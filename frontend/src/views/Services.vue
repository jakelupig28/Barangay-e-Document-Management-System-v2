<template>
  <div class="services-page">
    <!-- Hero Section -->
    <section class="hero-section bg-primary-gradient py-5">
      <div class="container py-4 py-lg-5">
        <div class="row align-items-center">
          <div class="col-lg-6 order-lg-1 order-2 text-lg-start text-center">
            <div class="official-badge mb-3">
              <span class="badge bg-white text-primary py-2 px-3 fw-normal">
                <i class="bi bi-list-check me-2"></i> Our Services
              </span>
            </div>
            <h1 class="display-4 fw-bold text-white mb-3">
             <span class="text-warning">Services</span>
            </h1>
            <p class="lead text-white mb-4">
              Quality services for all residents of <strong>Barangay 424 Zone 43 Manila</strong>
            </p>
          </div>
          <div class="col-lg-6 order-lg-2 order-1 mb-lg-0 mb-4">

          </div>
        </div>
      </div>
    </section>

    <!-- Services List -->
    <section class="services-section py-5 bg-light">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h2 class="display-5 fw-bold text-dark mb-3">
            <i class=" text-primary me-2"></i> Available Services
          </h2>
          <p class="text-muted mx-auto" style="max-width: 700px;">
            We provide various services to meet the needs of our community members
          </p>
        </div>
        
        <div class="row g-4">
          <div class="col-md-6 col-lg-4" v-for="(service, index) in services" :key="index">
            <div class="card service-card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div class="card-body p-4 d-flex flex-column">
                <div class="service-icon mb-3 text-primary">
                  <i :class="`bi ${service.icon} display-6`"></i>
                </div>
                <h3 class="h4 fw-bold mb-3">{{ service.title }}</h3>
                <p class="text-muted mb-4">{{ service.description }}</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                  <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 small">
                    {{ service.category }}
                  </span>
                  <button @click="requestService(service)" class="btn btn-sm btn-primary rounded-pill">
                    Request <i class="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How to Avail -->
    <section class="process-section py-5 bg-white">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h2 class="display-5 fw-bold text-dark mb-3">
            <i class=" text-primary me-2"></i> How to Avail Our Services
          </h2>
          <p class="text-muted mx-auto" style="max-width: 700px;">
            Simple steps to request barangay services
          </p>
        </div>
        
        <div class="row g-4">
          <div class="col-md-6 col-lg-3" v-for="(step, index) in processSteps" :key="index">
            <div class="card process-card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
              <div class="card-body text-center p-4">
                <div class="process-number mb-3">
                  <span class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                    {{ step.number }}
                  </span>
                </div>
                <h3 class="h5 fw-bold mb-3">{{ step.title }}</h3>
                <p class="text-muted small">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
      
  </div>
</template>

<script>
export default {
  name: 'ServicesPage',
  data() {
    return {
      services: [
        {
          title: 'Barangay Certificate',
          description: 'Official document certifying residency or clearance in the barangay.',
          icon: 'bi-file-earmark-text',
          category: 'Document'
        },
        {
          title: 'Certificate of Indigency (Financial Assistance)',
          description: 'Certification for low-income residents to avail of financial, medical, or burial assistance.',
          icon: 'bi-heart',
          category: 'Social Services'
        },
        {
          title: 'Certificate of Indigency (General Purpose)',
          description: 'Certification of indigent status for general purposes, scholarships, or legal assistance.',
          icon: 'bi-clipboard-check',
          category: 'Social Services'
        }
      ],
      processSteps: [
        {
          number: 1,
          title: 'Register',
          description: 'Register and request your needed certificate.'
        },
        {
          number: 2,
          title: 'Submit Request',
          description: 'Fill out the application form online and submit with necessary requirements'
        },
        {
          number: 3,
          title: 'Receive Notification',
          description: 'Get notified when your requested document is approved and ready for pickup'
        },
        {
          number: 4,
          title: 'Visit Barangay Hall',
          description: 'Go to our office to claim your document and show your valid ID as proof of residency'
        }
      ],
      requirements: [
        'Valid government-issued ID (original and photocopy)',
        'Proof of residency (utility bill, lease contract, etc.)',
        'Fully accomplished application form',
        'Community Tax Certificate (Cedula) for some services',
        'Other specific requirements depending on the service requested'
      ]
    }
  },
  methods: {
    requestService(service) {
      let type = 'barangay-certificate';
      if (service.title.includes('Financial')) {
        type = 'certificate-of-indigency-financial';
      } else if (service.title.includes('General')) {
        type = 'certificate-of-indigency-general';
      }
      
      const isAuth = this.$store && this.$store.state && this.$store.state.auth && this.$store.state.auth.isAuthenticated;
      if (isAuth) {
        this.$router.push({ path: '/resident/request', query: { type } });
      } else {
        this.$router.push('/login');
      }
    }
  }
}
</script>

<style scoped>
/* Hero Section - Reusing from About page */
.hero-section {
  background: linear-gradient(135deg, #1a3a8f 0%, #0d6efd 100%);
  position: relative;
  overflow: hidden;
}

.official-badge .badge {
  font-size: 0.9rem;
}

.services-hero-img {
  position: relative;
  z-index: 1;
  height: 300px;
  background-color: #e9ecef;
  border-radius: 0.5rem;
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

/* Service Cards */
.service-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.service-icon i {
  transition: transform 0.3s ease;
}

.service-card:hover .service-icon i {
  transform: scale(1.1);
}

/* Process Cards */
.process-card {
  transition: transform 0.3s ease;
}

.process-card:hover {
  transform: translateY(-5px);
}

.process-number span {
  transition: all 0.3s ease;
}

.process-card:hover .process-number span {
  background-color: #0d6efd !important;
  transform: scale(1.1);
}

/* Requirements List */
.list-group-item {
  border-left: 0;
  border-right: 0;
  transition: background-color 0.2s ease;
}

.list-group-item:hover {
  background-color: rgba(13, 110, 253, 0.05) !important;
}

/* Responsive Adjustments */
@media (max-width: 767.98px) {
  .hero-section {
    text-align: center;
    padding: 3.5rem 0 !important;
  }
  
  .services-hero-img {
    margin-bottom: 2rem;
  }
  
  .section-header h2 {
    font-size: 1.85rem !important;
  }

  .display-4 {
    font-size: 2.25rem !important;
  }

  .lead {
    font-size: 1rem !important;
  }
}

/* --- Dark Mode Styles --- */
:global(body.dark-mode .services-page) {
  background-color: #0f172a;
  color: #e2e8f0;
}

:global(body.dark-mode .hero-section) {
  background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%) !important;
}

:global(body.dark-mode .official-badge .badge) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

:global(body.dark-mode .services-section) {
  background-color: #0b0f19 !important;
}

:global(body.dark-mode .services-section .section-header h2),
:global(body.dark-mode .process-section .section-header h2) {
  color: #ffffff !important;
}

:global(body.dark-mode .services-section .section-header p),
:global(body.dark-mode .process-section .section-header p) {
  color: #94a3b8 !important;
}

:global(body.dark-mode .service-card),
:global(body.dark-mode .process-card) {
  background-color: #1e293b !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
}

:global(body.dark-mode .service-card h3),
:global(body.dark-mode .process-card h3) {
  color: #ffffff !important;
}

:global(body.dark-mode .service-card p),
:global(body.dark-mode .process-card p) {
  color: #94a3b8 !important;
}

:global(body.dark-mode .process-section) {
  background-color: #0f172a !important;
}

:global(body.dark-mode .process-number span) {
  background-color: #3b82f6 !important;
}

:global(body.dark-mode .process-card:hover .process-number span) {
  background-color: #60a5fa !important;
}
</style>