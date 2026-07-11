<template>
  <div class="about-modern">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            Our Mission: <br />
            <span class="highlight-text">Empowering Barangay 424 Zone 43 Manila</span>
          </h1>

          <p class="hero-description">
            We believe in bringing digital transformation to the grassroots level. By simplifying document processing and community services in Barangay 424 Zone 43 Manila, we are building a more connected, transparent, and efficient neighborhood for everyone.
          </p>

          <a href="#story" class="btn-learn">
            Learn More
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

        <!-- Hero Image (Tilted Organic Capsule Shape) -->
        <div class="hero-image-area">
          <div class="image-bg-effect"></div>
          <div class="image-mask-wrapper">
            <img src="@/assets/about1.jpeg" alt="Empowering Barangay 424 Zone 43 Manila" class="hero-main-img" />
          </div>
        </div>
      </div>
    </section>

    <!-- History Section -->
    <section id="story" class="story-section">
      <div class="container story-container">
        <!-- Story Image Card -->
        <div class="story-image-card">
          <img src="@/assets/about2.jpg" alt="Barangay 424 History" class="story-img" />
        </div>

        <!-- Story Content -->
        <div class="story-content">
          <h2 class="story-title">History</h2>
          <p class="story-desc">
            Barangay 424 Zone 43, situated in the district of Sampaloc, Manila, evolved from a historic residential enclave of the city. Originally part of Sampaloc's vast suburban areas, it gradually grew into a lively, densely populated community close to Manila's University Belt.
          </p>
          <p class="story-desc">
            Formally organized as a barangay in the 1970s as part of citywide community division efforts, Barangay 424 has long stood as a testament to the community spirit of Sampaloc residents. Through decades of growth, the barangay has consistently supported its residents through local health campaigns, disaster preparedness training, and public welfare programs, preserving its rich legacy of unity and bayanihan.
          </p>
        </div>
      </div>
    </section>

    <!-- Barangay Leadership Section -->
    <section class="leadership-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">Barangay Leadership</h2>
          <p class="section-subtitle">Meet the dedicated team working tirelessly to serve and uplift our community.</p>
        </div>

        <div class="leaders-grid">
          <!-- Leader 1 -->
          <div class="leader-card">
            <div class="leader-avatar-wrapper">
              <img src="@/assets/brgy captain pic.jpeg" alt="Angelito G. Dula" class="leader-avatar" />
            </div>
            <h3 class="leader-name">Angelito G. Dula</h3>
            <p class="leader-role">Barangay Captain</p>
          </div>

          <!-- Leader 2 -->
          <div class="leader-card">
            <div class="leader-avatar-wrapper">
              <img src="@/assets/leader-maria.png" alt="Rose Marie A. Soriano" class="leader-avatar" />
            </div>
            <h3 class="leader-name">Rose Marie A. Soriano</h3>
            <p class="leader-role">Barangay Secretary</p>
          </div>

          <!-- Leader 3 -->
          <div class="leader-card">
            <div class="leader-avatar-wrapper">
              <img src="@/assets/leader-ana.png" alt="Jannet M. Rivera" class="leader-avatar" />
            </div>
            <h3 class="leader-name">Jannet M. Rivera</h3>
            <p class="leader-role">Barangay Treasurer</p>
          </div>

          <!-- Leader 4 -->
          <div class="leader-card">
            <div class="leader-avatar-wrapper">
              <img src="@/assets/leader-jose.png" alt="Tyrone C. Fuertes" class="leader-avatar" />
            </div>
            <h3 class="leader-name">Tyrone C. Fuertes</h3>
            <p class="leader-role">SK Chairperson</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Vision, Mission & Values Section -->
    <section class="values-section">
      <div class="container values-container">
        <!-- Vision & Mission -->
        <div class="values-content">
          <h2 class="values-title">Mission & Vision</h2>
          
          <div class="value-statement">
            <h3 class="statement-subtitle">Our Vision</h3>
            <p class="statement-text">
              An economically progressive, peaceful, clean, self-reliant Barangay, we are committed to being a showcase of excellence in public service. We serve professionally and are united in purpose, especially in pursuing a sustainable development program to provide a better quality of life for our inhabitants in this Barangay.
            </p>
          </div>
          
          <div class="value-statement">
            <h3 class="statement-subtitle">Our Mission</h3>
            <p class="statement-text">
              Make a government relevant and responsive to the needs of the people in our Barangay and to enhance leadership skills of the Barangay council members in the field of public service by committing ourselves in creating a peaceful and friendly environment by safeguarding our community.
            </p>
          </div>
        </div>

        <!-- Core Values Grid -->
        <div class="core-values-grid">
          <!-- Value 1: Integrity -->
          <div class="value-card">
            <div class="value-icon-box integrity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h4 class="value-card-title">Integrity</h4>
            <p class="value-card-desc">Serving with honesty, transparency, and high ethical standards.</p>
          </div>

          <!-- Value 2: Service -->
          <div class="value-card">
            <div class="value-icon-box service-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h4 class="value-card-title">Service</h4>
            <p class="value-card-desc">Dedicated to the welfare, health, and needs of every resident.</p>
          </div>

          <!-- Value 3: Unity -->
          <div class="value-card">
            <div class="value-icon-box unity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h4 class="value-card-title">Unity</h4>
            <p class="value-card-desc">Fostering a strong spirit of cooperation and community bayanihan.</p>
          </div>

          <!-- Value 4: Progress -->
          <div class="value-card">
            <div class="value-icon-box progress-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <h4 class="value-card-title">Progress</h4>
            <p class="value-card-desc">Striving for continuous improvement, innovation, and development.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience CTA -->
    <section class="experience-section">
      <div class="container text-center">
        <h2 class="experience-title">Experience the Difference</h2>
        <p class="experience-subtitle">
          Join thousands of residents who are already enjoying faster, easier access to community services.
        </p>
        <router-link to="/register" class="btn-register">Register Now</router-link>
      </div>
    </section>

  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.about-modern {
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  background-color: #ffffff;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(180deg, #f3f7fd 0%, #ffffff 100%);
  background-image: 
    radial-gradient(rgba(37, 99, 235, 0.05) 1.5px, transparent 1.5px),
    linear-gradient(180deg, #f3f7fd 0%, #ffffff 100%);
  background-size: 24px 24px, 100% 100%;
  padding: 5rem 0 6rem 0;
  position: relative;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  align-items: center;
  gap: 3rem;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.hero-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 2.85rem;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  letter-spacing: -0.5px;
}

.highlight-text {
  color: #2563eb;
}

.hero-description {
  font-size: 1.05rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 480px;
}

.btn-learn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.2);
  transition: all 0.25s ease;
}

.btn-learn:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
}

.hero-image-area {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.image-bg-effect {
  position: absolute;
  top: 15px;
  right: -15px;
  width: calc(100% - 15px);
  height: calc(100% - 15px);
  background-color: #e2e8f0;
  border-radius: 42% 58% 46% 54% / 54% 46% 54% 46%;
  z-index: 1;
}

.image-mask-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1.1 / 1;
  border-radius: 42% 58% 46% 54% / 54% 46% 54% 46%;
  overflow: hidden;
  border: 6px solid #ffffff;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  z-index: 2;
}

.hero-main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.hero-main-img:hover {
  transform: scale(1.03);
}

/* Our Story Section */
.story-section {
  padding: 5rem 0;
  background-color: #f8fafc;
  background-image: radial-gradient(rgba(203, 213, 225, 0.25) 1px, transparent 1px);
  background-size: 16px 16px;
}

.story-container {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 4rem;
}

.story-image-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.story-img {
  width: 100%;
  height: auto;
  display: block;
}

.story-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.story-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 2.2rem;
  color: #0f172a;
  margin-bottom: 1.5rem;
}

.story-desc {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.story-desc:last-child {
  margin-bottom: 0;
}

/* Barangay Leadership Section */
.leadership-section {
  padding: 5rem 0;
  background-color: #ffffff;
  background-image: radial-gradient(rgba(226, 232, 240, 0.6) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}

.section-header {
  margin-bottom: 4rem;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 2.2rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.leaders-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.leader-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2.25rem 1.5rem;
  border: 1px solid #f1f5f9;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
  transition: all 0.3s ease;
}

.leader-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.04);
  border-color: #bfdbfe;
}

.leader-avatar-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1.5rem auto;
  border: 4px solid #eff6ff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.leader-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.leader-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  color: #0f172a;
  margin-bottom: 0.35rem;
}

.leader-role {
  color: #2563eb;
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0;
  text-transform: capitalize;
}

/* Vision, Mission & Values Section */
.values-section {
  padding: 5rem 0;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.values-container {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  align-items: start;
  gap: 4rem;
}

.values-content {
  display: flex;
  flex-direction: column;
}

.values-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 2.2rem;
  color: #0f172a;
  margin-bottom: 2rem;
}

.value-statement {
  margin-bottom: 2rem;
}

.value-statement:last-child {
  margin-bottom: 0;
}

.statement-subtitle {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.35rem;
  color: #2563eb;
  margin-bottom: 0.5rem;
}

.statement-text {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.core-values-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.value-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem 1.75rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.value-card:hover {
  transform: translateY(-4px);
  border-color: #bfdbfe;
}

.value-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.integrity-icon {
  background-color: #eff6ff;
}

.service-icon {
  background-color: #f0fdf4;
}

.unity-icon {
  background-color: #fff7ed;
}

.progress-icon {
  background-color: #f5f3ff;
}

.value-card-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.15rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.value-card-desc {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

/* Experience CTA */
.experience-section {
  padding: 5.5rem 0 6.5rem 0;
  background-color: #ffffff;
  background-image: 
    radial-gradient(rgba(37, 99, 235, 0.03) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
}

.experience-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 2.3rem;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.experience-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.btn-register {
  display: inline-block;
  background-color: #2563eb; /* brand blue */
  color: #ffffff;
  padding: 0.9rem 2.25rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.2);
  transition: all 0.25s ease;
}

.btn-register:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
}

/* Responsive Layouts */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 2.35rem;
  }
  .story-container, .values-container {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .leaders-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
  .hero-content {
    align-items: center;
  }
  .hero-description {
    margin: 0 auto 2rem auto;
  }
  .hero-image-area {
    justify-content: center;
    max-width: 420px;
    margin: 0 auto;
  }
  .leaders-grid {
    grid-template-columns: 1fr;
    max-width: 320px;
    margin: 0 auto;
  }
  .core-values-grid {
    grid-template-columns: 1fr;
  }
}

/* --- Dark Mode Styles --- */
:global(body.dark-mode .about-modern) {
  background-color: #0f172a;
  color: #e2e8f0;
}

:global(body.dark-mode .about-modern .hero-section) {
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px),
    linear-gradient(180deg, #090d16 0%, #0f172a 100%);
  background-color: #0f172a;
}

:global(body.dark-mode .about-modern .hero-title) {
  color: #ffffff;
}

:global(body.dark-mode .about-modern .hero-description) {
  color: #94a3b8;
}

:global(body.dark-mode .about-modern .image-mask-wrapper) {
  border-color: #1e293b;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

:global(body.dark-mode .about-modern .image-bg-effect) {
  background-color: #334155;
}

:global(body.dark-mode .about-modern .story-section) {
  background-color: #0b0f19;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
}

:global(body.dark-mode .about-modern .story-image-card) {
  border-color: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

:global(body.dark-mode .about-modern .story-title) {
  color: #ffffff;
}

:global(body.dark-mode .about-modern .story-desc) {
  color: #94a3b8;
}

:global(body.dark-mode .about-modern .leadership-section) {
  background-color: #0f172a;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px);
}

:global(body.dark-mode .about-modern .leader-card) {
  background-color: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

:global(body.dark-mode .about-modern .leader-card:hover) {
  border-color: #60a5fa;
  box-shadow: 0 10px 25px rgba(96, 165, 250, 0.1);
}

:global(body.dark-mode .about-modern .leader-avatar-wrapper) {
  border-color: #334155;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

:global(body.dark-mode .about-modern .leader-name) {
  color: #ffffff;
}

:global(body.dark-mode .about-modern .leader-role) {
  color: #60a5fa;
}

:global(body.dark-mode .about-modern .values-section) {
  background-color: #0b0f19;
  border-top-color: #1e293b;
  border-bottom-color: #1e293b;
}

:global(body.dark-mode .about-modern .values-title) {
  color: #ffffff;
}

:global(body.dark-mode .about-modern .statement-subtitle) {
  color: #60a5fa;
}

:global(body.dark-mode .about-modern .statement-text) {
  color: #94a3b8;
}

:global(body.dark-mode .about-modern .value-card) {
  background-color: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

:global(body.dark-mode .about-modern .value-card:hover) {
  border-color: #60a5fa;
}

:global(body.dark-mode .about-modern .value-card-title) {
  color: #ffffff;
}

:global(body.dark-mode .about-modern .value-card-desc) {
  color: #94a3b8;
}

:global(body.dark-mode .about-modern .integrity-icon) {
  background-color: #0f172a;
}

:global(body.dark-mode .about-modern .service-icon) {
  background-color: #0f172a;
}

:global(body.dark-mode .about-modern .unity-icon) {
  background-color: #0f172a;
}

:global(body.dark-mode .about-modern .progress-icon) {
  background-color: #0f172a;
}

:global(body.dark-mode .about-modern .experience-section) {
  background-color: #0f172a;
  background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1.5px, transparent 1.5px);
}

:global(body.dark-mode .about-modern .experience-title) {
  color: #ffffff;
}

:global(body.dark-mode .about-modern .experience-subtitle) {
  color: #94a3b8;
}

:global(body.dark-mode .about-modern .btn-register) {
  background-color: #3b82f6;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

:global(body.dark-mode .about-modern .btn-register:hover) {
  background-color: #60a5fa;
  box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
}
</style>