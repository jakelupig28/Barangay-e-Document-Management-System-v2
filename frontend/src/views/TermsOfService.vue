<template>
  <div class="legal-page">
    <section class="hero-section">
      <div class="container text-center">
        <h1 class="hero-title">Terms of Service</h1>
        <p class="hero-description">
          Please read these terms carefully before using the Barangay 424 Zone 43 Manila e-Docs Portal.
        </p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="glass-card">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using the Barangay 424 Zone 43 Manila e-Docs Portal, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the services.
          </p>

          <h2>2. Resident Account & Registration</h2>
          <p>
            To apply for documents or submit reports, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete registration information.</li>
            <li>Maintain the security of your password and accept all risks of unauthorized access.</li>
            <li>Register only using your true name and valid residential details.</li>
          </ul>

          <h2>3. Acceptable Use Policy</h2>
          <p>
            You agree not to use the portal for any unlawful purpose or in any way that could damage, disable, or impair the system. Uploading fraudulent identity documents or posting spam/gibberish concerns is strictly prohibited.
          </p>

          <h2>4. Processing of Requests</h2>
          <p>
            Barangay 424 Zone 43 Manila reserves the right to verify residency status, review compliance tagged records, and approve or reject document clearance requests based on official local registry records.
          </p>

          <h2>5. Modifications and Discontinuation</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue the portal or any service at any time with or without notice to support system maintenance and security updates.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'TermsOfService'
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
</style>
