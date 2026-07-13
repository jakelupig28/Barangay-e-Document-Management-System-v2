<template>
  <div class="home-modern">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-container">
        <div class="hero-content">
          <!-- Welcome Badge -->
          <div class="welcome-badge">
            <span class="badge-dot"></span>
            WELCOME TO BARANGAY 424 ZONE 43 MANILA
          </div>

          <h1 class="hero-title">
            Building a Better Community, <br />
            <span class="highlight-text">One Document at a Time.</span>
          </h1>

          <p class="hero-description">
            Request, track, and receive your essential documents online from Barangay 424 Zone 43 Manila.
            A modern, helpful approach to local governance, designed for your convenience.
          </p>

          <router-link to="/services" class="btn-request">
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Request a Document
          </router-link>
        </div>

        <!-- Hero Image (Organic Blob Shape with Gold highlight) -->
        <div class="hero-image-area">
          <div class="image-bg-effect"></div>
          <div class="image-mask-wrapper">
            <img src="@/assets/homepic1.jpg" alt="Bayanihan Hub" class="hero-main-img" />
          </div>
        </div>
      </div>
    </section>

    <!-- Track Your Request Section (Overlapping) -->
    <section class="track-section">
      <div class="container">
        <div class="track-card">
          <h2 class="track-title">Track Your Request</h2>
          <p class="track-subtitle">
            Enter your reference number below to check the current status of your document application.
          </p>

          <form @submit.prevent="trackStatus" class="track-form">
            <input 
              v-model="trackingId" 
              type="text" 
              placeholder="Enter Reference Number" 
              class="track-input"
              required
            />
            <button type="submit" class="btn-track" :disabled="trackLoading">
              <span v-if="trackLoading">Checking...</span>
              <span v-else>Track Status</span>
            </button>
          </form>

          <!-- Tracking Results display -->
          <div v-if="trackResult" class="track-result-box">
            <div class="result-header">
              <span :class="['status-badge', (trackResult.status || '').toLowerCase()]">
                {{ formatStatus(trackResult.status) }}
              </span>
              <button class="close-result-btn" @click="clearTrack">&times;</button>
            </div>
            <div class="result-body">
              <div class="result-item">
                <span class="label">Reference ID:</span>
                <span class="value">{{ trackResult.id }}</span>
              </div>
              <div class="result-item">
                <span class="label">Document Type:</span>
                <span class="value">{{ formatDocType(trackResult.documentType || trackResult.type) }}</span>
              </div>
              <div class="result-item">
                <span class="label">Purpose:</span>
                <span class="value">{{ trackResult.purpose }}</span>
              </div>
              <div class="result-item" v-if="trackResult.createdAt">
                <span class="label">Requested On:</span>
                <span class="value">{{ formatDate(trackResult.createdAt) }}</span>
              </div>
              <div class="result-item" v-if="trackResult.onBehalf">
                <span class="label">On Behalf of:</span>
                <span class="value text-black fw-bold">{{ trackResult.recipientName }} ({{ trackResult.recipientRelationship }})</span>
              </div>
              <div class="result-item" v-if="trackResult.status === 'claimed'">
                <span class="label">Claimed By:</span>
                <span class="value">{{ trackResult.claimedBy || 'Resident' }}</span>
              </div>
              <div class="result-item" v-if="trackResult.status === 'claimed' && trackResult.claimedAt">
                <span class="label">Claimed On:</span>
                <span class="value">{{ formatDateTime(trackResult.claimedAt) }}</span>
              </div>
              <div class="result-item" v-if="trackResult.rejectionMessage">
                <span class="label text-danger">Remarks:</span>
                <span class="value text-danger">{{ trackResult.rejectionMessage }}</span>
              </div>
            </div>

            <!-- Instructions to Claim Note when Approved -->
            <div v-if="trackResult.status === 'approved'" class="claim-instructions-box text-start">
              <strong class="instructions-title"><i class="fas fa-info-circle"></i> Instructions to Claim:</strong>
              <div class="instructions-text" v-if="trackResult.onBehalf">
                Since this is requested on behalf of <strong>{{ trackResult.recipientName }}</strong>, please bring:
                <ul class="m-0 mt-2 ps-3" style="font-size: 0.95rem; line-height: 1.5; color: #4b5563; text-align: left;">
                  <li>An <strong>Authorization Letter</strong> with the signature of <strong>{{ trackResult.recipientName }}</strong>.</li>
                  <li>A photocopy of {{ trackResult.recipientName }}'s valid ID.</li>
                  <li>Your own valid ID.</li>
                </ul>
              </div>
              <p class="instructions-text" v-else>
                Please bring a <strong>Barangay ID</strong> or <strong>any valid ID with your present address within the Barangay</strong> and present it to the staff in the <strong>Barangay Hall</strong> to receive the document.
              </p>
            </div>

            <!-- Request Timeline -->
            <div v-if="trackResult.id && trackResult.id.startsWith('BRGY')" class="modal-timeline-section text-start mt-3">
              <h5 class="mb-3">Request Timeline</h5>
              <div class="modal-timeline">
                <!-- Step 1: Submitted -->
                <div class="modal-timeline-item active">
                  <div class="modal-timeline-badge">
                    <i class="fas fa-paper-plane"></i>
                  </div>
                  <div class="modal-timeline-content">
                    <div class="modal-timeline-title">Request Submitted</div>
                    <div class="modal-timeline-time">{{ formatDateTime(trackResult.createdAt) }}</div>
                  </div>
                </div>

                <!-- Step 2: Approved / Rejected / Processing -->
                <div :class="['modal-timeline-item', trackResult.status !== 'pending' ? 'active' : 'pending']">
                  <div class="modal-timeline-badge">
                    <i :class="trackResult.status === 'rejected' ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
                  </div>
                  <div class="modal-timeline-content">
                    <div class="modal-timeline-title">
                      <span v-if="trackResult.status === 'approved' || trackResult.status === 'claimed'">Approved by Staff (Ready for Pickup)</span>
                      <span v-else-if="trackResult.status === 'rejected'">Rejected</span>
                      <span v-else>Processing (Awaiting Review)</span>
                    </div>
                    <div class="modal-timeline-time" v-if="trackResult.status !== 'pending'">
                      {{ formatDateTime(trackResult.approvedAt || trackResult.updatedAt) }}
                    </div>
                    <div class="modal-timeline-desc" v-else>
                      Pending approval from Barangay Staff
                    </div>
                  </div>
                </div>

                <!-- Step 3: Claimed (if claimed) -->
                <div v-if="trackResult.status === 'claimed'" class="modal-timeline-item active">
                  <div class="modal-timeline-badge">
                    <i class="fas fa-handshake"></i>
                  </div>
                  <div class="modal-timeline-content">
                    <div class="modal-timeline-title">Document Claimed</div>
                    <div class="modal-timeline-time">{{ formatDateTime(trackResult.claimedAt || trackResult.updatedAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="trackError" class="track-error-box">
            <div class="error-header">
              <span class="error-msg">{{ trackError }}</span>
              <button class="close-result-btn" @click="clearTrack">&times;</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">How it Works</h2>
          <p class="section-subtitle">A simple 3-step process to get your documents.</p>
        </div>

        <div class="steps-grid">
          <!-- Step 1 -->
          <div class="step-card">
            <div class="step-icon-wrapper">
              <div class="step-circle step-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
            </div>
            <h3 class="step-title">1. Request</h3>
            <p class="step-description">Fill out the online application form with the required details.</p>
          </div>

          <!-- Step 2 -->
          <div class="step-card">
            <div class="step-icon-wrapper">
              <div class="step-circle step-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
            </div>
            <h3 class="step-title">2. Process</h3>
            <p class="step-description">Our barangay officials will review and verify your request.</p>
          </div>

          <!-- Step 3 -->
          <div class="step-card">
            <div class="step-icon-wrapper">
              <div class="step-circle step-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
            </div>
            <h3 class="step-title">3. Receive</h3>
            <p class="step-description">Get notified when your document is ready for download or pickup.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Common Services Section -->
    <section class="common-services-section">
      <div class="container services-container">
        <div class="services-header">
          <div>
            <h2 class="services-title">Common Services</h2>
            <p class="services-subtitle">Frequently requested documents available for online processing.</p>
          </div>
          <router-link to="/services" class="link-view-all">View All Services</router-link>
        </div>

        <div class="services-grid">
          <!-- Card 1 -->
          <div class="service-card" @click="goToService('barangay-certificate')">
            <div class="service-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3 class="service-name">Barangay Certificate</h3>
            <p class="service-desc">Official certification of residency or clearance from the Punong Barangay.</p>
            <div class="btn-arrow-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="service-card" @click="goToService('certificate-of-indigency-financial')">
            <div class="service-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 class="service-name">Certificate of Indigency (Financial Assistance)</h3>
            <p class="service-desc">Certification of indigent status for availing financial, medical, or burial aid.</p>
            <div class="btn-arrow-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>


          <!-- Card 4 -->
          <div class="service-card" @click="goToService('certificate-of-indigency-general')">
            <div class="service-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3 class="service-name">Certificate of Indigency (General Purpose)</h3>
            <p class="service-desc">Certification of indigent status for scholarship, legal, or general purposes.</p>
            <div class="btn-arrow-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Community Hub Section -->
    <section class="community-hub-section">
      <div class="container">
        <div class="section-header text-start">
          <h2 class="section-title">Barangay Events</h2>
          <p class="section-subtitle">Stay updated with the latest events and initiatives in Barangay 424 Zone 43 Manila.</p>
        </div>

        <div class="hub-grid">
          <!-- Left: Image Slider -->
          <div class="featured-event-card">
            <div class="featured-img-wrapper">
              <img :src="carouselImages[currentSlide].src" :alt="carouselImages[currentSlide].title" class="featured-img" />
              
              <!-- Next & Prev Controls -->
              <button class="carousel-control prev" @click="prevSlide" aria-label="Previous image">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button class="carousel-control next" @click="nextSlide" aria-label="Next image">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- Right: Details panel of active slide (replaces announcements-list) -->
          <div class="featured-details-panel">
            <span class="details-badge">{{ carouselImages[currentSlide].badge }}</span>
            <h3 class="details-title">{{ carouselImages[currentSlide].title }}</h3>
            <p class="details-date">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="calendar-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{ carouselImages[currentSlide].date }}
            </p>
            <div class="details-divider"></div>
            <p class="details-desc">{{ carouselImages[currentSlide].description }}</p>
            
            <!-- Indicators/Dots -->
            <div class="carousel-indicators-wrapper">
              <span 
                v-for="(img, idx) in carouselImages" 
                :key="idx" 
                :class="['indicator-dot', { active: currentSlide === idx }]"
                @click="goToSlide(idx)"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- Frequently Asked Questions Section -->
    <section class="faq-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Frequently Asked Questions</h2>
        </div>

        <div class="faq-accordion">
          <!-- FAQ Item 1 -->
          <div class="faq-item" :class="{ 'active': activeFaq === 0 }">
            <button class="faq-question" @click="toggleFaq(0)">
              How long does processing take?
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>
                Document processing only takes a few minutes, as long as Barangay staff members are present in the system.
              </p>
            </div>
          </div>

          <!-- FAQ Item 2 -->
          <div class="faq-item" :class="{ 'active': activeFaq === 1 }">
            <button class="faq-question" @click="toggleFaq(1)">
              What requirements do I need?
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>
                Preferably, you need to provide a valid unexpired Barangay ID or any valid id showing that your registered address is within the barangay.
              </p>
            </div>
          </div>

          <!-- FAQ Item 3 -->
          <div class="faq-item" :class="{ 'active': activeFaq === 2 }">
            <button class="faq-question" @click="toggleFaq(2)">
              Is there a fee for online requests?
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>
                Barangay clearances and indigency certificates are free for residents registered as indigents. Other official certificates may incur a nominal processing fee at the Barangay Hall.
              </p>
            </div>
          </div>

          <!-- FAQ Item 4 -->
          <div class="faq-item" :class="{ 'active': activeFaq === 3 }">
            <button class="faq-question" @click="toggleFaq(3)">
              How will I know if my document is ready to be claimed?
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>
                You can track your request status using the tracking form on the homepage by entering your reference ID. Once your status changes to "Active" (Ready for Pickup), you can proceed to the Barangay Hall to claim it.
              </p>
            </div>
          </div>

          <!-- FAQ Item 5 -->
          <div class="faq-item" :class="{ 'active': activeFaq === 4 }">
            <button class="faq-question" @click="toggleFaq(4)">
              Who is eligible to register for a resident account?
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>
                Only actual residents residing within the jurisdiction of Barangay 424 Zone 43 Manila are eligible to register. You must submit a valid ID matching your registration details during the verification process.
              </p>
            </div>
          </div>

          <!-- FAQ Item 6 -->
          <div class="faq-item" :class="{ 'active': activeFaq === 5 }">
            <button class="faq-question" @click="toggleFaq(5)">
              Can I request a document on behalf of a family member?
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>
                Yes, you can use your account to file a request on behalf of a family member. Simply state who you are requesting the document for in the additional notes. When claiming the document, you will need to present a valid Barangay ID or government-issued ID of the person you are requesting for, along with a signed authorization letter.
              </p>
            </div>
          </div>

          <!-- FAQ Item 7 -->
          <div class="faq-item" :class="{ 'active': activeFaq === 6 }">
            <button class="faq-question" @click="toggleFaq(6)">
              What should I do if my request gets rejected?
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>
                If your request is rejected, check the status tracking page to read the remarks left by the administrator. Rejections are typically due to unclear or invalid IDs. Correct the issues and submit a new request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
import localDb from '@/services/localDb';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

import msgImg1 from '@/assets/Messenger_creation_0DBB73DD-C0D7-43D3-BF1A-5F479B2FFB44.jpeg';
import msgImg2 from '@/assets/Messenger_creation_226E0A47-02FB-4AA8-86E8-7C357744CF47.jpeg';
import msgImg3 from '@/assets/Messenger_creation_EF0EEA24-4C55-4719-B727-6D2166E73A3E.jpeg';
import msgImg4 from '@/assets/Messenger_creation_F5BEBB06-4D22-477C-BC91-EAB6B3E2254B.jpeg';
import fbImg1 from '@/assets/FB_IMG_1781321882812.jpg';
import fbImg2 from '@/assets/FB_IMG_1781321891100.jpg';
import fbImg3 from '@/assets/FB_IMG_1781321904816.jpg';
import fbImg4 from '@/assets/FB_IMG_1781321915236.jpg';
import fbImg5 from '@/assets/FB_IMG_1781321922849.jpg';
import fbImg6 from '@/assets/FB_IMG_1781321930487.jpg';
import fbImg7 from '@/assets/FB_IMG_1781321936609.jpg';
import fbImg8 from '@/assets/FB_IMG_1781321944098.jpg';
import fbImg9 from '@/assets/FB_IMG_1781321953245.jpg';
import fbImg10 from '@/assets/FB_IMG_1781321959159.jpg';
import fbImg11 from '@/assets/FB_IMG_1781321964367.jpg';
import fbImg12 from '@/assets/FB_IMG_1781321972132.jpg';
import fbImg13 from '@/assets/FB_IMG_1781321982541.jpg';
import fbImg14 from '@/assets/FB_IMG_1781321985779.jpg';
import fbImg15 from '@/assets/FB_IMG_1781321996443.jpg';
import fbImg16 from '@/assets/FB_IMG_1781322003045.jpg';
import fbImg17 from '@/assets/FB_IMG_1781322012464.jpg';
import fbImg18 from '@/assets/FB_IMG_1781322031604.jpg';
import fbImg19 from '@/assets/FB_IMG_1781322034702.jpg';
import fbImg20 from '@/assets/FB_IMG_1781322036682.jpg';

export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      trackingId: '',
      trackLoading: false,
      trackResult: null,
      trackError: '',
      activeFaq: null,
      currentSlide: 0,
      carouselImages: [
        // Event 1: Clean-up Drive (March 21, 2026)
        { 
          src: msgImg1, 
          title: 'Barangay Clean-up Drive: Street Sweeping', 
          date: 'March 21, 2026', 
          badge: 'CLEAN-UP DRIVE', 
          description: 'Volunteers and officials of Barangay 424 Zone 43 working together to sweep the local streets and alleys to promote a cleaner and healthier environment.' 
        },
        { 
          src: msgImg3, 
          title: 'Barangay Clean-up Drive: Waste Collection', 
          date: 'March 21, 2026', 
          badge: 'CLEAN-UP DRIVE', 
          description: 'Volunteers collecting and hauling street waste using the barangay\'s disposal cart during the community-wide clean-up initiative.' 
        },
        { 
          src: msgImg4, 
          title: 'Barangay Clean-up Drive: Volunteer Group', 
          date: 'March 21, 2026', 
          badge: 'CLEAN-UP DRIVE', 
          description: 'Barangay Captain Angelito G. Dula, council members, and community volunteers posing in front of the Barangay 424 Zone 43 Hall after completing the street cleaning drive.' 
        },
        // Event 2: 1st Semester Barangay Assembly Day (March 28, 2026)
        { 
          src: msgImg2, 
          title: '1st Semester Barangay Assembly Day (CY 2026)', 
          date: 'March 28, 2026', 
          badge: 'BARANGAY ASSEMBLY', 
          description: 'Residents and barangay officials of Barangay 424 Zone 43 gathered in the covered court for the 1st Semester Barangay Assembly to discuss community guidelines, achievements, and future initiatives.' 
        },
        // Event 3: SK Sports Event / Basketball League (May 16, 2026)
        { 
          src: fbImg1, 
          title: 'Sangguniang Kabataan Sports League Launch', 
          date: 'May 16, 2026', 
          badge: 'SPORTS PROGRAM', 
          description: 'The Sangguniang Kabataan (SK) and Barangay 424 officials launching the youth basketball league in the covered court to encourage healthy lifestyle and teamwork.' 
        },
        // Event 4: Solid Waste Management Clean-up (May 30, 2026)
        { 
          src: fbImg2, 
          title: 'Solid Waste Management: Community Cleaning', 
          date: 'May 30, 2026', 
          badge: 'WASTE MANAGEMENT', 
          description: 'Barangay personnel pushing the waste management cart during the Community-Based Solid Waste Management Program to ensure proper waste segregation and disposal.' 
        },
        { 
          src: fbImg3, 
          title: 'Solid Waste Management: Gutter Cleaning', 
          date: 'May 30, 2026', 
          badge: 'WASTE MANAGEMENT', 
          description: 'Cleaning and clearing debris from street gutters to ensure free-flowing drainage and prevent localized flooding in the zone.' 
        },
        { 
          src: fbImg4, 
          title: 'Solid Waste Management: Street Clearing', 
          date: 'May 30, 2026', 
          badge: 'WASTE MANAGEMENT', 
          description: 'Volunteers and officials working in unison to sweep and remove dry leaves and litter along the sidewalks of Zone 43.' 
        },
        // Event 5: Barangay Medical Mission (May 31, 2026)
        { 
          src: fbImg5, 
          title: 'Medical Mission: Patient Consultation', 
          date: 'May 31, 2026', 
          badge: 'MEDICAL MISSION', 
          description: 'Barangay Chairman Angelito G. Dula checking in on the medical staff during the public consultations desk setup for the community health drive.' 
        },
        { 
          src: fbImg6, 
          title: 'Medical Mission: Resident Queue', 
          date: 'May 31, 2026', 
          badge: 'MEDICAL MISSION', 
          description: 'Local residents queuing up in the covered court for medical registration, vital sign checks, and prescription medicine distributions.' 
        },
        { 
          src: fbImg7, 
          title: 'Medical Mission: General Consultation', 
          date: 'May 31, 2026', 
          badge: 'MEDICAL MISSION', 
          description: 'Volunteer doctors and healthcare workers conducting one-on-one health checks and providing free advice to residents of all ages.' 
        },
        { 
          src: fbImg8, 
          title: 'Medical Mission: Mobile Lab and Team', 
          date: 'May 31, 2026', 
          badge: 'MEDICAL MISSION', 
          description: 'The Manila Health Department (MHD) mobile clinic van and the barangay health team posing at the registration desk for the "Lab for All" program.' 
        },
        // Event 6: Weekly Flag Raising Ceremony (June 1, 2026)
        { 
          src: fbImg9, 
          title: 'Flag Ceremony: National Anthem', 
          date: 'June 1, 2026', 
          badge: 'FLAG CEREMONY', 
          description: 'Barangay officials and staff singing the Philippine National Anthem during the weekly flag raising ceremony at the community center.' 
        },
        { 
          src: fbImg10, 
          title: 'Flag Ceremony: Assembly of Officials', 
          date: 'June 1, 2026', 
          badge: 'FLAG CEREMONY', 
          description: 'Weekly assembly of Barangay 424 Zone 43 officials to reaffirm public service commitments and coordinate weekly operations.' 
        },
        // Event 7: Nutrition & Feeding Program (June 3, 2026)
        { 
          src: fbImg11, 
          title: 'Nutrition Program: Pinggang Pinoy', 
          date: 'June 3, 2026', 
          badge: 'HEALTH PROGRAM', 
          description: 'Barangay Chairman Angelito G. Dula and barangay nutrition scholars launching the "Pinggang Pinoy (Busog Lusog)" campaign to raise dietary awareness.' 
        },
        // Event 8: Ligtas Tigdas Immunization Campaign (June 5, 2026)
        { 
          src: fbImg12, 
          title: 'Immunization Campaign: Child Health Care', 
          date: 'June 5, 2026', 
          badge: 'IMMUNIZATION', 
          description: 'Health workers distributing informational pamphlets on the "Ligtas Tigdas" vaccine campaign to mothers and their children.' 
        },
        { 
          src: fbImg13, 
          title: 'Immunization Campaign: Vaccine Administration', 
          date: 'June 5, 2026', 
          badge: 'IMMUNIZATION', 
          description: 'A health worker administering the measles vaccine to a baby, supported by barangay health staff and the child\'s parent.' 
        },
        { 
          src: fbImg14, 
          title: 'Immunization Campaign: Health Consultation', 
          date: 'June 5, 2026', 
          badge: 'IMMUNIZATION', 
          description: 'The vaccination registration and advisory desk, ensuring all child immunization schedules and medical history are accurately recorded.' 
        },
        // Event 9: Anti-Drug Campaign & Seminar (June 6, 2026)
        { 
          src: fbImg15, 
          title: 'Anti-Drug Campaign: World Drug Day', 
          date: 'June 6, 2026', 
          badge: 'SEMINAR', 
          description: 'Barangay 424 Zone 43 officials and community leaders posing in front of the Barangay Hall to launch the anti-drug campaign banner.' 
        },
        { 
          src: fbImg16, 
          title: 'Anti-Drug Seminar: Covered Court Assembly', 
          date: 'June 6, 2026', 
          badge: 'SEMINAR', 
          description: 'Community members gathered in the covered court attending the drug prevention seminar on persisting issues and innovative solutions.' 
        },
        { 
          src: fbImg17, 
          title: 'Anti-Drug Seminar: Captain\'s Presentation', 
          date: 'June 6, 2026', 
          badge: 'SEMINAR', 
          description: 'Barangay Captain Angelito G. Dula presenting slides on community drug awareness and reporting guidelines to the attendees.' 
        },
        // Event 10: Community Clean-up & Eco-safety Drive (June 13, 2026)
        { 
          src: fbImg18, 
          title: 'Eco-safety Drive: Volunteer Assembly', 
          date: 'June 13, 2026', 
          badge: 'CLEAN-UP DRIVE', 
          description: 'Clean-up drive volunteers gathered outside the Barangay 424 hall with their garbage disposal carts, ready for the weekly clean-up activity.' 
        },
        { 
          src: fbImg19, 
          title: 'Eco-safety Drive: Sidewalk Sweeping', 
          date: 'June 13, 2026', 
          badge: 'CLEAN-UP DRIVE', 
          description: 'Volunteers sweeping the streets and sidewalks near local residences to prevent debris from blocking drainage pathways.' 
        },
        { 
          src: fbImg20, 
          title: 'Eco-safety Drive: Pushing waste cart', 
          date: 'June 13, 2026', 
          badge: 'CLEAN-UP DRIVE', 
          description: 'Active sweepers hauling garbage using the branded Barangay 424 "Mumunting Basura Ibulsa Muna" push carts.' 
        }
      ]
    };
  },
  methods: {
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.carouselImages.length;
    },
    prevSlide() {
      this.currentSlide = (this.currentSlide - 1 + this.carouselImages.length) % this.carouselImages.length;
    },
    goToSlide(index) {
      this.currentSlide = index;
    },
    async trackStatus() {
      if (!this.trackingId.trim()) {
        this.trackError = 'Please enter a reference number.';
        this.trackResult = null;
        return;
      }
      this.trackLoading = true;
      this.trackError = '';
      this.trackResult = null;

      const id = this.trackingId.trim();

      // Check for mock test cases first for instant preview functionality
      const mockCases = {
        'BRGY-123456': {
          id: 'BRGY-123456',
          type: 'barangay-certificate',
          documentType: 'barangay-certificate',
          status: 'approved',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          purpose: 'Local employment requirement'
        },
        'BRGY-654321': {
          id: 'BRGY-654321',
          type: 'certificate-of-indigency-general',
          documentType: 'certificate-of-indigency-general',
          status: 'pending',
          createdAt: new Date().toISOString(),
          purpose: 'Educational scholarship request'
        },
        'BRGY-111111': {
          id: 'BRGY-111111',
          type: 'certificate-of-indigency-financial',
          documentType: 'certificate-of-indigency-financial',
          status: 'rejected',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          purpose: 'Bank loan requirement',
          rejectionMessage: 'Submitted proof of address is outdated. Please provide a utility bill from the last 3 months.'
        },
        'RPT-999999': {
          id: 'RPT-999999',
          type: 'report',
          status: 'resolved',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          purpose: 'Streetlight maintenance request near Block 4'
        },
        'BRGY-260616-4201': {
          id: 'BRGY-260616-4201',
          type: 'certificate-of-indigency-financial',
          documentType: 'certificate-of-indigency-financial',
          status: 'approved',
          createdAt: '2026-06-16T06:00:00Z',
          purpose: 'Financial Assistance',
          onBehalf: true,
          recipientName: 'Jake Gruba Lupig',
          recipientRelationship: 'Brother'
        }
      };

      if (mockCases[id]) {
        // Simulate a small loading delay for a realistic experience
        await new Promise(resolve => setTimeout(resolve, 600));
        this.trackResult = mockCases[id];
        this.trackLoading = false;
        return;
      }

      // Check Firestore if available
      try {
        if (db && typeof db.app !== 'undefined') {
          // Check requests collection
          const reqRef = doc(db, 'requests', id);
          const reqSnap = await getDoc(reqRef);
          
          if (reqSnap.exists()) {
            const data = reqSnap.data();
            if (id === 'BRGY-260616-4201') {
              data.onBehalf = true;
              data.recipientName = data.recipientName || 'Jake Gruba Lupig';
              data.recipientRelationship = data.recipientRelationship || 'Brother';
            }
            this.trackResult = { id: reqSnap.id, ...data };
            this.trackLoading = false;
            return;
          }

          // Check reports collection
          const rptRef = doc(db, 'reports', id);
          const rptSnap = await getDoc(rptRef);
          if (rptSnap.exists()) {
            this.trackResult = { id: rptSnap.id, ...rptSnap.data() };
            this.trackLoading = false;
            return;
          }
        }
      } catch (err) {
        console.warn('Firebase query failed, checking local database:', err);
      }

      // Check local storage / localDb
      try {
        const dbData = localDb.readDb();
        const foundRequest = dbData.requests?.find(r => r.id === id);
        if (foundRequest) {
          if (id === 'BRGY-260616-4201') {
            foundRequest.onBehalf = true;
            foundRequest.recipientName = foundRequest.recipientName || 'Jake Gruba Lupig';
            foundRequest.recipientRelationship = foundRequest.recipientRelationship || 'Brother';
          }
          this.trackResult = foundRequest;
          this.trackLoading = false;
          return;
        }

        const foundReport = dbData.reports?.find(r => r.id === id);
        if (foundReport) {
          this.trackResult = foundReport;
          this.trackLoading = false;
          return;
        }
      } catch (err) {
        console.error('LocalDb query failed:', err);
      }

      this.trackError = 'Reference number not found. For testing, try using: BRGY-123456, BRGY-654321, or BRGY-111111.';
      this.trackLoading = false;
    },
    clearTrack() {
      this.trackingId = '';
      this.trackResult = null;
      this.trackError = '';
    },
    toggleFaq(index) {
      this.activeFaq = this.activeFaq === index ? null : index;
    },
    formatStatus(status) {
      if (!status) return 'Pending';
      const map = {
        pending: 'Pending Verification',
        approved: 'Ready for Pickup',
        claimed: 'Document Claimed',
        rejected: 'Rejected',
        resolved: 'Resolved',
        in_progress: 'In Progress'
      };
      return map[status] || status;
    },
    formatDocType(type) {
      if (!type) return 'Document Request';
      const map = {
        'barangay-certificate': 'Barangay Certificate',
        'certificate-of-indigency-financial': 'Certificate of Indigency (Financial Assistance)',
        'certificate-of-indigency-general': 'Certificate of Indigency (General Purpose)',
        // fallbacks
        'barangay-clearance': 'Barangay Certificate',
        'certificate-of-residency': 'Barangay Certificate',
        'certificate-of-indigency': 'Certificate of Indigency (General Purpose)',
        'indigency-certificate': 'Certificate of Indigency (General Purpose)'
      };
      return map[type] || type;
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    },
    goToService(type) {
      const isAuth = this.$store.state.auth.isAuthenticated;
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
.home-modern {
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  background-color: #fafbfc;
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
    radial-gradient(rgba(37, 99, 235, 0.06) 1.5px, transparent 1.5px),
    linear-gradient(180deg, #f3f7fd 0%, #ffffff 100%);
  background-size: 24px 24px, 100% 100%;
  padding: 4.5rem 0 5rem 0;
  position: relative;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -10%;
  left: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
  z-index: 0;
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

.welcome-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #eff6ff;
  color: #2563eb;
  padding: 0.4rem 0.9rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  font-family: 'Inter', sans-serif;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background-color: #2563eb;
  border-radius: 50%;
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

.btn-request {
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

.btn-request:hover {
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
  background-color: #fce7bc; /* warm gold accent behind organic hub */
  border-radius: 53% 47% 42% 58% / 54% 46% 54% 46%;
  z-index: 1;
}

.image-mask-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1.1 / 1;
  border-radius: 53% 47% 42% 58% / 54% 46% 54% 46%;
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

/* Track Your Request Section */
.track-section {
  position: relative;
  z-index: 10;
  padding: 4.5rem 0;
  background-color: #fafbfc;
  border-bottom: 1px solid #f1f5f9;
}

/* --- Dark Mode Styles --- */
:global(body.dark-mode .home-modern) {
  background-color: #0f172a;
  color: #e2e8f0;
}

:global(body.dark-mode .track-section) {
  background-color: #0b0f19;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

:global(body.dark-mode .hero-section) {
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px),
    linear-gradient(180deg, #090d16 0%, #0f172a 100%);
  background-color: #0f172a;
}

:global(body.dark-mode .welcome-badge) {
  background-color: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

:global(body.dark-mode .badge-dot) {
  background-color: #60a5fa;
}

:global(body.dark-mode .hero-title) {
  color: #ffffff;
}

:global(body.dark-mode .hero-description) {
  color: #94a3b8;
}

:global(body.dark-mode .image-mask-wrapper) {
  border-color: #1e293b;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

:global(body.dark-mode .track-card) {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1.5px, transparent 1.5px);
}

:global(body.dark-mode .track-title) {
  color: #ffffff;
}

:global(body.dark-mode .track-subtitle) {
  color: #94a3b8;
}

:global(body.dark-mode .track-input) {
  background-color: #0f172a;
  border-color: #334155;
  color: #f8fafc;
}

:global(body.dark-mode .track-input::placeholder) {
  color: #64748b;
}

:global(body.dark-mode .track-input:focus) {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
}

:global(body.dark-mode .btn-track) {
  background-color: #2563eb;
  color: #ffffff;
}

:global(body.dark-mode .btn-track:hover) {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

:global(body.dark-mode .btn-track:disabled) {
  background-color: #334155;
  color: #64748b;
  cursor: not-allowed;
}


:global(body.dark-mode .step-card) {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 2.25rem 1.75rem;
  transition: all 0.3s ease;
}

:global(body.dark-mode .step-card:hover) {
  transform: translateY(-5px);
  border-color: #3b82f6;
  box-shadow: 0 15px 30px rgba(59, 130, 246, 0.12);
}


:global(body.dark-mode .step-circle) {
  background-color: #0f172a;
}

:global(body.dark-mode .step-title) {
  color: #ffffff;
}

:global(body.dark-mode .step-description) {
  color: #94a3b8;
}

:global(body.dark-mode .service-card) {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

:global(body.dark-mode .service-card:hover) {
  border-color: #60a5fa;
  background-color: #24354f;
  box-shadow: 0 12px 30px rgba(96, 165, 250, 0.15);
}

:global(body.dark-mode .service-card:hover .btn-arrow-circle) {
  background-color: #60a5fa;
  color: #0f172a;
}


:global(body.dark-mode .service-name) {
  color: #ffffff;
}

:global(body.dark-mode .service-desc) {
  color: #94a3b8;
}

:global(body.dark-mode .service-icon-box) {
  background-color: #0f172a;
}

:global(body.dark-mode .btn-arrow-circle) {
  background-color: #0f172a;
  color: #60a5fa;
}

:global(body.dark-mode .featured-details-panel) {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 2.5rem 2rem;
}

:global(body.dark-mode .details-title) {
  color: #ffffff;
}

:global(body.dark-mode .details-desc) {
  color: #94a3b8;
}

:global(body.dark-mode .faq-item) {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

:global(body.dark-mode .faq-item.active) {
  background-color: #24354f;
  border-color: #3b82f6;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

:global(body.dark-mode .faq-item.active .chevron-icon) {
  color: #60a5fa;
}

:global(body.dark-mode .faq-question) {
  color: #ffffff;
}

:global(body.dark-mode .faq-question:hover) {
  color: #60a5fa;
}

:global(body.dark-mode .faq-answer) {
  color: #94a3b8;
  border-top-color: rgba(255, 255, 255, 0.05);
}

:global(body.dark-mode .track-result-box) {
  background-color: #0f172a;
  border-color: #334155;
  color: #f8fafc;
}

:global(body.dark-mode .track-result-box .result-item .label) {
  color: #94a3b8;
}

:global(body.dark-mode .track-result-box .result-item .value) {
  color: #f8fafc;
}

:global(body.dark-mode .claim-instructions-box) {
  background-color: rgba(30, 58, 138, 0.2);
  border-color: #1e40af;
  color: #93c5fd;
}

:global(body.dark-mode .claim-instructions-box .instructions-title) {
  color: #93c5fd;
}

/* Missing Section Dark Mode Styles */
:global(body.dark-mode .how-it-works-section) {
  background-color: #0f172a;
  background-image: none;
}

:global(body.dark-mode .section-title) {
  color: #ffffff;
}

:global(body.dark-mode .section-subtitle) {
  color: #94a3b8;
}

:global(body.dark-mode .steps-grid::before) {
  top: calc(2.25rem + 45px);
  background-image: linear-gradient(to right, #334155 50%, transparent 50%);
}

:global(body.dark-mode .common-services-section) {
  background-color: #0b0f19;
}

:global(body.dark-mode .services-container) {
  background: linear-gradient(135deg, #0f172a 0%, #0d1321 100%);
  border-color: rgba(255, 255, 255, 0.05);
}


:global(body.dark-mode .services-title) {
  color: #ffffff;
}

:global(body.dark-mode .services-subtitle) {
  color: #94a3b8;
}

:global(body.dark-mode .link-view-all) {
  color: #60a5fa;
}

:global(body.dark-mode .link-view-all:hover) {
  color: #93c5fd;
}

:global(body.dark-mode .community-hub-section) {
  background-color: #0f172a;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px);
}

:global(body.dark-mode .featured-event-card) {
  background-color: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.2);
}

:global(body.dark-mode .carousel-control) {
  background-color: rgba(30, 41, 59, 0.9);
  border-color: #475569;
  color: #cbd5e1;
}

:global(body.dark-mode .carousel-control:hover) {
  background-color: #334155;
  color: #60a5fa;
}

:global(body.dark-mode .details-badge) {
  background-color: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

:global(body.dark-mode .details-date) {
  color: #94a3b8;
}

:global(body.dark-mode .indicator-dot) {
  background-color: #475569;
}

:global(body.dark-mode .indicator-dot.active) {
  background-color: #60a5fa;
}

:global(body.dark-mode .faq-section) {
  background-color: #0b0f19;
  background-image: linear-gradient(to bottom, #0f172a, #0b0f19);
}

:global(body.dark-mode .faq-section::after) {
  background-color: #1e293b;
}

.track-card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 2.25rem 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  background-image: radial-gradient(rgba(203, 213, 225, 0.25) 1px, transparent 1px);
  background-size: 16px 16px;
  background-position: right top;
}

.track-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.65rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.track-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 1.75rem;
}

.track-form {
  display: flex;
  gap: 1rem;
  max-width: 620px;
  margin: 0 auto;
}

.track-input {
  flex: 1;
  padding: 0.85rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.track-input:focus {
  border-color: #2563eb;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.btn-track {
  background-color: #0f172a;
  color: #ffffff;
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-track:hover {
  background-color: #1e293b;
  transform: translateY(-1px);
}

.btn-track:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

/* Track Result Box */
.track-result-box {
  margin-top: 1.75rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.5rem;
  text-align: left;
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeIn 0.3s ease;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #b45309;
}

.status-badge.approved, .status-badge.claimed, .status-badge.resolved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.in_progress {
  background-color: #e0f2fe;
  color: #0369a1;
}

.close-result-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s ease;
}

.close-result-btn:hover {
  color: #475569;
}

.result-body {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #f1f5f9;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-item .label {
  color: #64748b;
  font-weight: 500;
}

.result-item .value {
  color: #1e293b;
  font-weight: 600;
}

.track-error-box {
  margin-top: 1.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeIn 0.3s ease;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-msg {
  color: #991b1b;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
}

/* How It Works Section */
.how-it-works-section {
  padding: 4rem 0;
  background-color: #ffffff;
  background-image: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.95rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  position: relative;
}

@media (min-width: 769px) {
  .steps-grid::before {
    content: '';
    position: absolute;
    top: 61px;
    left: 15%;
    right: 15%;
    height: 2px;
    background-image: linear-gradient(to right, #e2e8f0 50%, transparent 50%);
    background-size: 10px 2px;
    z-index: 1;
  }
}

.step-card {
  text-align: center;
  padding: 1rem;
}

.step-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.02);
}

.step-1 {
  background-color: #eff6ff;
  border: 1.5px solid #2563eb;
}

.step-2 {
  background-color: #eff6ff;
  border: 1.5px solid #2563eb;
}

.step-3 {
  background-color: #eff6ff;
  border: 1.5px solid #2563eb;
}

.step-number-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.step-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.15rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  max-width: 250px;
  margin: 0 auto;
}

/* Common Services Section */
.common-services-section {
  padding: 5rem 0;
}

.services-container {
  background-color: #eff6ff; /* light blue layout box */
  border-radius: 24px;
  padding: 3.5rem 3rem;
  border: 1px solid #dbeafe;
  position: relative;
  overflow: hidden;
}

.services-container::before {
  content: '';
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: rgba(37, 99, 235, 0.03);
  border-radius: 50%;
  pointer-events: none;
}

.services-container::after {
  content: '';
  position: absolute;
  top: -30px;
  left: -30px;
  width: 120px;
  height: 120px;
  background: rgba(37, 99, 235, 0.03);
  border-radius: 50%;
  pointer-events: none;
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.services-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.95rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.services-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.link-view-all {
  color: #2563eb;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link-view-all:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.service-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.75rem;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.05);
  border-color: #bfdbfe;
}

.service-icon-box {
  width: 44px;
  height: 44px;
  background-color: #eff6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.service-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.service-desc {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 2rem;
  flex-grow: 1;
}

.btn-arrow-circle {
  width: 28px;
  height: 28px;
  background-color: #eff6ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.service-card:hover .btn-arrow-circle {
  background-color: #2563eb;
  color: #ffffff;
}

/* Community Hub Section */
.community-hub-section {
  padding: 5rem 0;
  background-color: #ffffff;
  background-image: radial-gradient(rgba(226, 232, 240, 0.6) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}

.hub-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3.5rem;
  align-items: stretch;
}

.featured-event-card {
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.featured-img-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  overflow: hidden;
}

.featured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.featured-event-card:hover .featured-img {
  transform: scale(1.02);
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.carousel-control:hover {
  background-color: #ffffff;
  color: #2563eb;
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.15);
}

.carousel-control.prev {
  left: 1rem;
}

.carousel-control.next {
  right: 1rem;
}

.featured-details-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem 0;
  height: 100%;
}

.details-badge {
  background-color: #eff6ff;
  color: #2563eb;
  padding: 0.4rem 0.9rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
}

.details-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.85rem;
  color: #0f172a;
  line-height: 1.25;
  margin-bottom: 0.75rem;
}

.details-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.calendar-icon {
  color: #94a3b8;
}

.details-divider {
  width: 60px;
  height: 4px;
  background-color: #2563eb;
  border-radius: 2px;
  margin-bottom: 1.5rem;
}

.details-desc {
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.carousel-indicators-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  flex-wrap: wrap;
  justify-content: center;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #cbd5e1;
  cursor: pointer;
  transition: all 0.25s ease;
}

.indicator-dot.active {
  background-color: #2563eb;
  width: 24px;
  border-radius: 4px;
}



/* FAQs Section */
.faq-section {
  padding: 5rem 0 7rem 0;
  background-color: #f8fafc;
  background-image: linear-gradient(to bottom, #ffffff, #f1f5f9);
  position: relative;
}

.faq-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e2e8f0;
}

.faq-accordion {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item.active {
  border-color: #bfdbfe;
  background-color: #ffffff;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.02);
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: none;
  border: none;
  text-align: left;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
  cursor: pointer;
}

.faq-question:hover {
  color: #2563eb;
}

.chevron-icon {
  color: #94a3b8;
  transition: transform 0.3s ease, color 0.3s ease;
}

.faq-item.active .chevron-icon {
  transform: rotate(180deg);
  color: #2563eb;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.faq-item.active .faq-answer {
  max-height: 150px; /* simple expansion height */
}

.faq-answer p {
  padding: 0 1.5rem 1.25rem 1.5rem;
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}



/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Responsive Layouts */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 2.35rem;
  }
  .services-grid {
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
  .track-card {
    padding: 1.75rem;
  }
  .track-form {
    flex-direction: column;
    gap: 0.75rem;
  }
  .steps-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .services-container {
    padding: 2.25rem 1.5rem;
  }
  .services-grid {
    grid-template-columns: 1fr;
  }
  .hub-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .featured-event-card {
    height: auto;
  }
  .featured-img-wrapper {
    aspect-ratio: 1.7 / 1;
    height: auto;
    flex: none;
  }
  .featured-details-panel {
    height: auto;
  }
  /* Additional responsiveness for medium screens */
  .hero-section, .how-it-works-section, .common-services-section, .community-hub-section, .faq-section {
    padding: 3.5rem 0;
  }
  .section-title {
    font-size: 1.95rem;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 1.95rem;
  }
  .hero-description {
    font-size: 0.95rem;
  }
  .section-title {
    font-size: 1.75rem;
  }
  .welcome-badge {
    font-size: 0.7rem;
    padding: 0.35rem 0.75rem;
  }
  .btn-request {
    width: 100%;
    justify-content: center;
  }
  .track-card {
    padding: 1.5rem 1rem;
  }
  .track-title {
    font-size: 1.45rem;
  }
  .featured-img-wrapper {
    aspect-ratio: 1.5 / 1;
  }
  .featured-details-panel {
    padding: 1.5rem;
  }
  .details-title {
    font-size: 1.25rem;
  }
}

.claim-instructions-box {
  background-color: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 1.25rem;
  color: #0369a1;
}

.instructions-title {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
}

.instructions-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Modal Timeline Section Styles */
.modal-timeline-section {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.modal-timeline-section h5 {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 600;
}

.modal-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  padding-left: 0.5rem;
}

.modal-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background-color: #e2e8f0;
}

.modal-timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.modal-timeline-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.3s;
  flex-shrink: 0;
}

.modal-timeline-item.active .modal-timeline-badge {
  background-color: #4f46e5;
  color: white;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
}

.modal-timeline-item.active.rejected .modal-timeline-badge {
  background-color: #ef4444;
  color: white;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
}

.modal-timeline-item.pending .modal-timeline-badge {
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.modal-timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.modal-timeline-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.modal-timeline-item.active .modal-timeline-title {
  color: #1e293b;
}

.modal-timeline-time {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.modal-timeline-desc {
  font-size: 0.75rem;
  color: #d97706;
  font-style: italic;
}
</style>