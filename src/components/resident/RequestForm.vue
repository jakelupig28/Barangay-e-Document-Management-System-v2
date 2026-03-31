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

    <!-- Form -->
    <div class="request-content">
      <div class="request-card">
        <div class="card-body">
          <form @submit.prevent="submitRequest" class="request-form">
            <div class="form-group">
              <label class="form-label">Request Type</label>
              <div class="select-wrapper">
                <select v-model="request.type" class="form-select" required>
                  <option value="" disabled selected>Select document type</option>
                  <option value="barangay-clearance">Barangay Clearance</option>
                  <option value="barangay-id">Barangay ID</option>
                  <option value="certificate-of-residency">Certificate of Residency</option>
                  <option value="business-permit">Business Permit</option>
                  <option value="other">Other</option>
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

            <div v-if="request.type === 'other'" class="form-group">
              <label class="form-label">Specify Document</label>
              <input v-model="request.otherType" type="text" class="form-input"
                     placeholder="Enter document name" required>
            </div>

            <div class="form-group">
              <label class="form-label">Purpose</label>
              <textarea v-model="request.purpose" class="form-textarea" rows="4"
                        placeholder="Explain why you need this document" required></textarea>
            </div>

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
              <router-link to="/resident/requests" class="modal-button primary"
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
      request: { type: '', otherType: '', purpose: '', notes: '' },
      isSubmitting: false,
      requestId: '',
      showSuccessModal: false,
      currentUser: null
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
          isActive: true
        }

        if (this.isFirebaseReady()) {
          requestData.createdAt = serverTimestamp();
          requestData.updatedAt = serverTimestamp();
          await addDoc(collection(db, 'requests'), requestData)
        } else {
          localDb.createRequest(requestData)
        }

        this.showSuccessModal = true
        this.isSubmitting = false
        this.resetForm()
      } catch (error) {
        console.error('Error submitting request:', error)
        this.isSubmitting = false
        alert('Failed to submit request. Please try again.')
      }
    },
    resetForm() {
      this.request = { type: '', otherType: '', purpose: '', notes: '' }
    },
    closeModal() {
      this.showSuccessModal = false
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
  max-width: none;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.request-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  border: 1px solid #e2e8f0;
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

/* -------------------------------------------------
   Responsive
   ------------------------------------------------- */
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