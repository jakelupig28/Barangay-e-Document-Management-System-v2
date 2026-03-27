<template>
  <div class="login-page">
    <section class="hero-section">
      <div class="container h-100">
        <div class="row align-items-center h-100">
          <div class="col-lg-6 text-white mb-4 mb-lg-0">
            <h1 class="fw-bold mb-3">Barangay Portal</h1>
            <p class="lead mb-4 hero-copy">Secure access for Resident, Barangay Staff, and Super Admin accounts.</p>
            <router-link to="/" class="btn btn-outline-light">Back to Home</router-link>
          </div>
          <div class="col-lg-6">
            <div class="card shadow-lg border-0">
              <div class="card-body p-4 p-lg-5">
                <h3 class="mb-1 text-primary fw-bold">Log In</h3>
                <p class="text-muted small mb-3">Enter your credentials to continue.</p>

                <div class="mb-3">
                  <label class="form-label field-label">Login as</label>
                  <select v-model="selectedRole" class="form-select">
                    <option value="resident">Resident</option>
                    <option value="barangay_staff">Barangay Staff</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label field-label">Email</label>
                  <input v-model.trim="email" type="email" class="form-control" />
                </div>

                <div class="mb-2">
                  <label class="form-label field-label">Password</label>
                  <div class="input-group">
                    <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" />
                    <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                      <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <p v-if="error" class="text-danger small">{{ error }}</p>

                <button class="btn btn-primary w-100 mt-2" :disabled="loading" @click="login">
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>

                <p class="small mt-3 mb-0">
                  Default Super Admin: <code>superadmin@barangay.local / superadmin123</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
.login-page {
  min-height: 100vh;
}
.hero-section {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a3a8f 0%, #0d6efd 100%);
  display: flex;
  align-items: center;
}
.field-label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: #4b5563;
}
.hero-copy {
  max-width: 520px;
}
</style>