<template>
  <div class="manage-requests">
    <div class="header">
      <h2>Document Requests</h2>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <div v-if="isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading requests...
    </div>

    <div v-else class="stats-cards">
      <div class="stat-card" @click="filterByStatus('pending')" :class="{ active: currentFilter === 'pending' }">
        <div class="stat-value">{{ stats.pendingRequests }}</div>
        <div class="stat-label">Pending</div>
        <div class="stat-icon"><i class="fas fa-clock"></i></div>
      </div>
      <div class="stat-card" @click="filterByStatus('approved')" :class="{ active: currentFilter === 'approved' }">
        <div class="stat-value">{{ stats.approvedRequests }}</div>
        <div class="stat-label">Approved</div>
        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
      </div>
      <div class="stat-card" @click="filterByStatus('rejected')" :class="{ active: currentFilter === 'rejected' }">
        <div class="stat-value">{{ stats.rejectedRequests }}</div>
        <div class="stat-label">Rejected</div>
        <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
      </div>
      <div class="stat-card" @click="filterByStatus('all')" :class="{ active: currentFilter === 'all' }">
        <div class="stat-value">{{ stats.totalRequests }}</div>
        <div class="stat-label">Total</div>
        <div class="stat-icon"><i class="fas fa-file"></i></div>
      </div>
    </div>

    <div v-if="!isLoading" class="filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by resident name..."
          @input="searchRequests"
        >
        <i class="fas fa-search"></i>
      </div>
      <select v-model="documentTypeFilter" @change="filterRequests" class="form-select">
        <option value="">All Document Types</option>
        <option v-for="type in documentTypes" :value="type.value" :key="type.value">{{ type.label }}</option>
      </select>
    </div>

    <div v-if="!isLoading && filteredRequests.length > 0" class="requests-table">
      <table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Status</th>
            <th>Date Requested</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in filteredRequests" :key="request.id">
            <td>{{ request.id || request.documentId || 'N/A' }}</td>
            <td>
              <span :class="`status-badge ${request.status}`">
                <i :class="statusIcons[request.status]"></i>
                {{ request.status }}
              </span>
            </td>
            <td>{{ formatDate(request.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <!-- In the actions column of your table -->
                <button 
                  class="action-btn view" 
                  @click="$router.push(`/official/requests/${request.id}`)"
                >
                  <i class="fas fa-eye"></i>
                  <span class="btn-text">View</span>
                </button>
                <div class="approval-actions" v-if="request.status === 'pending'">
                  <button
                    class="action-btn approve"
                    @click="updateRequestStatus(request.id, 'approved')"
                    :disabled="isUpdating"
                  >
                    <i class="fas fa-check"></i>
                    <span class="btn-text">Approve</span>
                  </button>
                  <button
                    class="action-btn reject"
                    @click="updateRequestStatus(request.id, 'rejected')"
                    :disabled="isUpdating"
                  >
                    <i class="fas fa-times"></i>
                    <span class="btn-text">Reject</span>
                  </button>
                </div>
                <button
                  class="action-btn print"
                  @click="generateDocument(request)"
                  v-else-if="request.status === 'approved'"
                >
                  <i class="fas fa-print"></i>
                  <span class="btn-text">Print</span>
                </button>
                <div class="status-indicator" v-else>
                  <span class="status-text">Action taken</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!isLoading" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>No document requests found</p>
      <p class="subtext" v-if="currentFilter !== 'all' || searchQuery || documentTypeFilter">Try changing your filters</p>
    </div>

    <!-- Request Details Modal -->
    <div class="modal" :class="{ show: showViewModal }" v-if="showViewModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Request Details</h3>
          <button class="close-btn" @click="closeViewModal" :disabled="isUpdating">×</button>
        </div>
        <div class="modal-body" v-if="selectedRequest">
          <div v-if="modalError" class="error-message">
            <p>{{ modalError }}</p>
          </div>
          
          <div class="detail-grid">
            <!-- Basic Information Section -->
            <div class="section-header">
              <i class="fas fa-user"></i>
              <h4>Resident Information</h4>
            </div>
            
            <div class="detail-item">
              <label>Request ID:</label>
              <div class="detail-value highlight">{{ selectedRequest.id || selectedRequest.documentId || 'N/A' }}</div>
            </div>
            
            <div class="detail-item">
              <label>Resident Name:</label>
              <div class="detail-value">{{ selectedRequest.userName }}</div>
            </div>
            
            <div class="detail-item">
              <label>Contact:</label>
              <div class="detail-value">{{ selectedRequest.contact || 'N/A' }}</div>
            </div>
            
            <div class="detail-item full-width">
              <label>Address:</label>
              <div class="detail-value">{{ selectedRequest.address || 'N/A' }}</div>
            </div>

            <!-- Document Information Section -->
            <div class="section-header">
              <i class="fas fa-file-alt"></i>
              <h4>Document Information</h4>
            </div>
            
            <div class="detail-item">
              <label>Document Type:</label>
              <div class="detail-value">
                <span class="document-type-badge">
                  <i :class="documentTypeIcons[selectedRequest.type || selectedRequest.documentType]"></i>
                  {{ getDocumentTypeLabel(selectedRequest.type || selectedRequest.documentType) }}
                </span>
              </div>
            </div>
            
            <div class="detail-item full-width">
              <label>Purpose:</label>
              <div class="purpose-text">{{ selectedRequest.purpose || 'N/A' }}</div>
            </div>
            
            <div class="detail-item">
              <label>Date Requested:</label>
              <div class="detail-value">{{ formatDate(selectedRequest.createdAt) }}</div>
            </div>
            
            <div class="detail-item">
              <label>Status:</label>
              <div>
                <span :class="`status-badge large ${selectedRequest.status}`">
                  <i :class="statusIcons[selectedRequest.status]"></i>
                  {{ selectedRequest.status }}
                </span>
              </div>
            </div>

            <!-- Business Information (Conditional) -->
            <div v-if="selectedRequest.businessName || selectedRequest.businessAddress" class="section-header">
              <i class="fas fa-building"></i>
              <h4>Business Information</h4>
            </div>
            
            <div v-if="selectedRequest.businessName" class="detail-item">
              <label>Business Name:</label>
              <div class="detail-value">{{ selectedRequest.businessName }}</div>
            </div>
            
            <div v-if="selectedRequest.businessAddress" class="detail-item full-width">
              <label>Business Address:</label>
              <div class="detail-value">{{ selectedRequest.businessAddress }}</div>
            </div>

            <!-- Additional Notes -->
            <div v-if="selectedRequest.notes" class="section-header">
              <i class="fas fa-sticky-note"></i>
              <h4>Additional Notes</h4>
            </div>
            
            <div v-if="selectedRequest.notes" class="detail-item full-width">
              <div class="notes-text">{{ selectedRequest.notes }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="footer-actions">
            <button
              class="action-btn approve"
              @click="handleStatusUpdate('approved')"
              v-if="selectedRequest && selectedRequest.status === 'pending'"
              :disabled="isUpdating"
            >
              <i class="fas fa-check"></i> Approve Request
            </button>
            <button
              class="action-btn reject"
              @click="handleStatusUpdate('rejected')"
              v-if="selectedRequest && selectedRequest.status === 'pending'"
              :disabled="isUpdating"
            >
              <i class="fas fa-times"></i> Reject Request
            </button>
            <button
              class="action-btn print"
              @click="generateDocument(selectedRequest)"
              v-if="selectedRequest && selectedRequest.status === 'approved'"
            >
              <i class="fas fa-print"></i> Generate Document
            </button>
            <button class="action-btn close" @click="closeViewModal" :disabled="isUpdating">
              <i class="fas fa-times"></i> Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Printable Document Modal -->
    <div class="modal" :class="{ show: showPrintableDocument }" v-if="showPrintableDocument">
      <div class="modal-content printable-modal">
        <PrintableDocument
          :requestData="currentDocumentData"
          :barangayInfo="barangayInfo"
          @close="closePrintableDocument"
        />
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
import { format } from 'date-fns';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  getDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase/config';
import PrintableDocument from '@/components/official/PrintableDocument.vue';

export default {
  components: {
    PrintableDocument
  },
  setup() {
    const requests = ref([]);
    const users = ref({});
    const stats = ref({
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      totalRequests: 0,
    });
    const isLoading = ref(true);
    const isUpdating = ref(false);
    const error = ref(null);
    const modalError = ref(null);
    const searchQuery = ref('');
    const documentTypeFilter = ref('');
    const currentFilter = ref('all');
    const selectedRequest = ref(null);
    const showViewModal = ref(false);
    const showPrintableDocument = ref(false);
    const currentDocumentData = ref(null);
    
    // Toast notification
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastIcon = ref('');
    const isToastError = ref(false);
    
    const documentTypes = ref([
      { value: 'business-permit', label: 'Business Permit' },
      { value: 'barangay-clearance', label: 'Barangay Clearance' },
      { value: 'barangay-id', label: 'Barangay ID' },
      { value: 'residency-certificate', label: 'Certificate of Residency' },
      { value: 'indigency-certificate', label: 'Certificate of Indigency' },
      { value: 'other', label: 'Other' }
    ]);

    const statusIcons = {
      pending: 'fas fa-clock',
      approved: 'fas fa-check-circle',
      rejected: 'fas fa-times-circle',
    };

    const documentTypeIcons = {
      'business-permit': 'fas fa-building',
      'barangay-clearance': 'fas fa-file-contract',
      'barangay-id': 'fas fa-id-card',
      'residency-certificate': 'fas fa-home',
      'indigency-certificate': 'fas fa-hands-helping',
      'other': 'fas fa-file'
    };

    const barangayInfo = ref({
      name: 'Your Barangay',
      address: 'City, Province',
      contact: '0912-345-6789',
      captain: 'Hon. Barangay Captain'
    });

    let unsubscribe = null;
    const auth = getAuth();
    const user = ref(null);

    const getDocumentTypeLabel = (typeValue) => {
      const type = documentTypes.value.find(t => t.value === typeValue);
      return type ? type.label : typeValue;
    };

    const fetchUserData = async (userId) => {
      try {
        if (!userId) return null;
        if (users.value[userId]) return users.value[userId];
        
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          users.value[userId] = userDoc.data();
          return users.value[userId];
        }
        return null;
      } catch (err) {
        console.error('Error fetching user data:', err);
        return null;
      }
    };

    const fetchAllUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          users.value[doc.id] = doc.data();
        });
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    const fetchRequests = async () => {
      try {
        isLoading.value = true;
        error.value = null;
        
        await fetchAllUsers();

        const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(
          q,
          async (snapshot) => {
            const requestsData = [];
            
            for (const doc of snapshot.docs) {
              const requestData = doc.data();
              const userId = requestData.userId;
              const userData = await fetchUserData(userId);
              
              requestsData.push({
                id: doc.id,
                documentId: requestData.id || doc.id,
                ...requestData,
                userName: requestData.userName || userData?.displayName || 'Unknown Resident',
                contact: userData?.contact || 'N/A',
                email: userData?.email || 'N/A',
                address: requestData.address || userData?.address || 'N/A',
                createdAt: requestData.createdAt?.toDate?.() || null,
                updatedAt: requestData.updatedAt?.toDate?.() || null
              });
            }

            requests.value = requestsData;
            
            stats.value = {
              pendingRequests: requests.value.filter((r) => r.status === 'pending').length,
              approvedRequests: requests.value.filter((r) => r.status === 'approved').length,
              rejectedRequests: requests.value.filter((r) => r.status === 'rejected').length,
              totalRequests: requests.value.length,
            };

            isLoading.value = false;
          },
          (err) => {
            console.error('Error fetching requests:', err);
            error.value = 'Failed to load requests. Please try again later.';
            isLoading.value = false;
          }
        );
      } catch (err) {
        console.error('Error setting up listener:', err);
        error.value = 'Failed to initialize request listener.';
        isLoading.value = false;
      }
    };

    const updateRequestStatus = async (requestId, status) => {
      if (!user.value) {
        showToastNotification(
          'You must be logged in to perform this action.',
          'fas fa-exclamation-circle',
          true
        );
        return;
      }
      
      try {
        isUpdating.value = true;
        
        // Query the 'requests' collection to find the document with the custom 'id' field
        const q = query(collection(db, 'requests'), where('id', '==', requestId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error(`Document with custom ID ${requestId} not found in Firestore`);
        }
        
        // Get the first matching document's Firestore ID
        const documentId = querySnapshot.docs[0].id;
        const requestRef = doc(db, 'requests', documentId);
        
        // Verify the document exists
        const docSnapshot = await getDoc(requestRef);
        if (!docSnapshot.exists()) {
          throw new Error(`Document with Firestore ID ${documentId} not found`);
        }
        
        // Update the document
        await updateDoc(requestRef, {
          status: status,
          updatedAt: new Date(),
          updatedBy: user.value.uid,
        });

        showToastNotification(
          status === 'approved' ? 'Request approved!' : 'Request rejected!',
          status === 'approved' ? 'fas fa-check-circle' : 'fas fa-times-circle'
        );

        // Update the selected request in the modal if open
        if (selectedRequest.value && 
            (selectedRequest.value.documentId === requestId || 
             selectedRequest.value.id === documentId)) {
          selectedRequest.value.status = status;
        }
      } catch (err) {
        console.error('Error updating request status:', err);
        showToastNotification(
          `Failed to update request status: ${err.message}`,
          'fas fa-exclamation-circle',
          true
        );
      } finally {
        isUpdating.value = false;
      }
    };

    const handleStatusUpdate = async (status) => {
      if (selectedRequest.value) {
        await updateRequestStatus(selectedRequest.value.id, status);
      }
    };

    const generateDocument = (request) => {
      currentDocumentData.value = {
        ...request,
        type: request.type || request.documentType,
        userName: request.userName,
        address: request.address || barangayInfo.value.address,
        purpose: request.purpose || 'personal use',
        businessName: request.businessName,
        businessAddress: request.businessAddress
      };
      showPrintableDocument.value = true;
    };

    const closePrintableDocument = () => {
      showPrintableDocument.value = false;
      currentDocumentData.value = null;
    };

    const showToastNotification = (message, icon, isError = false) => {
      toastMessage.value = message;
      toastIcon.value = icon;
      isToastError.value = isError;
      showToast.value = true;
      
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    };

    const openViewModal = (request) => {
      selectedRequest.value = request;
      showViewModal.value = true;
      modalError.value = null;
    };

    const closeViewModal = () => {
      showViewModal.value = false;
      selectedRequest.value = null;
      modalError.value = null;
    };

    const filterByStatus = (status) => {
      currentFilter.value = status;
    };

    const filterRequests = () => {
      // Handled by computed property
    };

    const searchRequests = () => {
      // Handled by computed property
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
      onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          user.value = currentUser;
          fetchRequests();
        } else {
          error.value = 'Please log in to access document requests.';
          isLoading.value = false;
        }
      });
    });

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    const filteredRequests = computed(() => {
      let filtered = requests.value;

      // Filter by status
      if (currentFilter.value !== 'all') {
        filtered = filtered.filter((r) => r.status === currentFilter.value);
      }

      // Filter by document type
      if (documentTypeFilter.value) {
        filtered = filtered.filter((r) => 
          (r.type === documentTypeFilter.value) || 
          (r.documentType === documentTypeFilter.value)
        );
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (r) => 
            (r.userName && r.userName.toLowerCase().includes(query)) ||
            (r.contact && r.contact.toLowerCase().includes(query)) ||
            (r.id && r.id.toLowerCase().includes(query)) ||
            (r.documentId && r.documentId.toLowerCase().includes(query))
        );
      }

      return filtered;
    });

    return {
      requests,
      users,
      filteredRequests,
      stats,
      isLoading,
      isUpdating,
      error,
      modalError,
      searchQuery,
      documentTypeFilter,
      currentFilter,
      selectedRequest,
      showViewModal,
      documentTypes,
      statusIcons,
      documentTypeIcons,
      showToast,
      toastMessage,
      toastIcon,
      isToastError,
      showPrintableDocument,
      currentDocumentData,
      barangayInfo,
      updateRequestStatus,
      handleStatusUpdate,
      openViewModal,
      closeViewModal,
      filterByStatus,
      filterRequests,
      searchRequests,
      formatDate,
      getDocumentTypeLabel,
      generateDocument,
      closePrintableDocument
    };
  },
};
</script>

<style scoped>
.manage-requests {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  margin-bottom: 2rem;
}

.header h2 {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

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

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
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
  width: 250px;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.3s;
}

.form-select:focus {
  outline: none;
  border-color: #3498db;
}

.requests-table {
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
  min-width: 800px;
}

th,
td {
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

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge.large {
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.approval-actions {
  display: flex;
  gap: 0.5rem;
}

.status-indicator {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.action-btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.action-btn i {
  font-size: 0.9rem;
}

.action-btn .btn-text {
  display: inline-block;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.view {
  background: #e2e3e5;
  color: #383d41;
}

.action-btn.view:hover:not(:disabled) {
  background: #d6d8db;
}

.action-btn.approve {
  background: #28a745;
  color: white;
}

.action-btn.approve:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.action-btn.reject {
  background: #dc3545;
  color: white;
}

.action-btn.reject:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.action-btn.close {
  background: #6c757d;
  color: white;
}

.action-btn.close:hover:not(:disabled) {
  background: #5a6268;
}

.action-btn.print {
  background: #17a2b8;
  color: white;
}

.action-btn.print:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-1px);
}

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
}

/* === IMPROVED MODAL STYLES === */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  padding: 1rem;
}

.modal.show {
  opacity: 1;
  pointer-events: all;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transform: translateY(-20px);
  transition: transform 0.3s;
}

.modal.show .modal-content {
  transform: translateY(0);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-body {
  padding: 2rem;
}

/* Detail Grid Layout */
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.section-header i {
  color: #667eea;
  font-size: 1.2rem;
}

.section-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #2c3e50;
  font-size: 1rem;
  word-break: break-word;
}

.detail-value.highlight {
  font-weight: 600;
  color: #667eea;
  font-size: 1.1rem;
}

.purpose-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  font-size: 1rem;
}

.notes-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  background: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
  font-size: 1rem;
  color: #856404;
}

.document-type-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  background: #e9ecef;
  color: #495057;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.footer-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.footer-actions .action-btn {
  min-width: 140px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

/* Printable Document Modal */
.printable-modal {
  max-width: 900px;
}

/* Toast Notification */
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

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toast i {
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .form-select {
    width: 100%;
  }

  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }

  .action-buttons {
    flex-direction: column;
    align-items: flex-start;
  }

  .approval-actions {
    margin-top: 0.5rem;
  }

  .modal-content {
    width: 95%;
    margin: 0 auto;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1.25rem 1.5rem;
  }

  .footer-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .footer-actions .action-btn {
    min-width: 100%;
    justify-content: center;
  }

  .detail-grid {
    gap: 1rem;
  }

  .section-header {
    margin-bottom: 0.75rem;
  }
}

@media (max-width: 480px) {
  .manage-requests {
    padding: 1rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .modal {
    padding: 0.5rem;
  }
}
</style>