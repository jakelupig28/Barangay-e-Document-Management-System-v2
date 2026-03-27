<template>
  <div class="container py-5" style="max-width: 560px;">
    <div class="card shadow-sm">
      <div class="card-body p-4">
        <h4 class="mb-2">First-time Password Change</h4>
        <p class="text-muted small">You must change your default password before accessing the dashboard.</p>

        <div class="mb-3">
          <label class="form-label">New Password</label>
          <div class="input-group">
            <input v-model="newPassword" class="form-control" :type="showNewPassword ? 'text' : 'password'" />
            <button class="btn btn-outline-secondary" type="button" @click="showNewPassword = !showNewPassword">
              <i :class="showNewPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
            </button>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Confirm New Password</label>
          <div class="input-group">
            <input v-model="confirmPassword" class="form-control" :type="showConfirmPassword ? 'text' : 'password'" />
            <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword">
              <i :class="showConfirmPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
            </button>
          </div>
        </div>

        <p v-if="error" class="text-danger small">{{ error }}</p>
        <button class="btn btn-primary w-100" @click="submit">Update Password</button>
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
