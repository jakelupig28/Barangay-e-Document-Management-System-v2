<template>
  <div class="legal-page">
    <section class="hero-section">
      <div class="container text-center">
        <h1 class="hero-title">Privacy Policy</h1>
        <p class="hero-description">
          We are committed to protecting your personal data and ensuring your privacy.
        </p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="glass-card">
          <h2>1. Introduction</h2>
          <p>
            Welcome to the Barangay 424 Zone 43 Manila e-Docs Portal. This Privacy Policy describes how we collect, use, and process your personal information when you use our website and services to request certificates, clearances, and report community issues.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            To provide efficient services, we collect necessary resident information, including:
          </p>
          <ul>
            <li><strong>Personal Details:</strong> Full name, birthdate, gender, address, and civil status.</li>
            <li><strong>Contact Information:</strong> Email address and mobile numbers.</li>
            <li><strong>Official Documents:</strong> Government-issued ID photos and transaction records.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>
            Your information is used solely for the following purposes:
          </p>
          <ul>
            <li>Verifying your residency and compliance status.</li>
            <li>Processing official certificate and clearance requests.</li>
            <li>Sending notification updates regarding your requests.</li>
            <li>Addressing and tracking local neighborhood concerns.</li>
          </ul>

          <h2>4. Data Storage and Security</h2>
          <p>
            Your data is stored securely in compliance with the Data Privacy Act of 2012 (R.A. 10173) of the Philippines. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, loss, or alteration.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have any questions or concerns about this policy, please visit the Barangay Hall of Barangay 424 Zone 43 Manila during business hours (Monday to Friday, 8:00 AM to 5:00 PM).
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy'
};
</script>

<style scoped>
.legal-page {
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  background-color: #fafbfc;
  overflow-x: hidden;
  padding-bottom: 5rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero-section {
  background: linear-gradient(180deg, #f3f7fd 0%, #ffffff 100%);
  background-image: 
    radial-gradient(rgba(37, 99, 235, 0.05) 1.5px, transparent 1.5px),
    linear-gradient(180deg, #f3f7fd 0%, #ffffff 100%);
  background-size: 24px 24px, 100% 100%;
  padding: 4.5rem 0 3.5rem 0;
  text-align: center;
}

.hero-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 2.85rem;
  color: #0f172a;
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
}

.hero-description {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.content-section {
  padding-top: 2rem;
}

.glass-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
}

h2 {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #0f172a;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

h2:first-of-type {
  margin-top: 0;
}

p {
  font-size: 1rem;
  line-height: 1.7;
  color: #475569;
  margin-bottom: 1.25rem;
}

ul {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

li {
  font-size: 0.975rem;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 0.5rem;
}

/* --- Dark Mode Styles --- */
:global(body.dark-mode .legal-page) {
  background-color: #0f172a;
  color: #e2e8f0;
}

:global(body.dark-mode .hero-section) {
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.04) 1.5px, transparent 1.5px),
    linear-gradient(180deg, #090d16 0%, #0f172a 100%);
  background-color: #0f172a;
}

:global(body.dark-mode .hero-title) {
  color: #ffffff;
}

:global(body.dark-mode .hero-description) {
  color: #94a3b8;
}

:global(body.dark-mode .glass-card) {
  background-color: #1e293b;
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

:global(body.dark-mode .glass-card strong) {
  color: #ffffff;
}

:global(body.dark-mode h2) {
  color: #ffffff;
}

:global(body.dark-mode p) {
  color: #94a3b8;
}

:global(body.dark-mode li) {
  color: #94a3b8;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.15rem;
  }
  .hero-description {
    font-size: 1rem;
  }
  .glass-card {
    padding: 1.5rem;
    border-radius: 12px;
  }
  .hero-section {
    padding: 3.5rem 0 2.5rem 0;
  }
}
</style>
