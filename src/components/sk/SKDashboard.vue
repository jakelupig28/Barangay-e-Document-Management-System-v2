<template>
  <SKNav>
    <div class="sk-portal-container">
      <!-- Header -->
      <div class="sk-portal-header">
        <div class="sk-portal-header-content">
          <h1 class="sk-portal-title">
            SK Dashboard
          </h1>
          <p class="sk-portal-description">
            Welcome to your Sangguniang Kabataan official dashboard
          </p>
        </div>
        <div class="sk-portal-actions">
          <button class="sk-btn sk-btn-primary" @click="showNoticeModal">
            <i class="fas fa-plus-circle"></i>
            New Project
          </button>
          <button class="sk-btn sk-btn-secondary sk-btn-icon">
            <i class="fas fa-bell"></i>
          </button>
        </div>
      </div>

      <!-- Statistics Grid -->
      <div class="sk-grid sk-grid-cols-3">
        <div class="sk-card sk-stat-card">
          <div class="sk-stat-icon sk-stat-icon-primary">
            <i class="fas fa-kanban"></i>
          </div>
          <div class="sk-stat-content">
            <h3 class="sk-stat-value">12</h3>
            <p class="sk-stat-label">Total Projects</p>
            <div class="sk-stat-trend sk-stat-trend-positive">
              <i class="fas fa-arrow-up"></i>
              <span>3 new this month</span>
            </div>
          </div>
        </div>

        <div class="sk-card sk-stat-card">
          <div class="sk-stat-icon sk-stat-icon-warning">
            <i class="fas fa-hourglass-half"></i>
          </div>
          <div class="sk-stat-content">
            <h3 class="sk-stat-value">5</h3>
            <p class="sk-stat-label">Ongoing</p>
            <div class="sk-stat-trend sk-stat-trend-warning">
              <i class="fas fa-exclamation-circle"></i>
              <span>1 needs attention</span>
            </div>
          </div>
        </div>

        <div class="sk-card sk-stat-card">
          <div class="sk-stat-icon sk-stat-icon-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="sk-stat-content">
            <h3 class="sk-stat-value">7</h3>
            <p class="sk-stat-label">Completed</p>
            <div class="sk-stat-trend sk-stat-trend-positive">
              <i class="fas fa-check-circle"></i>
              <span>100% success rate</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="sk-card sk-mt-6">
        <div class="sk-card-header">
          <h2 class="sk-card-title">Recent Activities</h2>
        </div>
        <div class="sk-card-body">
          <div class="sk-activities-list">
            <div v-for="(activity, i) in activities" :key="i" class="sk-activity-item">
              <div class="sk-activity-icon" :class="`sk-activity-${activity.status}`">
                <i :class="activity.icon"></i>
              </div>
              <div class="sk-activity-content">
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.time }}</p>
              </div>
              <span class="sk-badge" :class="`sk-badge-${activity.status === 'completed' ? 'success' : activity.status === 'pending' ? 'warning' : 'primary'}`">
                {{ activity.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notice Modal -->
      <div class="sk-modal-overlay" v-if="showModal" @click.self="closeModal">
        <div class="sk-modal-content">
          <div class="sk-modal-header">
            <h3 class="sk-modal-title">
              <i class="fas fa-info-circle" style="color: #28a745;"></i>
              Notice
            </h3>
            <button class="sk-modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="sk-modal-body">
            <p>
              This <strong>dashboard</strong> is for demonstration purposes only and does
              <strong>not</strong> reflect live project statistics.
            </p>
            <div class="sk-note-box">
              <i class="fas fa-lightbulb"></i>
              <div>
                <strong>Note:</strong> Other sections such as
                <strong>Members</strong> and <strong>Forum</strong> are working as expected.
              </div>
            </div>
          </div>
          <div class="sk-modal-footer">
            <button class="sk-btn sk-btn-primary" @click="closeModal">
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  </SKNav>
</template>

<script>
export default {
  name: 'SKDashboard',
  data() {
    return {
      showModal: true,
      activities: [
        {
          title: 'Youth Sports Fest completed',
          time: '2 days ago',
          status: 'completed',
          icon: 'fas fa-check-circle'
        },
        {
          title: 'Scholarship program needs review',
          time: '1 week ago',
          status: 'pending',
          icon: 'fas fa-exclamation-triangle'
        },
        {
          title: 'New project proposal: Clean-up Drive',
          time: '2 weeks ago',
          status: 'new',
          icon: 'fas fa-lightbulb'
        }
      ]
    };
  },
  methods: {
    showNoticeModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    }
  }
};
</script>

<style scoped>
/* Update colors to match sidebar green theme */
:root {
  --primary-500: #28a745;
  --primary-600: #218838;
  --success-600: #28a745;
  --warning-600: #ffc107;
}

.sk-btn-primary {
  background: linear-gradient(135deg, #28a745, #218838);
  border-color: #28a745;
}

.sk-btn-primary:hover {
  background: linear-gradient(135deg, #218838, #1e7e34);
  border-color: #1e7e34;
}

.sk-stat-icon-primary {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.sk-stat-icon-success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.sk-stat-icon-warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.sk-stat-trend-positive {
  color: #28a745;
}

.sk-badge-primary {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.sk-badge-success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.sk-badge-warning {
  background: rgba(255, 193, 7, 0.1);
  color: #856404;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

/* Activity icons */
.sk-activity-completed {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.sk-activity-pending {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.sk-activity-new {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

/* Modal updates */
.sk-modal-title i {
  color: #28a745 !important;
}

.sk-note-box {
  border-left-color: #28a745;
}

.sk-note-box i {
  color: #28a745;
}

/* Additional component-specific styles */
.sk-activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sk-activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.sk-activity-item:hover {
  background: var(--gray-50);
  border-color: var(--gray-200);
}

.sk-activity-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.sk-activity-content {
  flex: 1;
}

.sk-activity-content h4 {
  margin: 0;
  font-weight: 600;
  color: var(--gray-900);
  font-size: 1rem;
}

.sk-activity-content p {
  margin: 0.25rem 0 0 0;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.sk-note-box {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: rgba(40, 167, 69, 0.05);
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #28a745;
  margin-top: 1rem;
}

.sk-note-box div {
  flex: 1;
}
</style>