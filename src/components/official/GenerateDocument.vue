<template>
  <div class="generate-document-page">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
        Back to Request
      </button>
      <div class="header-content">
        <h1>Generate Document</h1>
        <p class="subtitle">Preview and generate official document</p>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary" @click="handlePrint">
          <i class="fas fa-print"></i>
          Print Document
        </button>
        <button class="action-btn primary" @click="handleDownload">
          <i class="fas fa-download"></i>
          Download PDF
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading document data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Error Loading Document</h3>
      <p>{{ error }}</p>
      <button class="action-btn primary" @click="$router.back()">Go Back</button>
    </div>

    <!-- Document Preview -->
    <div v-else-if="requestData" class="document-preview">
      <!-- Document Controls -->
      <div class="preview-controls">
        <div class="control-group">
          <label>Paper Size:</label>
          <select v-model="paperSize" class="form-select">
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
          </select>
        </div>
        <div class="control-group">
          <label>Orientation:</label>
          <select v-model="orientation" class="form-select">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <div class="control-group">
          <label>Margin:</label>
          <select v-model="margin" class="form-select">
            <option value="normal">Normal</option>
            <option value="narrow">Narrow</option>
            <option value="wide">Wide</option>
          </select>
        </div>
      </div>

      <!-- Printable Document (via Component) -->
      <div
        class="printable-area"
        :class="[paperSize, orientation, 'margin-' + margin]"
        ref="printableArea"
      >
        <PrintableDocument
          :requestData="requestData"
          :barangayInfo="barangayInfo"
          :currentDate="currentDate"
          :validityDate="validityDate"
          :getDocumentTypeLabel="getDocumentTypeLabel"
          :getDocumentTitle="getDocumentTitle"
          :isBusinessDocument="isBusinessDocument"
        />
      </div>

      <!-- Action Buttons -->
      <div class="preview-actions">
        <button class="action-btn secondary" @click="$router.back()">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button class="action-btn" @click="handleMarkAsPrinted">
          <i class="fas fa-check"></i> Mark as Printed
        </button>
        <button class="action-btn primary" @click="handlePrint">
          <i class="fas fa-print"></i> Print Now
        </button>
        <button class="action-btn success" @click="handleDownload">
          <i class="fas fa-file-pdf"></i> Download PDF
        </button>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format, addMonths } from 'date-fns';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase/config';
import PrintableDocument from '@/components/official/PrintableDocument.vue';

export default {
  name: 'GenerateDocument',
  components: { PrintableDocument },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const requestData = ref(null);
    const isLoading = ref(true);
    const error = ref(null);
    const printableArea = ref(null);

    // Document settings
    const paperSize = ref('a4');
    const orientation = ref('portrait');
    const margin = ref('normal');

    // Toast
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastIcon = ref('');
    const isToastError = ref(false);

    // Barangay Info (from Firestore)
    const barangayInfo = ref({
      name: '',
      city: '',
      province: '',
      captain: '',
      secretary: '',
      contact: '',
    });

    const auth = getAuth();
    const user = ref(null);

    // Computed
    const currentDate = computed(() => format(new Date(), 'MMMM dd, yyyy'));
    const validityDate = computed(() => format(addMonths(new Date(), 6), 'MMMM dd, yyyy'));

    const isBusinessDocument = computed(() =>
      requestData.value?.type === 'business-permit'
    );

    const getDocumentTypeLabel = (type) => {
      const types = {
        'business-permit': 'Business Permit',
        'barangay-clearance': 'Barangay Clearance',
        'barangay-id': 'Barangay ID',
        'residency-certificate': 'Certificate of Residency',
        'indigency-certificate': 'Certificate of Indigency',
        'other': 'Other Document',
      };
      return types[type] || type;
    };

    const getDocumentTitle = (type) => {
      const titles = {
        'business-permit': 'BARANGAY BUSINESS PERMIT',
        'barangay-clearance': 'BARANGAY CLEARANCE',
        'barangay-id': 'BARANGAY IDENTIFICATION',
        'residency-certificate': 'CERTIFICATE OF RESIDENCY',
        'indigency-certificate': 'CERTIFICATE OF INDIGENCY',
        'other': 'BARANGAY CERTIFICATION',
      };
      return titles[type] || 'BARANGAY CERTIFICATION';
    };

    // Fetch Barangay Settings from Firestore
    const fetchBarangaySettings = async () => {
      try {
        const configRef = doc(db, 'config', 'barangaySettings');
        const snap = await getDoc(configRef);

        if (snap.exists()) {
          const d = snap.data();
          barangayInfo.value = {
            name: d.barangayName || d.name || 'Your Barangay',
            city: d.city || 'Your City',
            province: d.province || 'Your Province',
            captain: d.captain || d.captainName || 'Hon. Barangay Captain Name',
            secretary: d.secretary || 'Barangay Secretary Name',
            contact: d.contact || '(000) 000-0000',
          };
        } else {
          console.warn('No barangaySettings document found – using defaults');
          // Fallback defaults
          barangayInfo.value = {
            name: 'Your Barangay',
            city: 'Your City',
            province: 'Your Province',
            captain: 'Hon. Barangay Captain Name',
            secretary: 'Barangay Secretary Name',
            contact: '(000) 000-0000',
          };
        }
      } catch (err) {
        console.error('Failed to load barangay settings', err);
        // Keep defaults
        barangayInfo.value = {
          name: 'Your Barangay',
          city: 'Your City',
          province: 'Your Province',
          captain: 'Hon. Barangay Captain Name',
          secretary: 'Barangay Secretary Name',
          contact: '(000) 000-0000',
        };
      }
    };

    // Fetch Request
    const fetchRequestData = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const requestId = route.params.id;
        if (!requestId) throw new Error('No request ID provided');

        let document = null;

        const q = query(collection(db, 'requests'), where('id', '==', requestId));
        const snap = await getDocs(q);

        if (!snap.empty) {
          document = snap.docs[0];
        } else {
          const docRef = doc(db, 'requests', requestId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) document = docSnap;
          else throw new Error('Request not found');
        }

        const data = document.data();
        requestData.value = {
          id: document.id,
          documentId: data.id || document.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
        };

        if (requestData.value.status !== 'approved')
          throw new Error('This request has not been approved yet');

        isLoading.value = false;
      } catch (err) {
        console.error(err);
        error.value = err.message || 'Failed to load document data';
        isLoading.value = false;
      }
    };

    // Print
    const handlePrint = () => {
      if (!printableArea.value) return;

      const printWin = window.open('', '_blank');
      const content = printableArea.value.innerHTML;

      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${getDocumentTitle(requestData.value.type)}</title>
            <style>
              @page { size: ${paperSize.value} ${orientation.value}; margin: 0; }
              body { margin:0; padding:0; font-family:'Times New Roman',serif; }
              .printable-area { width:100%; padding:0; box-shadow:none; }
              ${getMarginCSS()}
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 500);
    };

    // Margin CSS helper
    const getMarginCSS = () => {
      const margins = {
        normal: 'padding: 20mm;',
        narrow: 'padding: 10mm;',
        wide: 'padding: 30mm;',
      };
      return `.margin-${margin.value} { ${margins[margin.value]} }`;
    };

    // Download (simulated)
    const handleDownload = async () => {
      showToastNotification('Preparing PDF...', 'fas fa-spinner fa-spin');
      setTimeout(() => {
        showToastNotification('PDF ready!', 'fas fa-file-pdf');
        const a = document.createElement('a');
        a.href = '#';
        a.download = `Barangay_${getDocumentTypeLabel(requestData.value.type)}_${requestData.value.documentId}.pdf`;
        a.click();
        showToastNotification('Download started!', 'fas fa-check-circle');
      }, 1200);
    };

    // Mark as Printed
    const handleMarkAsPrinted = async () => {
      if (!user.value || !requestData.value) return;
      try {
        await updateDoc(doc(db, 'requests', requestData.value.id), {
          printed: true,
          printedAt: new Date(),
          printedBy: user.value.uid,
          updatedAt: new Date(),
        });
        showToastNotification('Marked as printed', 'fas fa-check-circle');
        setTimeout(() => router.back(), 1500);
      } catch (e) {
        showToastNotification('Update failed', 'fas fa-exclamation-circle', true);
      }
    };

    // Toast
    const showToastNotification = (msg, icon, err = false) => {
      toastMessage.value = msg;
      toastIcon.value = icon;
      isToastError.value = err;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    // Auth & Mount
    onMounted(() => {
      onAuthStateChanged(auth, async (u) => {
        user.value = u;

        if (u) {
          // Load barangay settings first
          await fetchBarangaySettings();
          // Then load request data
          await fetchRequestData();
        } else {
          error.value = 'Please log in to generate documents.';
          isLoading.value = false;
        }
      });
    });

    return {
      requestData,
      isLoading,
      error,
      printableArea,
      paperSize,
      orientation,
      margin,
      barangayInfo,
      showToast,
      toastMessage,
      toastIcon,
      isToastError,
      currentDate,
      validityDate,
      isBusinessDocument,
      getDocumentTypeLabel,
      getDocumentTitle,
      handlePrint,
      handleDownload,
      handleMarkAsPrinted,
    };
  },
};
</script>

<style scoped>
/* === ALL ORIGINAL STYLES (unchanged) === */
.generate-document-page {
  min-height: 100vh;
  background: #f5f5f5;
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
  gap: 1.5rem;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
}

.back-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.header-content h1 {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.loading-state,
.error-state {
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

.preview-controls {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  min-width: 120px;
}

.printable-area {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

/* Paper Sizes */
.printable-area.a4.portrait { width: 210mm; min-height: 297mm; }
.printable-area.a4.landscape { width: 297mm; min-height: 210mm; }
.printable-area.letter.portrait { width: 216mm; min-height: 279mm; }
.printable-area.letter.landscape { width: 279mm; min-height: 216mm; }
.printable-area.legal.portrait { width: 216mm; min-height: 356mm; }
.printable-area.legal.landscape { width: 356mm; min-height: 216mm; }

/* Margins */
.margin-normal { padding: 20mm; }
.margin-narrow { padding: 10mm; }
.margin-wide { padding: 30mm; }

/* Portrait fallback padding */
.printable-area.portrait { padding: 20mm; }
.printable-area.landscape { padding: 15mm; }

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
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

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-btn.primary { background: #007bff; color: white; }
.action-btn.secondary { background: #6c757d; color: white; }
.action-btn.success { background: #28a745; color: white; }

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

.toast.show { transform: translateY(0); opacity: 1; }
.toast.error { background: #dc3545; }

/* Print Styles */
@media print {
  .generate-document-page { background: white; padding: 0; }
  .page-header, .preview-controls, .preview-actions, .toast { display: none !important; }
  .printable-area {
    box-shadow: none;
    margin: 0;
    width: 100% !important;
    min-height: auto !important;
    padding: 0 !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .generate-document-page { padding: 1rem; }
  .page-header { flex-direction: column; align-items: flex-start; padding: 1.25rem; }
  .preview-controls, .preview-actions { flex-direction: column; }
  .action-btn { width: 100%; justify-content: center; }
  .printable-area { transform: scale(0.85); transform-origin: top center; }
}
</style>