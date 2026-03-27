<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <!-- Left Side: Branding -->
      <div class="auth-left">
        <div class="brand-showcase">
          <div class="logo-wrapper">
             <i class="fas fa-landmark"></i>
          </div>
          <h1 class="brand-title">Barangay Portal</h1>
          <p class="hero-text">Secure, fast, and unified access to community e-services for all Residents and Officials.</p>
          <div class="features mt-4">
            <div class="feature-item"><i class="fas fa-shield-alt"></i> Secure Access</div>
            <div class="feature-item"><i class="fas fa-bolt"></i> Fast Processing</div>
            <div class="feature-item"><i class="fas fa-users"></i> Community First</div>
          </div>
        </div>
        <div class="auth-left-bg"></div>
      </div>

      <!-- Right Side: Form -->
      <div class="auth-right">
        <router-link to="/" class="back-link"><i class="fas fa-arrow-left"></i> Back to Home</router-link>
        
        <div class="auth-card">
          <div class="auth-header text-center mb-4">
            <h2>Welcome Back</h2>
            <p class="text-muted">Enter your credentials to continue</p>
          </div>

          <form @submit.prevent="login" class="auth-form">
            <div class="form-group floating-group">
              <select v-model="selectedRole" class="modern-input custom-select" id="roleSelect">
                <option value="resident">Resident</option>
                <option value="barangay_staff">Barangay Staff</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <label for="roleSelect" class="floating-label">Login As</label>
              <i class="fas fa-user-circle input-icon"></i>
            </div>

            <div class="form-group floating-group">
              <input v-model.trim="email" type="email" class="modern-input" id="emailInput" placeholder=" " required />
              <label for="emailInput" class="floating-label">Email Address</label>
              <i class="fas fa-envelope input-icon"></i>
            </div>

            <div class="form-group floating-group bg-white pr-0">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" class="modern-input password-input" id="passwordInput" placeholder=" " required />
              <label for="passwordInput" class="floating-label">Password</label>
              <i class="fas fa-lock input-icon"></i>
              <button class="toggle-password" type="button" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>

            <div v-if="error" class="error-alert">
              <i class="fas fa-exclamation-circle"></i> {{ error }}
            </div>

            <button type="submit" class="submit-btn mt-3" :disabled="loading" :class="{ 'loading': loading }">
              <span v-if="loading" class="spinner"><i class="fas fa-circle-notch fa-spin"></i></span>
              <span v-else>Sign In <i class="fas fa-arrow-right ml-2"></i></span>
            </button>
            
            <div class="auth-divider">
              <span>OR</span>
            </div>

            <div class="text-center">
              <p class="registration-prompt text-muted mb-2">Don't have an account yet?</p>
              <router-link to="/register" class="register-link-btn">
                Create User Account
              </router-link>
            </div>
          </form>

          <div class="admin-hint mt-4 text-center">
            <small class="text-muted">
              <i class="fas fa-info-circle mr-1"></i> Admin: <b>superadmin@barangay.local</b> / <b>superadmin123</b>
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import localDb from '@/services/localDb';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      selectedRole: 'resident',
      error: '',
      loading: false,
    };
  },
  methods: {
    async login() {
      if(!this.email || !this.password) return;
      this.error = '';
      this.loading = true;
      try {
        const user = localDb.login(this.email, this.password, this.selectedRole);
        this.$store.commit('setAuth', {
          uid: user.id,
          email: user.email,
          name: user.profile?.name || user.email,
          role: user.role,
        });

        if (user.role === 'resident') {
          this.$router.push({ name: 'resident-dashboard' });
          return;
        }

        if (user.role === 'barangay_staff') {
          const staff = localDb.getStaffAccountByUserId(user.id);
          if (staff?.mustChangePassword) {
            this.$router.push({ name: 'staff-change-password' });
            return;
          }
          this.$router.push({ name: 'official-dashboard' });
          return;
        }

        this.$router.push({ name: 'admin-dashboard' });
      } catch (err) {
        if (err.message === 'pending_validation') {
          this.$router.push({ name: 'pending-approval' });
          return;
        }
        this.error = err.message || 'Login failed.';
      } finally {
        this.loading = false;
      }
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
  max-width: 1100px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  overflow: hidden;
  min-height: 600px;
}

/* Left Panel - Branding */
.auth-left {
  flex: 1;
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
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
}

.hero-text {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
  max-width: 400px;
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
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #ffffff;
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
  max-width: 420px;
  margin: auto;
  width: 100%;
}

.auth-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.auth-form {
  margin-top: 2rem;
}

/* Floating Input Group */
.form-group.floating-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.modern-input {
  width: 100%;
  padding: 1.25rem 1rem 0.5rem 3rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #fdfdfd;
  color: #111827;
  transition: all 0.2s;
}

.custom-select {
  appearance: none;
}

.modern-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #ffffff;
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
.custom-select ~ .floating-label {
  top: 0.5rem;
  transform: translateY(0);
  font-size: 0.75rem;
  font-weight: 600;
  color: #3b82f6;
}

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

/* Error Alert */
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
  margin-bottom: 1.5rem;
  border: 1px solid #f87171;
  animation: shake 0.4s ease-in-out;
}

/* Rest of the UI */
.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 600;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}
.auth-divider span {
  padding: 0 1rem;
}

.register-link-btn {
  display: inline-block;
  width: 100%;
  padding: 0.85rem;
  background: #f3f4f6;
  color: #374151;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.register-link-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.admin-hint {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

/* Animations */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 900px) {
  .auth-left { display: none; }
  .auth-right { padding: 3rem 1.5rem; }
  .auth-container { max-width: 480px; min-height: auto; }
}
</style>