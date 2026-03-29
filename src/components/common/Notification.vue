<template>
  <div v-if="message" :class="['global-notification', type, { 'fade-out': fading }]">
    <i :class="iconClass"></i> <span>{{ message }}</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fading: false,
      timeout: null
    };
  },
  computed: {
    message() {
      return this.$store.state.notification.message;
    },
    type() {
      return this.$store.state.notification.type;
    },
    iconClass() {
      return this.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    }
  },
  watch: {
    message: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fading = false;
          clearTimeout(this.timeout);
          this.timeout = setTimeout(() => {
            this.fading = true;
            setTimeout(() => {
              this.$store.commit('clearNotification');
            }, 300);
          }, 5000);
        }
      }
    }
  }
}
</script>

<style scoped>
.global-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 14px 24px;
  border-radius: 8px;
  color: white;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  font-family: inherit;
  animation: slideIn 0.3s ease-out;
}

.global-notification.success {
  background-color: #10b981;
}

.global-notification.error {
  background-color: #ef4444;
}

.global-notification.info {
  background-color: #3b82f6;
}

.fade-out {
  animation: fadeOut 0.3s ease-in forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>