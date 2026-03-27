<template>
  <div class="container py-5" style="max-width: 720px;">
    <div class="card shadow-sm">
      <div class="card-body p-4 text-center">
        <h3 class="mb-3">Resident Validation Status</h3>
        <p class="mb-3">
          <strong>Status:</strong>
          <span :class="statusClass">{{ statusLabel }}</span>
        </p>

        <p v-if="status === 'pending_validation'">
          Your account will be under validation by Barangay Staff. Please wait a couple of minutes. Thank you.
        </p>
        <p v-else-if="status === 'rejected'" class="text-danger">
          Registration was rejected. Reason: {{ rejectionMessage || 'No reason provided.' }}
        </p>
        <p v-else class="text-success">Your account is approved. You can proceed to your dashboard.</p>

        <button v-if="status === 'approved'" class="btn btn-success mt-2" @click="$router.push({ name: 'resident-dashboard' })">
          Continue to Dashboard
        </button>
        <button v-else class="btn btn-outline-secondary mt-2" @click="logout">Logout</button>
      </div>
    </div>
  </div>
</template>

<script>
import localDb from '@/services/localDb';

export default {
  name: 'PendingApproval',
  data() {
    return {
      status: 'pending_validation',
      rejectionMessage: '',
    };
  },
  computed: {
    statusLabel() {
      if (this.status === 'pending_validation') return 'pending_validation';
      return this.status;
    },
    statusClass() {
      if (this.status === 'approved') return 'text-success';
      if (this.status === 'rejected') return 'text-danger';
      return 'text-warning';
    },
  },
  mounted() {
    this.loadStatus();
  },
  methods: {
    loadStatus() {
      const userId = this.$store.state.auth.user?.uid;
      const resident = localDb.readDb().residents.find((r) => r.userId === userId);
      if (!resident) return;
      this.status = resident.status;
      this.rejectionMessage = resident.rejectionMessage || '';
    },
    logout() {
      this.$store.dispatch('logout');
      this.$router.push({ name: 'login' });
    },
  },
};
</script>
