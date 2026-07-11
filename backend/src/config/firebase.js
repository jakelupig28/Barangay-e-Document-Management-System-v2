const admin = require('firebase-admin');
const path = require('path');
const { logInfo, logError } = require('../utils/logger');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './serviceAccountKey.json';

try {
  // Resolve path relative to project root
  const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
  
  // Initialize firebase-admin if service account exists
  const serviceAccount = require(resolvedPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  logInfo('Firebase Admin SDK initialized successfully.');
} catch (error) {
  logError(`Firebase SDK failed to initialize: ${error.message}`);
  logInfo('Backend is running in offline/mock mode. Put your firebase key JSON file in config to enable full features.');
}

const db = admin.apps.length > 0 ? admin.firestore() : null;
const auth = admin.apps.length > 0 ? admin.auth() : null;

module.exports = { admin, db, auth };
