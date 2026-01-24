<template>
  <div class="e-reports-page">
    <!-- Hero Section -->
    <section class="hero-section bg-primary-gradient py-5">
      <div class="container py-4 py-lg-5">
        <div class="row align-items-center">
          <div class="col-lg-6 order-lg-1 order-2 text-lg-start text-center">
            <div class="official-badge mb-3">
              <span class="badge bg-white text-primary py-2 px-3 fw-normal">
                <i class="bi bi-info-circle me-2"></i> About Barangay eReports
              </span>
            </div>
            <h1 class="display-4 fw-bold text-white mb-3">
              Barangay <span class="text-warning">eReports</span>
            </h1>
            <p class="lead text-white mb-4">
              Streamlining community governance with digital reporting and analytics
            </p>
          </div>
          <div class="col-lg-6 order-lg-2 order-1 mb-lg-0 mb-4">
            <div class="about-hero-img position-relative">
              <!-- Placeholder for image; replace with actual asset in production -->
              <!-- <img src="@/assets/barangay-reports.jpg" alt="eReports System" class="img-fluid rounded-3 shadow"> -->
              <div class="img-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- eReports Overview -->
    <section class="overview-section py-5 bg-light">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h2 class="display-5 fw-bold text-dark mb-3">
            <i class="bi bi-bar-chart text-primary me-2"></i> What is Barangay eReports?
          </h2>
          <p class="text-muted mx-auto" style="max-width: 700px;">
            Learn about our digital reporting system designed to enhance barangay governance
          </p>
        </div>
        
        <div class="row g-4">
          <div class="col-lg-6">
            <div class="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div class="card-body p-4 p-lg-5">
                <h3 class="h4 fw-bold mb-4 text-primary">Overview</h3>
                <p class="text-muted mb-4">
                  Barangay eReports is a digital platform that streamlines the creation, management, and analysis of reports for barangay governance. As the smallest administrative unit in the Philippines, barangays require efficient tools to manage community data, and eReports provides a user-friendly solution to support local officials.
                </p>
                <p class="text-muted">
                  This system replaces traditional paper-based reporting with automated processes, enabling barangays to track population statistics, document requests, incidents, and more with ease.
                </p>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div class="card-body p-4 p-lg-5">
                <h3 class="h4 fw-bold mb-4 text-primary">Purpose & Benefits</h3>
                <p class="text-muted mb-3">
                  <strong>Purpose:</strong> To enhance governance by providing tools for data-driven decision-making, transparency, and efficient service delivery.
                </p>
                <p class="text-muted">
                  <strong>Benefits:</strong>
                </p>
                <ul class="text-muted">
                  <li>Improves efficiency by automating report generation.</li>
                  <li>Promotes transparency with accessible data for officials and residents.</li>
                  <li>Supports data-driven decisions through analytics and visualizations.</li>
                  <li>Enhances community engagement by simplifying access to information.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Features -->
    <section class="features-section py-5 bg-white">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h2 class="display-5 fw-bold text-dark mb-3">
            <i class="bi bi-gear text-primary me-2"></i> Key Features
          </h2>
          <p class="text-muted mx-auto" style="max-width: 700px;">
            Discover the powerful tools that make Barangay eReports essential for governance
          </p>
        </div>
        
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="card feature-card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-primary bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i class="bi bi-bar-chart text-primary fs-4"></i>
                </div>
                <h3 class="h5 fw-bold mb-2">Report Generation</h3>
                <p class="text-muted small mb-0">Create reports on population, document requests, cases, finances, and projects with customizable date ranges.</p>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card feature-card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-success bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i class="bi bi-pie-chart text-success fs-4"></i>
                </div>
                <h3 class="h5 fw-bold mb-2">Data Visualization</h3>
                <p class="text-muted small mb-0">Visualize data with charts and graphs for easy analysis of community trends and patterns.</p>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card feature-card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-info bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i class="bi bi-file-arrow-down text-info fs-4"></i>
                </div>
                <h3 class="h5 fw-bold mb-2">Export Options</h3>
                <p class="text-muted small mb-0">Export reports as CSV or PDF files and print them for sharing or documentation.</p>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card feature-card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-warning bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i class="bi bi-shield-lock text-warning fs-4"></i>
                </div>
                <h3 class="h5 fw-bold mb-2">Secure & Accessible</h3>
                <p class="text-muted small mb-0">Ensures data privacy and secure access, compliant with the Data Privacy Act of 2012.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Chatbot Component -->
    <Chatbot />
  </div>
</template>

<script>
import Chatbot from '@/components/Chatbot.vue';

export default {
  name: 'eReports',
  components: {
    Chatbot
  }
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #1a3a8f 0%, #0d6efd 100%);
  position: relative;
  overflow: hidden;
}

.official-badge .badge {
  font-size: 0.9rem;
}

.about-hero-img {
  position: relative;
  z-index: 1;
}

.about-hero-img img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.img-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
}

/* Feature Cards */
.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.feature-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive Adjustments */
@media (max-width: 767.98px) {
  .hero-section {
    text-align: center;
  }
  
  .about-hero-img {
    margin-bottom: 2rem;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
}
</style>