<template>
  <div class="resident-details container-fluid py-5 px-4 px-md-5">
    <transition name="notify-fade">
      <div
        v-if="notification.show"
        class="notify-popup"
        :class="`notify-${notification.type}`"
        role="status"
        aria-live="polite"
      >
        <div class="notify-icon">
          <i :class="notification.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
        </div>
        <div class="notify-copy">
          <div class="notify-title">{{ notification.type === 'error' ? 'Action Failed' : 'Success' }}</div>
          <div class="notify-message">{{ notification.message }}</div>
        </div>
        <button class="notify-close" @click="hideNotification" aria-label="Close notification">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>

    <!-- Back Button -->
    <div class="mb-4">
      <button class="btn btn-outline-secondary rounded-pill px-4" @click="$router.push('/official/residents')">
        <i class="fas fa-arrow-left me-2"></i> Back to Residents
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" style="width: 3.5rem; height: 3.5rem;" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted fs-5">Loading resident details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger text-center py-4">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>{{ error }}</strong>
    </div>

    <!-- Resident Details -->
    <div v-else-if="resident" class="resident-content">
      <!-- Header Card -->
      <div class="card border-0 shadow-sm mb-5 overflow-hidden">
        <div class="card-header bg-primary text-white py-4 px-5">
          <div class="d-flex align-items-center flex-wrap gap-3">
            <div class="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 70px; height: 70px;">
              <i class="fas fa-user text-white fs-3"></i>
            </div>
            <div class="flex-grow-1 min-width-0">
              <h2 class="h3 mb-1 text-truncate">{{ resident.name }}</h2>
              <p class="mb-0 opacity-90">{{ resident.email }}</p>
            </div>
            <div class="badge bg-white text-primary fs-6 px-3 py-2">
              ID: {{ resident.residentId || resident.id }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="row g-4">
        <!-- Personal Information -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-light border-0 py-3 px-4">
              <h5 class="card-title mb-0 d-flex align-items-center">
                <i class="fas fa-user-circle text-primary me-2"></i>
                Personal Information
              </h5>
            </div>
            <div class="card-body p-4">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div class="d-flex align-items-start">
                    <i class="fas fa-home text-primary mt-1 me-3"></i>
                    <div>
                      <div class="small text-muted mb-1">Address</div>
                      <div class="fw-semibold">{{ resident.address || 'Not provided' }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="d-flex align-items-start">
                    <i class="fas fa-map-marker-alt text-primary mt-1 me-3"></i>
                    <div>
                      <div class="small text-muted mb-1">Barangay</div>
                      <div class="fw-semibold">{{ resident.barangayName || 'Not provided' }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="d-flex align-items-start">
                    <i class="fas fa-phone text-primary mt-1 me-3"></i>
                    <div>
                      <div class="small text-muted mb-1">Contact Number</div>
                      <div class="fw-semibold">{{ resident.contact || 'Not provided' }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="d-flex align-items-start">
                    <i class="fas fa-calendar-alt text-primary mt-1 me-3"></i>
                    <div>
                      <div class="small text-muted mb-1">Birthdate</div>
                      <div class="fw-semibold">{{ formatDate(resident.birthdate) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="d-flex align-items-start">
                    <i class="fas fa-venus-mars text-primary mt-1 me-3"></i>
                    <div>
                      <div class="small text-muted mb-1">Gender</div>
                      <div class="fw-semibold text-capitalize">{{ resident.gender || 'Not provided' }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="d-flex align-items-start">
                    <i class="fas fa-heart text-primary mt-1 me-3"></i>
                    <div>
                      <div class="small text-muted mb-1">Civil Status</div>
                      <div class="fw-semibold text-capitalize">{{ resident.civilStatus || 'Not provided' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration Details -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-light border-0 py-3 px-4">
              <h5 class="card-title mb-0 d-flex align-items-center">
                <i class="fas fa-clipboard-check text-primary me-2"></i>
                Registration Details
              </h5>
            </div>
            <div class="card-body p-4">
              <div class="d-flex flex-column gap-3">
                <div class="d-flex align-items-start">
                  <i class="fas fa-calendar-check text-primary mt-1 me-3"></i>
                  <div class="flex-grow-1">
                    <div class="small text-muted mb-1">Registered On</div>
                    <div class="fw-semibold">{{ formatDate(resident.createdAt) }}</div>
                  </div>
                </div>
                <div class="d-flex align-items-start">
                  <i class="fas fa-calendar-times text-primary mt-1 me-3"></i>
                  <div class="flex-grow-1">
                    <div class="small text-muted mb-1">ID Expires At</div>
                    <div class="fw-semibold">{{ formatDate(resident.idExpiresAt) }}</div>
                  </div>
                </div>
                <div class="d-flex align-items-start">
                  <i class="fas fa-user-tag text-primary mt-1 me-3"></i>
                  <div class="flex-grow-1">
                    <div class="small text-muted mb-1">Role</div>
                    <div class="fw-semibold text-capitalize">{{ resident.role || 'resident' }}</div>
                  </div>
                </div>
                <div class="d-flex align-items-start">
                  <i class="fas fa-sync-alt text-primary mt-1 me-3"></i>
                  <div class="flex-grow-1">
                    <div class="small text-muted mb-1">Last Updated</div>
                    <div class="fw-semibold">{{ formatDate(resident.updatedAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Uploaded ID Grid Layout -->
      <div class="mt-4" v-if="resident.barangayIdImage">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light border-0 py-3 px-4">
            <h5 class="card-title mb-0 d-flex align-items-center">
              <i class="fas fa-id-card text-primary me-2"></i>
              Uploaded Valid ID
            </h5>
          </div>
          <div class="card-body p-4 text-center">
            <img
              :src="resident.barangayIdImage"
              alt="Barangay ID"
              class="img-fluid rounded border shadow-sm uploaded-id-preview"
              style="max-height: 400px; object-fit: contain;"
              @click="openImagePreview"
            >
            <div class="small text-muted mt-2">Click the ID to view a larger version</div>
          </div>
        </div>
      </div>

      <!-- Status & Approval (Grid Layout) -->
      <div class="mt-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light border-0 py-3 px-4">
            <h5 class="card-title mb-0 d-flex align-items-center">
              <i class="fas fa-info-circle text-primary me-2"></i>
              Status & Approval
            </h5>
          </div>
          <div class="card-body p-4">
            <div class="status-grid">
              <div class="status-item">
                <div class="icon">
                  <i class="fas fa-circle"></i>
                </div>
                <div>
                  <div class="small text-muted mb-1">Account Status</div>
                  <span :class="`badge bg-${getStatusBadgeColor(resident.status)} fs-6 px-3 py-2`">
                    {{ formatStatusLabel(resident.status) }}
                  </span>
                </div>
              </div>

              <div class="status-item">
                <div class="icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div>
                  <div class="small text-muted mb-1">Approval Status</div>
                  <span :class="`badge bg-${resident.isApproved ? 'success' : 'warning'} fs-6 px-3 py-2`">
                    {{ resident.isApproved ? 'Approved' : 'Pending Approval' }}
                  </span>
                </div>
              </div>

              <div class="status-item">
                <div class="icon">
                  <i class="fas fa-id-card"></i>
                </div>
                <div>
                  <div class="small text-muted mb-1">ID Status</div>
                  <span :class="`badge bg-${isIdValid(resident.idExpiresAt) ? 'success' : 'danger'} fs-6 px-3 py-2`">
                    {{ isIdValid(resident.idExpiresAt) ? 'Valid' : 'Expired' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex flex-wrap gap-3 mt-4">
        <template v-if="!resident.isApproved && resident.status !== 'rejected'">
          <button class="btn btn-success px-4 action-btn" @click="approveResident">
            <i class="fas fa-check me-2"></i> Approve Resident
          </button>
          <button class="btn btn-warning px-4 action-btn" @click="rejectResident">
            <i class="fas fa-times me-2"></i> Reject Resident
          </button>
        </template>
        <button class="btn btn-danger px-4 ms-auto action-btn" @click="confirmDelete">
          <i class="fas fa-trash-alt me-2"></i> Delete Resident
        </button>
      </div>
    </div>

    <div
      v-if="showImagePreview && resident?.barangayIdImage"
      class="image-preview-modal"
      @click.self="closeImagePreview"
    >
      <div class="image-preview-toolbar" @click.stop>
        <button class="image-preview-tool" @click="zoomOutImage" aria-label="Zoom out">
          <i class="fas fa-search-minus"></i>
        </button>
        <span class="image-preview-zoom-label">{{ Math.round(imageZoom * 100) }}%</span>
        <button class="image-preview-tool" @click="zoomInImage" aria-label="Zoom in">
          <i class="fas fa-search-plus"></i>
        </button>
        <button class="image-preview-tool" @click="resetImageZoom" aria-label="Reset zoom">
          <i class="fas fa-undo"></i>
        </button>
      </div>
      <button class="image-preview-close" @click="closeImagePreview" aria-label="Close image preview">
        <i class="fas fa-times"></i>
      </button>
      <img
        :src="resident.barangayIdImage"
        alt="Barangay ID enlarged preview"
        class="image-preview-full"
        :style="{ transform: `scale(${imageZoom})` }"
      >
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete resident <strong>{{ resident?.name }}</strong>? This action cannot be undone.</p>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteResident" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Resident
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase/config'
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import localDb from '@/services/localDb'

export default {
  name: 'ResidentDetails',
  data() {
    return {
      resident: null,
      loading: true,
      error: null,
      showDeleteModal: false,
      deleting: false,
      showImagePreview: false,
      imageZoom: 1,
      notification: {
        show: false,
        type: 'success',
        message: ''
      },
      notificationTimer: null
    }
  },
  computed: {
    residentId() {
      return this.$route.params.id
    }
  },
  async created() {
    await this.fetchResident()
  },
  beforeUnmount() {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer)
    }
  },
  methods: {
    isFirebaseReady() {
      return !!(db && typeof db === 'object' && typeof db.app !== 'undefined')
    },
    async fetchResident() {
      try {
        this.loading = true
        this.error = null
        
        if (!this.residentId) {
          throw new Error('No resident ID provided')
        }

        if (!this.isFirebaseReady()) {
          const dbData = localDb.readDb();
          const user = dbData.users?.find(u => u.id === this.residentId);
          const residentObj = dbData.residents?.find(r => r.userId === this.residentId);
          if (user) {
            this.resident = {
              id: user.id,
              email: user.email,
              role: user.role,
              status: user.status || (residentObj ? residentObj.status : 'approved'),
              isApproved: user.status === 'approved' || (residentObj && residentObj.status === 'approved') || user.role !== 'resident',
              name: user.profile?.name || user.name || user.email,
              contact: user.profile?.contact || user.contact || '',
              address: user.profile?.address || user.address || '',
              barangayName: user.profile?.barangayName || user.barangayName || '',
              birthdate: user.profile?.birthdate || user.birthdate || '',
              gender: user.profile?.gender || user.gender || '',
              civilStatus: user.profile?.civilStatus || user.civilStatus || '',
              createdAt: user.profile?.createdAt || user.createdAt || (residentObj ? residentObj.createdAt : ''),
              updatedAt: user.updatedAt || (residentObj ? residentObj.updatedAt : null),
              barangayIdImage: (residentObj && residentObj.barangayIdImage) || user.barangayIdImage || null,
              idExpiresAt: (residentObj && residentObj.idExpiresAt) || user.idExpiresAt || null
            };
            return;
          } else {
            throw new Error('Resident not found in local DB');
          }
        }

        const docRef = doc(db, 'users', this.residentId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          this.resident = {
            id: docSnap.id,
            ...data,
            name: data.profile?.name || data.name || data.email,
            contact: data.profile?.contact || data.contact || '',
            address: data.profile?.address || data.address || '',
            barangayName: data.profile?.barangayName || data.barangayName || '',
            birthdate: data.profile?.birthdate || data.birthdate || '',
            gender: data.profile?.gender || data.gender || '',
            civilStatus: data.profile?.civilStatus || data.civilStatus || '',
            createdAt: data.profile?.createdAt || data.createdAt || null
          }
        } else {
          throw new Error('Resident not found')
        }
      } catch (error) {
        console.error('Error fetching resident:', error)
        this.error = error.message || 'Failed to load resident details'
      } finally {
        this.loading = false
      }
    },

    formatDate(date) {
      if (!date) return 'Not provided'
      
      // Handle Firestore timestamp
      if (date.seconds) {
        const d = new Date(date.seconds * 1000)
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      // Handle string date (like birthdate)
      const d = new Date(date)
      return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    getStatusBadgeColor(status) {
      switch (status) {
        case 'approved': return 'success'
        case 'pending_validation': return 'secondary'
        case 'rejected': return 'danger'
        case 'active': return 'success'
        case 'inactive': return 'secondary'
        case 'suspended': return 'warning'
        case 'banned': return 'danger'
        default: return 'secondary'
      }
    },

    formatStatusLabel(status) {
      if (!status) return 'Not set'
      return String(status)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    },

    isIdValid(expiryDate) {
      if (!expiryDate) return true; // Default to Valid if no expiry date provided
      
      const now = new Date()
      const expiry = expiryDate.seconds ? new Date(expiryDate.seconds * 1000) : new Date(expiryDate)
      return expiry > now
    },

    editResident() {
      // Navigate to edit resident page
      this.$router.push(`/official/resident/${this.residentId}/edit`)
    },

    printDetails() {
      window.print()
    },

    async approveResident() {
      try {
        if (!this.isFirebaseReady()) {
          const dbData = localDb.readDb();
          const user = dbData.users?.find(u => u.id === this.residentId);
          if (user) {
            user.status = 'approved';
            user.isApproved = true;
            const resident = dbData.residents?.find(r => r.userId === this.residentId);
            if(resident) resident.status = 'approved';
            localDb.writeDb(dbData);
          }
        } else {
          const docRef = doc(db, 'users', this.residentId)
          await updateDoc(docRef, {
            isApproved: true,
            status: 'active',
            updatedAt: new Date()
          })
        }
        
        // Refresh resident data
        await this.fetchResident()

        this.showNotification('Resident approved successfully.', 'success')
      } catch (error) {
        console.error('Error approving resident:', error)
        this.showNotification('Failed to approve resident.', 'error')
      }
    },
    async rejectResident() {
      const reason = prompt("Enter rejection reason:");
      if (reason === null) return; // cancelled

      try {
        if (!this.isFirebaseReady()) {
          const dbData = localDb.readDb();
          const user = dbData.users?.find(u => u.id === this.residentId);
          if (user) {
            user.status = 'rejected';
            user.isApproved = false;
            user.rejectionMessage = reason;
            const resident = dbData.residents?.find(r => r.userId === this.residentId);
            if(resident) {
              resident.status = 'rejected';
              resident.rejectionMessage = reason;
            }
            localDb.writeDb(dbData);
          }
        } else {
          const docRef = doc(db, 'users', this.residentId)
          await updateDoc(docRef, {
            isApproved: false,
            status: 'rejected',
            rejectionMessage: reason,
            updatedAt: new Date()
          })
        }
        
        // Refresh resident data
        await this.fetchResident()

        this.showNotification('Resident rejected successfully.', 'success')
      } catch (error) {
        console.error('Error rejecting resident:', error)
        this.showNotification('Failed to reject resident.', 'error')
      }
    },

    confirmDelete() {
      this.showDeleteModal = true
    },

    async deleteResident() {
      try {
        this.deleting = true
        if (!this.isFirebaseReady()) {
          const dbData = localDb.readDb();
          dbData.users = dbData.users.filter(u => u.id !== this.residentId);
          localDb.writeDb(dbData);
        } else {
          await deleteDoc(doc(db, 'users', this.residentId))
        }
        
        this.$router.push('/official/residents')
        this.showNotification('Resident deleted successfully.', 'success')
      } catch (error) {
        console.error('Error deleting resident:', error)
        this.showNotification('Failed to delete resident.', 'error')
      } finally {
        this.deleting = false
        this.showDeleteModal = false
      }
    },

    showNotification(message, type = 'success') {
      if (this.notificationTimer) {
        clearTimeout(this.notificationTimer)
      }

      this.notification = {
        show: true,
        type,
        message
      }

      this.notificationTimer = setTimeout(() => {
        this.hideNotification()
      }, 3500)
    },

    hideNotification() {
      this.notification.show = false
    },

    openImagePreview() {
      this.showImagePreview = true
      this.imageZoom = 1
    },

    closeImagePreview() {
      this.showImagePreview = false
    },

    zoomInImage() {
      this.imageZoom = Math.min(this.imageZoom + 0.25, 4)
    },

    zoomOutImage() {
      this.imageZoom = Math.max(this.imageZoom - 0.25, 0.75)
    },

    resetImageZoom() {
      this.imageZoom = 1
    }
  }
}
</script>


<style scoped>
.resident-details {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(180deg, #f3f8ff 0%, #eef3fb 100%);
  min-height: 100vh;
}

.resident-content {
  max-width: 1400px;
  margin: 0 auto;
}

.notify-popup {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 1700;
  width: min(420px, calc(100vw - 24px));
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.2);
}

.notify-success {
  border-left: 5px solid #22c55e;
}

.notify-error {
  border-left: 5px solid #ef4444;
}

.notify-icon {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.notify-success .notify-icon {
  color: #166534;
  background: #dcfce7;
}

.notify-error .notify-icon {
  color: #991b1b;
  background: #fee2e2;
}

.notify-copy {
  flex: 1;
  min-width: 0;
}

.notify-title {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.2;
}

.notify-message {
  margin-top: 4px;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.35;
}

.notify-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #94a3b8;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.notify-close:hover {
  color: #334155;
  background: #f1f5f9;
}

.notify-fade-enter-active,
.notify-fade-leave-active {
  transition: all 0.22s ease;
}

.notify-fade-enter-from,
.notify-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.card {
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
  border-radius: 16px 16px 0 0 !important;
  font-weight: 600;
}

.card-header.bg-primary {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%) !important;
  color: #ffffff !important;
}

.card-header.bg-light {
  background: linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%) !important;
}

.d-flex.align-items-start > div {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  width: 100%;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.status-item:hover {
  background: #e0edff;
  transform: translateY(-1px);
}

.status-item .icon {
  font-size: 1.5rem;
  color: #2563eb;
}

@media (max-width: 768px) {
  .notify-popup {
    top: 12px;
    right: 12px;
    left: 12px;
    width: auto;
  }

  .image-preview-modal {
    padding: 12px;
  }

  .image-preview-close {
    top: 10px;
    right: 10px;
  }

  .image-preview-toolbar {
    top: 10px;
    gap: 8px;
    padding: 6px 8px;
  }

  .image-preview-tool {
    width: 30px;
    height: 30px;
  }
}

.btn {
  font-size: 1rem;
}

.action-btn {
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.26);
}

.uploaded-id-preview {
  cursor: zoom-in;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.uploaded-id-preview:hover {
  transform: scale(1.01);
  box-shadow: 0 10px 24px rgba(30, 64, 175, 0.22) !important;
}

.image-preview-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1800;
  padding: 24px;
}

.image-preview-full {
  width: auto;
  max-width: min(1000px, 90vw);
  max-height: 82vh;
  border-radius: 14px;
  border: 2px solid rgba(191, 219, 254, 0.7);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
  transform-origin: center center;
  transition: transform 0.2s ease;
}

.image-preview-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.image-preview-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.image-preview-toolbar {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(191, 219, 254, 0.35);
  backdrop-filter: blur(6px);
}

.image-preview-tool {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.image-preview-tool:hover {
  background: rgba(255, 255, 255, 0.32);
}

.image-preview-zoom-label {
  min-width: 58px;
  text-align: center;
  color: #dbeafe;
  font-size: 0.85rem;
  font-weight: 700;
}
.spinner-border {
  width: 3.5rem;
  height: 3.5rem;
}

.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* Print Styles */
@media print {
  body * {
    visibility: hidden;
  }
  .resident-details, .resident-details * {
    visibility: visible;
  }
  .resident-details {
    position: absolute;
    left: 0;
    top: 0;
    padding: 20px !important;
  }
  .btn, .modal, .shadow, .card:hover {
    display: none !important;
  }
  .card {
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    break-inside: avoid;
  }
  .status-grid {
    display: block;
  }
  .status-item {
    margin-bottom: 1rem;
    page-break-inside: avoid;
  }
}
</style>