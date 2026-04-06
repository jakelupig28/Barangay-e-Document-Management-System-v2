<template>
  <div class="manage-residents container py-4">
    <h2 class="mb-4 fw-bold">Resident Management</h2>

    <transition name="notify-fade">
      <div
        v-if="notification.show"
        class="notify-popup"
        :class="`notify-${notification.type}`"
        role="status"
        aria-live="polite"
      >
        <div class="notify-icon">
          <i :class="notificationIcon"></i>
        </div>
        <div class="notify-content">
          <div class="notify-title">{{ notificationTitle }}</div>
          <div class="notify-message">{{ notification.message }}</div>
        </div>
        <button class="notify-close" @click="hideNotification" aria-label="Close notification">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>

    <!-- Search Bar -->
    <div class="search-bar mb-4">
      <div class="input-group shadow-sm" style="max-width: 400px;">
        <input 
          v-model="searchQuery" 
          type="text" 
          class="form-control border-0 ps-3 py-2" 
          placeholder="Search residents..." 
          @keyup.enter="searchResidents"
          style="border-radius: 8px 0 0 8px;"
        />
        <button class="btn btn-primary px-3" @click="searchResidents" style="border-radius: 0 8px 8px 0;">
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>

    <!-- Residents Table -->
    <div class="table-responsive rounded-4 shadow-sm border border-light overflow-hidden mb-4 bg-white">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-light text-muted small text-uppercase fw-bold">
          <tr>
            <th class="ps-4 py-3">RESIDENT</th>
            <th class="py-3">CONTACT</th>
            <th class="py-3 text-center">REGISTERED</th>
            <th class="py-3 text-center">STATUS</th>
            <th class="pe-4 py-3 text-end">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resident in paginatedResidents" :key="resident.id" class="border-top">
            <td class="py-3 ps-4">
              <div class="d-flex align-items-center">
                <div class="avatar-sm bg-primary-soft text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px; background: rgba(13, 110, 253, 0.1);">
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <div class="fw-bold text-dark">{{ resident.name }}</div>
                  <small class="text-muted">{{ resident.email }}</small>
                </div>
              </div>
            </td>
            <td class="py-3 text-muted">{{ resident.contact }}</td>
            <td class="py-3 text-center text-muted small">{{ formatDate(resident.createdAt) }}</td>
            <td class="py-3 text-center">
              <span v-if="resident.isApproved" class="badge rounded-pill bg-success-soft text-success px-3 py-2">
                <i class="fas fa-check-circle me-1"></i> Active
              </span>
              <span v-else-if="resident.status === 'rejected'" class="badge rounded-pill bg-danger-soft text-danger px-3 py-2">
                <i class="fas fa-times-circle me-1"></i> Rejected
              </span>
              <span v-else class="badge rounded-pill bg-warning-soft text-warning px-3 py-2">
                <i class="fas fa-clock me-1"></i> Pending
              </span>
            </td>
            <td class="py-3 pe-4 text-end">
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-light rounded-pill px-3 border" @click="viewResident(resident.id)">
                  <i class="fas fa-eye me-1 text-primary"></i> Details
                </button>
                <div v-if="!resident.isApproved && resident.status !== 'rejected'" class="d-flex gap-2">
                  <button class="btn btn-sm btn-success rounded-pill px-3 shadow-sm" @click="approveResident(resident.id)">
                    <i class="fas fa-check"></i>
                  </button>
                  <button class="btn btn-sm btn-danger rounded-pill px-3 shadow-sm" @click="rejectResident(resident.id)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-4">
      <div class="text-muted small">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, residents.length) }} of {{ residents.length }} residents
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="prevPage">
              <i class="fas fa-chevron-left"></i>
            </button>
          </li>
          <li class="page-item" v-for="page in visiblePages" :key="page" :class="{ active: currentPage === page }">
            <button class="page-link" @click="currentPage = page">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="nextPage">
              <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase/config'
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'
import localDb from '@/services/localDb'

export default {
  data() {
    return {
      allResidents: [],
      residents: [],
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      maxVisiblePages: 5,
      notification: {
        show: false,
        type: 'success',
        message: ''
      },
      notificationTimer: null
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.residents.length / this.pageSize)
    },
    paginatedResidents() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.residents.slice(start, start + this.pageSize)
    },
    visiblePages() {
      const range = []
      const start = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2))
      const end = Math.min(this.totalPages, start + this.maxVisiblePages - 1)
      
      for (let i = start; i <= end; i++) {
        range.push(i)
      }
      
      return range
    },
    notificationIcon() {
      if (this.notification.type === 'error') return 'fas fa-exclamation-circle'
      return 'fas fa-check-circle'
    },
    notificationTitle() {
      if (this.notification.type === 'error') return 'Action Failed'
      return 'Action Completed'
    }
  },
  async created() {
    await this.fetchResidents()
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
    async fetchResidents() {
      if (!this.isFirebaseReady()) {
        const localData = localDb.readDb();
        this.allResidents = localData.users ? localData.users.filter(u => u.role === 'resident').map(u => ({
          ...u,
          name: u.profile?.name || u.name || 'Not provided',
          contact: u.profile?.contact || u.contact || 'Not provided',
          createdAt: u.profile?.createdAt || u.createdAt || null
        })) : [];
        this.residents = [...this.allResidents];
        this.currentPage = 1;
        return;
      }
      
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'resident'))
        const snapshot = await getDocs(q)

        this.allResidents = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            name: data.profile?.name || data.name || 'Not provided',
            contact: data.profile?.contact || data.contact || 'Not provided',
            createdAt: data.profile?.createdAt || data.createdAt || null
          }
        })

        this.residents = [...this.allResidents]
        this.currentPage = 1
      } catch (err) {
        console.error('Error fetching residents:', err)
        this.allResidents = []
        this.residents = []
      }
    },

    async searchResidents() {
      if (!this.searchQuery.trim()) {
        this.residents = [...this.allResidents]
      } else {
        this.residents = this.allResidents.filter(res =>
          res.name?.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      this.currentPage = 1
    },

    viewResident(id) {
      this.$router.push(`/official/resident/${id}`)
    },

    async approveResident(id) {
      try {
        if (!this.isFirebaseReady()) {
          const dbData = localDb.readDb();
          const user = dbData.users?.find(u => u.id === id);
          if (user) {
            user.status = 'approved';
            user.isApproved = true;
            const resident = dbData.residents?.find(r => r.userId === id);
            if (resident) resident.status = 'approved';
            localDb.writeDb(dbData);
          }
        } else {
          const docRef = doc(db, 'users', id);
          await updateDoc(docRef, {
            isApproved: true,
            status: 'active',
            updatedAt: new Date()
          });
        }
        
        await this.fetchResidents();
        this.showNotification('Resident approved successfully.', 'success');
      } catch (err) {
        console.error('Error approving resident:', err);
        this.showNotification('Failed to approve resident.', 'error');
      }
    },

    async rejectResident(id) {
      const reason = prompt("Enter rejection reason:");
      if (reason === null) return;

      try {
        if (!this.isFirebaseReady()) {
          const dbData = localDb.readDb();
          const user = dbData.users?.find(u => u.id === id);
          if (user) {
            user.status = 'rejected';
            user.isApproved = false;
            user.rejectionMessage = reason;
            const resident = dbData.residents?.find(r => r.userId === id);
            if (resident) {
              resident.status = 'rejected';
              resident.rejectionMessage = reason;
            }
            localDb.writeDb(dbData);
          }
        } else {
          const docRef = doc(db, 'users', id);
          await updateDoc(docRef, {
            isApproved: false,
            status: 'rejected',
            rejectionMessage: reason,
            updatedAt: new Date()
          });
        }
        
        await this.fetchResidents();
        this.showNotification('Resident rejected successfully.', 'success');
      } catch (err) {
        console.error('Error rejecting resident:', err);
        this.showNotification('Failed to reject resident.', 'error');
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

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    formatDate(date) {
      if (!date) return 'N/A'
      const d = new Date(date.seconds ? date.seconds * 1000 : date)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.manage-residents {
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  color: #2d3748;
  position: relative;
}

.notify-popup {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1600;
  width: min(420px, calc(100vw - 32px));
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 12px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.15);
}

.notify-success {
  border-left: 5px solid #16a34a;
}

.notify-error {
  border-left: 5px solid #dc2626;
}

.notify-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.notify-success .notify-icon {
  color: #166534;
  background: #dcfce7;
}

.notify-error .notify-icon {
  color: #991b1b;
  background: #fee2e2;
}

.notify-content {
  flex: 1;
  min-width: 0;
}

.notify-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.notify-message {
  font-size: 0.9rem;
  color: #475569;
  margin-top: 3px;
  line-height: 1.35;
}

.notify-close {
  border: none;
  background: transparent;
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
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

h2 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #2d3748 0%, #718096 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.table {
  background-color: #fff;
  border-radius: 16px;
}

.table th {
  background-color: #f8fafc;
  border-bottom: 2px solid #edf2f7;
  letter-spacing: 0.025em;
}

.table td {
  border-bottom: 1px solid #edf2f7;
}

.bg-primary-soft { background: rgba(66, 153, 225, 0.1); }
.bg-success-soft { background: rgba(72, 187, 120, 0.1); }
.bg-danger-soft { background: rgba(245, 101, 101, 0.1); }
.bg-warning-soft { background: rgba(237, 137, 54, 0.1); }

.btn-light {
  background-color: #f8fafc;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-light:hover {
  background-color: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.page-link {
  border-radius: 12px !important;
  margin: 0 4px;
  border: none;
  font-weight: 600;
  color: #4a5568;
}

.page-item.active .page-link {
  background: #3182ce;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
}

.page-link:hover {
  background-color: #f1f3f5;
  color: #0d6efd;
}

.page-item.disabled .page-link {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .notify-popup {
    top: 12px;
    right: 12px;
    left: 12px;
    width: auto;
  }

  .table-responsive {
    border: 1px solid #dee2e6;
    border-radius: 8px;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination {
    justify-content: center;
  }
}
</style>