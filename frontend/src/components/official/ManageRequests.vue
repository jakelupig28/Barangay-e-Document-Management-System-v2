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

      <div class="stat-glass-card claimed" @click="filterByStatus('claimed')" :class="{ active: currentFilter === 'claimed' }">
        <div class="stat-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.claimedRequests }}</div>
            <div class="stat-label">Claimed</div>
          </div>
        </div>
        <div class="stat-progress" :style="{ width: (stats.claimedRequests / (stats.totalRequests || 1) * 100) + '%' }"></div>
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
        <div class="custom-select-wrapper">
           <i class="fas fa-filter select-icon"></i>
          <select v-model="documentTypeFilter" class="professional-select">
            <option value="">All Documents</option>
            <option v-for="type in documentTypes" :value="type.value" :key="type.value">{{ type.label }}</option>
          </select>
        </div>
        <div class="status-tabs">
          <button 
            v-for="status in ['all', 'pending', 'approved', 'claimed', 'rejected']" 
            :key="status"
            :class="['status-tab', { active: currentFilter === status }, status]"
            @click="currentFilter = status"
          >
            {{ status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1) }}
          </button>
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
              <span>{{ getDocumentTypeLabel(request.type || request.documentType) }}</span>
            </td>
            <td class="py-3">
              <span :class="['badge rounded-pill px-3 py-2', `badge-${(request.status || 'pending').toLowerCase()}`]" style="font-weight: 500;">
                <i :class="statusIcons[(request.status || 'pending').toLowerCase()]" class="me-1"></i>
                {{ request.status === 'claimed' ? 'Document Claimed' : request.status }}
              </span>
            </td>
            <td class="py-3 text-center text-muted small">
              {{ formatDate(request.createdAt) }}
            </td>
            <td class="pe-4 py-3 text-end">
              <div class="d-flex justify-content-end gap-2">
                <button 
                  v-if="request.status === 'approved'"
                  class="btn btn-sm btn-success rounded-pill px-3"
                  @click="updateRequestStatus(request.id, 'claimed')"
                  :disabled="isUpdating"
                >
                  <i class="fas fa-handshake me-1"></i> Claimed
                </button>
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
                <div v-if="selectedRequest.onBehalf" class="detail-block">
                  <span class="label">On Behalf of</span>
                  <span class="value semi-bold text-black">{{ selectedRequest.recipientName }} ({{ selectedRequest.recipientRelationship }})</span>
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
                      {{ getDocumentTypeLabel(selectedRequest.type || selectedRequest.documentType) }}
                    </span>
                  </div>
                </div>
                <div class="detail-block">
                  <span class="label">Submission Date</span>
                  <span class="value">{{ formatDate(selectedRequest.createdAt) }}</span>
                </div>
                <div v-if="selectedRequest.status === 'claimed'" class="detail-block">
                  <span class="label">Claimed By</span>
                  <span class="value semi-bold">{{ selectedRequest.claimedBy || 'Resident' }}</span>
                </div>
                <div v-if="selectedRequest.status === 'claimed' && selectedRequest.claimedAt" class="detail-block">
                  <span class="label">Claimed Date</span>
                  <span class="value semi-bold">{{ formatDate(selectedRequest.claimedAt) }}</span>
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
                  <span :class="['status-pill-large', (selectedRequest.status || 'pending').toLowerCase()]">
                    <i :class="statusIcons[(selectedRequest.status || 'pending').toLowerCase()]"></i>
                    {{ selectedRequest.status === 'claimed' ? 'DOCUMENT CLAIMED' : selectedRequest.status.toUpperCase() }}
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
                <div v-else-if="selectedRequest.status === 'approved'" class="integrated-actions">
                  <button
                    class="btn-action approve"
                    @click="handleStatusUpdate('claimed')"
                    :disabled="isUpdating"
                    style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);"
                  >
                    <i class="fas fa-handshake"></i> Mark as Claimed
                  </button>
                </div>
              </div>
            </div>

            <!-- Request Timeline -->
            <div class="detail-section timeline-section mt-3">
              <div class="section-badge"><i class="fas fa-history"></i> Request Timeline</div>
              <div class="modal-timeline">
                <!-- Step 1: Submitted -->
                <div class="modal-timeline-item active">
                  <div class="modal-timeline-badge">
                    <i class="fas fa-paper-plane"></i>
                  </div>
                  <div class="modal-timeline-content">
                    <div class="modal-timeline-title">Request Submitted</div>
                    <div class="modal-timeline-time">{{ formatDate(selectedRequest.createdAt) }}</div>
                  </div>
                </div>

                <!-- Step 2: Approved / Rejected / Processing -->
                <div :class="['modal-timeline-item', selectedRequest.status !== 'pending' ? 'active' : 'pending']">
                  <div class="modal-timeline-badge">
                    <i :class="selectedRequest.status === 'rejected' ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
                  </div>
                  <div class="modal-timeline-content">
                    <div class="modal-timeline-title">
                      <span v-if="selectedRequest.status === 'approved' || selectedRequest.status === 'claimed'">Approved by Staff (Ready for Pickup)</span>
                      <span v-else-if="selectedRequest.status === 'rejected'">Rejected</span>
                      <span v-else>Processing (Awaiting Review)</span>
                    </div>
                    <div class="modal-timeline-time" v-if="selectedRequest.status !== 'pending'">
                      {{ formatDate(selectedRequest.approvedAt || selectedRequest.updatedAt) }}
                    </div>
                    <div class="modal-timeline-desc" v-else>
                      Pending approval from Barangay Staff
                    </div>
                  </div>
                </div>

                <!-- Step 3: Claimed (if claimed) -->
                <div v-if="selectedRequest.status === 'claimed'" class="modal-timeline-item active">
                  <div class="modal-timeline-badge">
                    <i class="fas fa-handshake"></i>
                  </div>
                  <div class="modal-timeline-content">
                    <div class="modal-timeline-title">Document Claimed</div>
                    <div class="modal-timeline-time">{{ formatDate(selectedRequest.claimedAt || selectedRequest.updatedAt) }}</div>
                  </div>
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

    <!-- Printable Document Modal (styled like templates preview) -->
    <div v-if="showPrintableDocument" class="preview-overlay" @click.self="closePrintableDocument">
      <!-- Top Bar -->
      <div class="preview-top-bar">
        <div class="preview-title-light">
          <i class="fas fa-file-contract"></i>
          <span>{{ getDocumentTypeLabel(currentDocumentData.type) }} Preview</span>
        </div>
        <div class="preview-top-actions">
          <div class="dropdown-download">
            <button class="btn-top-action download-btn" @click.stop="toggleDownloadMenu">
              <i class="fas fa-download"></i> Download <i class="fas fa-chevron-down small-arrow"></i>
            </button>
            <div v-if="showDownloadMenu" class="download-menu shadow">
              <a href="#" @click.prevent="downloadDocument('pdf')">
                <i class="fas fa-file-pdf text-danger"></i> PDF Document (.pdf)
              </a>
              <a href="#" @click.prevent="downloadDocument('docx')">
                <i class="fas fa-file-word text-primary"></i> Word Document (.docx)
              </a>
            </div>
          </div>
          <button class="btn-top-action close" @click="closePrintableDocument" title="Close Preview">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Preview Body -->
      <div class="preview-canvas custom-scroll">
        <div class="paper-preview-full">
          <PrintableDocument
            ref="printableDoc"
            :requestData="currentDocumentData"
            :barangayInfo="barangayInfo"
            @close="closePrintableDocument"
          />
        </div>
      </div>
    </div>

    <!-- Custom Claim Modal -->
    <div class="modal" :class="{ show: showClaimModal }" v-if="showClaimModal">
      <div class="modal-content premium-modal claim-prompt-modal">
        <div class="modal-header">
          <div class="header-main">
            <div class="header-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">
              <i class="fas fa-handshake"></i>
            </div>
            <div class="header-titles">
              <h3>Mark as Claimed</h3>
              <p class="request-id-subtitle">Record the person receiving the document</p>
            </div>
          </div>
          <button class="close-btn" @click="cancelClaim">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-0">
            <label for="claimantNameInput" class="form-label fw-semibold mb-2">Receiver's Full Name</label>
            <input 
              type="text" 
              id="claimantNameInput" 
              v-model="claimantName" 
              placeholder="Enter name of the receiver..."
              class="professional-input w-100"
              @keyup.enter="confirmClaim"
              autofocus
            />
            <p class="input-hint mt-2 mb-0"><i class="fas fa-info-circle me-1"></i> Please verify the valid ID of the receiver before handing over the document.</p>
          </div>
        </div>
        <div class="modal-footer premium-footer">
          <div class="footer-actions">
            <button class="btn-premium btn-cancel" @click="cancelClaim">Cancel</button>
            <button class="btn-premium btn-confirm-claim" @click="confirmClaim" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none;">
              Confirm Claim
            </button>
          </div>
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
      claimedRequests: 0,
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
    const showDownloadMenu = ref(false);
    const printableDoc = ref(null);
    
    const showClaimModal = ref(false);
    const claimantName = ref('');
    const claimantRequestId = ref('');
    
    // Toast notification
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastIcon = ref('');
    const isToastError = ref(false);
    
    const documentTypes = ref([
      { value: 'barangay-certificate', label: 'Barangay Certificate' },
      { value: 'certificate-of-indigency-financial', label: 'Certificate of Indigency (Financial Assistance)' },
      { value: 'certificate-of-indigency-general', label: 'Certificate of Indigency (General Purpose)' }
    ]);

    const statusIcons = {
      pending: 'fas fa-clock',
      approved: 'fas fa-check-circle',
      claimed: 'fas fa-handshake',
      rejected: 'fas fa-times-circle',
    };

    const documentTypeIcons = {
      'barangay-certificate': 'fas fa-file-contract',
      'certificate-of-indigency-financial': 'fas fa-hands-helping',
      'certificate-of-indigency-general': 'fas fa-hands-helping',
      // fallbacks
      'barangay-clearance': 'fas fa-file-contract',
      'residency-certificate': 'fas fa-file-contract',
      'certificate-of-residency': 'fas fa-file-contract',
      'indigency-certificate': 'fas fa-hands-helping',
      'certificate-of-indigency': 'fas fa-hands-helping'
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
      const types = {
        'barangay-certificate': 'Barangay Certificate',
        'certificate-of-indigency-financial': 'Certificate of Indigency (Financial Assistance)',
        'certificate-of-indigency-general': 'Certificate of Indigency (General Purpose)',
        // fallbacks
        'barangay-clearance': 'Barangay Certificate',
        'certificate-of-residency': 'Barangay Certificate',
        'residency-certificate': 'Barangay Certificate',
        'certificate-of-indigency': 'Certificate of Indigency (General Purpose)',
        'indigency-certificate': 'Certificate of Indigency (General Purpose)'
      };
      return types[typeValue] || typeValue;
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
              claimedAt: req.claimedAt ? new Date(req.claimedAt) : null,
            };
          }).sort((a, b) => b.createdAt - a.createdAt);

          stats.value = {
            pendingRequests: requests.value.filter((r) => r.status === 'pending').length,
            approvedRequests: requests.value.filter((r) => r.status === 'approved').length,
            claimedRequests: requests.value.filter((r) => r.status === 'claimed').length,
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
                updatedAt: requestData.updatedAt?.toDate?.() || null,
                claimedAt: requestData.claimedAt?.toDate?.() || requestData.claimedAt || null
              });
            }

            requests.value = requestsData;
            
            stats.value = {
              pendingRequests: requests.value.filter((r) => r.status === 'pending').length,
              approvedRequests: requests.value.filter((r) => r.status === 'approved').length,
              claimedRequests: requests.value.filter((r) => r.status === 'claimed').length,
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

    const triggerStatusEmail = (status, residentEmail, residentName, requestId, documentType, createdAt, approvedAt, claimedBy = '', onBehalf = false, recipientName = '', recipientRelationship = '') => {
      if (!residentEmail || residentEmail === 'N/A') {
        console.warn('No valid email for resident, skipping email notification.');
        return;
      }
      
      const formatDocType = (type) => {
        const mapping = {
          'barangay-certificate': 'Barangay Certificate',
          'certificate-of-indigency-financial': 'Certificate of Indigency (Financial Assistance)',
          'certificate-of-indigency-general': 'Certificate of Indigency (General Purpose)',
          'barangay-clearance': 'Barangay Certificate',
          'barangay-id': 'Barangay ID',
          'certificate-of-residency': 'Barangay Certificate',
          'certificate-of-indigency': 'Certificate of Indigency (General Purpose)',
          'business-permit': 'Business Permit'
        };
        return mapping[type] || type;
      };

      const docLabel = formatDocType(documentType);

      if (status === 'approved') {
        fetch('/api/notify-request-approval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residentEmail,
            residentName,
            requestId,
            documentType: docLabel,
            createdAt,
            approvedAt: new Date().toISOString(),
            onBehalf,
            recipientName,
            recipientRelationship
          })
        }).catch(err => console.warn('Failed to send approval email:', err));
      } else if (status === 'claimed') {
        fetch('/api/notify-request-claimed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residentEmail,
            residentName,
            requestId,
            documentType: docLabel,
            createdAt,
            approvedAt,
            claimedAt: new Date().toISOString(),
            claimedBy
          })
        }).catch(err => console.warn('Failed to send claimed email:', err));
      }
    };

    const updateRequestStatus = async (requestId, status, message = '', claimedByInput = '') => {
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

        // Retrieve existing request info before updating
        const currentReq = requests.value.find(r => r.id === requestId || r.documentId === requestId);
        const residentEmail = currentReq?.email || '';
        const residentName = currentReq?.userName || 'Resident';
        const documentType = currentReq ? (currentReq.documentType || currentReq.type) : 'Document';
        const createdAt = currentReq?.createdAt || new Date().toISOString();
        const approvedAt = currentReq?.updatedAt || new Date().toISOString();

        let claimedBy = claimedByInput;
        if (status === 'claimed' && !claimedBy) {
          claimantRequestId.value = requestId;
          claimantName.value = residentName;
          showClaimModal.value = true;
          isUpdating.value = false;
          return;
        }
        
        if (!isFirebaseReady()) {
          const dbData = localDb.readDb();
          const reqIndex = (dbData.requests || []).findIndex(r => r.id === requestId);
          if (reqIndex !== -1) {
            dbData.requests[reqIndex].status = status;
            if (status === 'rejected' && message) {
              dbData.requests[reqIndex].rejectionMessage = message;
            }
            if (status === 'claimed') {
              dbData.requests[reqIndex].claimedAt = new Date().toISOString();
              dbData.requests[reqIndex].claimedBy = claimedBy;
            }
            dbData.requests[reqIndex].updatedAt = new Date().toISOString();
            dbData.requests[reqIndex].updatedBy = user.value?.id || user.value?.uid || 'staff';
            localDb.writeDb(dbData);
            
            let toastMsg = 'Request updated!';
            let toastIcon = 'fas fa-info-circle';
            if (status === 'approved') {
              toastMsg = 'Request approved!';
              toastIcon = 'fas fa-check-circle';
            } else if (status === 'rejected') {
              toastMsg = 'Request rejected!';
              toastIcon = 'fas fa-times-circle';
            } else if (status === 'claimed') {
              toastMsg = 'Request marked as claimed!';
              toastIcon = 'fas fa-handshake';
            }
            showToastNotification(toastMsg, toastIcon);

            if (selectedRequest.value && selectedRequest.value.id === requestId) {
              selectedRequest.value.status = status;
            }
            fetchRequests();

            // Trigger Email Notification
            triggerStatusEmail(status, residentEmail, residentName, requestId, documentType, createdAt, approvedAt, claimedBy, currentReq?.onBehalf, currentReq?.recipientName, currentReq?.recipientRelationship);
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
        if (status === 'claimed') {
          updateData.claimedAt = new Date();
          updateData.claimedBy = claimedBy;
        }

        await updateDoc(requestRef, updateData);

        let toastMsg = 'Request updated!';
        let toastIcon = 'fas fa-info-circle';
        if (status === 'approved') {
          toastMsg = 'Request approved!';
          toastIcon = 'fas fa-check-circle';
        } else if (status === 'rejected') {
          toastMsg = 'Request rejected!';
          toastIcon = 'fas fa-times-circle';
        } else if (status === 'claimed') {
          toastMsg = 'Request marked as claimed!';
          toastIcon = 'fas fa-handshake';
        }
        showToastNotification(toastMsg, toastIcon);

        // Update the selected request in the modal if open
        if (selectedRequest.value && 
            (selectedRequest.value.documentId === requestId || 
             selectedRequest.value.id === documentId)) {
          selectedRequest.value.status = status;
        }

        // Trigger Email Notification
        triggerStatusEmail(status, residentEmail, residentName, requestId, documentType, createdAt, approvedAt, claimedBy, currentReq?.onBehalf, currentReq?.recipientName, currentReq?.recipientRelationship);
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
      showDownloadMenu.value = false;
      currentDocumentData.value = null;
    };

    const toggleDownloadMenu = () => {
      showDownloadMenu.value = !showDownloadMenu.value;
    };

    const confirmClaim = async () => {
      if (!claimantName.value.trim()) {
        showToastNotification('Please enter the name of the person claiming the document.', 'fas fa-exclamation-circle', true);
        return;
      }
      const requestId = claimantRequestId.value;
      const name = claimantName.value.trim();
      
      showClaimModal.value = false;
      claimantRequestId.value = '';
      claimantName.value = '';
      
      await updateRequestStatus(requestId, 'claimed', '', name);
    };

    const cancelClaim = () => {
      showClaimModal.value = false;
      claimantRequestId.value = '';
      claimantName.value = '';
    };

    const downloadDocument = async (format) => {
      showDownloadMenu.value = false;
      if (!currentDocumentData.value) return;
      const fileName = `${getDocumentTypeLabel(currentDocumentData.value.type).replace(/\s+/g, '_')}_${currentDocumentData.value.id || 'document'}`;
      
      if (format === 'pdf') {
        const element = document.querySelector('.printable-document');
        if (!element) {
          showToastNotification('Could not find document content to download.', 'fas fa-exclamation-circle', true);
          return;
        }
        
        showToastNotification('Generating PDF...', 'fas fa-spinner fa-spin');
        
        html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
          pdf.save(`${fileName}.pdf`);
          showToastNotification('PDF downloaded successfully!', 'fas fa-check-circle');
        }).catch((err) => {
          console.error('PDF generation error:', err);
          showToastNotification('Failed to generate PDF. Please try again.', 'fas fa-exclamation-circle', true);
        });
      } else if (format === 'docx') {
        const element = document.querySelector('.printable-document');
        if (!element) {
          showToastNotification('Could not find document content to download.', 'fas fa-exclamation-circle', true);
          return;
        }
        
        showToastNotification('Generating Word document...', 'fas fa-spinner fa-spin');
        
        try {
          // Helper to convert an image URL to base64 with white background flattening
          const imgToBase64 = async (imgUrl, isCircular = false, zoom = 1.0) => {
            if (!imgUrl) return '';
            if (imgUrl.startsWith('data:')) return imgUrl;
            try {
              const res = await fetch(imgUrl);
              const blob = await res.blob();
              
              const img = new Image();
              const url = URL.createObjectURL(blob);
              img.src = url;
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });
              URL.revokeObjectURL(url);
              
              const canvas = document.createElement('canvas');
              const rawSize = Math.max(img.naturalWidth || img.width || 300, img.naturalHeight || img.height || 300);
              const size = rawSize % 2 === 0 ? rawSize : rawSize + 1;
              canvas.width = size;
              canvas.height = size;
              
              const ctx = canvas.getContext('2d');
              
              // Fill canvas with white background
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, size, size);
              
              if (isCircular) {
                // Create a circular clipping mask
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                
                // Fill the clipped area with white
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, size, size);
              }
              
              // Draw the image centered
              const w = img.naturalWidth || img.width || size;
              const h = img.naturalHeight || img.height || size;
              const minSide = Math.min(w, h);
              
              if (isCircular) {
                // Center crop with zoom
                const cropSize = Math.floor(minSide / zoom);
                const sx = Math.floor((w - cropSize) / 2);
                const sy = Math.floor((h - cropSize) / 2);
                ctx.drawImage(
                  img,
                  sx, sy, cropSize, cropSize,
                  0, 0, size, size
                );
              } else {
                // Fit center for square/rectangular logos with zoom
                const cropSizeW = Math.floor(w / zoom);
                const cropSizeH = Math.floor(h / zoom);
                const aspect = cropSizeW / cropSizeH;
                let dx = 0, dy = 0, dw = size, dh = size;
                if (aspect > 1) {
                  dh = Math.floor(size / aspect);
                  dy = Math.floor((size - dh) / 2);
                } else {
                  dw = Math.floor(size * aspect);
                  dx = Math.floor((size - dw) / 2);
                }
                const sx = Math.floor((w - cropSizeW) / 2);
                const sy = Math.floor((h - cropSizeH) / 2);
                ctx.drawImage(
                  img,
                  sx, sy, cropSizeW, cropSizeH,
                  dx, dy, dw, dh
                );
              }
              
              return canvas.toDataURL('image/png');
            } catch (e) {
              console.error('Error converting image to base64:', e);
              return imgUrl;
            }
          };

          // Extract logo images
          const logoLeftImg = element.querySelector('.cert-preview-logo-left img');
          const logoCenterImg = element.querySelector('.cert-preview-logo-center img');
          const logoRightImg = element.querySelector('.cert-preview-logo-right img');

          const base64Left = logoLeftImg ? await imgToBase64(logoLeftImg.src, true, 1.38) : '';
          const base64Center = logoCenterImg ? await imgToBase64(logoCenterImg.src, true, 1.0) : '';
          const base64Right = logoRightImg ? await imgToBase64(logoRightImg.src, false, 1.0) : '';

          // Extract header text
          const headerTextEl = element.querySelector('.cert-preview-header-text');
          const headerTextHTML = headerTextEl ? headerTextEl.innerHTML : '';

          // Extract columns
          const leftColEl = element.querySelector('.cert-left-column');
          const rightColEl = element.querySelector('.cert-right-column');

          // Sangguniang Barangay (on left)
          const sbHTML = leftColEl ? leftColEl.innerHTML : '';
          // Certificate Content (on right)
          const certHTML = rightColEl ? rightColEl.innerHTML : '';

          // We need to strip the signature row from the certificate content
          let certBodyHTML = certHTML;
          let signatureHTML = '';
          const sigRowEl = element.querySelector('.cert-preview-signatures-row');
          if (sigRowEl) {
            const captainEl = sigRowEl.querySelector('.cert-p-captain');
            const sealEl = sigRowEl.querySelector('.cert-p-seal-official');
            
            // Extract captain name and title
            const nameEl = captainEl ? captainEl.querySelector('.cert-p-name') : null;
            const titleEl = captainEl ? captainEl.querySelector('.cert-p-title-sub') : null;
            const captainName = nameEl ? nameEl.textContent.trim() : 'ANGELITO G. DULA';
            const captainTitle = titleEl ? titleEl.textContent.trim() : 'Barangay Chairman';
            
            const sealInnerEl = sealEl ? sealEl.querySelector('.seal-inner-text') : null;
            const sealInnerText = sealInnerEl ? sealInnerEl.textContent.trim() : 'The certificate issued by Barangay 424, Zone 43 is not valid without a dry seal.';
            
            // Generate dashed circle seal image dynamically
            const generateSealImage = (text) => {
              const canvas = document.createElement('canvas');
              canvas.width = 300;
              canvas.height = 300;
              const ctx = canvas.getContext('2d');
              
              // Fill background with white
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, 300, 300);
              
              // Draw the dashed circle
              ctx.strokeStyle = '#1e3a8a';
              ctx.lineWidth = 5;
              ctx.setLineDash([14, 14]);
              ctx.beginPath();
              ctx.arc(150, 150, 135, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
              
              // Draw the text
              ctx.fillStyle = '#1e3a8a';
              ctx.font = 'bold 22px "Times New Roman", serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              const words = text.split(' ');
              const lines = [];
              let currentLine = words[0];
              
              for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = ctx.measureText(currentLine + " " + word).width;
                if (width < 210) {
                  currentLine += " " + word;
                } else {
                  lines.push(currentLine);
                  currentLine = word;
                }
              }
              lines.push(currentLine);
              
              const lineHeight = 28;
              const totalHeight = lines.length * lineHeight;
              const startY = 150 - (totalHeight / 2) + (lineHeight / 2);
              
              for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], 150, startY + (i * lineHeight));
              }
              
              return canvas.toDataURL('image/png');
            };
            
            const sealImageBase64 = generateSealImage(sealInnerText);
            
            signatureHTML = `
              <table class="no-border" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%; border: none;">
                <tr>
                  <td style="width: 60%; text-align: center; vertical-align: bottom; padding-top: 20px; border: 0px solid white; mso-border-alt: 0px solid white;">
                    <!-- Signature Line Table -->
                    <table border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse: collapse; width: 180pt; border: 0px solid white;">
                      <tr>
                        <td style="border-top: 1.5pt solid #1e3a8a; font-size: 1px; line-height: 1px; border-left: 0px solid white; border-right: 0px solid white; border-bottom: 0px solid white; mso-border-top-alt: 1.5pt solid #1e3a8a; mso-border-left-alt: 0px solid white; mso-border-right-alt: 0px solid white; mso-border-bottom-alt: 0px solid white;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style="text-align: center; padding-top: 4px; border: 0px solid white; mso-border-alt: 0px solid white;">
                          <p style="font-family: 'Times New Roman', serif; margin: 0; padding: 0;"><span style="font-size: 11pt; font-weight: bold; color: #1e3a8a;">${captainName}</span><br><span style="font-size: 8.5pt; font-weight: bold; color: #64748b;">${captainTitle}</span></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="width: 40%; text-align: center; vertical-align: bottom; padding-top: 20px; border: 0px solid white; mso-border-alt: 0px solid white;">
                    <table border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse: separate; width: 110px; height: 110px; text-align: center;">
                      <tr>
                        <td style="vertical-align: middle; text-align: center; border: 0px solid white; mso-border-alt: 0px solid white; padding: 0;">
                          <img src="${sealImageBase64}" width="110" height="110" border="0" style="width: 110px; height: 110px; border: none; outline: none; display: block; margin: 0 auto;" alt="Official Seal">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `;
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = certHTML;
            const sigRowInTemp = tempDiv.querySelector('.cert-preview-signatures-row');
            if (sigRowInTemp) {
              sigRowInTemp.remove();
            }
            certBodyHTML = tempDiv.innerHTML;
          }

          // Construct Word-friendly HTML document structure
          const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
              <meta charset="utf-8">
              <title>Barangay Document</title>
              <style>
                body {
                  font-family: 'Times New Roman', serif;
                  font-size: 12.5pt;
                  color: #0f172a;
                  margin: 0;
                  padding: 0;
                }
                table {
                  border-collapse: collapse;
                }
                p {
                  margin: 0 0 8px 0;
                }
                /* Style adjustments for Sangguniang Barangay */
                .cert-sb-title {
                  font-size: 12.5pt;
                  font-weight: bold;
                  text-align: center;
                  margin-bottom: 10px;
                  color: #1e3a8a;
                }
                .cert-sb-subtitle {
                  font-size: 11.5pt;
                  font-weight: bold;
                  text-align: center;
                  margin: 10px 0 5px 0;
                  color: #1e3a8a;
                }
                .cert-official-item {
                  text-align: center;
                  margin-bottom: 8px;
                }
                .cert-off-name {
                  font-size: 11pt;
                  font-weight: bold;
                  color: #0f172a;
                }
                .cert-off-title {
                  font-size: 9.5pt;
                  color: #1e293b;
                  font-weight: bold;
                }
                /* Style adjustments for Certificate Content */
                .cert-preview-title {
                  font-size: 19pt;
                  font-weight: bold;
                  color: #1e3a8a;
                  text-align: center;
                  margin-top: 15px;
                  margin-bottom: 15px;
                }
                .cert-preview-no {
                  font-size: 11pt;
                  font-weight: bold;
                  color: #1e293b;
                  text-align: right;
                  margin-bottom: 15px;
                }
                .cert-p-to-whom {
                  font-weight: bold;
                  margin-bottom: 12px;
                }
                .cert-p-main-text {
                   font-size: 16pt;
                   margin-bottom: 24px;
                   text-indent: 0;
                   text-align: justify;
                   line-height: 1.75;
                 }

                .cert-p-name {
                  font-weight: bold;
                  font-size: 13pt;
                  border-top: 1.5pt solid #1e3a8a;
                  padding-top: 4px;
                  margin-top: 10px;
                  color: #1e3a8a;
                }
                .cert-p-title-sub {
                  font-size: 10.5pt;
                  color: #64748b;
                  font-weight: bold;
                }
                .seal-outer-text {
                  font-size: 6pt;
                  font-weight: bold;
                  color: #1e3a8a;
                }
                .seal-inner-text {
                  font-size: 7.5pt;
                  font-weight: bold;
                  color: #1e3a8a;
                }
                /* Header lines */
                .cert-p-line-1, .cert-p-line-2, .cert-p-line-3, .cert-p-line-dist {
                  font-weight: bold;
                  color: #1e3a8a;
                  text-align: center;
                }
                .cert-p-line-1 { font-size: 11.5pt; }
                .cert-p-line-2 { font-size: 11.5pt; }
                .cert-p-line-sub { font-size: 9.5pt; color: #475569; text-align: center; }
                .cert-p-line-3 { font-size: 14.5pt; }
                .cert-p-line-dist { font-size: 11.5pt; }

                /* Force hide vertical column lines / borders in Word */
                table.no-border, table.no-border > tr > td, table.no-border > tbody > tr > td {
                  border: none !important;
                  border-style: none !important;
                  border-width: 0px !important;
                  mso-border-alt: none !important;
                  mso-border-left-alt: none !important;
                  mso-border-right-alt: none !important;
                  mso-border-top-alt: none !important;
                  mso-border-bottom-alt: none !important;
                }

                @page Section1 {
                  size: 595.3pt 841.9pt;
                  margin: 28pt 28pt 28pt 28pt; /* A little bit far to the end of paper */
                  mso-header-margin: 28pt;
                  mso-footer-margin: 28pt;
                  mso-paper-source: 0;
                }
                div.Section1 {
                  page: Section1;
                }
              </style>
            </head>
            <body>
              <div class="Section1">
                <!-- Outer Double Border Frame Table -->
                <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 539pt; border: none; background-color: #ffffff; margin: 0 auto;">
                <tr>
                  <td style="padding: 4px; border: 3.5pt double #1e3a8a; vertical-align: top; height: 730pt;">
                    <!-- Inner Frame Table -->
                    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; border: none;">
                      <tr>
                        <td style="padding: 24px; border: 1.0pt solid #1e3a8a; vertical-align: top; height: 710pt;">
                                                     <!-- Header Table -->
                          <table class="no-border" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-bottom: 10px; border: 0px solid white;">
                            <tr>
                              <!-- Left Logo (with inward padding) -->
                              <td style="width: 120px; text-align: left; vertical-align: middle; padding-left: 35px; border: 0px solid white; mso-border-alt: 0px solid white;">
                                ${base64Left ? `<img src="${base64Left}" width="95" height="95" border="0" style="width: 95px; height: 95px; border: none; outline: none;" alt="Logo Left">` : ''}
                              </td>
                              
                              <!-- Center Text & Logo -->
                              <td style="text-align: center; vertical-align: middle; padding: 0 10px; border: 0px solid white; mso-border-alt: 0px solid white;">
                                ${base64Center ? `<div style="margin-bottom: 4px; border: none;"><img src="${base64Center}" width="55" height="55" border="0" style="width: 55px; height: 55px; border: none; outline: none;" alt="Logo Center"></div>` : ''}
                                <div style="font-family: 'Times New Roman', serif;">
                                  ${headerTextHTML || `
                                    <div class="cert-p-line-1">REPUBLIC OF THE PHILIPPINES</div>
                                    <div class="cert-p-line-2">CITY OF MANILA</div>
                                    <div class="cert-p-line-sub">Vicente G. Cruz St. Corner Lardizabal Extension</div>
                                    <div class="cert-p-line-3">BARANGAY 424 ZONE 43</div>
                                    <div class="cert-p-line-dist">DISTRICT IV, MANILA</div>
                                  `}
                                </div>
                              </td>
                              
                              <!-- Right Logo (with inward padding) -->
                              <td style="width: 120px; text-align: right; vertical-align: middle; padding-right: 35px; border: 0px solid white; mso-border-alt: 0px solid white;">
                                ${base64Right ? `<img src="${base64Right}" width="95" height="95" border="0" style="width: 95px; height: 95px; border: none; outline: none;" alt="Logo Right">` : ''}
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Divider Line Table -->
                          <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-bottom: 15px; border: none;">
                            <tr>
                              <td style="border-top: 1.5pt solid #1e3a8a; height: 1px; font-size: 1px; line-height: 1px; border-left: none; border-right: none; border-bottom: none;">&nbsp;</td>
                            </tr>
                          </table>
                          
                          <!-- One Column Table -->
                          <table class="no-border" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 0px solid white;">
                            <tr>
                              <!-- Column: Certificate Content (100% width, padded) -->
                              <td style="width: 100%; padding-left: 35pt; padding-right: 35pt; vertical-align: top; text-align: left; border: 0px solid white; mso-border-alt: 0px solid white;">
                                <div style="font-family: 'Times New Roman', serif;">
                                  ${certBodyHTML}
                                </div>
                              </td>
                            </tr>
                            <!-- Vertical Spacer Row to push signature to bottom -->
                            <tr>
                              <td style="height: 50pt; font-size: 1px; line-height: 1px; border: 0px solid white; mso-border-alt: 0px solid white;" height="70">&nbsp;</td>
                            </tr>
                            <tr>
                              <!-- Column: Signature (100% width, padded) -->
                              <td style="width: 100%; padding-left: 35pt; padding-right: 35pt; vertical-align: top; text-align: left; border: 0px solid white; mso-border-alt: 0px solid white;">
                                <div style="font-family: 'Times New Roman', serif;">
                                  ${signatureHTML}
                                </div>
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
             </div>
            </body>
            </html>
          `;
          
          const blob = new Blob(['\ufeff' + html], {
            type: 'application/msword;charset=utf-8'
          });
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.doc`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToastNotification('Document downloaded as Word file!', 'fas fa-check-circle');
        } catch (error) {
          console.error('Error generating Word document:', error);
          showToastNotification('Failed to generate Word document. Please try again.', 'fas fa-exclamation-circle', true);
        }
      }
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
        filtered = filtered.filter((r) => {
          const rType = (r.type || r.documentType || '').toLowerCase();
          const fType = documentTypeFilter.value.toLowerCase();
          
          if (fType === 'barangay-certificate') {
            return rType === 'barangay-certificate' || rType === 'barangay-clearance' || rType === 'residency-certificate' || rType === 'certificate-of-residency';
          }
          if (fType === 'certificate-of-indigency-financial') {
            return rType === 'certificate-of-indigency-financial';
          }
          if (fType === 'certificate-of-indigency-general') {
            return rType === 'certificate-of-indigency-general' || rType === 'certificate-of-indigency' || rType === 'indigency-certificate';
          }
          return rType === fType;
        });
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
      closePrintableDocument,
      showDownloadMenu,
      toggleDownloadMenu,
      downloadDocument,
      printableDoc,
      showClaimModal,
      claimantName,
      claimantRequestId,
      confirmClaim,
      cancelClaim
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
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (min-width: 992px) {
  .search-and-filter {
    flex-wrap: nowrap;
  }
}

.search-wrapper {
  position: relative;
  width: 240px;
  max-width: 100%;
  flex-shrink: 1;
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
  padding: 0.75rem 1rem 0.75rem 3rem;
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
  width: 200px;
  min-width: 180px;
  flex-shrink: 0;
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
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
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
  flex-shrink: 0;
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
  white-space: nowrap;
}

.status-pill-large.pending { background: #fee2e2; color: #991b1b; }
.status-pill-large.approved { background: #dcfce7; color: #166534; }
.status-pill-large.claimed { background: #e0f2fe; color: #0369a1; }
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
.badge-claimed { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
.badge-rejected { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

@media (max-width: 640px) {
  .section-grid {
    grid-template-columns: 1fr;
  }
}

.modal-content.printable-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.dropdown-download {
  position: relative;
}

.download-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.download-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.small-arrow {
  font-size: 0.75rem;
  opacity: 0.7;
}

.download-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  width: 200px;
  z-index: 100;
  overflow: hidden;
  padding: 0.25rem 0;
}

.download-menu a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  text-align: left;
}

.download-menu a:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.claim-prompt-modal {
  max-width: 480px;
}

.btn-confirm-claim:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Toast Notification styling */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #10b981; /* Premium Emerald/Green background */
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2000;
}

.toast.show {
  transform: translateY(0);
  opacity: 1;
}

.toast.error {
  background: #ef4444; /* Premium red background */
  box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toast i {
  font-size: 1.25rem;
}

/* Modal Timeline Section Styles */
.modal-timeline-section {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.modal-timeline-section h5 {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 600;
}

.modal-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  padding-left: 0.5rem;
  text-align: left;
}

.modal-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background-color: #e2e8f0;
}

.modal-timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.modal-timeline-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.3s;
  flex-shrink: 0;
}

.modal-timeline-item.active .modal-timeline-badge {
  background-color: #4f46e5;
  color: white;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
}

.modal-timeline-item.active.rejected .modal-timeline-badge {
  background-color: #ef4444;
  color: white;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
}

.modal-timeline-item.pending .modal-timeline-badge {
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.modal-timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-align: left;
}

.modal-timeline-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.modal-timeline-item.active .modal-timeline-title {
  color: #1e293b;
}

.modal-timeline-time {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.modal-timeline-desc {
  font-size: 0.75rem;
  color: #d97706;
  font-style: italic;
}
</style>