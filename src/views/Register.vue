<template>
  <div class="register-page">
    <section class="hero-section py-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-5 text-white mb-4 mb-lg-0">
            <h1 class="fw-bold mb-3">Resident Registration</h1>
            <p class="mb-4 hero-copy">Complete your details to create a resident account for barangay e-services.</p>
            <router-link to="/" class="btn btn-outline-light">Back to Home</router-link>
          </div>
          <div class="col-lg-7">
            <div class="card shadow-lg border-0">
              <div class="card-body p-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label field-label">Full Name</label>
                    <input v-model.trim="form.name" class="form-control" type="text" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label field-label">Email</label>
                    <input v-model.trim="form.email" class="form-control" type="email" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label field-label">Password</label>
                    <div class="input-group">
                      <input v-model="form.password" class="form-control" :type="showPassword ? 'text' : 'password'" />
                      <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                        <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label field-label">Confirm Password</label>
                    <div class="input-group">
                      <input v-model="form.confirmPassword" class="form-control" :type="showConfirmPassword ? 'text' : 'password'" />
                      <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword" :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'">
                        <i :class="showConfirmPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label field-label">Birthdate</label>
                    <input v-model="form.birthdate" class="form-control" type="date" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label field-label">Contact Number</label>
                    <input v-model.trim="form.contact" class="form-control" type="text" />
                  </div>
                  <div class="col-12">
                    <label class="form-label field-label">Address</label>
                    <input v-model.trim="form.address" class="form-control" type="text" />
                  </div>
                  <div class="col-12">
                    <label class="form-label field-label">Present Barangay ID (image only)</label>
                    <input class="form-control" type="file" accept="image/*" @change="handleFileChange" />
                  </div>
                </div>

                <p v-if="error" class="text-danger small mt-3">{{ error }}</p>
                <p v-if="success" class="text-success small mt-3">{{ success }}</p>

                <div class="d-flex gap-2 mt-3">
                  <button class="btn btn-primary" :disabled="loading" @click="registerResident">
                    {{ loading ? 'Submitting...' : 'Submit Registration' }}
                  </button>
                  <router-link to="/login" class="btn btn-outline-primary">Go to Login</router-link>
                </div>
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
  name: 'RegisterPage',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthdate: '',
        contact: '',
        address: '',
      },
      showPassword: false,
      showConfirmPassword: false,
      barangayIdImage: '',
      loading: false,
      error: '',
      success: '',
    };
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

        localDb.registerResident({
          ...this.form,
          barangayIdImage: this.barangayIdImage,
        });

        window.alert('Your account will be under validation by Barangay Staff. Please wait a couple of minutes. Thank you.');
        this.success = 'Registration submitted with status: pending_validation';
        this.$router.push({ name: 'login' });
      } catch (err) {
        this.error = err.message || 'Registration failed.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.register-page {
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
  max-width: 420px;
}
</style>
