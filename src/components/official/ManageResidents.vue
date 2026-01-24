<template>
  <div class="manage-residents container py-4">
    <h2 class="mb-4 fw-bold">Resident Management</h2>

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
    <div class="table-responsive rounded-3 shadow-sm mb-4">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-light">
          <tr>
            <th class="fw-semibold text-muted small py-3 ps-4">RESIDENT</th>
            <!-- <th class="fw-semibold text-muted small py-3">SITIO</th> -->
            <th class="fw-semibold text-muted small py-3">CONTACT</th>
            <th class="fw-semibold text-muted small py-3">REGISTERED</th>
             <th class="fw-semibold text-muted small py-3">ACTION</th>
            <th class="fw-semibold text-muted small py-3 pe-4"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resident in paginatedResidents" :key="resident.id" class="border-top">
            <td class="py-3 ps-4">
              <div class="d-flex align-items-center">
                <div class="bg-light-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                  <i class="fas fa-user text-primary"></i>
                </div>
                <div>
                  <div class="fw-semibold">{{ resident.name }}</div>
                  <small class="text-muted">{{ resident.email }}</small>
                </div>
              </div>
            </td>
            <!-- <td class="py-3">{{ resident.address }}</td> -->
            <td class="py-3">{{ resident.contact }}</td>
            <td class="py-3">{{ formatDate(resident.createdAt) }}</td>
            <td class="py-3 pe-4">
              <button class="btn btn-sm btn-light rounded-pill px-3" @click="viewResident(resident.id)">
                <i class="fas fa-eye me-1"></i> View Details
              </button>
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
import { collection, getDocs, query, where } from 'firebase/firestore'

export default {
  data() {
    return {
      allResidents: [],
      residents: [],
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      maxVisiblePages: 5
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
    }
  },
  async created() {
    await this.fetchResidents()
  },
  methods: {
    async fetchResidents() {
      const q = query(collection(db, 'users'), where('role', '==', 'resident'))
      const snapshot = await getDocs(q)

      this.allResidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      this.residents = [...this.allResidents]
      this.currentPage = 1
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.table {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.table th {
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 2px solid #e9ecef;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.bg-light-primary {
  background-color: rgba(13, 110, 253, 0.1) !important;
}

.btn-light {
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.btn-light:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
}

.pagination {
  --bs-pagination-padding-x: 0.75rem;
  --bs-pagination-padding-y: 0.375rem;
  --bs-pagination-font-size: 0.875rem;
  margin-bottom: 0;
}

.page-link {
  border-radius: 6px !important;
  margin: 0 4px;
  min-width: 38px;
  text-align: center;
  border: none;
  color: #495057;
  transition: all 0.2s ease;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  box-shadow: 0 2px 4px rgba(13, 110, 253, 0.2);
}

.page-link:hover {
  background-color: #f1f3f5;
  color: #0d6efd;
}

.page-item.disabled .page-link {
  opacity: 0.5;
}

@media (max-width: 768px) {
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