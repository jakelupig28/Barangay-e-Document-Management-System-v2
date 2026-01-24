<template>
  <div class="report-details">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> Back to Reports
      </button>
      <h2 class="title">Report Details</h2>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading report details...</p>
    </div>

    <!-- Report Content -->
    <div v-else-if="report" class="report-card">
      <div class="report-header">
        <div class="report-id">#{{ report.customId || report.id || 'N/A' }}</div>
        <div class="status-badge" :class="report.status">
          <i :class="statusIcons[report.status]"></i>
          {{ formatStatus(report.status) }}
        </div>
      </div>

      <h3 class="report-title">{{ report.title || 'Untitled Report' }}</h3>
<div class="meta-grid">
        <div class="meta-item">
          <label><i class="fas fa-tag"></i> Type</label>
          <div  :class="report.reportType">
            <i :class="[report.reportType]"></i>
            {{ getReportTypeLabel(report.reportType) }}
          </div>
        </div>

        <div class="meta-item">
          <label><i class="fas fa-exclamation"></i> Urgency</label>
          <div :class="report.urgency">
            <i :class="[report.urgency]"></i>
            {{ getUrgencyLabel(report.urgency) }}
          </div>
        </div>

        <div class="meta-item">
          <label><i class="fas fa-user"></i> Resident</label>
          <div>{{ report.userName || 'Anonymous' }}</div>
        </div>

        <div class="meta-item">
          <label><i class="fas fa-map-marker-alt"></i> Sitio</label>
          <div>{{ report.location || 'Not specified' }}</div>
        </div>

        <div class="meta-item">
          <label><i class="fas fa-calendar-alt"></i> Reported</label>
          <div>{{ formatDate(report.createdAt) }}</div>
        </div>
      </div>

      <!-- Description -->
      <div class="section">
        <h4><i class="fas fa-align-left"></i> Description</h4>
        <p class="description">{{ report.description || 'No description provided.' }}</p>
      </div>

      <!-- Photos -->
      <div class="section" v-if="report.photoUrls && report.photoUrls.length > 0">
        <h4><i class="fas fa-images"></i> Attached Photos ({{ report.photoUrls.length }})</h4>
        <div class="photo-grid">
          <div
            v-for="(photoUrl, index) in report.photoUrls"
            :key="index"
            class="photo-thumb"
            @click="viewPhoto(photoUrl)"
          >
            <img :src="photoUrl" :alt="`Photo ${index + 1}`" loading="lazy" />
            <div class="overlay">
              <i class="fas fa-expand-alt"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button
          class="btn resolve"
          @click="handleStatusUpdate('resolved')"
          v-if="['pending', 'in-progress'].includes(report.status)"
          :disabled="isUpdating"
        >
          <i class="fas fa-check"></i>
          {{ report.status === 'pending' ? 'Mark as In Progress' : 'Mark Resolved' }}
        </button>
      </div>
    </div>

    <!-- Photo Lightbox -->
    <Teleport to="body">
      <transition name="lightbox">
        <div v-if="selectedPhoto" class="lightbox" @click.self="selectedPhoto = null">
          <div class="lightbox-content">
            <img :src="selectedPhoto" alt="Enlarged report photo" />
            <button class="close-lightbox" @click="selectedPhoto = null" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Toast -->
    <transition name="toast">
      <div class="toast" :class="{ show: showToast, error: isToastError }" v-if="showToast">
        <i :class="toastIcon"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { format } from 'date-fns';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase/config';

const router = useRouter();
const route = useRoute();

const report = ref(null);
const isLoading = ref(true);
const isUpdating = ref(false);
const error = ref(null);
const selectedPhoto = ref(null);

const showToast = ref(false);
const toastMessage = ref('');
const toastIcon = ref('');
const isToastError = ref(false);

const user = ref(null);

const reportTypeIcons = {
  maintenance: 'fas fa-tools',
  safety: 'fas fa-shield-alt',
  sanitation: 'fas fa-broom',
  noise: 'fas fa-volume-up',
  infrastructure: 'fas fa-city',
  other: 'fas fa-question-circle'
};

const urgencyIcons = {
  low: 'fas fa-battery-quarter',
  medium: 'fas fa-battery-half',
  high: 'fas fa-battery-three-quarters',
  emergency: 'fas fa-bolt'
};

const statusIcons = {
  pending: 'fas fa-clock',
  'in-progress': 'fas fa-sync-alt',
  resolved: 'fas fa-check-circle'
};

const getReportTypeLabel = (type) => {
  const map = {
    maintenance: 'Maintenance',
    safety: 'Safety Concern',
    sanitation: 'Sanitation',
    noise: 'Noise Complaint',
    infrastructure: 'Infrastructure',
    other: 'Other'
  };
  return map[type] || type;
};

const getUrgencyLabel = (level) => {
  const map = { low: 'Low', medium: 'Medium', high: 'High', emergency: 'Emergency' };
  return map[level] || level;
};

const formatStatus = (status) => {
  return status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = date.toDate ? date.toDate() : date;
  return format(d, 'MMM dd, yyyy • h:mm a');
};

const fetchReport = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, where('id', '==', route.params.id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      report.value = {
        id: docSnap.id,
        customId: data.id,
        ...data,
        createdAt: data.createdAt?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null
      };
    } else {
      error.value = 'Report not found.';
    }
  } catch (err) {
    error.value = 'Failed to load report. Please try again.';
    console.error('Error fetching report:', err);
  } finally {
    isLoading.value = false;
  }
};

const updateReportStatus = async (status) => {
  if (!user.value) {
    showToastNotification('Please log in to update status.', 'fas fa-lock', true);
    return;
  }

  try {
    isUpdating.value = true;
    
    const ref = doc(db, 'reports', report.value.id);
    await updateDoc(ref, {
      status,
      updatedAt: new Date(),
      updatedBy: user.value.uid
    });

    report.value.status = status;
    report.value.updatedAt = new Date();

    const msg = status === 'resolved' ? 'Report resolved!' : 'Work in progress!';
    const icon = status === 'resolved' ? 'fas fa-check-circle' : 'fas fa-sync-alt';
    showToastNotification(msg, icon);
  } catch (err) {
    showToastNotification('Update failed: ' + err.message, 'fas fa-times-circle', true);
  } finally {
    isUpdating.value = false;
  }
};

const handleStatusUpdate = (status) => updateReportStatus(status);

const showToastNotification = (msg, icon, isError = false) => {
  toastMessage.value = msg;
  toastIcon.value = icon;
  isToastError.value = isError;
  showToast.value = true;
  setTimeout(() => (showToast.value = false), 3500);
};

const viewPhoto = (url) => (selectedPhoto.value = url);
const goBack = () => router.back();

onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
    if (currentUser) {
      fetchReport();
    } else {
      error.value = 'Please log in to view report details.';
      isLoading.value = false;
    }
  });
});
</script>

<style scoped>
/* === Root & Layout === */
.report-details {
  min-height: 100vh;
  padding: 2rem 1rem;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.report-card {
  background: white;
  border-radius: 1.75rem;
  padding: 2.25rem;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 960px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* === Header === */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.02em;
}

.back-btn {
  background: #64748b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 10px rgba(100, 116, 139, 0.2);
}

.back-btn:hover {
  background: #475569;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(100, 116, 139, 0.3);
}

/* === Report Header === */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.report-id {
  font-size: 1.15rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.5px;
}

.status-badge {
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: capitalize;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.in-progress { background: #dbeafe; color: #1e40af; }
.status-badge.resolved { background: #d1fae5; color: #065f46; }

/* === Title === */
.report-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 1rem 0 1.5rem;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

/* === Meta Grid === */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.25rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-item > div {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
}

/* === Badges === */
.badge {
  padding: 0.5rem 1rem;
  border-radius: 1.75rem;
  font-size: 0.825rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.badge.type { background: #f1f5f9; color: #475569; }
.badge.urgency.low { background: #dbeafe; color: #1e40af; }
.badge.urgency.medium { background: #fef3c7; color: #92400e; }
.badge.urgency.high { background: #fee2e2; color: #991b1b; }
.badge.urgency.emergency { background: #fecaca; color: #7f1d1d; }

/* === Sections === */
.section {
  margin-bottom: 2.25rem;
}

.section h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  letter-spacing: -0.01em;
}

.description {
  background: #f8fafc;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  line-height: 1.7;
  color: #475569;
  border-left: 5px solid #3b82f6;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* === Photo Grid === */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.25rem;
}

.photo-thumb {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: zoom-in;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  aspect-ratio: 1;
}

.photo-thumb:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-thumb:hover .overlay {
  opacity: 1;
}

.overlay i {
  color: white;
  font-size: 1.4rem;
  background: rgba(0,0,0,0.5);
  padding: 0.5rem;
  border-radius: 50%;
}

/* === Actions === */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.btn {
  padding: 0.9rem 1.8rem;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.3s ease;
  min-width: 160px;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}

.btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.18);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn.resolve {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
}

.btn.resolve:hover:not(:disabled) {
  background: linear-gradient(135deg, #15803d, #166534);
}

/* === Lightbox === */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.lightbox-content {
  position: relative;
  max-width: 92vw;
  max-height: 92vh;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  animation: zoomIn 0.4s ease;
}

@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.lightbox-content img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.close-lightbox {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.close-lightbox:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.lightbox-enter-active, .lightbox-leave-active { transition: opacity 0.3s; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }

/* === Alerts & Loading === */
.alert {
  padding: 1.25rem 1.75rem;
  border-radius: 16px;
  margin-bottom: 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
}

.alert.error {
  background: #fee2e2;
  color: #991b1b;
  border-left: 5px solid #ef4444;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #e2e8f0;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.25rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === Toast === */
.toast {
  position: fixed;
  bottom: 2.5rem;
  right: 2.5rem;
  background: #16a34a;
  color: white;
  padding: 1rem 1.75rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  transform: translateY(120px);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 1500;
  min-width: 280px;
  backdrop-filter: blur(8px);
}

.toast.show {
  transform: translateY(0);
  opacity: 1;
}

.toast.error {
  background: #ef4444;
}

.toast-enter-active, .toast-leave-active { transition: all 0.4s ease; }
.toast-enter-from, .toast-leave-to { transform: translateY(120px); opacity: 0; }

/* === Responsive === */
@media (max-width: 768px) {
  .report-details { padding: 1.5rem 1rem; }
  .header { flex-direction: column; align-items: stretch; text-align: center; }
  .report-card { padding: 1.75rem; border-radius: 1.5rem; }
  .meta-grid { grid-template-columns: 1fr; gap: 1.25rem; }
  .actions { justify-content: stretch; }
  .btn { flex: 1; font-size: 0.9rem; }
  .photo-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .title { font-size: 1.75rem; }
}

@media (max-width: 480px) {
  .title { font-size: 1.6rem; }
  .report-header { flex-direction: column; align-items: flex-start; }
  .photo-grid { grid-template-columns: repeat(2, 1fr); }
  .toast { right: 1rem; left: 1rem; bottom: 1.5rem; min-width: auto; }
}
</style>