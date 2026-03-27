<template>
  <div class="modal-overlay" v-if="isVisible" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Create Barangay Staff Account</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submit" class="modern-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" v-model="form.name" required class="form-control" placeholder="Jane Doe" />
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" v-model="form.email" required class="form-control" placeholder="staff@barangay.local" />
          </div>

          <div class="form-group">
            <label>Contact Number</label>
            <input type="text" v-model="form.contact" required class="form-control" placeholder="0912-345-6789" />
          </div>

          <div class="form-group">
            <label>Temporary Password</label>
            <input type="password" v-model="form.password" required class="form-control" placeholder="Minimum 8 characters" minlength="8" />
          </div>

          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> Creating...</span>
              <span v-else>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaffAccountModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        contact: '',
        password: ''
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
      this.resetForm();
    },
    submit() {
      this.$emit('save', { ...this.form });
    },
    resetForm() {
      this.form = {
        name: '',
        email: '',
        contact: '',
        password: ''
      };
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) this.resetForm();
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eef0f3;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #dc3545;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  color: #495057;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  color: #dc3545;
  background: #f8d7da;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.modal-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eef0f3;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f1f3f5;
  color: #495057;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
