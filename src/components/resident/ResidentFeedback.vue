<template>
  <div class="feedback-wrapper">
    <!-- Header -->
    <div class="feedback-header">
      <div class="header-content">
        <h1 class="feedback-title">We Value Your Feedback</h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="feedback-content">
      <div class="feedback-card">
        <form @submit.prevent="submitFeedback" class="feedback-form">
          <div class="form-grid">

            <!-- Full Name -->
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input v-model="form.name" type="text" class="form-input" required placeholder="Juan Dela Cruz">
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-input" required placeholder="juan@example.com">
            </div>

            <!-- Service Type -->
            <div class="form-group">
              <label class="form-label">Service Related To</label>
              <select v-model="form.service" class="form-select" required>
                <option value="" disabled>Select a service</option>
                <option value="clearance">Barangay Clearance</option>
                <option value="indigency">Certificate of Indigency</option>
                <option value="id">Barangay ID</option>
                <option value="complaint">Complaint/Blotter</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Rating -->
            <div class="form-group full-width">
              <label class="form-label">How satisfied were you?</label>
              <div class="rating-group">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  @click="form.rating = n"
                  :class="['rating-btn', { active: form.rating >= n }]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </button>
              </div>
              <p class="rating-label">{{ ratingText }}</p>
            </div>

            <!-- Feedback Message -->
            <div class="form-group full-width">
              <label class="form-label">Your Feedback</label>
              <textarea
                v-model="form.message"
                class="form-textarea"
                rows="5"
                required
                placeholder="Tell us about your experience..."
              ></textarea>
            </div>

            <!-- Anonymous Toggle -->
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.anonymous" class="checkbox-input">
                <span class="checkmark"></span>
                Submit anonymously
              </label>
            </div>

          </div>

          <div class="form-actions">
            <button type="button" @click="resetForm" class="cancel-button">
              Clear
            </button>
            <button type="submit" class="submit-button" :disabled="submitting">
              <svg v-if="!submitting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span v-if="submitting">Submitting...</span>
              <span v-else>Submit Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Message -->
    <transition name="fade">
      <div v-if="message" :class="['status-message', messageType]">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="messageType === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline v-if="messageType === 'success'" points="22 4 12 14.01 9 11.01"></polyline>
          <circle v-if="messageType === 'error'" cx="12" cy="12" r="10"></circle>
          <line v-if="messageType === 'error'" x1="15" y1="9" x2="9" y2="15"></line>
          <line v-if="messageType === 'error'" x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        {{ message }}
      </div>
    </transition>
  </div>
</template>

<script>
import { db } from '@/firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default {
  name: 'FeedbackForm',
  data() {
    return {
      form: {
        name: '',
        email: '',
        service: '',
        rating: 0,
        message: '',
        anonymous: false
      },
      submitting: false,
      message: '',
      messageType: ''
    }
  },
  computed: {
    ratingText() {
      const texts = ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
      return texts[this.form.rating] || 'Not rated'
    }
  },
  methods: {
    async submitFeedback() {
      if (this.form.rating === 0) {
        this.showMessage('Please select a rating', 'error')
        return
      }

      this.submitting = true
      try {
        const feedbackData = {
          ...this.form,
          name: this.form.anonymous ? 'Anonymous' : this.form.name,
          email: this.form.anonymous ? null : this.form.email,
          submittedAt: serverTimestamp(),
          status: 'new'
        }

        await addDoc(collection(db, 'feedback'), feedbackData)
        this.showMessage('Thank you! Your feedback has been submitted.', 'success')
        this.resetForm()
      } catch (error) {
        this.showMessage('Failed to submit feedback. Please try again.', 'error')
        console.error('Feedback error:', error)
      } finally {
        this.submitting = false
      }
    },
    resetForm() {
      this.form = {
        name: '',
        email: '',
        service: '',
        rating: 0,
        message: '',
        anonymous: false
      }
    },
    showMessage(msg, type = 'info') {
      this.message = msg
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 5000)
    }
  }
}
</script>

<style scoped>
/* -------------------------------------------------
   Page Wrapper
   ------------------------------------------------- */
.feedback-wrapper {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: 3rem;
}

/* -------------------------------------------------
   Header – Transparent & Centered
   ------------------------------------------------- */
.feedback-header {
  background: transparent;
  color: #1f2937;
    margin-top: -30px;
  padding: 3rem 2rem 1.5rem;
  text-align: center;
}

.header-content {
  max-width: 1000px;
  text-align: start;
  margin: 0 auto;
}

.feedback-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.feedback-subtitle {
  font-size: 1.1rem;
  margin: 0.75rem 0 0;
  color: #4b5563;
  font-weight: 400;
}

/* -------------------------------------------------
   Content – Centered Card
   ------------------------------------------------- */
.feedback-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

.feedback-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

/* -------------------------------------------------
   Form Grid
   ------------------------------------------------- */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

/* -------------------------------------------------
   Form Inputs
   ------------------------------------------------- */
.form-label {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #fafafa;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  background: white;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 12px;
  padding-right: 2.5rem;
}

/* -------------------------------------------------
   Rating Stars
   ------------------------------------------------- */
.rating-group {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}

.rating-btn {
  background: transparent;
  border: none;
  color: #d1d5db;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.rating-btn.active,
.rating-btn:hover {
  color: #fbbf24;
  transform: scale(1.1);
}

.rating-btn:hover ~ .rating-btn {
  color: #d1d5db !important;
}

.rating-label {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #4b5563;
  font-style: italic;
}

/* -------------------------------------------------
   Checkbox
   ------------------------------------------------- */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.checkbox-input:checked ~ .checkmark {
  background: #4f46e5;
  border-color: #4f46e5;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 3px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked ~ .checkmark:after {
  display: block;
}

/* -------------------------------------------------
   Form Actions
   ------------------------------------------------- */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button,
.submit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button {
  background: white;
  color: #4f46e5;
  border: 1.5px solid #e2e8f0;
}

.cancel-button:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
}

.submit-button {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79,70,229,.3);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* -------------------------------------------------
   Toast Message
   ------------------------------------------------- */
.status-message {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  animation: slideUp 0.4s ease-out;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  max-width: 90%;
}

.status-message.success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translateX(-50%); }
}

/* -------------------------------------------------
   Responsive
   ------------------------------------------------- */
@media (max-width: 768px) {
  .feedback-header {
    padding: 2rem 1rem 1.5rem;
  }
  .feedback-title {
    font-size: 1.75rem;
  }
  .feedback-card {
    padding: 2rem 1.5rem;
  }
  .form-actions {
    flex-direction: column;
  }
  .cancel-button,
  .submit-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .feedback-title {
    font-size: 1.5rem;
  }
  .form-input,
  .form-select,
  .form-textarea {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }
  .rating-group {
    justify-content: center;
  }
}
</style>