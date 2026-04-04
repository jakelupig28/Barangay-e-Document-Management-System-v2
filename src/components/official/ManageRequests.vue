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

    <div v-else class="stats-grid mb-5">
      <div class="stat-glass-card pending" @click="filterByStatus('pending')" :class="{ active: currentFilter === 'pending' }">
        <div class="stat-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pendingRequests }}</div>
            <div class="stat-label">Pending Requests</div>
          </div>
        </div>
        <div class="stat-progress" :style="{ width: (stats.pendingRequests / (stats.totalRequests || 1) * 100) + '%' }"></div>
      </div>

      <div class="stat-glass-card approved" @click="filterByStatus('approved')" :class="{ active: currentFilter === 'approved' }">
        <div class="stat-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.approvedRequests }}</div>
            <div class="stat-label">Approved</div>
          </div>
        </div>
        <div class="stat-progress" :style="{ width: (stats.approvedRequests / (stats.totalRequests || 1) * 100) + '%' }"></div>
      </div>

      <div class="stat-glass-card rejected" @click="filterByStatus('rejected')" :class="{ active: currentFilter === 'rejected' }">
        <div class="stat-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.rejectedRequests }}</div>
            <div class="stat-label">Rejected</div>
          </div>
        </div>
        <div class="stat-progress" :style="{ width: (stats.rejectedRequests / (stats.totalRequests || 1) * 100) + '%' }"></div>
      </div>

      <div class="stat-glass-card total" @click="filterByStatus('all')" :class="{ active: currentFilter === 'all' }">
        <div class="stat-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalRequests }}</div>
            <div class="stat-label">Total Requests</div>
          </div>
        </div>
        <div class="stat-progress" style="width: 100%"></div>
      </div>
    </div>

    <div v-if="!isLoading" class="dashboard-controls">
      <div class="search-and-filter">
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search by resident name or reference ID..."
            class="professional-input"
          >
        </div>
        <div class="filter-group">
          <div class="custom-select-wrapper">
             <i class="fas fa-filter select-icon"></i>
            <select v-model="documentTypeFilter" class="professional-select">
              <option value="">All Documents</option>
              <option v-for="type in documentTypes" :value="type.value" :key="type.value">{{ type.label }}</option>
            </select>
          </div>
          <div class="status-tabs">
            <button 
              v-for="status in ['all', 'pending', 'approved', 'rejected']" 
              :key="status"
              :class="['status-tab', { active: currentFilter === status }, status]"
              @click="currentFilter = status"
            >
              {{ status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && filteredRequests.length > 0" class="requests-table-container shadow-sm border rounded-4 overflow-hidden">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-light text-muted small text-uppercase fw-bold">
          <tr>
            <th class="ps-4 py-3">RESIDENT</th>
            <th class="py-3">DOCUMENT TYPE</th>
            <th class="py-3">STATUS</th>
            <th class="py-3 text-center">DATE REQUESTED</th>
            <th class="pe-4 py-3 text-end">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in filteredRequests" :key="request.id" class="border-top">
            <td class="ps-4 py-3">
              <div class="d-flex align-items-center">
                <div class="avatar-sm bg-primary-soft text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 36px; height: 36px; background: rgba(13, 110, 253, 0.1);">
                  <i class="fas fa-user small"></i>
                </div>
                <div>
                  <div class="fw-semibold text-dark">{{ request.userName }}</div>
                  <div class="small text-muted">{{ request.id || 'N/A' }}</div>
                </div>
              </div>
            </td>
            <td class="py-3">
              <div class="d-flex align-items-center gap-2">
                <i :class="documentTypeIcons[request.type || request.documentType]" class="text-secondary opacity-75"></i>
                <span>{{ getDocumentTypeLabel(request.type || request.documentType) }}</span>
              </div>
            </td>
            <td class="py-3">
              <span :class="['badge rounded-pill px-3 py-2', `badge-${request.status}`]" style="font-weight: 500;">
                <i :class="statusIcons[request.status]" class="me-1"></i>
                {{ request.status }}
              </span>
            </td>
            <td class="py-3 text-center text-muted small">
              {{ formatDate(request.createdAt) }}
            </td>
            <td class="pe-4 py-3 text-end">
              <div class="d-flex justify-content-end gap-2">
                <button 
                  class="btn btn-sm btn-outline-primary rounded-pill px-3 border-0 bg-light" 
                  @click="openViewModal(request)"
                >
                  <i class="fas fa-eye me-1"></i> View
                </button>
                <div v-if="request.status === 'pending'" class="d-flex gap-2">
                  <button
                    class="btn btn-sm btn-success rounded-pill px-3"
                    @click="updateRequestStatus(request.id, 'approved')"
                    :disabled="isUpdating"
                  >
                    <i class="fas fa-check me-1"></i> Approve
                  </button>
                  <button
                    class="btn btn-sm btn-danger rounded-pill px-3"
                    @click="triggerRejection(request)"
                    :disabled="isUpdating"
                  >
                    <i class="fas fa-times me-1"></i> Reject
                  </button>
                </div>
                <button
                  class="btn btn-sm btn-info text-white rounded-pill px-3"
                  @click="generateDocument(request)"
                  v-else-if="request.status === 'approved'"
                >
                  <i class="fas fa-print me-1"></i> Print
                </button>
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
      <div class="modal-content premium-modal">
        <div class="modal-header">
          <div class="header-main">
            <div class="header-icon">
              <i class="fas fa-file-invoice"></i>
            </div>
            <div class="header-titles">
              <h3>Request Details</h3>
              <p class="request-id-subtitle">Ref: {{ selectedRequest.id || selectedRequest.documentId || 'N/A' }}</p>
            </div>
          </div>
          <button class="close-btn" @click="closeViewModal" :disabled="isUpdating">×</button>
        </div>
        <div class="modal-body custom-scroll" v-if="selectedRequest">
          <div v-if="modalError" class="error-message">
            <p>{{ modalError }}</p>
          </div>
          
          <div class="detail-container">
            <!-- Resident Information Section -->
            <div class="detail-section resident-section">
              <div class="section-badge"><i class="fas fa-user-circle"></i> Resident Information</div>
              <div class="section-grid">
                <div class="detail-block">
                  <span class="label">Resident Name</span>
                  <span class="value semi-bold">{{ selectedRequest.userName }}</span>
                </div>
                <div class="detail-block">
                  <span class="label">Contact Number</span>
                  <span class="value">{{ selectedRequest.contact || 'N/A' }}</span>
                </div>
                <div class="detail-block full">
                  <span class="label">Home Address</span>
                  <span class="value">{{ selectedRequest.address || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Document Details Section -->
            <div class="detail-section document-section">
              <div class="section-badge"><i class="fas fa-certificate"></i> Document Information</div>
              <div class="section-grid">
                <div class="detail-block">
                  <span class="label">Document Type</span>
                  <div class="value">
                    <span class="premium-doc-badge">
                      <i :class="documentTypeIcons[selectedRequest.type || selectedRequest.documentType]"></i>
                      {{ getDocumentTypeLabel(selectedRequest.type || selectedRequest.documentType) }}
                    </span>
                  </div>
                </div>
                <div class="detail-block">
                  <span class="label">Submission Date</span>
                  <span class="value">{{ formatDate(selectedRequest.createdAt) }}</span>
                </div>
                <div class="detail-block full">
                  <span class="label">Purpose of Request</span>
                  <div class="purpose-container">
                     {{ selectedRequest.purpose || 'Not specified' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Business Information (Conditional) -->
            <div v-if="selectedRequest.businessName || selectedRequest.businessAddress" class="detail-section business-section">
              <div class="section-badge"><i class="fas fa-store"></i> Business Context</div>
              <div class="section-grid">
                <div v-if="selectedRequest.businessName" class="detail-block">
                  <span class="label">Business Name</span>
                  <span class="value semi-bold">{{ selectedRequest.businessName }}</span>
                </div>
                <div v-if="selectedRequest.businessAddress" class="detail-block full">
                  <span class="label">Business Address</span>
                  <span class="value">{{ selectedRequest.businessAddress }}</span>
                </div>
              </div>
            </div>

            <!-- Additional Notes -->
            <div v-if="selectedRequest.notes" class="detail-section notes-section">
              <div class="section-badge"><i class="fas fa-comment-alt"></i> Resident's Notes</div>
              <div class="notes-container">
                {{ selectedRequest.notes }}
              </div>
            </div>

            <!-- Current Status & Actions -->
            <div class="detail-section status-section actions-integrated">
              <div class="section-badge"><i class="fas fa-tasks"></i> Status & Actions</div>
              <div class="status-and-action-container">
                <div class="status-display">
                  <span :class="['status-pill-large', selectedRequest.status]">
                    <i :class="statusIcons[selectedRequest.status]"></i>
                    {{ selectedRequest.status.toUpperCase() }}
                  </span>
                  <span v-if="selectedRequest.status === 'rejected' && selectedRequest.rejectionMessage" class="rejection-history">
                     Reason: {{ selectedRequest.rejectionMessage }}
                  </span>
                </div>

                <!-- Integrate Action Buttons Directly in Container -->
                <div v-if="selectedRequest.status === 'pending' && !isRejecting" class="integrated-actions">
                  <button
                    class="btn-action approve"
                    @click="handleStatusUpdate('approved')"
                    :disabled="isUpdating"
                  >
                    <i class="fas fa-check"></i> Approve Request
                  </button>
                  <button
                    class="btn-action reject"
                    @click="handleStatusUpdate('rejected')"
                    :disabled="isUpdating"
                  >
                    <i class="fas fa-times"></i> Reject Request
                  </button>
                </div>
              </div>
            </div>

            <!-- Rejection Reason Input -->
            <transition name="fade-slide">
              <div v-if="isRejecting" class="rejection-form-container">
                <div class="form-header">
                  <i class="fas fa-exclamation-triangle"></i>
                  <span>Provide a reason for rejection</span>
                </div>
                <textarea 
                  v-model="rejectionMessage" 
                  class="rejection-textarea" 
                  placeholder="Explain why this request is being rejected..."
                  autofocus
                ></textarea>
                <div class="rejection-hint">
                  <i class="fas fa-info-circle"></i> This message will be visible to the resident.
                </div>
              </div>
            </transition>
          </div>
        </div>
        <div class="modal-footer premium-footer">
          <div class="footer-actions">
            <!-- Printing still in footer for clarity -->
            <button
              class="btn-premium btn-print"
              @click="generateDocument(selectedRequest)"
              v-if="selectedRequest && selectedRequest.status === 'approved'"
            >
              <i class="fas fa-print"></i> Generate Document
            </button>
            
            <!-- Rejection Actions -->
            <template v-if="isRejecting">
               <button
                class="btn-premium btn-confirm-reject"
                @click="handleStatusUpdate('rejected')"
                :disabled="isUpdating || !rejectionMessage.trim()"
              >
                <i class="fas fa-times-circle"></i> Confirm Rejection
              </button>
              <button
                class="btn-premium btn-cancel"
                @click="isRejecting = false"
                :disabled="isUpdating"
              >
                Cancel
              </button>
            </template>

            <button class="btn-premium btn-close" @click="closeViewModal" :disabled="isUpdating">
              Close
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
import localDb from '@/services/localDb';

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
    const isRejecting = ref(false);
    const rejectionMessage = ref('');
    
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

    const isFirebaseReady = () => !!(db && typeof db === 'object' && typeof db.app !== 'undefined');

    const fetchAllUsers = async () => {
      if (!isFirebaseReady()) return;
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
      if (!isFirebaseReady()) {
        try {
          isLoading.value = true;
          error.value = null;
          const dbData = localDb.readDb();
          const reqs = dbData.requests || [];
          const reqUsers = dbData.users || [];
          
          requests.value = reqs.map(req => {
            const reqUser = reqUsers.find(u => u.id === req.userId);
            return {
              id: req.id,
              documentId: req.id,
              ...req,
              userName: req.userName || reqUser?.profile?.name || reqUser?.email || 'Unknown Resident',
              contact: reqUser?.profile?.contact || reqUser?.contact || 'N/A',
              email: reqUser?.email || 'N/A',
              address: req.address || reqUser?.profile?.address || reqUser?.address || 'N/A',
              createdAt: req.createdAt ? new Date(req.createdAt) : null,
              updatedAt: req.updatedAt ? new Date(req.updatedAt) : null,
            };
          }).sort((a, b) => b.createdAt - a.createdAt);

          stats.value = {
            pendingRequests: requests.value.filter((r) => r.status === 'pending').length,
            approvedRequests: requests.value.filter((r) => r.status === 'approved').length,
            rejectedRequests: requests.value.filter((r) => r.status === 'rejected').length,
            totalRequests: requests.value.length,
          };
        } catch (err) {
          console.error('Local DB fetch error:', err);
          error.value = 'Failed to load requests from local storage.';
        } finally {
          isLoading.value = false;
        }
        return;
      }
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

    const updateRequestStatus = async (requestId, status, message = '') => {
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
        
        if (!isFirebaseReady()) {
          const dbData = localDb.readDb();
          const reqIndex = (dbData.requests || []).findIndex(r => r.id === requestId);
          if (reqIndex !== -1) {
            dbData.requests[reqIndex].status = status;
            if (status === 'rejected' && message) {
              dbData.requests[reqIndex].rejectionMessage = message;
            }
            dbData.requests[reqIndex].updatedAt = new Date().toISOString();
            dbData.requests[reqIndex].updatedBy = user.value?.id || user.value?.uid || 'staff';
            localDb.writeDb(dbData);
            
            showToastNotification(
              status === 'approved' ? 'Request approved!' : 'Request rejected!',
              status === 'approved' ? 'fas fa-check-circle' : 'fas fa-times-circle'
            );

            if (selectedRequest.value && selectedRequest.value.id === requestId) {
              selectedRequest.value.status = status;
            }
            fetchRequests();
          } else {
             showToastNotification('Request not found in local database.', 'fas fa-exclamation-circle', true);
          }
          isUpdating.value = false;
          return;
        }

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
        const updateData = {
          status: status,
          updatedAt: new Date(),
          updatedBy: user.value.uid,
        };

        if (status === 'rejected' && message) {
          updateData.rejectionMessage = message;
        }

        await updateDoc(requestRef, updateData);

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
      if (!selectedRequest.value) return;

      if (status === 'rejected' && !isRejecting.value) {
        isRejecting.value = true;
        return;
      }

      if (status === 'rejected' && !rejectionMessage.value.trim()) {
        showToastNotification('Please provide a reason for rejection.', 'fas fa-exclamation-circle', true);
        return;
      }

      await updateRequestStatus(selectedRequest.value.id, status, rejectionMessage.value);
      
      // Reset rejection state
      isRejecting.value = false;
      rejectionMessage.value = '';
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
      isRejecting.value = false;
      rejectionMessage.value = '';
    };

    const triggerRejection = (request) => {
      selectedRequest.value = request;
      showViewModal.value = true;
      modalError.value = null;
      isRejecting.value = true;
      rejectionMessage.value = '';
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
        let date;
        if (timestamp.toDate) {
          date = timestamp.toDate();
        } else if (typeof timestamp === 'string') {
          date = new Date(timestamp);
        } else if (timestamp instanceof Date) {
          date = timestamp;
        } else {
          date = new Date(timestamp);
        }
        return format(date, 'MMM dd, yyyy hh:mm a');
      } catch (err) {
        console.error('Format date error:', err);
        return 'Invalid Date';
      }
    };

    onMounted(() => {
      if (!isFirebaseReady()) {
        const localUser = localDb.getSessionUser();
        if (localUser) {
          user.value = localUser;
          fetchRequests();
        } else {
          error.value = 'Please log in to access document requests.';
          isLoading.value = false;
        }
        return;
      }
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            user.value = currentUser;
            fetchRequests();
          } else {
            error.value = 'Please log in to access document requests.';
            isLoading.value = false;
          }
        });
      } catch (err) {
        console.error("Auth init bypassed");
      }
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
      triggerRejection,
      closeViewModal,
      filterByStatus,
      filterRequests,
      searchRequests,
      formatDate,
      getDocumentTypeLabel,
      generateDocument,
      closePrintableDocument
    };
  }
};
</script>

<style scoped>
.manage-requests {
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
  font-size: 0.875rem;
}

.professional-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.9375rem;
  color: #1e293b;
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
  gap: 1.5rem;
  flex-wrap: wrap;
}

.custom-select-wrapper {
  position: relative;
  min-width: 220px;
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
  padding: 0.5rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.status-tab:hover {
  color: #1e293b;
}

.status-tab.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Stats Section */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.75rem;
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.stat-glass-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
.approved .stat-icon-wrapper { background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #15803d; }
.rejected .stat-icon-wrapper { background: linear-gradient(135deg, #fef2f2, #fee2e2); color: #b91c1c; }
.total .stat-icon-wrapper { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #1d4ed8; }

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

/* Base Modal Container */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal.show {
  display: flex !important;
}

/* Premium Modal Content */
.premium-modal {
  width: 100%;
  max-width: 850px;
  max-height: 90vh;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalTransition 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalTransition {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.75rem 2.5rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-icon {
  width: 44px;
  height: 44px;
  background: #3b82f6;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);
}

.header-titles h3 {
  font-family: 'Outfit';
  font-size: 1.375rem;
  margin: 0;
  color: #0f172a;
}

.request-id-subtitle {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0.125rem 0 0;
  font-family: 'Inter';
  letter-spacing: 0.02em;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.detail-container {
  padding: 1.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  position: relative;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.detail-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-block.full {
  grid-column: 1 / -1;
}

.detail-block .label {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.detail-block .value {
  font-size: 1rem;
  color: #1e293b;
}

.value.semi-bold {
  font-weight: 600;
}

.premium-doc-badge {
  background: #eff6ff;
  color: #2563eb;
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #dbeafe;
}

.purpose-container, .notes-container {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 16px;
  color: #334155;
  font-size: 0.9375rem;
  line-height: 1.6;
  border: 1px solid #f1f5f9;
}

.notes-container {
  background: #fffbeb;
  color: #92400e;
  border-color: #fef3c7;
}

/* Integrated Actions Section */
.status-and-action-container {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1.5px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .status-and-action-container {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.status-display {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.status-pill-large {
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.8125rem;
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  letter-spacing: 0.02em;
}

.status-pill-large.pending { background: #fee2e2; color: #991b1b; }
.status-pill-large.approved { background: #dcfce7; color: #166534; }
.status-pill-large.rejected { background: #f1f5f9; color: #475569; }

.rejection-history {
  background: #fef2f2;
  color: #b91c1c;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #fee2e2;
}

.integrated-actions {
  display: flex;
  gap: 0.875rem;
}

.btn-action {
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-action.approve {
  background: #16a34a;
  color: white;
}

.btn-action.approve:hover {
  background: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3);
}

.btn-action.reject {
  background: #ef4444;
  color: white;
}

.btn-action.reject:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
}

/* Rejection Form */
.rejection-form-container {
  background: #fff5f5;
  border: 2px solid #feb2b2;
  border-radius: 20px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #c53030;
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 0.9375rem;
}

.rejection-textarea {
  width: 100%;
  height: 120px;
  background: white;
  border: 1.5px solid #fed7d7;
  border-radius: 14px;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  color: #2d3748;
  resize: none;
  transition: all 0.2s;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.rejection-textarea:focus {
  outline: none;
  border-color: #f56565;
  box-shadow: 0 0 0 4px rgba(245, 101, 101, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  max-height: calc(90vh - 150px);
}

/* Premium Footer */
.premium-footer {
  background: #f8fafc;
  padding: 1.5rem 2.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-premium {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9375rem;
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-confirm-reject { background: #b91c1c; color: white; }
.btn-cancel { background: #e2e8f0; color: #475569; }
.btn-print { background: #3b82f6; color: white; }
.btn-close { background: #f1f5f9; color: #64748b; margin-left: auto; }

/* Table Improvements */
.requests-table-container {
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.badge-pending { background: #fffbeb; color: #92400e; border: 1px solid #fef3c7; }
.badge-approved { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
.badge-rejected { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

@media (max-width: 640px) {
  .section-grid {
    grid-template-columns: 1fr;
  }
}
</style>