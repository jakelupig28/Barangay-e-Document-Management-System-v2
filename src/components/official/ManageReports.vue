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

    <!-- Stats Section -->
    <div v-else class="stats-grid">
      <div class="stat-glass-card pending" @click="filterByStatus('pending')" :class="{ active: currentFilter === 'pending' }">
        <div class="stat-icon-wrapper">
          <i class="fas fa-clock-rotate-left"></i>
        </div>
        <div class="stat-value">{{ stats.pendingReports }}</div>
        <div class="stat-label">Pending Reports</div>
      </div>
      <div class="stat-glass-card in-progress" @click="filterByStatus('in-progress')" :class="{ active: currentFilter === 'in-progress' }">
        <div class="stat-icon-wrapper">
          <i class="fas fa-screwdriver-wrench"></i>
        </div>
        <div class="stat-value">{{ stats.inProgressReports }}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-glass-card resolved" @click="filterByStatus('resolved')" :class="{ active: currentFilter === 'resolved' }">
        <div class="stat-icon-wrapper">
          <i class="fas fa-circle-check"></i>
        </div>
        <div class="stat-value">{{ stats.resolvedReports }}</div>
        <div class="stat-label">Resolved Case</div>
      </div>
      <div class="stat-glass-card total" @click="filterByStatus('all')" :class="{ active: currentFilter === 'all' }">
        <div class="stat-icon-wrapper">
          <i class="fas fa-flag"></i>
        </div>
        <div class="stat-value">{{ stats.totalReports }}</div>
        <div class="stat-label">Total Reports</div>
      </div>
    </div>

    <!-- Dashboard Controls -->
    <div v-if="!isLoading" class="dashboard-controls">
      <div class="search-and-filter">
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search by title, description, or resident name..."
            class="professional-input"
          >
        </div>
        <div class="filter-group">
          <div class="custom-select-wrapper">
            <i class="fas fa-filter select-icon"></i>
            <select v-model="reportTypeFilter" class="professional-select">
              <option value="">All Report Types</option>
              <option v-for="type in reportTypes" :value="type.value" :key="type.value">{{ type.label }}</option>
            </select>
          </div>
          <div class="custom-select-wrapper">
            <i class="fas fa-bolt select-icon"></i>
            <select v-model="urgencyFilter" class="professional-select">
              <option value="">All Urgency Levels</option>
              <option v-for="level in urgencyLevels" :value="level.value" :key="level.value">{{ level.label }}</option>
            </select>
          </div>
          <div class="status-tabs">
            <button 
              v-for="status in ['all', 'pending', 'in-progress', 'resolved']" 
              :key="status"
              :class="['status-tab', { active: currentFilter === status }, status]"
              @click="currentFilter = status"
            >
              {{ status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ') }}
            </button>
          </div>
        </div>
      </div>
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
    <div v-else-if="!isLoading" class="empty-state-wrapper">
      <div class="empty-card">
        <div class="empty-icon-ring">
          <i class="fas fa-flag-checkered"></i>
        </div>
        <h3>No Reports Found</h3>
        <p>There are currently no reports that match your selected filters.</p>
        <div class="empty-actions" v-if="currentFilter !== 'all' || searchQuery || reportTypeFilter || urgencyFilter">
          <button class="btn-clear" @click="resetFilters">
            <i class="fas fa-rotate-left"></i> Clear All Filters
          </button>
        </div>
      </div>
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
import localDb from '@/services/localDb';

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
    const user = ref(null);

    const getReportTypeLabel = (typeValue) => {
      const type = reportTypes.value.find(t => t.value === typeValue);
      return type ? type.label : typeValue;
    };

    const getUrgencyLabel = (urgencyValue) => {
      const level = urgencyLevels.value.find(u => u.value === urgencyValue);
      return level ? level.label : urgencyValue;
    };

    const isFirebaseReady = () => !!(db && typeof db === 'object' && typeof db.app !== 'undefined');

    const fetchReports = async () => {
      if (!isFirebaseReady()) {
        try {
          isLoading.value = true;
          error.value = null;
          const dbData = localDb.readDb();
          const localReports = dbData.reports || [];
          
          reports.value = localReports.map(rep => ({
             id: rep.id,
             customId: rep.id,
             ...rep,
             createdAt: rep.createdAt ? new Date(rep.createdAt) : null,
             updatedAt: rep.updatedAt ? new Date(rep.updatedAt) : null
          })).sort((a, b) => b.createdAt - a.createdAt);

          stats.value = {
             pendingReports: reports.value.filter(r => r.status === 'pending').length,
             inProgressReports: reports.value.filter(r => r.status === 'in-progress').length,
             resolvedReports: reports.value.filter(r => r.status === 'resolved').length,
             totalReports: reports.value.length,
          };
        } catch (err) {
          console.error('Local DB fetch error:', err);
          error.value = 'Failed to load reports from local storage.';
        } finally {
          isLoading.value = false;
        }
        return;
      }
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
        if (!isFirebaseReady()) {
          const dbData = localDb.readDb();
          const repIndex = (dbData.reports || []).findIndex(r => r.id === reportId);
          if (repIndex !== -1) {
            dbData.reports[repIndex].status = status;
            dbData.reports[repIndex].updatedAt = new Date().toISOString();
            dbData.reports[repIndex].updatedBy = user.value?.uid || user.value?.id || 'staff';
            localDb.writeDb(dbData);
            
            const messages = {
              'in-progress': 'Report marked as in progress!',
              'resolved': 'Report resolved successfully!'
            };
            showToastNotification(messages[status] || 'Status updated!', status === 'resolved' ? 'fas fa-check-circle' : 'fas fa-tools');
            fetchReports();
          } else {
             showToastNotification('Report not found in local database.', 'fas fa-exclamation-circle', true);
          }
          isUpdating.value = false;
          return;
        }

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
    
    const resetFilters = () => {
      searchQuery.value = '';
      reportTypeFilter.value = '';
      urgencyFilter.value = '';
      currentFilter.value = 'all';
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        return format(timestamp.toDate ? timestamp.toDate() : timestamp, 'MMM dd, yyyy hh:mm a');
      } catch {
        return 'Invalid Date';
      }
    };

    onMounted(() => {
      if (!isFirebaseReady()) {
        const localUser = localDb.getSessionUser();
        if (localUser) {
          user.value = localUser;
          fetchReports();
        } else {
          error.value = 'Please log in to access reports management.';
          isLoading.value = false;
        }
        return;
      }
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            user.value = currentUser;
            fetchReports();
          } else {
            error.value = 'Please log in to access reports management.';
            isLoading.value = false;
          }
        });
      } catch (err) {
        console.error("Auth init bypassed.");
      }
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
      resetFilters,
      formatDate,
      getReportTypeLabel,
      getUrgencyLabel
    };
  },
};
</script>

<style scoped>
.manage-reports {
  padding: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  color: #1e293b;
  min-height: 100vh;
}

.header h2 {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2.5rem;
  letter-spacing: -0.025em;
}

/* Stats Section */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.75rem;
  margin-bottom: 2.5rem;
}

.stat-glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 1.75rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.stat-glass-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-glass-card.active {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.pending .stat-icon-wrapper { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #b45309; }
.in-progress .stat-icon-wrapper { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #1d4ed8; }
.resolved .stat-icon-wrapper { background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #15803d; }
.total .stat-icon-wrapper { background: linear-gradient(135deg, #f8fafc, #f1f5f9); color: #475569; }

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.5rem;
  color: #0f172a;
}

.stat-label {
  font-size: 0.9375rem;
  color: #64748b;
  font-weight: 600;
}

/* Dashboard Controls */
.dashboard-controls {
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid #f1f5f9;
}

.search-and-filter {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .search-and-filter {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-wrapper {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.professional-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.professional-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.custom-select-wrapper {
  position: relative;
  min-width: 180px;
}

.select-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.875rem;
  pointer-events: none;
}

.professional-select {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 2.5rem;
  background: #f8fafc;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9375rem;
  color: #1e293b;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease;
}

.professional-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: #ffffff;
}

.status-tabs {
  background: #f1f5f9;
  padding: 0.375rem;
  border-radius: 14px;
  display: flex;
  gap: 0.25rem;
}

.status-tab {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.status-tab.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Reports Table */
.reports-table {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f8fafc;
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9375rem;
  color: #1e293b;
}

tr:last-child td {
  border-bottom: none;
}

/* Status Badges */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.in-progress { background: #cce5ff; color: #004085; }
.status-badge.resolved { background: #d4edda; color: #155724; }

/* Urgency Indicator */
.urgency-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.urgency-badge.low { color: #10b981; }
.urgency-badge.medium { color: #f59e0b; }
.urgency-badge.high { color: #ef4444; }
.urgency-badge.emergency { color: #dc2626; font-weight: 800; }

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.btn-text { display: none; }

.action-btn.view { background: #f1f5f9; color: #475569; }
.action-btn.progress { background: #eff6ff; color: #2563eb; }
.action-btn.resolve { background: #f0fdf4; color: #16a34a; }

.action-btn:hover {
  transform: translateY(-2px);
  filter: brightness(0.95);
}

/* Empty State */
.empty-state-wrapper {
  padding: 4rem 2rem;
  display: flex;
  justify-content: center;
}

.empty-card {
  text-align: center;
  max-width: 400px;
}

.empty-icon-ring {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #94a3b8;
  margin: 0 auto 1.5rem;
}

.empty-card h3 {
  font-family: 'Outfit';
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.empty-card p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.btn-clear {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #0f172a;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.toast.show {
  transform: translateY(0);
  opacity: 1;
}

.toast.error { background: #ef4444; }

@media (max-width: 640px) {
  .manage-reports { padding: 1.5rem; }
  .stats-grid { grid-template-columns: 1fr; }
  .action-buttons { flex-direction: column; }
}
</style>