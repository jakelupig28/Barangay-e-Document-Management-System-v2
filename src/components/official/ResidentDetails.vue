<template>
  <div class="resident-details container-fluid py-5 px-4 px-md-5">
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
                    {{ resident.status ? resident.status.charAt(0).toUpperCase() + resident.status.slice(1) : 'Not set' }}
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
          <button class="btn btn-success px-4" @click="approveResident">
            <i class="fas fa-check me-2"></i> Approve Resident
          </button>
          <button class="btn btn-warning px-4" @click="rejectResident">
            <i class="fas fa-times me-2"></i> Reject Resident
          </button>
        </template>
        <button class="btn btn-danger px-4 ms-auto" @click="confirmDelete">
          <i class="fas fa-trash-alt me-2"></i> Delete Resident
        </button>
      </div>
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
      deleting: false
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
          if (user) {
            this.resident = {
              id: user.id,
              email: user.email,
              role: user.role,
              status: user.status || 'approved',
              isApproved: user.status === 'approved' || user.role !== 'resident',
              name: user.profile?.name || user.email,
              contact: user.profile?.contact || '',
              address: user.profile?.address || '',
              birthdate: user.profile?.birthdate || '',
              gender: user.profile?.gender || '',
              createdAt: user.profile?.createdAt || ''
            };
            return;
          } else {
            throw new Error('Resident not found in local DB');
          }
        }

        const docRef = doc(db, 'users', this.residentId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          this.resident = {
            id: docSnap.id,
            ...docSnap.data()
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
        case 'active': return 'success'
        case 'inactive': return 'secondary'
        case 'suspended': return 'warning'
        case 'banned': return 'danger'
        default: return 'secondary'
      }
    },

    isIdValid(expiryDate) {
      if (!expiryDate) return false
      
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
            localDb.readDb = () => dbData; // Mock write, but actually we need writeDb
            // the localDb doesn't perfectly expose writeDb, but updating it by reference usually works if we serialize it,
            // To be safe, let's just use localStorage directly since we have the data
            localStorage.setItem('barangay_db', JSON.stringify(dbData));
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
        
        if (this.$toast) {
          this.$toast.success('Resident approved successfully')
        } else {
          alert('Resident approved successfully')
        }
      } catch (error) {
        console.error('Error approving resident:', error)
        if (this.$toast) {
          this.$toast.error('Failed to approve resident')
        } else {
          alert('Failed to approve resident')
        }
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
            localStorage.setItem('barangay_db', JSON.stringify(dbData));
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
        
        if (this.$toast) {
          this.$toast.success('Resident rejected successfully')
        } else {
          alert('Resident rejected successfully')
        }
      } catch (error) {
        console.error('Error rejecting resident:', error)
        if (this.$toast) {
          this.$toast.error('Failed to reject resident')
        } else {
          alert('Failed to reject resident')
        }
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
          localStorage.setItem('barangay_db', JSON.stringify(dbData));
        } else {
          await deleteDoc(doc(db, 'users', this.residentId))
        }
        
        this.$router.push('/official/residents')
        if (this.$toast) {
          this.$toast.success('Resident deleted successfully')
        } else {
          alert('Resident deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting resident:', error)
        if (this.$toast) {
          this.$toast.error('Failed to delete resident')
        } else {
          alert('Failed to delete resident')
        }
      } finally {
        this.deleting = false
        this.showDeleteModal = false
      }
    }
  }
}
</script>


<style scoped>
.resident-details {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.resident-content {
  max-width: 1400px;
  margin: 0 auto;
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
  background: #f1f3f5;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.status-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.status-item .icon {
  font-size: 1.5rem;
  color: #6c757d;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
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
<style scoped>
.resident-details {
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  border-radius: 12px 12px 0 0 !important;
}

.font-monospace {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.modal-content {
  border-radius: 12px;
  border: none;
}

.badge {
  font-size: 0.75em;
}

/* Print styles */
@media print {
  .btn, .modal, .alert {
    display: none !important;
  }
  
  .card {
    border: 1px solid #ddd !important;
    box-shadow: none !important;
  }
}
</style>