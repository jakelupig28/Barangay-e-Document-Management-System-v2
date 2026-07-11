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
            {{ request.status === 'claimed' ? 'Document Claimed' : (request.status.charAt(0).toUpperCase() + request.status.slice(1)) }}
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
            class="action-btn approve"
            @click="updateRequestStatus('claimed')"
            v-if="request.status === 'approved'"
            :disabled="isUpdating"
            style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-color: #10b981;"
          >
            <i class="fas fa-handshake"></i> Mark as Claimed
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
              <div class="info-item" v-if="request.onBehalf">
                <label>On Behalf of:</label>
                <div class="info-value text-black fw-bold">{{ request.recipientName }} ({{ request.recipientRelationship }})</div>
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
              <div class="info-item" v-if="request.status === 'claimed'">
                <label>Claimed By:</label>
                <div class="info-value">{{ request.claimedBy || 'Resident' }}</div>
              </div>
              <div class="info-item" v-if="request.status === 'claimed' && request.claimedAt">
                <label>Date Claimed:</label>
                <div class="info-value">{{ formatDate(request.claimedAt) }}</div>
              </div>
              <div class="info-item" v-if="request.updatedAt && request.status !== 'claimed'">
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
            <label for="claimantNameInput" class="form-label fw-semibold mb-2" style="color: #475569; font-size: 0.875rem; text-align: left; display: block;">Receiver's Full Name</label>
            <input 
              type="text" 
              id="claimantNameInput" 
              v-model="claimantName" 
              placeholder="Enter name of the receiver..."
              class="professional-input w-100"
              @keyup.enter="confirmClaim"
              autofocus
              style="padding: 0.75rem 1rem; border-radius: 12px; border: 1.5px solid #cbd5e1; outline: none; font-size: 0.95rem; width: 100%; box-sizing: border-box;"
            />
            <p class="input-hint mt-2 mb-0" style="color: #64748b; font-size: 0.8rem; text-align: left; display: flex; align-items: center; gap: 0.25rem;">
              <i class="fas fa-info-circle" style="color: #3b82f6;"></i> Please verify the valid ID of the receiver before handing over the document.
            </p>
          </div>
        </div>
        <div class="modal-footer premium-footer">
          <div class="footer-actions" style="display: flex; gap: 0.75rem; justify-content: flex-end; width: 100%;">
            <button class="btn-premium btn-cancel" @click="cancelClaim" style="padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9375rem; border: none; cursor: pointer; transition: all 0.2s; background: #e2e8f0; color: #475569;">Cancel</button>
            <button class="btn-premium btn-confirm-claim" @click="confirmClaim" style="padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9375rem; border: none; cursor: pointer; transition: all 0.2s; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
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
import localDb from '@/services/localDb';
import PrintableDocument from '@/components/official/PrintableDocument.vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    const showDownloadMenu = ref(false);
    const printableDoc = ref(null);
    const showClaimModal = ref(false);
    const claimantName = ref('');
    
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

    const fetchRequest = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const requestId = route.params.id;
        if (!requestId) throw new Error('No request ID provided');

        if (isFirebaseReady()) {
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

          // Fetch resident user info
          let contact = 'N/A';
          let email = 'N/A';
          let address = 'N/A';
          
          try {
            const userRef = doc(db, 'users', requestData.userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              contact = userData.contact || userData.profile?.contact || 'N/A';
              email = userData.email || 'N/A';
              address = userData.address || userData.profile?.address || 'N/A';
            }
          } catch (err) {
            console.warn("Failed to fetch resident user details in Firestore:", err);
          }

          request.value = {
            id: document.id,
            documentId: requestData.id || document.id,
            ...requestData,
            contact: requestData.contact && requestData.contact !== 'N/A' ? requestData.contact : contact,
            email: requestData.email && requestData.email !== 'N/A' ? requestData.email : email,
            address: requestData.address && requestData.address !== 'N/A' ? requestData.address : address,
            createdAt: requestData.createdAt?.toDate?.() || null,
            updatedAt: requestData.updatedAt?.toDate?.() || null
          };
        } else {
          // Fallback to localDb
          const dbData = localDb.readDb();
          const reqs = dbData.requests || [];
          const foundReq = reqs.find(r => r.id === requestId);
          
          if (!foundReq) {
            throw new Error('Request not found in local database');
          }
          
          let contact = 'N/A';
          let email = 'N/A';
          let address = 'N/A';
          
          const userProfile = dbData.users?.find(u => u.id === foundReq.userId);
          if (userProfile) {
            contact = userProfile.profile?.contact || userProfile.contact || 'N/A';
            email = userProfile.email || 'N/A';
            address = userProfile.profile?.address || userProfile.address || 'N/A';
          }
          
          request.value = {
            id: foundReq.id,
            documentId: foundReq.id,
            ...foundReq,
            contact: foundReq.contact && foundReq.contact !== 'N/A' ? foundReq.contact : contact,
            email: foundReq.email && foundReq.email !== 'N/A' ? foundReq.email : email,
            address: foundReq.address && foundReq.address !== 'N/A' ? foundReq.address : address,
            createdAt: foundReq.createdAt ? new Date(foundReq.createdAt) : null,
            updatedAt: foundReq.updatedAt ? new Date(foundReq.updatedAt) : null
          };
        }

        isLoading.value = false;
      } catch (err) {
        console.error('Error fetching request:', err);
        error.value = err.message || 'Failed to load request details';
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

     const updateRequestStatus = async (status, claimantNameInput = '') => {
      if (!user.value) {
        showToastNotification('You must be logged in to perform this action.', 'fas fa-exclamation-circle', true);
        return;
      }
      
      const residentName = request.value?.userName || 'Resident';

      if (status === 'claimed' && !claimantNameInput) {
        claimantName.value = residentName;
        showClaimModal.value = true;
        return;
      }

      try {
        isUpdating.value = true;
        
        if (!request.value) return;

        const residentEmail = request.value.email || '';
        const requestId = request.value.id || request.value.documentId || 'N/A';
        const documentType = request.value.type || request.value.documentType || 'Document';
        const createdAt = request.value.createdAt || new Date().toISOString();
        const approvedAt = request.value.updatedAt || new Date().toISOString();

        let claimedBy = '';
        if (status === 'claimed') {
          claimedBy = claimantNameInput.trim() || residentName;
        }

        if (isFirebaseReady()) {
          const requestRef = doc(db, 'requests', request.value.id);
          
          const updateData = {
            status: status,
            updatedAt: new Date(),
            updatedBy: user.value.uid,
          };
          if (status === 'claimed') {
            updateData.claimedAt = new Date();
            updateData.claimedBy = claimedBy;
          }
          await updateDoc(requestRef, updateData);
        } else {
          const dbData = localDb.readDb();
          if (!dbData.requests) dbData.requests = [];
          const reqIndex = dbData.requests.findIndex(r => r.id === request.value.id || r.id === request.value.documentId);
          if (reqIndex !== -1) {
            dbData.requests[reqIndex].status = status;
            if (status === 'claimed') {
              dbData.requests[reqIndex].claimedAt = new Date().toISOString();
              dbData.requests[reqIndex].claimedBy = claimedBy;
            }
            dbData.requests[reqIndex].updatedAt = new Date().toISOString();
            localDb.writeDb(dbData);
          }
        }

        request.value.status = status;
        request.value.claimedBy = claimedBy;
        request.value.updatedAt = new Date();
        if (status === 'claimed') {
          request.value.claimedAt = new Date();
        }

        showToastNotification(
          status === 'approved' ? 'Request approved successfully!' : 
          status === 'claimed' ? 'Request marked as claimed successfully!' :
          'Request rejected successfully!',
          status === 'approved' ? 'fas fa-check-circle' : 
          status === 'claimed' ? 'fas fa-handshake' :
          'fas fa-times-circle'
        );

        triggerStatusEmail(status, residentEmail, residentName, requestId, documentType, createdAt, approvedAt, claimedBy, request.value?.onBehalf, request.value?.recipientName, request.value?.recipientRelationship);

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
      showDownloadMenu.value = false;
      currentDocumentData.value = null;
    };

    const confirmClaim = async () => {
      if (!claimantName.value.trim()) {
        showToastNotification('Please enter the name of the person claiming the document.', 'fas fa-exclamation-circle', true);
        return;
      }
      const name = claimantName.value.trim();
      showClaimModal.value = false;
      await updateRequestStatus('claimed', name);
    };

    const cancelClaim = () => {
      showClaimModal.value = false;
      claimantName.value = '';
    };

    const toggleDownloadMenu = () => {
      showDownloadMenu.value = !showDownloadMenu.value;
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
              
              const rawSize = Math.max(img.naturalWidth || img.width || 300, img.naturalHeight || img.height || 300);
              const size = rawSize % 2 === 0 ? rawSize : rawSize + 1; // Ensure even size for clean integer centering
              
              const canvas = document.createElement('canvas');
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

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        return format(timestamp instanceof Date ? timestamp : timestamp.toDate(), 'MMM dd, yyyy hh:mm a');
      } catch {
        return 'Invalid Date';
      }
    };

    const isFirebaseReady = () => !!(db && typeof db === 'object' && typeof db.app !== 'undefined');

    onMounted(() => {
      if (!isFirebaseReady()) {
        const localUser = localDb.getSessionUser();
        if (localUser) {
          user.value = {
            uid: localUser.id,
            email: localUser.email,
            name: localUser.profile?.name || localUser.email,
            role: localUser.role
          };
          fetchRequest();
        } else {
          error.value = 'Please log in to view request details.';
          isLoading.value = false;
        }
        return;
      }
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, (currentUser) => {
          user.value = currentUser;
          if (currentUser) {
            fetchRequest();
          } else {
            error.value = 'Please log in to view request details.';
            isLoading.value = false;
          }
        });
      } catch (err) {
        console.error("Auth init bypassed:", err);
      }
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
      getDocumentTypeLabel,
      showDownloadMenu,
      toggleDownloadMenu,
      downloadDocument,
      printableDoc,
      showClaimModal,
      claimantName,
      confirmClaim,
      cancelClaim
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
  white-space: nowrap;
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

.status-badge.claimed {
  background: #e0f2fe;
  color: #0369a1;
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

/* Custom Claim Modal styling */
.premium-modal {
  width: 100%;
  max-width: 480px;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalTransition 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.claim-prompt-modal {
  max-width: 480px;
}

@keyframes modalTransition {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.premium-modal .modal-header {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);
}

.header-titles h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  margin: 0;
  color: #0f172a;
  text-align: left;
}

.request-id-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.125rem 0 0;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.02em;
  text-align: left;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.premium-modal .modal-body {
  padding: 2rem;
  background: #ffffff;
}

.professional-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1e293b;
  transition: all 0.2s;
  box-sizing: border-box;
}

.professional-input:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.premium-footer {
  background: #f8fafc;
  padding: 1.25rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-premium {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-cancel {
  background: #e2e8f0;
  color: #475569;
}

.btn-cancel:hover {
  background: #cbd5e1;
}

.btn-confirm-claim {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-confirm-claim:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>