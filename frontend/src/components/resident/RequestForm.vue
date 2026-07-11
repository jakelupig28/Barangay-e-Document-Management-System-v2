<template>
  <div class="request-wrapper">
    <!-- Header -->
    <div class="request-header">
      <div class="header-content">
        <h1 class="request-title">
          Document Request
        </h1>
        <!-- <p class="request-subtitle">Fill out the form to request official documents</p> -->
      </div>
    </div>

    <!-- Form & Recent Requests Grid -->
    <div class="request-content">
      <div class="request-grid">
        <!-- Request Form Card -->
        <div class="request-card form-card">
          <div class="card-title">
            <h3><i class="fas fa-file-signature text-primary me-2"></i> Create New Request</h3>
          </div>
          <div class="card-body p-0">
            <form @submit.prevent="submitRequest" class="request-form">
              <div class="form-group">
                <label class="form-label">Request Type</label>
                <div class="select-wrapper">
                  <select v-model="request.type" class="form-select" required>
                    <option value="" disabled selected>Select document type</option>
                    <option value="barangay-certificate">Barangay Certificate</option>
                    <option value="certificate-of-indigency-financial">Certificate of Indigency (Financial Assistance)</option>
                    <option value="certificate-of-indigency-general">Certificate of Indigency (General Purpose)</option>
                  </select>
                  <div class="select-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Purpose</label>
                <textarea v-model="request.purpose" class="form-textarea" rows="4"
                           placeholder="Explain why you need this document" required></textarea>
              </div>

              <!-- On Behalf Section -->
              <div class="form-group checkbox-group">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="request.onBehalf" class="form-checkbox">
                  <span class="checkbox-label">Request on behalf of another person</span>
                </label>
              </div>

              <transition name="fade-slide">
                <div v-if="request.onBehalf" class="on-behalf-fields">
                  <div class="form-group">
                    <label class="form-label">Recipient's Full Name</label>
                    <input type="text" v-model="request.recipientName" class="form-input" 
                           placeholder="Enter the full name of the recipient" :required="request.onBehalf">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Relationship to Recipient</label>
                    <input type="text" v-model="request.recipientRelationship" class="form-input" 
                           placeholder="e.g. Child, Parent, Spouse, Authorized Representative" :required="request.onBehalf">
                  </div>
                </div>
              </transition>

              <div class="form-group">
                <label class="form-label">Additional Notes (Optional)</label>
                <textarea v-model="request.notes" class="form-textarea" rows="3"
                          placeholder="Any additional information that might help process your request"></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="submit-button" :disabled="isSubmitting">
                  <span v-if="!isSubmitting">Submit Request</span>
                  <span v-else>Processing...</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Recent Requests Card -->
        <div class="request-card recent-requests-card">
          <div class="card-title">
            <h3><i class="fas fa-history text-primary me-2"></i> Recent Requests</h3>
          </div>
          <div class="card-body p-0">
            <div v-if="recentRequests.length === 0" class="text-center p-4 text-muted">
              <i class="fas fa-folder-open fa-2x mb-2 text-muted" style="opacity: 0.5;"></i>
              <p class="m-0">No recent requests found.</p>
            </div>
            <div v-else class="recent-requests-list">
              <div v-for="req in recentRequests" :key="req.id" class="recent-request-item shadow-sm" @click="openDetailsModal(req)" style="cursor: pointer;">
                <div class="request-item-header d-flex justify-content-between align-items-center mb-2">
                  <span class="request-item-id text-secondary small">ID: {{ req.id }}</span>
                  <span :class="['status-badge', req.status]">{{ req.status === 'claimed' ? 'Document Claimed' : (req.status || 'Pending') }}</span>
                </div>
                <div class="request-item-body">
                  <h5 class="request-item-type mb-1">{{ formatDocType(req.documentType || req.type) }}</h5>
                  <p class="request-item-purpose text-muted mb-2"><small>Purpose: {{ req.purpose }}</small></p>
                  <div class="request-item-footer text-muted d-flex align-items-center gap-2">
                    <i class="far fa-calendar-alt"></i>
                    <span><small>{{ formatDate(req.createdAt) }}</small></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-content">
          <div class="success-message">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Request Submitted Successfully!</h3>
            <div class="request-id-display">
              <span>Request ID:</span>
              <strong>{{ requestId }}</strong>
            </div>
            <p class="instructions">
              You can track your request status in your dashboard or using the request ID above.
            </p>
            <div class="modal-actions">
              <button @click="closeModal" class="modal-button secondary">Return to Form</button>
              <router-link to="/resident/dashboard" class="modal-button primary"
                           @click.native="closeModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                View My Requests
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Details Modal -->
    <div v-if="selectedRequest" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-container">
        <div class="modal-content info-modal">
          <div class="modal-header mb-3">
            <div class="header-main d-flex align-items-center gap-3">
              <div class="header-icon bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; font-size: 1.25rem;">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="header-titles">
                <h3 class="m-0" style="font-size: 1.375rem; font-weight: 700; color: #0f172a;">Request Details</h3>
                <p class="request-id-subtitle m-0 text-muted" style="font-size: 0.8125rem;">Ref: {{ selectedRequest.id }}</p>
              </div>
            </div>
            <button class="close-btn" @click="closeDetailsModal">×</button>
          </div>
          <div class="modal-body custom-scroll" style="padding: 1.5rem 0;">
            <div class="detail-container d-flex flex-column gap-4">
              <!-- Document Details Section -->
              <div class="detail-section">
                <div class="section-badge mb-3"><i class="fas fa-certificate"></i> Document Information</div>
                <div class="section-grid d-flex flex-column gap-3">
                  <div class="detail-block">
                    <span class="label d-block text-muted small fw-medium mb-1">Document Type</span>
                    <div class="value">
                      <span class="premium-doc-badge px-3 py-2 rounded-3 text-primary bg-primary-soft fw-bold" style="background: rgba(13, 110, 253, 0.1); font-size: 0.875rem;">
                        {{ formatDocType(selectedRequest.documentType || selectedRequest.type) }}
                      </span>
                    </div>
                  </div>
                  <div v-if="selectedRequest.onBehalf" class="detail-block">
                    <span class="label d-block text-muted small fw-medium mb-1">On Behalf of</span>
                    <span class="value fw-semibold text-black">{{ selectedRequest.recipientName }} ({{ selectedRequest.recipientRelationship }})</span>
                  </div>
                  <div class="detail-block">
                    <span class="label d-block text-muted small fw-medium mb-1">Date Requested</span>
                    <span class="value fw-semibold text-dark">{{ formatDate(selectedRequest.createdAt) }}</span>
                  </div>
                  <div class="detail-block">
                    <span class="label d-block text-muted small fw-medium mb-1">Purpose</span>
                    <div class="purpose-container p-3 bg-light rounded-3 text-secondary" style="font-size: 0.9375rem; border: 1px solid #f1f5f9;">
                      {{ selectedRequest.purpose }}
                    </div>
                  </div>
                  <div v-if="selectedRequest.notes && selectedRequest.notes !== 'None'" class="detail-block">
                    <span class="label d-block text-muted small fw-medium mb-1">Additional Notes</span>
                    <div class="notes-container p-3 rounded-3 text-warning-dark" style="font-size: 0.9375rem; background: #fffbeb; border: 1px solid #fef3c7; color: #92400e;">
                      {{ selectedRequest.notes }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status Info Section -->
              <div class="detail-section">
                <div class="section-badge mb-3"><i class="fas fa-info-circle"></i> Status Details</div>
                <div class="status-and-action-container p-3 rounded-3 bg-light border d-flex flex-column gap-3">
                  <div class="status-display d-flex align-items-center gap-3">
                    <span :class="['status-pill-large px-3 py-2 rounded-3 fw-bold small text-uppercase', selectedRequest.status || 'pending']">
                      <i :class="statusIcons[selectedRequest.status || 'pending']" class="me-2"></i>
                      {{ selectedRequest.status === 'claimed' ? 'Document Claimed' : (selectedRequest.status || 'Pending') }}
                    </span>
                  </div>
                  
                  <div v-if="selectedRequest.status === 'rejected' && selectedRequest.rejectionMessage" class="rejection-history p-3 rounded-3 bg-danger-soft text-danger" style="background: #fef2f2; border: 1px solid #fee2e2;">
                    <strong>Rejection Reason:</strong> {{ selectedRequest.rejectionMessage }}
                  </div>

                  <div v-if="selectedRequest.status === 'claimed'" class="claim-info p-3 rounded-3 bg-info-soft text-info" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1;">
                    <div><strong>Claimed By:</strong> {{ selectedRequest.claimedBy || 'Resident' }}</div>
                    <div class="mt-1" v-if="selectedRequest.claimedAt"><strong>Date Claimed:</strong> {{ formatDate(selectedRequest.claimedAt) }}</div>
                  </div>

                  <div v-if="selectedRequest.status === 'approved'" class="p-3 rounded-3 mt-1 text-start" style="background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; text-align: left;">
                    <div class="fw-bold"><i class="fas fa-info-circle me-1"></i> Pickup Instructions:</div>
                    <ul class="m-0 mt-2 ps-3" style="font-size: 0.9rem; line-height: 1.5;" v-if="selectedRequest.onBehalf">
                      <li style="color: #000000; font-weight: bold; list-style-type: none; margin-left: -15px; margin-bottom: 5px;">On-behalf request for {{ selectedRequest.recipientName }}:</li>
                      <li>Bring an <strong>Authorization Letter</strong> with the signature of <strong>{{ selectedRequest.recipientName }}</strong>.</li>
                      <li>Bring a photocopy of {{ selectedRequest.recipientName }}'s valid ID.</li>
                      <li>Bring your own valid ID.</li>
                    </ul>
                    <ul class="m-0 mt-2 ps-3" style="font-size: 0.9rem; line-height: 1.5;" v-else>
                      <li>Bring a valid government-issued ID.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-end" style="border-top: 1px solid #f1f5f9; padding-top: 1rem;">
            <button class="modal-button secondary" @click="closeDetailsModal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import localDb from '@/services/localDb'

export default {
  name: 'DocumentRequest',
  data() {
    return {
      request: { type: '', otherType: '', purpose: '', notes: '', onBehalf: false, recipientName: '', recipientRelationship: '' },
      isSubmitting: false,
      requestId: '',
      showSuccessModal: false,
      currentUser: null,
      recentRequests: [],
      selectedRequest: null,
      statusIcons: {
        pending: 'fas fa-clock',
        approved: 'fas fa-check-circle',
        claimed: 'fas fa-handshake',
        rejected: 'fas fa-times-circle'
      }
    }
  },
  created() {
    try {
      if (this.isFirebaseReady()) {
        const auth = getAuth()
        this.currentUser = auth.currentUser
      } else {
        this.currentUser = localDb.getSessionUser()
      }
    } catch (e) {
      this.currentUser = localDb.getSessionUser()
    }
    
    // Set type from query parameters if available
    if (this.$route && this.$route.query && this.$route.query.type) {
      const qType = this.$route.query.type;
      if (qType === 'barangay-clearance' || qType === 'certificate-of-residency' || qType === 'residency-certificate') {
        this.request.type = 'barangay-certificate';
      } else if (qType === 'certificate-of-indigency' || qType === 'indigency-certificate') {
        this.request.type = 'certificate-of-indigency-general';
      } else {
        this.request.type = qType;
      }
    }
    
    this.fetchRecentRequests()
  },
  methods: {
    isFirebaseReady() {
      return !!(db && typeof db === 'object' && typeof db.app !== 'undefined')
    },
    generateRequestId() {
      const prefix = 'BRGY'
      const now = new Date()
      const datePart = now.getFullYear().toString().substr(-2) +
                       (now.getMonth() + 1).toString().padStart(2, '0') +
                       now.getDate().toString().padStart(2, '0')
      const randomPart = Math.floor(1000 + Math.random() * 9000)
      return `${prefix}-${datePart}-${randomPart}`
    },
    async fetchRecentRequests() {
      try {
        const userId = this.currentUser?.uid || this.currentUser?.id;
        if (!userId) return;

        if (this.isFirebaseReady()) {
          const { getDocs, query, collection, where, orderBy, limit } = require('firebase/firestore');
          const q = query(
            collection(db, 'requests'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const snapshot = await getDocs(q);
          this.recentRequests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } else {
          const dbData = localDb.readDb();
          const reqs = dbData.requests || [];
          this.recentRequests = reqs
            .filter(r => r.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        }
      } catch (e) {
        console.error('Error fetching recent requests:', e);
      }
    },
    formatDocType(type) {
      const mapping = {
        'barangay-certificate': 'Barangay Certificate',
        'certificate-of-indigency-financial': 'Certificate of Indigency (Financial Assistance)',
        'certificate-of-indigency-general': 'Certificate of Indigency (General Purpose)',
        // fallbacks
        'barangay-clearance': 'Barangay Certificate',
        'barangay-id': 'Barangay ID',
        'certificate-of-residency': 'Barangay Certificate',
        'certificate-of-indigency': 'Certificate of Indigency (General Purpose)',
        'business-permit': 'Business Permit'
      };
      return mapping[type] || type;
    },
    formatDate(date) {
      if (!date) return 'N/A';
      const d = date?.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return date;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    async submitRequest() {
      try {
        this.isSubmitting = true
        this.requestId = this.generateRequestId()

        const requestData = {
          id: this.requestId,
          userId: this.currentUser?.uid || this.currentUser?.id,
          userName: this.currentUser?.displayName || this.currentUser?.profile?.name || (this.currentUser?.email ? this.currentUser.email.split('@')[0] : 'Resident'),
          type: this.request.type === 'other' ? this.request.otherType : this.request.type,
          documentType: this.request.type === 'other' ? this.request.otherType : this.request.type,
          purpose: this.request.purpose,
          notes: this.request.notes || 'None',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          onBehalf: this.request.onBehalf || false,
          recipientName: this.request.onBehalf ? this.request.recipientName : '',
          recipientRelationship: this.request.onBehalf ? this.request.recipientRelationship : ''
        }

        if (this.isFirebaseReady()) {
          requestData.createdAt = serverTimestamp();
          requestData.updatedAt = serverTimestamp();
          await addDoc(collection(db, 'requests'), requestData)
        } else {
          localDb.createRequest(requestData)
        }

        // Send email notification to staff
        try {
          fetch('/api/notify-request-creation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              residentEmail: this.currentUser?.email || '',
              residentName: requestData.userName,
              requestId: this.requestId,
              documentType: this.formatDocType(requestData.documentType),
              purpose: requestData.purpose,
              notes: requestData.onBehalf ? `[On behalf of: ${requestData.recipientName} (${requestData.recipientRelationship})] ${requestData.notes}` : requestData.notes,
              createdAt: new Date().toISOString(),
              onBehalf: requestData.onBehalf,
              recipientName: requestData.recipientName,
              recipientRelationship: requestData.recipientRelationship
            })
          }).catch(err => console.warn('Failed to send request creation email:', err));
        } catch (mailErr) {
          console.warn('Email dispatch failed:', mailErr);
        }

        this.showSuccessModal = true
        this.isSubmitting = false
        this.resetForm()
        this.fetchRecentRequests()
      } catch (error) {
        console.error('Error submitting request:', error)
        this.isSubmitting = false
        alert('Failed to submit request. Please try again.')
      }
    },
    resetForm() {
      this.request = { type: '', otherType: '', purpose: '', notes: '', onBehalf: false, recipientName: '', recipientRelationship: '' }
    },
    closeModal() {
      this.showSuccessModal = false
    },
    openDetailsModal(req) {
      this.selectedRequest = req;
    },
    closeDetailsModal() {
      this.selectedRequest = null;
    }
  }
}
</script>

<style scoped>
/* -------------------------------------------------
   Page wrapper – light gradient, full height
   ------------------------------------------------- */
.request-wrapper {
  min-height: 100vh;
  padding-bottom: 3rem;
}

/* -------------------------------------------------
   Header – transparent, full-width, same h1 style
   ------------------------------------------------- */
.request-header {
  background: transparent;
  color: #1f2937;
  padding: 3rem 2rem 1.5rem;
  text-align: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.5rem;
}

/* Same size/weight as dashboard h2 */
.request-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  margin-top: -30px;
  color: #1f2937;
}

.request-subtitle {
  font-size: 1.1rem;
  margin: 0.75rem 0 0;
  font-weight: 400;
  color: #4b5563;
}

/* -------------------------------------------------
   Content – full-width, centered card
   ------------------------------------------------- */
.request-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
}

.request-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
  align-items: start;
}

.request-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.card-title {
  border-bottom: 1.5px solid #f1f5f9;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.card-title h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.recent-requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.recent-request-item {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.recent-request-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04);
  border-color: #cbd5e1;
}

.request-item-type {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.approved {
  background-color: #d1fae5;
  color: #059669;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-badge.claimed {
  background-color: #e0f2fe;
  color: #0369a1;
}

/* Info Modal styles */
.info-modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-height: 85vh;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  width: 100%;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1.5px solid #f1f5f9;
  padding-bottom: 1rem;
}
.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}
.close-btn:hover {
  background: #e2e8f0;
  color: #ef4444;
}
.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
}
.status-pill-large {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}
.status-pill-large.pending {
  background-color: #fef3c7;
  color: #d97706;
}
.status-pill-large.approved {
  background-color: #d1fae5;
  color: #059669;
}
.status-pill-large.claimed {
  background-color: #e0f2fe;
  color: #0369a1;
}
.status-pill-large.rejected {
  background-color: #fee2e2;
  color: #dc2626;
}

/* -------------------------------------------------
   Form
   ------------------------------------------------- */
.card-body { display: flex; flex-direction: column; gap: 1.75rem; }
.request-form { display: flex; flex-direction: column; gap: 1.5rem; }

.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-label { font-weight: 600; color: #1f2937; font-size: 0.95rem; }

.select-wrapper { position: relative; }
.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #fafafa;
  transition: all 0.3s ease;
}
.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  background: white;
}
.form-textarea { resize: vertical; min-height: 120px; }
.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
}

/* Submit button */
.form-actions { margin-top: 1.5rem; }
.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}
.submit-button:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

/* -------------------------------------------------
   Success Modal
   ------------------------------------------------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn .3s ease-out;
}
.modal-container { width: 90%; max-width: 500px; animation: slideUp .4s ease-out; }
.modal-content { background: white; border-radius: 16px; padding: 2.5rem; }

.success-message { text-align: center; }
.success-icon svg { color: #10b981; }
.success-message h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
  color: #064e3b;
}
.request-id-display {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  padding: 1rem;
  margin: 1.5rem 0;
  font-size: 1.1rem;
}
.request-id-display strong {
  color: #065f46;
  font-size: 1.3rem;
  display: block;
  margin-top: .5rem;
  font-family: monospace;
}
.instructions { color: #4b5563; margin-bottom: 2rem; line-height: 1.5; }

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
.modal-button {
  padding: .75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all .3s ease;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  min-width: 140px;
  justify-content: center;
}
.modal-button.primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  text-decoration: none;
}
.modal-button.primary:hover {
  background: linear-gradient(135deg, #4338ca, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79,70,229,.3);
}
.modal-button.secondary {
  background: white;
  color: #4f46e5;
  border: 1.5px solid #e2e8f0;
}
.modal-button.secondary:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
}

/* Animations */
@keyframes fadeIn { from {opacity:0} to {opacity:1} }
@keyframes slideUp { from {opacity:0; transform:translateY(20px)} to {opacity:1; transform:translateY(0)} }

.checkbox-group {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}
.form-checkbox {
  width: 20px;
  height: 20px;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  accent-color: #6366f1;
}
.checkbox-label {
  font-weight: 500;
  color: #334155;
  font-size: 0.95rem;
}
.on-behalf-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  margin-bottom: 0.5rem;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* -------------------------------------------------
   Responsive
   ------------------------------------------------- */
@media (max-width: 900px) {
  .request-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .request-header { padding: 2rem 1rem 1.5rem; }
  .request-title { font-size: 1.75rem; }
  .request-card { padding: 2rem 1.5rem; border-radius: 12px; }
  .modal-content { padding: 2rem; }
  .modal-actions { flex-direction: column; }
  .modal-button { width: 100%; }
}
@media (max-width: 480px) {
  .request-title { font-size: 1.5rem; }
  .form-input, .form-select, .form-textarea { padding: .75rem 1rem; font-size: .95rem; }
  .submit-button { font-size: 1rem; padding: .875rem; }
  .success-message h3 { font-size: 1.3rem; }
  .request-id-display { font-size: 1rem; }
}
</style>