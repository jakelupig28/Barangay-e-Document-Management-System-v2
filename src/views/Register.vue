<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <!-- Left Side: Branding -->
      <div class="auth-left">
        <div class="brand-showcase">
          <div class="logo-wrapper">
             <i class="fas fa-id-card"></i>
          </div>
          <h1 class="brand-title">Resident Registration</h1>
          <p class="hero-text">Become an official digital resident of our barangay. Complete your profile to access all exclusive e-services.</p>
          <div class="features mt-4">
            <div class="feature-item"><i class="fas fa-lock"></i> GDPR Data Privacy</div>
            <div class="feature-item"><i class="fas fa-clock"></i> Quick Verification</div>
            <div class="feature-item"><i class="fas fa-hands-helping"></i> Community Support</div>
          </div>
        </div>
        <div class="auth-left-bg"></div>
      </div>

      <!-- Right Side: Form -->
      <div class="auth-right">
        <router-link to="/" class="back-link"><i class="fas fa-arrow-left"></i> Back to Home</router-link>
        
        <div class="auth-card">
          <div class="auth-header text-center mb-4">
            <h2>Create Account</h2>
            <p class="text-muted">Enter your details and upload ID to verify your residency</p>
          </div>

          <form @submit.prevent="registerResident" class="auth-form">
            <div class="form-grid">
              
              <!-- First Name -->
              <div class="form-group floating-group">
                <input v-model.trim="form.firstName" type="text" class="modern-input" id="firstNameInput" placeholder=" " required />
                <label for="firstNameInput" class="floating-label">First Name</label>
                <i class="fas fa-user input-icon"></i>
              </div>

              <!-- Middle Name -->
              <div class="form-group floating-group">
                <input v-model.trim="form.middleName" type="text" class="modern-input" id="middleNameInput" placeholder=" " />
                <label for="middleNameInput" class="floating-label">Middle Name</label>
                <i class="fas fa-user input-icon"></i>
              </div>

              <!-- Last Name -->
              <div class="form-group floating-group">
                <input v-model.trim="form.lastName" type="text" class="modern-input" id="lastNameInput" placeholder=" " required />
                <label for="lastNameInput" class="floating-label">Last Name</label>
                <i class="fas fa-user input-icon"></i>
              </div>

              <!-- Contact Number -->
              <div class="form-group floating-group">
                <input v-model.trim="form.contact" type="text" class="modern-input" id="contactInput" placeholder=" " required />
                <label for="contactInput" class="floating-label">Contact Number</label>
                <i class="fas fa-phone input-icon"></i>
              </div>

              <!-- Gender -->
              <div class="form-group floating-group">
                <select v-model="form.gender" class="modern-input has-value" id="genderInput" required>
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <label for="genderInput" class="floating-label fixed-label">Gender</label>
                <i class="fas fa-venus-mars input-icon"></i>
              </div>

              <!-- Civil Status -->
              <div class="form-group floating-group">
                <select v-model="form.civilStatus" class="modern-input has-value" id="civilStatusInput" required>
                  <option value="" disabled>Select Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                  <option value="Divorced">Divorced</option>
                </select>
                <label for="civilStatusInput" class="floating-label fixed-label">Civil Status</label>
                <i class="fas fa-heart input-icon"></i>
              </div>

              <!-- Email -->
              <div class="form-group floating-group full-width">
                <input v-model.trim="form.email" type="email" class="modern-input" id="emailInput" placeholder=" " required />
                <label for="emailInput" class="floating-label">Email Address</label>
                <i class="fas fa-envelope input-icon"></i>
              </div>

              <!-- Password -->
              <div class="form-group floating-group pr-0">
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="modern-input password-input" id="passwordInput" placeholder=" " required />
                <label for="passwordInput" class="floating-label">Password</label>
                <i class="fas fa-lock input-icon"></i>
                <button class="toggle-password" type="button" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>

              <!-- Confirm Password -->
              <div class="form-group floating-group pr-0" :class="passwordMatchClass">
                <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="modern-input password-input" id="confirmPasswordInput" placeholder=" " required />
                <label for="confirmPasswordInput" class="floating-label">Confirm Password</label>
                <i class="fas fa-lock input-icon"></i>
                <button class="toggle-password" type="button" @click="showConfirmPassword = !showConfirmPassword" aria-label="Toggle confirm password">
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>

              <!-- Birthdate -->
              <div class="form-group floating-group date-group">
                <input v-model="form.birthdate" type="date" class="modern-input has-value" id="birthdateInput" required />
                <label for="birthdateInput" class="floating-label fixed-label">Birthdate</label>
                <i class="fas fa-calendar-day input-icon"></i>
              </div>

              <!-- Age (Auto Computed) -->
              <div class="form-group floating-group">
                <input v-model="computedAge" type="text" class="modern-input has-value" id="ageInput" readonly placeholder=" " />
                <label for="ageInput" class="floating-label fixed-label">Age</label>
                <i class="fas fa-child input-icon"></i>
              </div>

              <!-- Complete Address -->
              <div class="form-group floating-group full-width">
                <input v-model.trim="form.address" type="text" class="modern-input" id="addressInput" placeholder=" " required />
                <label for="addressInput" class="floating-label">Complete Address</label>
                <i class="fas fa-home input-icon"></i>
              </div>

              <!-- File Upload -->
              <div class="form-group full-width upload-group">
                <label class="upload-label text-muted"><i class="fas fa-id-card pb-1 mr-1"></i> Upload Valid Barangay ID (Image)</label>
                <div class="file-drop-area" :class="{'has-image': barangayIdImage}">
                  <input class="file-input" type="file" accept="image/*" @change="handleFileChange" id="fileUpload" :required="!barangayIdImage" />
                  <div class="file-message">
                    <div v-if="barangayIdImage" class="image-preview-container">
                      <img :src="barangayIdImage" alt="ID Preview" class="id-preview-image" />
                      <div class="change-image-text"><i class="fas fa-edit"></i> Click or Drag to Change Image</div>
                    </div>
                    <span v-else>Drag & Drop or Click to Browse</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="error" class="error-alert mt-2">
              <i class="fas fa-exclamation-circle"></i> {{ error }}
            </div>
            
            <div v-if="success" class="success-alert mt-2">
              <i class="fas fa-check-circle"></i> {{ success }}
            </div>

            <button type="submit" class="submit-btn mt-4" :disabled="loading" :class="{ 'loading': loading }">
              <span v-if="loading" class="spinner"><i class="fas fa-circle-notch fa-spin"></i></span>
              <span v-else>Submit Registration <i class="fas fa-arrow-right ml-2"></i></span>
            </button>
            
            <div class="text-center mt-4">
              <p class="text-muted mb-0">Already an official resident?</p>
              <router-link to="/login" class="login-link">Sign In Here</router-link>
            </div>
          </form>

        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="custom-modal-overlay">
      <div class="custom-modal">
        <button class="close-btn" @click="closeSuccessModal" aria-label="Close message"><i class="fas fa-times"></i></button>
        <div class="modal-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3 class="modal-title">Registration Successful!</h3>
        <p class="modal-message">Your account will be under validation by Barangay Staff. Please wait a couple of minutes. Thank you.</p>
        <button class="modal-btn" @click="closeSuccessModal">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
import localDb from '@/services/localDb';

export default {
  name: 'RegisterPage',
  data() {
    return {
      form: {
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthdate: '',
        gender: '',
        civilStatus: '',
        contact: '',
        address: '',
      },
      showPassword: false,
      showConfirmPassword: false,
      barangayIdImage: '',
      loading: false,
      error: '',
      success: '',
      showSuccessModal: false,
    };
  },
  computed: {
    passwordMatchClass() {
      if (!this.form.confirmPassword) return '';
      return this.form.password === this.form.confirmPassword ? 'match-success' : 'match-error';
    },
    computedAge() {
      if (!this.form.birthdate) return '';
      const birth = new Date(this.form.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 0 ? age : 0;
    }
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files?.[0];
      if (!file) {
        this.barangayIdImage = '';
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.error = 'Please upload an image file only.';
        event.target.value = '';
        this.barangayIdImage = '';
        return;
      }
      this.error = '';
      const reader = new FileReader();
      reader.onload = () => {
        this.barangayIdImage = reader.result;
      };
      reader.readAsDataURL(file);
    },
    async registerResident() {
      this.error = '';
      this.success = '';
      this.loading = true;
      try {
        if (this.form.password.length < 8) throw new Error('Password must be at least 8 characters.');
        if (this.form.password !== this.form.confirmPassword) throw new Error('Passwords do not match.');
        if (!this.barangayIdImage) throw new Error('Present Barangay ID image is required.');

        const combinedName = `${this.form.firstName} ${this.form.middleName ? this.form.middleName.trim() + ' ' : ''}${this.form.lastName}`.trim();

        localDb.registerResident({
          ...this.form,
          name: combinedName,
          age: this.computedAge,
          barangayIdImage: this.barangayIdImage,
        });

        this.showSuccessModal = true;
      } catch (err) {
        this.error = err.message || 'Registration failed.';
      } finally {
        this.loading = false;
      }
    },
    closeSuccessModal() {
      this.showSuccessModal = false;
      this.$router.push({ name: 'login' });
    },
  },
};
</script>

<style scoped>
/* Full Page Wrapper */
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 2rem;
}

/* Container Split */
.auth-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  overflow: hidden;
  min-height: 700px;
}

/* Left Panel - Branding */
.auth-left {
  flex: 1;
  max-width: 450px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-left-bg {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background-image: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%);
  pointer-events: none;
}

.logo-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
}

.hero-text {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.05rem;
  font-weight: 500;
}
.feature-item i {
  color: #93c5fd;
}

/* Right Panel - Form */
.auth-right {
  flex: 2;
  padding: 3rem 4rem;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #ffffff;
  overflow-y: auto;
  max-height: 90vh; /* Scrolable if window is small */
}

/* Scrollbar hiding for right panel if needed */
.auth-right::-webkit-scrollbar {
  width: 6px;
}
.auth-right::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

.back-link {
  position: absolute;
  top: 2rem;
  left: 2.5rem;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1e3a8a;
}

.auth-card {
  max-width: 600px;
  margin: auto;
  width: 100%;
  padding-top: 1rem;
}

.auth-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

/* Form Layout Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.full-width {
  grid-column: 1 / -1;
}

/* Floating Input Group */
.form-group.floating-group {
  position: relative;
}

.modern-input {
  width: 100%;
  padding: 1.25rem 1rem 0.5rem 3rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background-color: #fdfdfd;
  color: #111827;
  transition: all 0.2s;
}

.modern-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: #ffffff;
}

.floating-label {
  position: absolute;
  left: 3rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.95rem;
  color: #6b7280;
  pointer-events: none;
  transition: 0.2s ease all;
}

.input-icon {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.1rem;
  transition: color 0.2s;
}

.modern-input:focus ~ .input-icon {
  color: #3b82f6;
}

.modern-input:focus ~ .floating-label,
.modern-input:not(:placeholder-shown) ~ .floating-label,
.fixed-label {
  top: 0.5rem;
  transform: translateY(0);
  font-size: 0.75rem;
  font-weight: 600;
  color: #3b82f6;
}

/* Date Input Special Handling */
.date-group {
  position: relative;
}
.date-group .has-value {
  padding-top: 1.6rem;
  padding-bottom: 0.15rem;
}

/* Password Toggle */
.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.toggle-password:hover {
  color: #4b5563;
}

/* File Upload modern style */
.upload-group {
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
}
.upload-label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.file-drop-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background-color: #f8fafc;
  transition: 0.2s ease;
  cursor: pointer;
  min-height: 100px;
}
.file-drop-area.has-image {
  border-color: #3b82f6;
  background-color: #eff6ff;
  padding: 1rem;
}
.file-drop-area:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
.file-input {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
  opacity: 0;
  z-index: 2;
}
.file-message {
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
  width: 100%;
  text-align: center;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.id-preview-image {
  max-width: 100%;
  max-height: 180px;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.change-image-text {
  font-size: 0.85rem;
  color: #3b82f6;
  font-weight: 600;
  margin-top: 4px;
}

/* Buttons and Interactions */
.submit-btn {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(to right, #2563eb, #3b82f6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn.loading {
  opacity: 0.8;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
}
.login-link:hover {
  text-decoration: underline;
}

/* Error/Success Alert */
.error-alert {
  background: #fef2f2;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #f87171;
  animation: shake 0.4s ease-in-out;
}

.success-alert {
  background: #ecfdf5;
  color: #047857;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #34d399;
}

/* Animations */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Custom Modal */
.custom-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: modalFadeIn 0.2s ease-out;
}

.custom-modal {
  background: white;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  animation: modalScaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.5rem;
}

.close-btn:hover {
  color: #4b5563;
}

.modal-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: #10b981;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.modal-message {
  font-size: 1rem;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.modal-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.modal-btn:hover {
  background: #059669;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalScaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (max-width: 900px) {
  .auth-left { display: none; }
  .auth-right { padding: 3rem 1.5rem; }
  .auth-container { max-width: 500px; min-height: auto; }
  .form-grid { grid-template-columns: 1fr; }
}

/* Match Status Indicators */
.match-success .modern-input {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}
.match-success .input-icon,
.match-success .floating-label,
.match-success .toggle-password {
  color: #10b981;
}

.match-error .modern-input {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}
.match-error .input-icon,
.match-error .floating-label,
.match-error .toggle-password {
  color: #ef4444;
}

/* Custom Dropdown Styling */
select.modern-input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.2em;
  padding-right: 2.5rem;
  cursor: pointer;
}

select.modern-input:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
}

select.modern-input option {
  color: #111827;
  background: white;
  padding: 10px;
}
</style>
