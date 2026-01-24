<template>
  <div class="manage-reports">
    <div class="header">
      <h2>Resident Reports</h2>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading reports...
    </div>

    <!-- Stats Cards -->
    <div v-else class="stats-cards">
      <div class="stat-card" @click="filterByStatus('pending')" :class="{ active: currentFilter === 'pending' }">
        <div class="stat-value">{{ stats.pendingReports }}</div>
        <div class="stat-label">Pending</div>
        <div class="stat-icon"><i class="fas fa-clock"></i></div>
      </div>
      <div class="stat-card" @click="filterByStatus('in-progress')" :class="{ active: currentFilter === 'in-progress' }">
        <div class="stat-value">{{ stats.inProgressReports }}</div>
        <div class="stat-label">In Progress</div>
        <div class="stat-icon"><i class="fas fa-tools"></i></div>
      </div>
      <div class="stat-card" @click="filterByStatus('resolved')" :class="{ active: currentFilter === 'resolved' }">
        <div class="stat-value">{{ stats.resolvedReports }}</div>
        <div class="stat-label">Resolved</div>
        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
      </div>
      <div class="stat-card" @click="filterByStatus('all')" :class="{ active: currentFilter === 'all' }">
        <div class="stat-value">{{ stats.totalReports }}</div>
        <div class="stat-label">Total</div>
        <div class="stat-icon"><i class="fas fa-flag"></i></div>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="!isLoading" class="filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title, description, or resident name..."
          @input="searchReports"
        >
        <i class="fas fa-search"></i>
      </div>
      <select v-model="reportTypeFilter" @change="filterReports" class="form-select">
        <option value="">All Report Types</option>
        <option v-for="type in reportTypes" :value="type.value" :key="type.value">{{ type.label }}</option>
      </select>
      <select v-model="urgencyFilter" @change="filterReports" class="form-select">
        <option value="">All Urgency Levels</option>
        <option v-for="level in urgencyLevels" :value="level.value" :key="level.value">{{ level.label }}</option>
      </select>
    </div>

    <!-- Reports Table -->
    <div v-if="!isLoading && filteredReports.length > 0" class="reports-table">
      <table>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Urgency</th>
            <th>Date Reported</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in filteredReports" :key="report.id">
            <td>{{ report.customId || report.id || 'N/A' }}</td>
            <td>
              <span :class="` ${report.urgency}`">
                <i :class="[report.urgency]"></i>
                {{ getUrgencyLabel(report.urgency) }}
              </span>
            </td>
            <td>{{ formatDate(report.createdAt) }}</td>
            <td>
              <span :class="`status-badge ${report.status}`">
                <i :class="statusIcons[report.status]"></i>
                {{ report.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <!-- View (Always) -->
                <button
                  class="action-btn view"
                  @click="viewReport(report)"
                  title="View Details"
                >
                  <i class="fas fa-eye"></i>
                  <span class="btn-text">View</span>
                </button>

                <!-- Start (Only if pending) -->
                <button
                  v-if="report.status === 'pending'"
                  class="action-btn progress"
                  @click="updateReportStatus(report.id, 'in-progress')"
                  :disabled="isUpdating"
                  title="Start Work"
                >
                  <i class="fas fa-tools"></i>
                  <span class="btn-text">Start</span>
                </button>
                <div v-else class="grid-placeholder"></div>

                <!-- Resolve (If pending or in-progress) -->
                <button
                  v-if="report.status === 'pending' || report.status === 'in-progress'"
                  class="action-btn resolve"
                  @click="updateReportStatus(report.id, 'resolved')"
                  :disabled="isUpdating"
                  title="Mark as Resolved"
                >
                  <i class="fas fa-check"></i>
                  <span class="btn-text">Resolve</span>
                </button>
                <div v-else-if="report.status === 'resolved'" class="status-indicator">
                  <span class="status-text">Resolved</span>
                </div>
                <div v-else class="grid-placeholder"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="empty-state">
      <i class="fas fa-flag"></i>
      <p>No reports found</p>
      <p class="subtext" v-if="currentFilter !== 'all' || searchQuery || reportTypeFilter || urgencyFilter">
        Try changing your filters
      </p>
    </div>

    <!-- Toast Notification -->
    <div class="toast" :class="{ show: showToast, error: isToastError }">
      <div class="toast-content">
        <i :class="toastIcon"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase/config';

export default {
  name: 'ManageReports',
  setup() {
    const router = useRouter();
    const reports = ref([]);
    const stats = ref({
      pendingReports: 0,
      inProgressReports: 0,
      resolvedReports: 0,
      totalReports: 0,
    });
    const isLoading = ref(true);
    const isUpdating = ref(false);
    const error = ref(null);
    const searchQuery = ref('');
    const reportTypeFilter = ref('');
    const urgencyFilter = ref('');
    const currentFilter = ref('all');

    const showToast = ref(false);
    const toastMessage = ref('');
    const toastIcon = ref('');
    const isToastError = ref(false);

    const reportTypes = ref([
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'safety', label: 'Safety Concern' },
      { value: 'sanitation', label: 'Sanitation' },
      { value: 'noise', label: 'Noise Complaint' },
      { value: 'infrastructure', label: 'Infrastructure' },
      { value: 'other', label: 'Other' }
    ]);

    const urgencyLevels = ref([
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'emergency', label: 'Emergency' }
    ]);

    const reportTypeIcons = {
      maintenance: 'fas fa-tools',
      safety: 'fas fa-exclamation-triangle',
      sanitation: 'fas fa-trash',
      noise: 'fas fa-volume-up',
      infrastructure: 'fas fa-road',
      other: 'fas fa-flag'
    };

    const urgencyIcons = {
      low: 'fas fa-thermometer-empty',
      medium: 'fas fa-thermometer-half',
      high: 'fas fa-thermometer-full',
      emergency: 'fas fa-exclamation-circle'
    };

    const statusIcons = {
      pending: 'fas fa-clock',
      'in-progress': 'fas fa-tools',
      resolved: 'fas fa-check-circle'
    };

    let unsubscribe = null;
    const auth = getAuth();
    const user = ref(null);

    const getReportTypeLabel = (typeValue) => {
      const type = reportTypes.value.find(t => t.value === typeValue);
      return type ? type.label : typeValue;
    };

    const getUrgencyLabel = (urgencyValue) => {
      const level = urgencyLevels.value.find(u => u.value === urgencyValue);
      return level ? level.label : urgencyValue;
    };

    const fetchReports = async () => {
      try {
        isLoading.value = true;
        error.value = null;
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const reportsData = [];
            for (const doc of snapshot.docs) {
              const reportData = doc.data();
              reportsData.push({
                id: doc.id,
                customId: reportData.id,
                ...reportData,
                createdAt: reportData.createdAt?.toDate?.() || null,
                updatedAt: reportData.updatedAt?.toDate?.() || null
              });
            }
            reports.value = reportsData;
            stats.value = {
              pendingReports: reports.value.filter(r => r.status === 'pending').length,
              inProgressReports: reports.value.filter(r => r.status === 'in-progress').length,
              resolvedReports: reports.value.filter(r => r.status === 'resolved').length,
              totalReports: reports.value.length,
            };
            isLoading.value = false;
          },
          (err) => {
            console.error('Error fetching reports:', err);
            error.value = 'Failed to load reports. Please try again later.';
            isLoading.value = false;
          }
        );
      } catch (err) {
        console.error('Error setting up listener:', err);
        error.value = 'Failed to initialize report listener.';
        isLoading.value = false;
      }
    };

    const updateReportStatus = async (reportId, status) => {
      if (!user.value) {
        showToastNotification('You must be logged in to perform this action.', 'fas fa-exclamation-circle', true);
        return;
      }

      try {
        isUpdating.value = true;
        const reportRef = doc(db, 'reports', reportId);
        const docSnapshot = await getDoc(reportRef);
        if (!docSnapshot.exists()) throw new Error(`Report not found`);

        await updateDoc(reportRef, {
          status: status,
          updatedAt: new Date(),
          updatedBy: user.value.uid,
        });

        const messages = {
          'in-progress': 'Report marked as in progress!',
          'resolved': 'Report resolved successfully!'
        };
        showToastNotification(messages[status] || 'Status updated!', status === 'resolved' ? 'fas fa-check-circle' : 'fas fa-tools');
      } catch (err) {
        console.error('Error updating report:', err);
        showToastNotification(`Failed to update: ${err.message}`, 'fas fa-exclamation-circle', true);
      } finally {
        isUpdating.value = false;
      }
    };

    const showToastNotification = (message, icon, isError = false) => {
      toastMessage.value = message;
      toastIcon.value = icon;
      isToastError.value = isError;
      showToast.value = true;
      setTimeout(() => { showToast.value = false; }, 3000);
    };

    const viewReport = (report) => {
      router.push(`/reports/${report.id}`);
    };

    const filterByStatus = (status) => { currentFilter.value = status; };
    const filterReports = () => {};
    const searchReports = () => {};

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        return format(timestamp.toDate ? timestamp.toDate() : timestamp, 'MMM dd, yyyy hh:mm a');
      } catch {
        return 'Invalid Date';
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          user.value = currentUser;
          fetchReports();
        } else {
          error.value = 'Please log in to access reports management.';
          isLoading.value = false;
        }
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    const filteredReports = computed(() => {
      let filtered = reports.value;
      if (currentFilter.value !== 'all') {
        filtered = filtered.filter(r => r.status === currentFilter.value);
      }
      if (reportTypeFilter.value) {
        filtered = filtered.filter(r => r.reportType === reportTypeFilter.value);
      }
      if (urgencyFilter.value) {
        filtered = filtered.filter(r => r.urgency === urgencyFilter.value);
      }
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(r =>
          (r.title?.toLowerCase().includes(query)) ||
          (r.description?.toLowerCase().includes(query)) ||
          (r.userName?.toLowerCase().includes(query)) ||
          (r.location?.toLowerCase().includes(query)) ||
          (r.id?.toLowerCase().includes(query)) ||
          (r.customId?.toLowerCase().includes(query))
        );
      }
      return filtered;
    });

    return {
      reports,
      filteredReports,
      stats,
      isLoading,
      isUpdating,
      error,
      searchQuery,
      reportTypeFilter,
      urgencyFilter,
      currentFilter,
      reportTypes,
      urgencyLevels,
      reportTypeIcons,
      urgencyIcons,
      statusIcons,
      showToast,
      toastMessage,
      toastIcon,
      isToastError,
      updateReportStatus,
      viewReport,
      filterByStatus,
      filterReports,
      searchReports,
      formatDate,
      getReportTypeLabel,
      getUrgencyLabel
    };
  },
};
</script>

<style scoped>
/* === Layout === */
.manage-reports {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header h2 {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* === Messages === */
.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 2rem 0;
}

/* === Stats Cards === */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-card.active {
  border: 2px solid #3498db;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  opacity: 0.2;
}

/* === Filters === */
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.search-box input:focus {
  outline: none;
  border-color: #3498db;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.form-select {
  width: 220px;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
}

.form-select:focus {
  outline: none;
  border-color: #3498db;
}

/* === Table === */
.reports-table {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  position: sticky;
  top: 0;
}

/* === Badges === */
.status-badge, .report-type-badge, .urgency-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.in-progress { background: #cce5ff; color: #004085; }
.status-badge.resolved { background: #d4edda; color: #155724; }
.report-type-badge { background: #e9ecef; color: #495057; }
.urgency-badge.low { background: #d1ecf1; color: #0c5460; }
.urgency-badge.medium { background: #fff3cd; color: #856404; }
.urgency-badge.high { background: #f8d7da; color: #721c24; }
.urgency-badge.emergency { background: #f5c6cb; color: #842029; }

/* === ACTION BUTTONS === */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  min-width: 240px;
  align-items: center;
}

.action-btn,
.status-indicator,
.grid-placeholder {
  min-width: 75px;
  height: 38px;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-btn {
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.grid-placeholder {
  visibility: hidden;
}

/* Button Colors */
.action-btn.view { background: #e2e3e5; color: #383d41; }
.action-btn.view:hover:not(:disabled) { background: #d6d8db; }
.action-btn.progress { background: #007bff; color: white; }
.action-btn.progress:hover:not(:disabled) { background: #0056b3; }
.action-btn.resolve { background: #28a745; color: white; }
.action-btn.resolve:hover:not(:disabled) { background: #218838; }
.action-btn.close { background: #6c757d; color: white; }
.action-btn.close:hover:not(:disabled) { background: #545b62; }

.status-indicator {
  background: #d4edda;
  color: #155724;
  font-size: 0.75rem;
  font-weight: 600;
}

/* === Empty State === */
.empty-state {
  padding: 3rem;
  text-align: center;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state i {
  font-size: 3rem;
  color: #bdc3c7;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #7f8c8d;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.empty-state .subtext {
  font-size: 0.9rem;
  color: #95a5a6;
}

/* === Toast === */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1100;
}

.toast.show {
  transform: translateY(0);
  opacity: 1;
}

.toast.error {
  background: #dc3545;
}

/* === Responsive === */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .form-select, .search-box {
    width: 100%;
  }

  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr 1fr;
    min-width: auto;
    gap: 0.4rem;
  }

  .action-btn,
  .status-indicator {
    min-width: 60px;
    font-size: 0.8rem;
    height: 36px;
  }

  .action-buttons > *:nth-child(3) {
    grid-column: span 2;
  }
}
</style>