<template>
  <div class="password-change-container d-flex align-items-center justify-content-center min-vh-100 bg-light">
    <div class="card border-0 shadow-sm custom-card" style="max-width: 500px; width: 100%;">
      <div class="card-body p-5">
        <h3 class="fw-bold mb-3 text-dark">First-time Password Change</h3>
        <p class="text-muted mb-4 pb-2" style="font-size: 0.95rem;">You must change your default password before accessing the dashboard.</p>

        <form @submit.prevent="submit" class="needs-validation" novalidate>
          <div class="mb-4">
            <label class="form-label fw-medium text-dark">New Password</label>
            <div class="input-group custom-input-group">
              <input v-model="newPassword" class="form-control border-end-0 shadow-none" :type="showNewPassword ? 'text' : 'password'" required />
              <button class="btn btn-outline-secondary border-start-0 bg-white shadow-none text-muted" type="button" @click="showNewPassword = !showNewPassword" style="border-color: #dee2e6;">
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="mb-4 pb-2">
            <label class="form-label fw-medium text-dark">Confirm New Password</label>
            <div class="input-group custom-input-group">
              <input v-model="confirmPassword" class="form-control border-end-0 shadow-none" :type="showConfirmPassword ? 'text' : 'password'" required />
              <button class="btn btn-outline-secondary border-start-0 bg-white shadow-none text-muted" type="button" @click="showConfirmPassword = !showConfirmPassword" style="border-color: #dee2e6;">
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger py-2 px-3 small border-0 bg-danger text-white rounded-3 mb-4">
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 rounded-3 fw-medium custom-btn mt-2">
            Update Password
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import localDb from '@/services/localDb';

export default {
  name: 'StaffPasswordChange',
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      showNewPassword: false,
      showConfirmPassword: false,
      error: '',
    };
  },
  methods: {
    submit() {
      this.error = '';
      try {
        if (this.newPassword.length < 8) throw new Error('Password must be at least 8 characters.');
        if (this.newPassword !== this.confirmPassword) throw new Error('Passwords do not match.');
        const userId = this.$store.state.auth.user?.uid;
        if (!userId) throw new Error('Session expired. Please login again.');
        localDb.changeStaffPassword(userId, this.newPassword);
        this.$router.push({ name: 'official-dashboard' });
      } catch (err) {
        this.error = err.message || 'Failed to update password.';
      }
    },
  },
};
</script>

<style scoped>
.custom-card {
  border-radius: 16px;
}

.custom-input-group .form-control {
  padding: 0.75rem 1rem;
  border-radius: 8px 0 0 8px;
  border-color: #e2e8f0;
}

.custom-input-group .form-control:focus {
  border-color: #3b82f6;
  box-shadow: none;
}

.custom-input-group .btn {
  border-radius: 0 8px 8px 0;
  border-color: #e2e8f0;
  padding-left: 1rem;
  padding-right: 1.25rem;
}

.custom-input-group:focus-within .form-control,
.custom-input-group:focus-within .btn {
  border-color: #3b82f6;
}

.custom-input-group .btn:hover {
  background-color: transparent !important;
  color: #4b5563 !important;
}

.form-label {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.custom-btn {
  background-color: #3b82f6;
  border: none;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.custom-btn:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}
</style>
