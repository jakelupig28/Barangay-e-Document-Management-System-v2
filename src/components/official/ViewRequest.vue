<template>
  <div class="view-request-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
        Back to Requests
      </button>
      <h1>Document Request Details</h1>
    </div>

    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading request details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Error Loading Request</h3>
      <p>{{ error }}</p>
      <button class="action-btn primary" @click="$router.back()">
        Go Back
      </button>
    </div>

    <div v-else-if="request" class="request-details">
      <!-- Header Section -->
      <div class="request-header">
        <div class="request-meta">
          <h2>Request #{{ request.documentId || request.id || 'N/A' }}</h2>
          <span :class="`status-badge large ${request.status}`">
            <i :class="statusIcons[request.status]"></i>
            {{ request.status.charAt(0).toUpperCase() + request.status.slice(1) }}
          </span>
        </div>
        <div class="request-actions">
          <button
            class="action-btn approve"
            @click="updateRequestStatus('approved')"
            v-if="request.status === 'pending'"
            :disabled="isUpdating"
          >
            <i class="fas fa-check"></i> Approve Request
          </button>
          <button
            class="action-btn reject"
            @click="updateRequestStatus('rejected')"
            v-if="request.status === 'pending'"
            :disabled="isUpdating"
          >
            <i class="fas fa-times"></i> Reject Request
          </button>
            <button
            class="action-btn print"
            @click="$router.push(`/official/requests/${request.id}/generate`)"
            v-if="request.status === 'approved'"
            >
            <i class="fas fa-print"></i> Generate Document
            </button>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Left Column - Resident Information -->
        <div class="content-column">
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-user"></i>
              <h3>Resident Information</h3>
            </div>
            <div class="card-body">
              <div class="info-item">
                <label>Full Name:</label>
                <div class="info-value">{{ request.userName || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Contact Number:</label>
                <div class="info-value">{{ request.contact || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Email Address:</label>
                <div class="info-value">{{ request.email || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Resident Address:</label>
                <div class="info-value">{{ request.address || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <!-- Business Information (Conditional) -->
          <div class="info-card" v-if="request.businessName || request.businessAddress">
            <div class="card-header">
              <i class="fas fa-building"></i>
              <h3>Business Information</h3>
            </div>
            <div class="card-body">
              <div class="info-item" v-if="request.businessName">
                <label>Business Name:</label>
                <div class="info-value">{{ request.businessName }}</div>
              </div>
              <div class="info-item" v-if="request.businessAddress">
                <label>Business Address:</label>
                <div class="info-value">{{ request.businessAddress }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Document Information -->
        <div class="content-column">
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-file-alt"></i>
              <h3>Document Information</h3>
            </div>
            <div class="card-body">
              <div class="info-item">
                <label>Document Type:</label>
                <div class="info-value">
                  <span class="document-type-badge">
                    <i :class="documentTypeIcons[request.type || request.documentType]"></i>
                    {{ getDocumentTypeLabel(request.type || request.documentType) }}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <label>Purpose:</label>
                <div class="info-value purpose-text">{{ request.purpose || 'N/A' }}</div>
              </div>
              <div class="info-item">
                <label>Date Requested:</label>
                <div class="info-value">{{ formatDate(request.createdAt) }}</div>
              </div>
              <div class="info-item" v-if="request.updatedAt">
                <label>Last Updated:</label>
                <div class="info-value">{{ formatDate(request.updatedAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div class="info-card" v-if="request.notes">
            <div class="card-header">
              <i class="fas fa-sticky-note"></i>
              <h3>Additional Notes</h3>
            </div>
            <div class="card-body">
              <div class="notes-content">
                {{ request.notes }}
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-history"></i>
              <h3>Request Timeline</h3>
            </div>
            <div class="card-body">
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Request Submitted</div>
                    <div class="timeline-date">{{ formatDate(request.createdAt) }}</div>
                  </div>
                </div>
                <div class="timeline-item" v-if="request.status !== 'pending'">
                  <div class="timeline-marker completed"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Request {{ request.status }}</div>
                    <div class="timeline-date" v-if="request.updatedAt">
                      {{ formatDate(request.updatedAt) }}
                    </div>
                  </div>
                </div>
                <div class="timeline-item" v-else>
                  <div class="timeline-marker pending"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Awaiting Review</div>
                    <div class="timeline-description">Pending approval from barangay official</div>
                  </div>
                </div>
              </div>
            </div>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format } from 'date-fns';
import { 
  doc, 
  getDoc,
  updateDoc,
  where,
  getDocs,
  collection,
  query  // Fixed: Now imported
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase/config';
import PrintableDocument from '@/components/official/PrintableDocument.vue';

export default {
  name: 'ViewRequest',
  components: {
    PrintableDocument
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const request = ref(null);
    const isLoading = ref(true);
    const isUpdating = ref(false);
    const error = ref(null);
    const showPrintableDocument = ref(false);
    const currentDocumentData = ref(null);
    
    // Toast
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastIcon = ref('');
    const isToastError = ref(false);
    
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

    const auth = getAuth();
    const user = ref(null);

    const getDocumentTypeLabel = (typeValue) => {
      const types = {
        'business-permit': 'Business Permit',
        'barangay-clearance': 'Barangay Clearance',
        'barangay-id': 'Barangay ID',
        'residency-certificate': 'Certificate of Residency',
        'indigency-certificate': 'Certificate of Indigency',
        'other': 'Other'
      };
      return types[typeValue] || typeValue;
    };

    const fetchRequest = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const requestId = route.params.id;
        if (!requestId) throw new Error('No request ID provided');

        let document = null;

        // 1. Try by custom 'id' field (e.g. BRGY-250818-6426)
        const q1 = query(collection(db, 'requests'), where('id', '==', requestId));
        const snapshot1 = await getDocs(q1);

        if (!snapshot1.empty) {
          document = snapshot1.docs[0];
        } else {
          // 2. Fallback: maybe the route param IS the Firestore document ID
          const docRef = doc(db, 'requests', requestId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            document = docSnap;
          } else {
            throw new Error('Request not found');
          }
        }

        const requestData = document.data();

        request.value = {
          id: document.id,
          documentId: requestData.id || document.id,
          ...requestData,
          createdAt: requestData.createdAt?.toDate?.() || null,
          updatedAt: requestData.updatedAt?.toDate?.() || null
        };

        isLoading.value = false;
      } catch (err) {
        console.error('Error fetching request:', err);
        error.value = err.message || 'Failed to load request details';
        isLoading.value = false;
      }
    };

    const updateRequestStatus = async (status) => {
      if (!user.value) {
        showToastNotification('You must be logged in to perform this action.', 'fas fa-exclamation-circle', true);
        return;
      }
      
      try {
        isUpdating.value = true;
        
        if (!request.value) return;

        const requestRef = doc(db, 'requests', request.value.id);
        
        await updateDoc(requestRef, {
          status: status,
          updatedAt: new Date(),
          updatedBy: user.value.uid,
        });

        request.value.status = status;
        request.value.updatedAt = new Date();

        showToastNotification(
          status === 'approved' ? 'Request approved successfully!' : 'Request rejected successfully!',
          status === 'approved' ? 'fas fa-check-circle' : 'fas fa-times-circle'
        );

        setTimeout(() => router.back(), 1500);
      } catch (err) {
        console.error('Error updating request:', err);
        showToastNotification(`Failed to update: ${err.message}`, 'fas fa-exclamation-circle', true);
      } finally {
        isUpdating.value = false;
      }
    };

    const generateDocument = () => {
      if (!request.value) return;
      
      currentDocumentData.value = {
        ...request.value,
        type: request.value.type || request.value.documentType,
        userName: request.value.userName,
        address: request.value.address || barangayInfo.value.address,
        purpose: request.value.purpose || 'personal use',
        businessName: request.value.businessName,
        businessAddress: request.value.businessAddress
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

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        return format(timestamp instanceof Date ? timestamp : timestamp.toDate(), 'MMM dd, yyyy hh:mm a');
      } catch {
        return 'Invalid Date';
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
        if (currentUser) {
          fetchRequest();
        } else {
          error.value = 'Please log in to view request details.';
          isLoading.value = false;
        }
      });
    });

    return {
      request,
      isLoading,
      isUpdating,
      error,
      statusIcons,
      documentTypeIcons,
      showPrintableDocument,
      currentDocumentData,
      barangayInfo,
      showToast,
      toastMessage,
      toastIcon,
      isToastError,
      updateRequestStatus,
      generateDocument,
      closePrintableDocument,
      formatDate,
      getDocumentTypeLabel
    };
  },
};
</script>

<style scoped>
/* === ALL STYLES FROM YOUR ORIGINAL (unchanged) === */
.view-request-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.back-btn {
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

.back-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.page-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.loading-state, .error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-state i {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.error-state i {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.error-state p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.request-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.request-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.request-meta h2 {
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.request-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.content-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header i {
  font-size: 1.25rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: #2c3e50;
  font-size: 1.1rem;
  word-break: break-word;
}

.purpose-text {
  white-space: pre-wrap;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.notes-content {
  white-space: pre-wrap;
  line-height: 1.5;
  background: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
  color: #856404;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge.large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
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

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
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

.action-btn.print {
  background: #17a2b8;
  color: white;
}

.action-btn.print:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-1px);
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0.25rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dee2e6;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #dee2e6;
}

.timeline-marker.completed {
  background: #28a745;
  box-shadow: 0 0 0 2px #28a745;
}

.timeline-marker.pending {
  background: #ffc107;
  box-shadow: 0 0 0 2px #ffc107;
}

.timeline-content {
  margin-left: 0;
}

.timeline-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.timeline-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.timeline-description {
  color: #6c757d;
  font-size: 0.9rem;
  font-style: italic;
}

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

.modal-content.printable-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

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

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .view-request-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .request-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .request-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .action-btn {
    flex: 1;
    min-width: 0;
    justify-content: center;
  }

  .card-body {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .request-meta h2 {
    font-size: 1.25rem;
  }

  .card-header {
    padding: 1.25rem;
  }

  .card-header h3 {
    font-size: 1.1rem;
  }
}
</style>