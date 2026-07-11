const fs = require('fs');
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const dns = require('dns');

if (dns && typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Manually load .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const value = trimmed.substring(index + 1).trim();
        // Remove surrounding quotes if any
        const cleanedValue = value.replace(/^['"]|['"]$/g, '');
        process.env[key] = cleanedValue;
      }
    }
  });
}

let transporter;

// Lazy initialize transporter to avoid delay on startup
async function getTransporter() {
  if (transporter) return transporter;

  // Check if real SMTP config exists in environment
  if (process.env.SMTP_SERVICE || (process.env.SMTP_HOST && process.env.SMTP_USER)) {
    const transportConfig = {
      pool: true
    };
    if (process.env.SMTP_SERVICE && process.env.SMTP_SERVICE.toLowerCase() === 'gmail') {
      transportConfig.host = 'smtp.gmail.com';
      transportConfig.port = 587;
      transportConfig.secure = false;
    } else if (process.env.SMTP_SERVICE) {
      transportConfig.service = process.env.SMTP_SERVICE;
    } else {
      transportConfig.host = process.env.SMTP_HOST;
      transportConfig.port = parseInt(process.env.SMTP_PORT || '587');
      transportConfig.secure = process.env.SMTP_SECURE === 'true';
    }
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
    transportConfig.tls = {
      rejectUnauthorized: false
    };
    transportConfig.connectionTimeout = 15000;
    transportConfig.greetingTimeout = 15000;
    transportConfig.socketTimeout = 15000;
    transportConfig.family = 4;
    transportConfig.lookup = (hostname, options, callback) => {
      if (typeof options === 'function') {
        callback = options;
        options = { family: 4 };
      } else if (options) {
        options.family = 4;
      } else {
        options = { family: 4 };
      }
      dns.lookup(hostname, options, callback);
    };
    transporter = nodemailer.createTransport(transportConfig);
    console.log(`Nodemailer real SMTP transporter initialized using: ${process.env.SMTP_SERVICE || process.env.SMTP_HOST}`);
  } else {
    // Fallback to test Ethereal account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Nodemailer test Ethereal transporter initialized. User:', testAccount.user);
    } catch (err) {
      console.error('Failed to create Nodemailer test transporter:', err);
    }
  }
  return transporter;
}

// Helper function to append email records in local.json
function recordEmailInLocalJson(emailRecord) {
  const filePath = path.join(__dirname, 'local.json');
  try {
    let dbData = { users: [], residents: [], staffAccounts: [], emails: [] };
    if (fs.existsSync(filePath)) {
      dbData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    if (!dbData.emails) {
      dbData.emails = [];
    }
    
    // Add unique ID and timestamp
    const record = {
      id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sentAt: new Date().toISOString(),
      ...emailRecord
    };
    
    dbData.emails.push(record);
    fs.writeFileSync(filePath, JSON.stringify(dbData, null, 2), 'utf8');
    console.log(`[local.json] Recorded email to ${record.to} in database.`);
  } catch (err) {
    console.error('Error recording email to local.json:', err);
  }
}

// Helper function to send email via nodemailer and record in local.json
async function sendMailHelper(mailOptions, logDescription) {
  let messageId = `simulated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let previewUrl = null;
  let smtpSuccess = false;
  let smtpError = null;

  try {
    const mailTransporter = await getTransporter();
    if (mailTransporter) {
      const info = await mailTransporter.sendMail(mailOptions);
      messageId = info.messageId || messageId;
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
      smtpSuccess = true;
      console.log(`[Email Sent] ${logDescription}. Message ID: ${messageId}`);
      if (previewUrl) {
        console.log(`[Email Preview Link] ${previewUrl}`);
      }
    } else {
      throw new Error('Nodemailer transporter not initialized.');
    }
  } catch (err) {
    smtpError = err.message || String(err);
    console.error(`Error sending email (${logDescription}) via SMTP:`, err);
  }

  // Record in local.json anyway so local testing continues to work
  recordEmailInLocalJson({
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    body: mailOptions.html || mailOptions.text,
    messageId: messageId,
    previewUrl: previewUrl,
    smtpSuccess: smtpSuccess,
    smtpError: smtpError
  });

  return { success: true, messageId, previewUrl, smtpSuccess, smtpError };
}

module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.use(express.json({ limit: '50mb' }));

      // Endpoint to write to local.json
      devServer.app.post('/api/sync-local', (req, res) => {
        try {
          const filePath = path.join(__dirname, 'local.json');
          
          let existingData = {};
          if (fs.existsSync(filePath)) {
            try {
              existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) {
              console.warn('Error reading existing local.json before sync:', e);
            }
          }
          
          const newData = req.body;
          // Preserve recorded emails from backend so they don't get wiped by frontend sync
          if (existingData.emails && !newData.emails) {
            newData.emails = existingData.emails;
          } else if (existingData.emails && newData.emails) {
            const emailMap = new Map();
            existingData.emails.forEach(e => emailMap.set(e.id, e));
            newData.emails.forEach(e => emailMap.set(e.id, e));
            newData.emails = Array.from(emailMap.values());
          }
          
          fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf8');
          res.json({ success: true, message: 'Saved to local.json' });
        } catch (error) {
          console.error('Error writing to local.json:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });

      // Endpoint to notify staff of a new resident registration
      devServer.app.post('/api/notify-registration', async (req, res) => {
        console.log('[API /api/notify-registration] Received request with body:', req.body);
        const { residentEmail, residentName } = req.body;
        if (!residentEmail || !residentName) {
          console.warn('[API /api/notify-registration] Validation failed: missing email or name');
          return res.status(400).json({ success: false, error: 'Missing resident email or name.' });
        }

        try {
          // Read staff emails from local.json
          let staffEmails = ['superadmin@barangay.local'];
          const filePath = path.join(__dirname, 'local.json');
          if (fs.existsSync(filePath)) {
            try {
              const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              const staffUsers = fileData.users?.filter(u => u.role === 'barangay_staff') || [];
              if (staffUsers.length > 0) {
                staffEmails = staffUsers.map(u => u.email);
              }
            } catch (e) {
              console.warn('Error reading staff emails from local.json, using fallback:', e);
            }
          }

          // Include developer SMTP_USER for local testing
          if (process.env.SMTP_USER && !staffEmails.includes(process.env.SMTP_USER)) {
            staffEmails.push(process.env.SMTP_USER);
          }

          const mailTransporter = await getTransporter();
          if (!mailTransporter) {
            throw new Error('Nodemailer transporter not initialized.');
          }

          const mailOptions = {
            from: '"Barangay 424 System" <noreply@barangay424.gov>',
            to: staffEmails.join(', '),
            subject: 'New Resident Registration Waiting for Validation',
            text: `Hello Barangay Staff,\n\nA new resident account has been registered and is waiting to be validated.\n\nResident Details:\n- Name: ${residentName}\n- Email: ${residentEmail}\n\nPlease log in to the admin panel to validate and approve this account.\n\nBest regards,\nBarangay 424 Document Management System`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb; margin-top: 0;">New Resident Account Registered</h2>
                <p>Hello Barangay Staff,</p>
                <p>A new resident account has been registered and is waiting to be validated.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #eff6ff;">
                  <strong style="color: #1e293b;">Resident Details:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #475569;">
                    <li><strong>Name:</strong> ${residentName}</li>
                    <li><strong>Email:</strong> ${residentEmail}</li>
                  </ul>
                </div>
                <p>Please log in to the admin panel to validate and approve this account.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:8080/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 0.85rem; color: #64748b; margin: 0;">This is an automated notification from the Barangay 424 Zone 43 Document Management System.</p>
              </div>
            `
          };

          const emailResult = await sendMailHelper(mailOptions, `New registration notification for "${residentName}" sent to staff`);
          res.json(emailResult);
        } catch (error) {
          console.error('Error sending registration email:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });

      // Endpoint to notify resident of account approval
      devServer.app.post('/api/notify-approval', async (req, res) => {
        console.log('[API /api/notify-approval] Received request with body:', req.body);
        const { residentEmail, residentName } = req.body;
        if (!residentEmail || !residentName) {
          console.warn('[API /api/notify-approval] Validation failed: missing email or name');
          return res.status(400).json({ success: false, error: 'Missing resident email or name.' });
        }

        try {
          const mailTransporter = await getTransporter();
          if (!mailTransporter) {
            throw new Error('Nodemailer transporter not initialized.');
          }

          const mailOptions = {
            from: '"Barangay 424 System" <noreply@barangay424.gov>',
            to: residentEmail,
            subject: 'Barangay 424 Resident Account Approved',
            text: `Hello ${residentName},\n\nGood news! Your account registration has been approved by the barangay staff.\n\nYou can now log in to the system and make a certificate request.\n\nBest regards,\nBarangay 424 Document Management System`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #16a34a; margin-top: 0;">Account Registration Approved!</h2>
                <p>Hello <strong>${residentName}</strong>,</p>
                <p>Good news! Your account registration has been approved by the barangay staff.</p>
                <p>You can now log in to the system and start making certificate requests online.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:8080/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 0.85rem; color: #64748b; margin: 0;">This is an automated notification from the Barangay 424 Zone 43 Document Management System.</p>
              </div>
            `
          };

          const emailResult = await sendMailHelper(mailOptions, `Approval notification sent to resident "${residentName}" (${residentEmail})`);
          res.json(emailResult);
        } catch (error) {
          console.error('Error sending approval email:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });

      // Endpoint to notify staff of a new certificate request
      devServer.app.post('/api/notify-request-creation', async (req, res) => {
        console.log('[API /api/notify-request-creation] Received request with body:', req.body);
        const { residentEmail, residentName, requestId, documentType, purpose, notes, createdAt, onBehalf, recipientName, recipientRelationship } = req.body;
        if (!requestId || !documentType || !residentName) {
          console.warn('[API /api/notify-request-creation] Validation failed: missing details');
          return res.status(400).json({ success: false, error: 'Missing request details.' });
        }

        try {
          // Read staff emails from local.json
          let staffEmails = ['superadmin@barangay.local'];
          const filePath = path.join(__dirname, 'local.json');
          if (fs.existsSync(filePath)) {
            try {
              const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              const staffUsers = fileData.users?.filter(u => u.role === 'barangay_staff') || [];
              if (staffUsers.length > 0) {
                staffEmails = staffUsers.map(u => u.email);
              }
            } catch (e) {
              console.warn('Error reading staff emails from local.json, using fallback:', e);
            }
          }

          // Include developer SMTP_USER for local testing
          if (process.env.SMTP_USER && !staffEmails.includes(process.env.SMTP_USER)) {
            staffEmails.push(process.env.SMTP_USER);
          }

          const mailTransporter = await getTransporter();
          if (!mailTransporter) {
            throw new Error('Nodemailer transporter not initialized.');
          }

          const formattedDate = new Date(createdAt || new Date()).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });

          const mailOptions = {
            from: '"Barangay 424 System" <noreply@barangay424.gov>',
            to: staffEmails.join(', '),
            subject: `${onBehalf ? '[ON BEHALF] ' : ''}New Certificate Request: ${documentType} - ${requestId}`,
            text: `Hello Barangay Staff,\n\nA new certificate request has been submitted and is waiting for review.\n\nRequest Details:\n- Request ID: ${requestId}\n- Resident Name: ${residentName}\n- Email: ${residentEmail || 'N/A'}\n${onBehalf ? `- Requested on Behalf of: ${recipientName} (${recipientRelationship})\n` : ''}- Document Type: ${documentType}\n- Purpose: ${purpose || 'N/A'}\n- Notes: ${notes || 'None'}\n- Date Requested: ${formattedDate}\n\nPlease log in to the admin/staff panel to review and approve this request.\n\nBest regards,\nBarangay 424 Document Management System`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb; margin-top: 0;">New Certificate Request Submitted</h2>
                ${
                  onBehalf
                    ? `<div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 10px 15px; margin-bottom: 20px; color: #b45309; font-weight: bold; font-size: 0.95rem;">
                         ⚠️ This is requested on behalf of ${recipientName} (${recipientRelationship}).
                       </div>`
                    : ''
                }
                <p>Hello Barangay Staff,</p>
                <p>A new certificate request has been submitted and is waiting for your review.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #eff6ff;">
                  <strong style="color: #1e293b;">Request Details:</strong>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 10px; color: #475569; font-size: 0.95rem;">
                    <tr>
                      <td style="padding: 6px 0; width: 35%; font-weight: bold;">Request ID:</td>
                      <td style="padding: 6px 0; color: #0f172a;">${requestId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold;">Resident Name:</td>
                      <td style="padding: 6px 0; color: #0f172a;">${residentName}</td>
                    </tr>
                    ${
                      onBehalf
                        ? `<tr>
                             <td style="padding: 6px 0; font-weight: bold;">Requested on Behalf of:</td>
                             <td style="padding: 6px 0; color: #b45309; font-weight: bold;">${recipientName} (${recipientRelationship})</td>
                           </tr>`
                        : ''
                    }
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold;">Resident Email:</td>
                      <td style="padding: 6px 0;">${residentEmail || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold;">Document Type:</td>
                      <td style="padding: 6px 0; color: #2563eb; font-weight: bold;">${documentType}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold;">Purpose:</td>
                      <td style="padding: 6px 0;">${purpose || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold;">Notes:</td>
                      <td style="padding: 6px 0;">${notes || 'None'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold;">Date Requested:</td>
                      <td style="padding: 6px 0;">${formattedDate}</td>
                    </tr>
                  </table>
                </div>
                <p>Please log in to the admin/staff panel to process this request.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:8080/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 0.85rem; color: #64748b; margin: 0;">This is an automated notification from the Barangay 424 Zone 43 Document Management System.</p>
              </div>
            `
          };

          const emailResult = await sendMailHelper(mailOptions, `New request notification for "${requestId}" sent to staff`);
          res.json(emailResult);
        } catch (error) {
          console.error('Error sending request creation email:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });

      // Endpoint to notify resident that their certificate request is approved
      devServer.app.post('/api/notify-request-approval', async (req, res) => {
        console.log('[API /api/notify-request-approval] Received request with body:', req.body);
        const { residentEmail, residentName, requestId, documentType, createdAt, approvedAt, onBehalf, recipientName, recipientRelationship } = req.body;
        if (!residentEmail || !requestId || !documentType) {
          console.warn('[API /api/notify-request-approval] Validation failed: missing email or details');
          return res.status(400).json({ success: false, error: 'Missing resident email or request details.' });
        }

        try {
          const mailTransporter = await getTransporter();
          if (!mailTransporter) {
            throw new Error('Nodemailer transporter not initialized.');
          }

          const formatTime = (d) => d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
          const submittedStr = formatTime(createdAt);
          const approvedStr = formatTime(approvedAt || new Date());

          const mailOptions = {
            from: '"Barangay 424 System" <noreply@barangay424.gov>',
            to: residentEmail,
            subject: `Certificate Request Approved: ${documentType} - ${requestId}`,
            text: `Hello ${residentName},\n\nGood news! Your request for "${documentType}" has been approved by the barangay staff.\n\nRequest Timeline:\n- Submitted: ${submittedStr}\n- Approved: ${approvedStr}\n\nTo claim your certificate, please remember to:\n${
              onBehalf
                ? `1. Bring an Authorization Letter with the signature of ${recipientName}.\n2. Bring a photocopy of ${recipientName}'s valid ID.\n3. Bring your own valid ID.`
                : `1. Bring a Barangay ID or any valid ID with your present address within the barangay.\n2. Present it to the staff at the Barangay Hall.`
            }\n\nPlease log in to your dashboard to view the request status.\n\nBest regards,\nBarangay 424 Document Management System`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #16a34a; margin-top: 0;">Certificate Request Approved!</h2>
                <p>Hello <strong>${residentName}</strong>,</p>
                <p>Good news! Your request for <strong>${documentType}</strong> (ID: <code>${requestId}</code>) has been approved by the barangay staff.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <h4 style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Request Timeline</h4>
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <!-- Step 1: Request Submitted -->
                    <tr>
                      <td style="width: 24px; vertical-align: top; align: center; padding: 0;">
                        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 0 auto;">
                          <tr>
                            <td align="center" valign="middle" style="width: 24px; height: 24px; border-radius: 50%; background-color: #4f46e5; color: #ffffff; text-align: center; line-height: 24px; font-size: 11px; font-weight: bold; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);">➤</td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align: top; padding: 0 0 0 16px;">
                        <div style="font-size: 14px; font-weight: 600; color: #1e293b; line-height: 18px;">Request Submitted</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500;">${submittedStr}</div>
                      </td>
                    </tr>
                    <!-- Connector Line -->
                    <tr>
                      <td style="width: 24px; align: center; padding: 4px 0;">
                        <div style="width: 2px; height: 16px; background-color: #e2e8f0; margin: 0 auto;"></div>
                      </td>
                      <td style="padding: 0 0 0 16px; height: 24px;">&nbsp;</td>
                    </tr>
                    <!-- Step 2: Approved -->
                    <tr>
                      <td style="width: 24px; vertical-align: top; align: center; padding: 0;">
                        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 0 auto;">
                          <tr>
                            <td align="center" valign="middle" style="width: 24px; height: 24px; border-radius: 50%; background-color: #4f46e5; color: #ffffff; text-align: center; line-height: 24px; font-size: 11px; font-weight: bold; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);">✓</td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align: top; padding: 0 0 0 16px;">
                        <div style="font-size: 14px; font-weight: 600; color: #1e293b; line-height: 18px;">Approved by Staff (Ready for Pickup)</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500;">${approvedStr}</div>
                      </td>
                    </tr>
                  </table>
                </div>

                <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 25px 0; border: 1px solid #e0f2fe; color: #0369a1;">
                  <strong style="display: block; margin-bottom: 8px; font-size: 1rem;"><i class="fas fa-info-circle"></i> Instructions to Claim:</strong>
                  <div style="margin: 0; font-size: 0.95rem; line-height: 1.5;">
                    ${
                      onBehalf
                        ? `Since this is requested on behalf of <strong>${recipientName}</strong>, please bring:<br>
                           <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                             <li>An <strong>Authorization Letter</strong> with the signature of <strong>${recipientName}</strong>.</li>
                             <li>A photocopy of <strong>${recipientName}</strong>'s valid ID.</li>
                             <li>Your own valid ID.</li>
                           </ul>`
                        : `Please bring a <strong>Barangay ID</strong> or <strong>any valid ID with your present address within the Barangay</strong> and present it to the staff in the <strong>Barangay Hall</strong> to receive the document.`
                    }
                  </div>
                </div>

                <p>You can now log in to the portal to track further updates or view details.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:8080/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 0.85rem; color: #64748b; margin: 0;">This is an automated notification from the Barangay 424 Zone 43 Document Management System.</p>
              </div>
            `
          };

          const emailResult = await sendMailHelper(mailOptions, `Approval email sent to resident "${residentName}" (${residentEmail})`);
          res.json(emailResult);
        } catch (error) {
          console.error('Error sending request approval email:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });

      // Endpoint to notify resident that their certificate request is marked as claimed
      devServer.app.post('/api/notify-request-claimed', async (req, res) => {
        console.log('[API /api/notify-request-claimed] Received request with body:', req.body);
        const { residentEmail, residentName, requestId, documentType, createdAt, approvedAt, claimedAt, claimedBy } = req.body;
        if (!residentEmail || !requestId || !documentType) {
          console.warn('[API /api/notify-request-claimed] Validation failed: missing email or details');
          return res.status(400).json({ success: false, error: 'Missing resident email or request details.' });
        }

        try {
          const mailTransporter = await getTransporter();
          if (!mailTransporter) {
            throw new Error('Nodemailer transporter not initialized.');
          }

          const formatTime = (d) => d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
          const submittedStr = formatTime(createdAt);
          const approvedStr = formatTime(approvedAt);
          const claimedStr = formatTime(claimedAt || new Date());

          const mailOptions = {
            from: '"Barangay 424 System" <noreply@barangay424.gov>',
            to: residentEmail,
            subject: `Certificate Request Claimed: ${documentType} - ${requestId}`,
            text: `Hello ${residentName},\n\nYour certificate request for "${documentType}" (ID: ${requestId}) has been marked as claimed by ${claimedBy || 'Resident'}.\n\nRequest Timeline:\n- Submitted: ${submittedStr}\n- Approved: ${approvedStr}\n- Claimed: ${claimedStr}\n\nBest regards,\nBarangay 424 Document Management System`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0284c7; margin-top: 0;">Certificate Request Claimed</h2>
                <p>Hello <strong>${residentName}</strong>,</p>
                <p>Your certificate request for <strong>${documentType}</strong> (ID: <code>${requestId}</code>) has been claimed by <strong>${claimedBy || 'Resident'}</strong>.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <h4 style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Request Timeline</h4>
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <!-- Step 1: Request Submitted -->
                    <tr>
                      <td style="width: 24px; vertical-align: top; align: center; padding: 0;">
                        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 0 auto;">
                          <tr>
                            <td align="center" valign="middle" style="width: 24px; height: 24px; border-radius: 50%; background-color: #4f46e5; color: #ffffff; text-align: center; line-height: 24px; font-size: 11px; font-weight: bold; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);">➤</td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align: top; padding: 0 0 0 16px;">
                        <div style="font-size: 14px; font-weight: 600; color: #1e293b; line-height: 18px;">Request Submitted</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500;">${submittedStr}</div>
                      </td>
                    </tr>
                    <!-- Connector Line 1 -->
                    <tr>
                      <td style="width: 24px; align: center; padding: 4px 0;">
                        <div style="width: 2px; height: 16px; background-color: #e2e8f0; margin: 0 auto;"></div>
                      </td>
                      <td style="padding: 0 0 0 16px; height: 24px;">&nbsp;</td>
                    </tr>
                    <!-- Step 2: Approved -->
                    <tr>
                      <td style="width: 24px; vertical-align: top; align: center; padding: 0;">
                        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 0 auto;">
                          <tr>
                            <td align="center" valign="middle" style="width: 24px; height: 24px; border-radius: 50%; background-color: #4f46e5; color: #ffffff; text-align: center; line-height: 24px; font-size: 11px; font-weight: bold; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);">✓</td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align: top; padding: 0 0 0 16px;">
                        <div style="font-size: 14px; font-weight: 600; color: #1e293b; line-height: 18px;">Approved by Staff (Ready for Pickup)</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500;">${approvedStr}</div>
                      </td>
                    </tr>
                    <!-- Connector Line 2 -->
                    <tr>
                      <td style="width: 24px; align: center; padding: 4px 0;">
                        <div style="width: 2px; height: 16px; background-color: #e2e8f0; margin: 0 auto;"></div>
                      </td>
                      <td style="padding: 0 0 0 16px; height: 24px;">&nbsp;</td>
                    </tr>
                    <!-- Step 3: Claimed -->
                    <tr>
                      <td style="width: 24px; vertical-align: top; align: center; padding: 0;">
                        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 0 auto;">
                          <tr>
                            <td align="center" valign="middle" style="width: 24px; height: 24px; border-radius: 50%; background-color: #4f46e5; color: #ffffff; text-align: center; line-height: 24px; font-size: 11px; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);">🤝</td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align: top; padding: 0 0 0 16px;">
                        <div style="font-size: 14px; font-weight: 600; color: #1e293b; line-height: 18px;">Document Claimed by ${claimedBy || 'Resident'}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500;">${claimedStr}</div>
                      </td>
                    </tr>
                  </table>
                </div>

                <p>If you have already received your document, thank you! You can log in below to check your request history.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:8080/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 0.85rem; color: #64748b; margin: 0;">This is an automated notification from the Barangay 424 Zone 43 Document Management System.</p>
              </div>
            `
          };

          const emailResult = await sendMailHelper(mailOptions, `Claimed email sent to resident "${residentName}" (${residentEmail})`);
          res.json(emailResult);
        } catch (error) {
          console.error('Error sending request claimed email:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });

      // Endpoint to read from local.json
      devServer.app.get('/api/sync-local', (req, res) => {
        try {
          const filePath = path.join(__dirname, 'local.json');
          if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            res.json(JSON.parse(data));
          } else {
            res.json(null);
          }
        } catch (error) {
          console.error('Error reading from local.json:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });

      return middlewares;
    }
  }
};
