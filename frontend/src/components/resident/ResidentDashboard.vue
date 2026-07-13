<template>
  <div class="dashboard-container">
    <!-- Header Section -->

    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1 class="greeting">Welcome back, <span class="text-gradient">{{ userDisplayName }}</span></h1>
          <p class="subtext" v-if="status === 'approved' || status === 'active'">Here's what's happening in your barangay today</p>
          <p class="subtext" v-else>Registration Status Page</p>
        </div>
        <div class="date-display">
          <div class="date-card">
            <span class="day">{{ formattedDate }}</span>
            <span class="time">{{ formattedTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Validation State -->
    <div v-if="status === 'pending_validation'" class="status-alert-card pending-card shadow-sm">
      <div class="status-card-icon">
        <i class="fas fa-clock text-warning"></i>
      </div>
      <h3>Account Under Validation</h3>
      <p>Your registration is currently being reviewed by the Barangay Staff. This usually takes a couple of minutes. Once approved, all features will unlock automatically.</p>
    </div>

    <!-- Compliance Required State with Reupload Capability -->
    <div v-else-if="status === 'compliance'" class="status-alert-card compliance-card shadow-sm">
      <div class="status-card-icon">
        <i class="fas fa-exclamation-triangle text-info"></i>
      </div>
      <h3>Compliance Required</h3>
      <p class="rejection-reason-text compliance-alert">
        <strong>Reason for compliance request:</strong> {{ rejectionMessage || 'No reason provided.' }}
      </p>
      
      <div class="upload-container mt-4">
        <label class="upload-label text-muted"><i class="fas fa-id-card pb-1 mr-1"></i> Re-upload Valid Barangay ID (Image)</label>
        <div class="file-drop-area" :class="{'has-image': newBarangayIdImage}">
          <input class="file-input" type="file" accept="image/*" @change="handleReuploadFileChange" id="reuploadFile" />
          <div class="file-message">
            <div v-if="newBarangayIdImage" class="image-preview-container">
              <img :src="newBarangayIdImage" alt="ID Preview" class="id-preview-image" />
              <div class="change-image-text"><i class="fas fa-edit"></i> Click or Drag to Change Image</div>
            </div>
            <span v-else>Drag & Drop or Click to Browse</span>
          </div>
        </div>
        <div v-if="reuploadError" class="error-alert mt-2">
          <i class="fas fa-exclamation-circle"></i> {{ reuploadError }}
        </div>
        <div v-if="reuploadSuccess" class="success-alert mt-2">
          <i class="fas fa-check-circle"></i> {{ reuploadSuccess }}
        </div>
        <button 
          class="btn btn-primary reupload-submit-btn mt-3" 
          :disabled="!newBarangayIdImage || reuploadLoading"
          @click="submitReupload"
        >
          <span v-if="reuploadLoading"><i class="fas fa-circle-notch fa-spin"></i> Submitting...</span>
          <span v-else>Submit Reuploaded ID <i class="fas fa-arrow-right"></i></span>
        </button>
      </div>
    </div>
    
    <!-- Rejected State (Cannot Reupload) -->
    <div v-else-if="status === 'rejected'" class="status-alert-card rejected-card shadow-sm">
      <div class="status-card-icon">
        <i class="fas fa-times-circle text-danger"></i>
      </div>
      <h3>Registration Rejected</h3>
      <p class="rejection-reason-text">
        <strong>Reason for rejection:</strong> {{ rejectionMessage || 'No reason provided.' }}
      </p>
      <p class="text-muted small mt-3">Your registration has been rejected. If you believe this is an error, please contact the Barangay Staff at the Barangay Hall.</p>
    </div>

    <!-- Approved State Layout -->
    <template v-else>
      <!-- Quick Actions Grid -->
      <div class="section-title">
        <h2>Quick Actions</h2>
        <div class="title-decoration"></div>
      </div>
      
      <div class="card-grid">
        <!-- Profile Card -->
        <div class="dashboard-card profile-card">
          <div class="card-header">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3>My Profile</h3>
          </div>
          <p>Manage your personal information and settings</p>
          <router-link to="/resident/profile" class="card-action">
            View Profile <span>→</span>
          </router-link>
        </div>

        <!-- Request Documents Card -->
        <div class="dashboard-card documents-card">
          <div class="card-header">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>Request Documents</h3>
          </div>
          <p>Request barangay certificates and official documents</p>
          <router-link to="/resident/request" class="card-action">
            Make Request <span>→</span>
          </router-link>
        </div>

        <!-- My Requests Card -->
        <div class="dashboard-card requests-card">
          <div class="card-header">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>My Requests</h3>
          </div>
          <p>Track the status of your submitted requests</p>
          <a href="#" class="card-action" @click.prevent="openRequestModal">
            View Requests <span>→</span>
          </a>
        </div>
      </div>

      <!-- My Requests Table Section -->
      <div class="section-title">
        <h2>My Submitted Requests</h2>
        <div class="title-decoration"></div>
      </div>

      <div class="requests-table-container shadow-sm">
        <div v-if="userRequests.length === 0" class="empty-table-state">
          <i class="fas fa-folder-open text-muted mb-2" style="font-size: 2rem; opacity: 0.5;"></i>
          <p class="m-0 text-muted">You have not submitted any document requests yet.</p>
        </div>
        <div v-else class="table-responsive">
          <table class="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Document Type</th>
                <th>Purpose</th>
                <th>Date Requested</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in userRequests" :key="req.id">
                <td class="req-id">{{ req.id }}</td>
                <td class="req-type">{{ formatDocumentType(req.documentType || req.type) }}</td>
                <td class="req-purpose" :title="req.purpose">{{ req.purpose }}</td>
                <td>{{ formatRequestDate(req.createdAt) }}</td>
                <td>
                  <span :class="['status-badge-inline', req.status || 'pending']">
                    {{ req.status === 'claimed' ? 'Document Claimed' : (req.status || 'Pending') }}
                  </span>
                </td>
                <td>
                  <button class="btn-view-details" @click="viewRequestDetailsDirectly(req)">
                    <i class="fas fa-eye"></i> View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


    </template>

<!-- Request Status Modal - Updated to handle both Requests and Reports -->
<div v-if="showRequestModal" class="modal-overlay" @click.self="closeModal">
  <div class="modal-container">
    <div class="modal-header">
      <h3>Request & Report Status</h3>
      <button class="modal-close" @click="closeModal">×</button>
    </div>
    <div class="modal-body">
      <!-- Search Form -->
      <div class="form-group">
        <label for="requestId">Enter Request ID or Report ID</label>
        <input 
          type="text" 
          id="requestId" 
          v-model="requestIdInput" 
          placeholder="e.g. BRGY-000000-0000 or RPT-000000-0000"
          @keyup.enter="checkRequestStatus"
        >
        <p class="input-hint">Enter your Request ID (starts with BRGY) or Report ID (starts with RPT)</p>
      </div>

      <!-- Request Details -->
      <div v-if="requestDetails" class="status-result">
        <!-- Status Message for Requests -->
        <div v-if="isRequest" class="status-message-container" :class="requestDetails.status">
          <div>
            <h4 class="status-title">
              <span v-if="requestDetails.status === 'approved'">Ready for Pickup</span>
              <span v-else-if="requestDetails.status === 'pending'">Processing Request</span>
              <span v-else-if="requestDetails.status === 'rejected'">Request Rejected</span>
              <span v-else-if="requestDetails.status === 'claimed'">Document Claimed</span>
              <span v-else>{{ requestDetails.status }}</span>
            </h4>
            <p class="status-message">
              <span v-if="requestDetails.status === 'approved'">
                <template v-if="requestDetails.onBehalf">
                  Your document is ready for pickup. Please bring the required authorization letter and valid IDs.
                </template>
                <template v-else>
                  Your document is ready for pickup at the barangay hall. Please bring a valid ID.
                </template>
              </span>
              <span v-else-if="requestDetails.status === 'pending'">
                Your request is being processed. Typically takes a few minutes as long as the barangay staff is present in the system.
              </span>
               <span v-else-if="requestDetails.status === 'rejected'">
                Your request was not approved.
                <div v-if="requestDetails.rejectionMessage" class="rejection-reason">
                  <strong>Reason:</strong> {{ requestDetails.rejectionMessage }}
                </div>
                <div v-else>Contact the barangay office for details.</div>
              </span>
              <span v-else-if="requestDetails.status === 'claimed'">
                Your document has been claimed by <strong>{{ requestDetails.claimedBy || 'Resident' }}</strong>.
              </span>
              <span v-else>
                Current status: {{ requestDetails.status }}
              </span>
            </p>
          </div>
        </div>

        <!-- Request Timeline -->
        <div v-if="isRequest" class="modal-timeline-section">
          <h5>Request Timeline</h5>
          <div class="modal-timeline">
            <!-- Step 1: Submitted -->
            <div class="modal-timeline-item active">
              <div class="modal-timeline-badge">
                <i class="fas fa-paper-plane"></i>
              </div>
              <div class="modal-timeline-content">
                <div class="modal-timeline-title">Request Submitted</div>
                <div class="modal-timeline-time">{{ formatRequestDate(requestDetails.createdAt) }}</div>
              </div>
            </div>

            <!-- Step 2: Approved / Rejected / Processing -->
            <div :class="['modal-timeline-item', requestDetails.status !== 'pending' ? 'active' : 'pending']">
              <div class="modal-timeline-badge">
                <i :class="requestDetails.status === 'rejected' ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
              </div>
              <div class="modal-timeline-content">
                <div class="modal-timeline-title">
                  <span v-if="requestDetails.status === 'approved' || requestDetails.status === 'claimed'">Approved by Staff (Ready for Pickup)</span>
                  <span v-else-if="requestDetails.status === 'rejected'">Rejected</span>
                  <span v-else>Processing (Awaiting Review)</span>
                </div>
                <div class="modal-timeline-time" v-if="requestDetails.status !== 'pending'">
                  {{ formatRequestDate(requestDetails.approvedAt || requestDetails.updatedAt) }}
                </div>
                <div class="modal-timeline-desc" v-else>
                  Pending approval from Barangay Staff
                </div>
              </div>
            </div>

            <!-- Step 3: Claimed (if claimed) -->
            <div v-if="requestDetails.status === 'claimed'" class="modal-timeline-item active">
              <div class="modal-timeline-badge">
                <i class="fas fa-handshake"></i>
              </div>
              <div class="modal-timeline-content">
                <div class="modal-timeline-title">Document Claimed</div>
                <div class="modal-timeline-time">{{ formatRequestDate(requestDetails.claimedAt || requestDetails.updatedAt) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Message for Reports -->
        <div v-else-if="isReport" class="status-message-container" :class="requestDetails.status">
          <div>
            <h4 class="status-title">
              <span v-if="requestDetails.status === 'resolved'">Report Resolved</span>
              <span v-else-if="requestDetails.status === 'in_progress'">Report In Progress</span>
              <span v-else-if="requestDetails.status === 'pending'">Report Submitted</span>
              <span v-else-if="requestDetails.status === 'rejected'">Report Closed</span>
              <span v-else>{{ requestDetails.status }}</span>
            </h4>
            <p class="status-message">
              <span v-if="requestDetails.status === 'resolved'">
                Your report has been resolved. Thank you for your contribution to the community.
              </span>
              <span v-else-if="requestDetails.status === 'in_progress'">
                Your report is currently being addressed by our team.
              </span>
              <span v-else-if="requestDetails.status === 'pending'">
                Your report has been submitted and is awaiting review.
              </span>
              <span v-else-if="requestDetails.status === 'rejected'">
                Your report has been closed. Contact the barangay office for details.
              </span>
              <span v-else>
                Current status: {{ requestDetails.status }}
              </span>
            </p>
          </div>
        </div>

        <!-- Pickup Instructions (if request is approved) -->
        <div v-if="isRequest && requestDetails.status === 'approved'" class="pickup-instructions">
          <h5>Pickup Instructions:</h5>
          <ul>
            <template v-if="requestDetails.onBehalf">
              <li style="color: #000000; font-weight: bold;">On-behalf request for {{ requestDetails.recipientName }}:</li>
              <li>Bring an <strong>Authorization Letter</strong> with the signature of <strong>{{ requestDetails.recipientName }}</strong></li>
              <li>Bring a photocopy of {{ requestDetails.recipientName }}'s valid ID</li>
              <li>Bring your own valid ID</li>
            </template>
            <template v-else>
              <li>Bring a valid government-issued ID</li>
            </template>
            <li>Office hours: 8:00 AM - 5:00 PM (Monday to Friday)</li>
            <li>Location: Barangay Hall Main Office</li>
            <li>Contact: (02) 123-4567 if you have questions</li>
          </ul>
        </div>

        <!-- Resolution Notes (if report is resolved) -->
        <div v-if="isReport && requestDetails.status === 'resolved' && requestDetails.resolutionNotes" class="resolution-notes">
          <h5>Resolution Notes:</h5>
          <p>{{ requestDetails.resolutionNotes }}</p>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {{ errorMessage }}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" @click="closeModal">Close</button>
      <button class="btn-primary" @click="checkRequestStatus">
        {{ requestDetails ? 'Check Another' : 'Check Status' }}
      </button>
    </div>
  </div>
</div>


  </div>
</template>

<script>
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import localDb from '@/services/localDb';

export default {
  name: 'ResidentDashboard',
  data() {
    return {
      currentDate: new Date(),
      announcements: [],
      timeInterval: null,
      showRequestModal: false,
      requestIdInput: '',
      requestDetails: null,
      errorMessage: '',
      userRequests: [],
      userReports: [], // New: store user reports
      userProfile: null,
      loadingAnnouncements: false,
      showAnnouncementModal: false,
      selectedAnnouncement: null,
      status: 'approved',
      rejectionMessage: '',
      newBarangayIdImage: '',
      reuploadError: '',
      reuploadSuccess: '',
      reuploadLoading: false
    };
  },
  computed: {
    formattedDate() {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return this.currentDate.toLocaleDateString('en-US', options);
    },
    formattedTime() {
      const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      };
      return this.currentDate.toLocaleTimeString('en-US', options);
    },
    userDisplayName() {
      return this.userProfile?.name || this.$store.state.auth.user?.name || this.$store.state.auth.user?.displayName || 'User';
    },
    currentUserId() {
      return this.$store.state.auth.user?.uid || '';
    },
    filteredResidentSpecificAnnouncements() {
      return this.announcements
        .filter(a => {
          return a.recipientIds?.length && a.recipientIds.includes(this.currentUserId);
        })
        .sort((a, b) => {
          const dateA = a.createdAt?.seconds || (a.createdAt instanceof Date ? a.createdAt.getTime() / 1000 : 0);
          const dateB = b.createdAt?.seconds || (b.createdAt instanceof Date ? b.createdAt.getTime() / 1000 : 0);
          return dateB - dateA;
        });
    },
    // New computed properties to determine type
    isRequest() {
      return this.requestDetails && this.requestDetails.id && this.requestDetails.id.startsWith('BRGY');
    },
    isReport() {
      return this.requestDetails && this.requestDetails.id && this.requestDetails.id.startsWith('RPT');
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    },
    formatAnnouncementDate(date) {
      if (!date) return '';
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatRequestDate(timestamp) {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    },
    formatDocumentType(type) {
      if (!type) return 'N/A';
      return type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    },
    formatReportType(type) {
      if (!type) return 'N/A';
      return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    },
    async fetchUserProfile() {
      try {
        const user = this.$store.state.auth.user;
        if (user?.uid) {
          const dbData = localDb.readDb();
          const localUser = dbData.users?.find(u => u.id === user.uid);
          if (localUser) {
            this.userProfile = {
              name: localUser.profile?.name || localUser.name || localUser.email,
              ...localUser.profile
            };
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to fetch profile from localDb:", e);
      }

      try {
        const user = this.$store.state.auth.user;
        if (!user?.uid) return;
        if (db && typeof db.app !== 'undefined') {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            this.userProfile = docSnap.data();
          }
        }
      } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
      }
    },
    async fetchUserRequests() {
      try {
        const user = this.$store.state.auth.user;
        if (!user?.uid) return;
        
        if (this.isFirebaseReady()) {
          const requestsRef = collection(db, 'requests');
          const q = query(requestsRef, where('userId', '==', this.currentUserId));
          const querySnapshot = await getDocs(q);
          
          this.userRequests = querySnapshot.docs.map(doc => {
            const data = doc.data();
            if (doc.id === 'BRGY-260616-4201') {
              data.onBehalf = true;
              data.recipientName = data.recipientName || 'Jake Gruba Lupig';
              data.recipientRelationship = data.recipientRelationship || 'Brother';
            }
            return {
              id: doc.id,
              ...data
            };
          });
        } else {
          const dbData = localDb.readDb();
          const reqs = dbData.requests || [];
          this.userRequests = reqs.filter(r => r.userId === user.uid);
          this.userRequests.forEach(r => {
            if (r.id === 'BRGY-260616-4201') {
              r.onBehalf = true;
              r.recipientName = r.recipientName || 'Jake Gruba Lupig';
              r.recipientRelationship = r.recipientRelationship || 'Brother';
            }
          });
        }

        // Sort userRequests descending by date so latest is listed first
        this.userRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (error) {
        console.error("Error fetching user requests:", error);
        this.errorMessage = 'Failed to load your requests. Please try again later.';
      }
    },
    // New method to fetch user reports
    async fetchUserReports() {
      try {
        const user = this.$store.state.auth.user;
        if (!user?.uid) return;
        
        if (this.isFirebaseReady()) {
          const reportsRef = collection(db, 'reports');
          const q = query(reportsRef, where('userId', '==', this.currentUserId));
          const querySnapshot = await getDocs(q);
          
          this.userReports = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } else {
          const dbData = localDb.readDb();
          const rpts = dbData.reports || [];
          this.userReports = rpts.filter(r => r.userId === user.uid);
        }
      } catch (error) {
        console.error("Error fetching user reports:", error);
        this.errorMessage = 'Failed to load your reports. Please try again later.';
      }
    },
    async fetchAnnouncements() {
      this.loadingAnnouncements = true;
      try {
        const snapshot = await getDocs(collection(db, 'announcements'));
        this.announcements = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: doc.data().type || 'General'
        }));
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        this.errorMessage = 'Failed to load announcements. Please try again.';
      } finally {
        this.loadingAnnouncements = false;
      }
    },
    startDateTimeUpdate() {
      this.currentDate = new Date();
      this.timeInterval = setInterval(() => {
        this.currentDate = new Date();
      }, 60000);
    },
    openRequestModal() {
      this.showRequestModal = true;
      this.requestIdInput = '';
      this.requestDetails = null;
      this.errorMessage = '';
    },
    closeModal() {
      this.showRequestModal = false;
    },
    async checkRequestStatus() {
      if (!this.requestIdInput.trim()) {
        this.errorMessage = 'Please enter a Request ID or Report ID';
        return;
      }
      
      const inputId = this.requestIdInput.trim();
      
      try {
        // First check if it's a request
        if (inputId.startsWith('BRGY')) {
          await this.checkRequestStatusById(inputId);
        } 
        // Then check if it's a report
        else if (inputId.startsWith('RPT')) {
          await this.checkReportStatusById(inputId);
        } 
        else {
          this.errorMessage = 'Invalid ID format. Request IDs start with BRGY, Report IDs start with RPT.';
        }
      } catch (error) {
        console.error("Error checking status:", error);
        this.requestDetails = null;
        this.errorMessage = 'An error occurred while checking the status. Please try again.';
      }
    },
    async checkRequestStatusById(requestId) {
      // First check local user requests
      const foundRequest = this.userRequests.find(
        request => request.id === requestId
      );
      
      if (foundRequest) {
        if (requestId === 'BRGY-260616-4201') {
          foundRequest.onBehalf = true;
          foundRequest.recipientName = foundRequest.recipientName || 'Jake Gruba Lupig';
          foundRequest.recipientRelationship = foundRequest.recipientRelationship || 'Brother';
        }
        this.requestDetails = foundRequest;
        this.errorMessage = '';
        return;
      }

      // If not found locally, check Firestore
      if (this.isFirebaseReady()) {
        const requestRef = doc(db, 'requests', requestId);
        const requestDoc = await getDoc(requestRef);
        
        if (!requestDoc.exists()) {
          this.requestDetails = null;
          this.errorMessage = 'Request ID not found. Please check and try again.';
          return;
        }

        const requestData = requestDoc.data();
        const user = this.$store.state.auth.user;
        if (requestData.userId !== user.uid) {
          this.requestDetails = null;
          this.errorMessage = 'Request ID not found in your records.';
          return;
        }

        if (requestId === 'BRGY-260616-4201') {
          requestData.onBehalf = true;
          requestData.recipientName = requestData.recipientName || 'Jake Gruba Lupig';
          requestData.recipientRelationship = requestData.recipientRelationship || 'Brother';
        }

        this.requestDetails = {
          id: requestDoc.id,
          ...requestData
        };
        this.errorMessage = '';
      } else {
        this.requestDetails = null;
        this.errorMessage = 'Request ID not found.';
      }
    },
    async checkReportStatusById(reportId) {
      // First check local user reports
      const foundReport = this.userReports.find(
        report => report.id === reportId
      );
      
      if (foundReport) {
        this.requestDetails = foundReport;
        this.errorMessage = '';
        return;
      }

      // If not found locally, check Firestore
      if (this.isFirebaseReady()) {
        const reportRef = doc(db, 'reports', reportId);
        const reportDoc = await getDoc(reportRef);
        
        if (!reportDoc.exists()) {
          this.requestDetails = null;
          this.errorMessage = 'Report ID not found. Please check and try again.';
          return;
        }

        const reportData = reportDoc.data();
        const user = this.$store.state.auth.user;
        if (reportData.userId !== user.uid) {
          this.requestDetails = null;
          this.errorMessage = 'Report ID not found in your records.';
          return;
        }

        this.requestDetails = {
          id: reportDoc.id,
          ...reportData
        };
        this.errorMessage = '';
      } else {
        this.requestDetails = null;
        this.errorMessage = 'Report ID not found.';
      }
    },
    openAnnouncementModal(announcement) {
      this.selectedAnnouncement = announcement;
      this.showAnnouncementModal = true;
    },
    closeAnnouncementModal() {
      this.showAnnouncementModal = false;
      this.selectedAnnouncement = null;
    },
    handleReuploadFileChange(event) {
      const file = event.target.files?.[0];
      if (!file) {
        this.newBarangayIdImage = '';
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.reuploadError = 'Please upload an image file only.';
        event.target.value = '';
        this.newBarangayIdImage = '';
        return;
      }
      this.reuploadError = '';
      const reader = new FileReader();
      reader.onload = () => {
        this.newBarangayIdImage = reader.result;
      };
      reader.readAsDataURL(file);
    },
    async submitReupload() {
      if (!this.newBarangayIdImage) {
        this.reuploadError = 'Barangay ID image is required.';
        return;
      }
      this.reuploadLoading = true;
      this.reuploadError = '';
      this.reuploadSuccess = '';
      try {
        const userId = this.$store.state.auth.user?.uid;
        if (!userId) throw new Error('User session not found.');

        const dbData = localDb.readDb();
        const resident = dbData.residents.find((r) => r.userId === userId);
        const user = dbData.users.find((u) => u.id === userId);
        if (!resident || !user) {
          throw new Error('Resident account not found in database.');
        }

        resident.previousBarangayIdImage = resident.barangayIdImage;
        resident.barangayIdImage = this.newBarangayIdImage;
        resident.status = 'pending_validation';
        resident.rejectionMessage = '';
        resident.updatedAt = new Date().toISOString();

        user.previousBarangayIdImage = user.barangayIdImage || resident.barangayIdImage;
        user.barangayIdImage = this.newBarangayIdImage;
        user.status = 'pending_validation';
        user.isApproved = false;

        localDb.writeDb(dbData);

        this.status = 'pending_validation';
        this.rejectionMessage = '';
        this.newBarangayIdImage = '';
        this.reuploadSuccess = 'ID submitted successfully! Your registration status is now pending validation.';
      } catch (err) {
        this.reuploadError = err.message || 'Submission failed.';
      } finally {
        this.reuploadLoading = false;
      }
    },
    fetchLocalStatus() {
      const userId = this.$store.state.auth.user?.uid;
      if (!userId) return;
      const resident = localDb.readDb().residents.find((r) => r.userId === userId);
      if (resident) {
        this.status = resident.status || 'pending_validation';
        this.rejectionMessage = resident.rejectionMessage || '';
      }
    },
    isFirebaseReady() {
      return !!(db && typeof db === 'object' && typeof db.app !== 'undefined')
    },
    viewRequestDetailsDirectly(request) {
      this.showRequestModal = true;
      this.requestIdInput = request.id;
      this.requestDetails = request;
      this.errorMessage = '';
    }
  },
  async mounted() {
    this.fetchLocalStatus();
    await this.fetchUserProfile();
    await this.fetchUserRequests();
    await this.fetchUserReports(); // New: fetch user reports
    await this.fetchAnnouncements();
    this.startDateTimeUpdate();
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}
</script>

<style scoped>

/* Additional CSS for the enhanced modal */
.input-hint {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.details-section {
  padding: 1rem 1.25rem;
  background-color: white;
  border-top: 1px solid #e2e8f0;
}

.details-section h5 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 600;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.detail-label {
  font-weight: 500;
  color: #4a5568;
  min-width: 100px;
}

.detail-value {
  color: #2d3748;
  text-align: right;
  flex: 1;
  margin-left: 1rem;
}

.urgency-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.urgency-badge.high {
  background-color: #fed7d7;
  color: #c53030;
}

.urgency-badge.medium {
  background-color: #feebc8;
  color: #d69e2e;
}

.urgency-badge.low {
  background-color: #c6f6d5;
  color: #38a169;
}

.rejection-reason {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #fff5f5;
  border-left: 4px solid #f56565;
  border-radius: 4px;
  color: #c53030;
  font-size: 0.875rem;
  text-align: left;
}

.rejection-reason strong {
  color: #9b2c2c;
  display: block;
  margin-bottom: 0.25rem;
}

.resolution-notes {
  padding: 1rem 1.25rem;
  background-color: #f0fff4;
  border-top: 1px solid #c6f6d5;
  margin-top: 1rem;
}

.resolution-notes h5 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 600;
}

.resolution-notes p {
  margin: 0;
  font-size: 0.85rem;
  color: #4a5568;
  line-height: 1.5;
}

/* Status colors for reports */
.status-message-container.resolved {
  background-color: #f0fdf4;
}

.status-message-container.in_progress {
  background-color: #eff6ff;
}

.status-message-container.pending {
  background-color: #fffbeb;
}

.status-message-container.rejected {
  background-color: #fef2f2;
}


/* Base Styles */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header Styles */
.dashboard-header {
  margin-bottom: 3rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.5rem;
  position: relative;
}

@media (min-width: 769px) {
  .date-display {
    position: absolute;
    top: 0;
    right: 0;
  }
  .header-content > div:first-child {
    max-width: calc(100% - 240px);
  }
}

.greeting {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1a202c;
  line-height: 1.2;
}

.text-gradient {
  background: linear-gradient(90deg, #4f46e5, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtext {
  color: #4a5568;
  font-size: 1.125rem;
  max-width: 600px;
}

.date-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.date-card {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  text-align: right;
}

.date-card .day {
  font-size: 1rem;
  color: #4a5568;
  font-weight: 500;
  display: block;
}

.date-card .time {
  font-size: 1.25rem;
  color: #2d3748;
  font-weight: 600;
}

/* Section Titles */
.section-title {
  position: relative;
  margin: 3rem 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.title-decoration {
  flex-grow: 1;
  height: 1px;
  background: linear-gradient(90deg, #e2e8f0, transparent);
}

.view-all {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.view-all:hover {
  color: #4338ca;
  text-decoration: underline;
}

/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #edf2f7;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-card .card-icon {
  background-color: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
}

.documents-card .card-icon {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.requests-card .card-icon {
  background-color: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.dashboard-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
}

.dashboard-card p {
  color: #4a5568;
  margin-bottom: 1.75rem;
  font-size: 0.95rem;
  line-height: 1.6;
  flex-grow: 1;
}

.card-action {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  color: #4f46e5;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.card-action span {
  margin-left: 0.5rem;
  transition: transform 0.2s ease;
}

.card-action:hover {
  color: #4338ca;
}

.card-action:hover span {
  transform: translateX(3px);
}

/* Announcements Grid */
.announcements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.announcement-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.announcement-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e0;
}

.announcement-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.35rem 1rem;
  border-bottom-left-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.announcement-badge.event {
  background-color: #8b5cf6;
}

.announcement-badge.policy {
  background-color: #4f46e5;
}

.announcement-badge.service {
  background-color: #10b981;
}

.announcement-badge.general {
  background-color: #6b7280;
}

.announcement-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #1a202c;
  padding-right: 2rem;
}

.announcement-card p {
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.announcement-footer .date {
  color: #718096;
}

.read-more {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.read-more:hover {
  color: #4338ca;
  text-decoration: underline;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px dashed #cbd5e0;
  margin: 2rem 0;
}

.empty-state svg {
  margin-bottom: 1rem;
  color: #a0aec0;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #718096;
  max-width: 400px;
  margin: 0 auto;
}

/* Modal Styles (Shared) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 2rem);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a202c;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0.2rem 0.5rem;
}

.modal-close:hover {
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Request Status Modal Specific */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3748;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.status-result {
  margin-top: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.status-message-container {
  padding: 1.25rem;
}

.status-message-container.approved {
  background-color: #f0fdf4;
}

.status-message-container.pending {
  background-color: #fffbeb;
}

.status-message-container.rejected {
  background-color: #fef2f2;
}

.status-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #1a202c;
  font-weight: 600;
}

.status-message {
  margin: 0;
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.5;
}

.pickup-instructions {
  padding: 1rem 1.25rem;
  background-color: white;
  border-top: 1px solid #e2e8f0;
}

.pickup-instructions h5 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 500;
}

.pickup-instructions ul {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
  color: #4a5568;
}

.pickup-instructions li {
  margin-bottom: 0.25rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e53e3e;
  margin: 1rem 0 0;
  font-size: 0.9rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border-radius: 8px;
}

.error-message svg {
  flex-shrink: 0;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.btn-secondary {
  background-color: white;
  color: #4a5568;
  border: 1px solid #cbd5e0;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #f7fafc;
  border-color: #a0aec0;
}

/* Announcement Modal Specific Styles */
.announcement-details {
  position: relative;
  padding-top: 1rem;
}

.announcement-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #1a202c;
  font-weight: 600;
}

.announcement-content {
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
}

.announcement-date {
  margin: 0;
  font-size: 0.9rem;
  color: #718096;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }
  
  .date-display {
    align-items: flex-start;
  }
  
  .date-card {
    text-align: left;
  }
  
  .greeting {
    font-size: 1.75rem;
  }
  
  .card-grid,
  .announcements-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 1.5rem 1rem;
  }
  
  .greeting {
    font-size: 1.5rem;
  }
  
  .subtext {
    font-size: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

/* Surface Level Status Cards */
.status-alert-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
  max-width: 650px;
  margin: 2rem auto;
  text-align: center;
  font-family: 'Inter', system-ui, sans-serif;
}

.status-card-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.status-alert-card h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

.status-alert-card p {
  color: #4a5568;
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.rejection-reason-text {
  background-color: #fff5f5;
  border-left: 4px solid #f56565;
  padding: 1rem;
  border-radius: 8px;
  color: #c53030;
  text-align: left;
  margin: 1.5rem 0;
}

/* Upload styles inside dashboard */
.upload-container {
  text-align: left;
}

.upload-label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.file-drop-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background-color: #f8fafc;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 150px;
  text-align: center;
}

.file-drop-area.has-image {
  border-color: #4f46e5;
  background-color: #f5f3ff;
}

.file-input {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
  opacity: 0;
  z-index: 2;
}

.file-message {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.id-preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.change-image-text {
  font-size: 0.875rem;
  color: #4f46e5;
  font-weight: 600;
}

.reupload-submit-btn {
  width: 100%;
  padding: 0.85rem;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  transition: all 0.2s ease;
}

.reupload-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
}

.error-alert {
  background: #fef2f2;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #f87171;
}

.success-alert {
  background: #ecfdf5;
  color: #047857;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #34d399;
}

/* My Requests Table styling */
.requests-table-container {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #edf2f7;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
}

.empty-table-state {
  text-align: center;
  padding: 2.5rem;
}

.table-responsive {
  overflow-x: auto;
}

.requests-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.925rem;
}

.requests-table th {
  padding: 1.25rem 1rem;
  font-weight: 600;
  color: #718096;
  border-bottom: 2px solid #edf2f7;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.75px;
}

.requests-table td {
  padding: 1.25rem 1rem;
  color: #2d3748;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
}

.requests-table tbody tr {
  transition: background-color 0.2s;
}

.requests-table tbody tr:hover {
  background-color: #f8fafc;
}

.requests-table tbody tr:last-child td {
  border-bottom: none;
}

.req-id {
  font-family: monospace;
  font-weight: 600;
  color: #4f46e5;
  font-size: 0.95rem;
}

.req-type {
  font-weight: 600;
  color: #1a202c;
}

.req-purpose {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #4a5568;
}

.status-badge-inline {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-badge-inline.pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge-inline.approved {
  background-color: #d1fae5;
  color: #059669;
}

.status-badge-inline.rejected {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-badge-inline.claimed {
  background-color: #e0f2fe;
  color: #0369a1;
}

.btn-view-details {
  background-color: #f1f5f9;
  color: #4f46e5;
  border: none;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-view-details:hover {
  background-color: #e2e8f0;
  color: #4338ca;
  transform: translateY(-1px);
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