<template>
  <div class="certificate-templates-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Certificate Templates</h1>
        <p class="subtitle">Customize, Edit Text, or Import Certificate Templates</p>
      </div>
      <div class="header-actions">
        <button class="action-btn primary" @click="createNewTemplate">
          <i class="fas fa-plus"></i> Create New
        </button>
      </div>
    </div>

    <!-- Templates Grid -->
    <div class="templates-grid">
      <!-- Default Template Card -->
      <div class="template-provider-card standard" @click="previewTemplate('residency-certificate', 'Standard Certificate')">
        <div class="template-visual">
          <div class="mini-doc">
            <div class="mini-header"></div>
            <div class="mini-line long"></div>
            <div class="mini-line medium"></div>
            <div class="mini-line short"></div>
            <div class="mini-seal"></div>
          </div>
          <span class="preview-tag">System Default</span>
        </div>
        <div class="template-info">
          <h3>Standard Certificate</h3>
          <p>The default clearance certificate layout provided by the system.</p>
        </div>
        <div class="template-footer">
          <button class="btn-template-action" @click.stop="editDefaultTemplate">
            <i class="fas fa-edit"></i> Edit Text
          </button>
        </div>
      </div>

      <!-- User Custom Templates -->
      <div v-for="template in templates" :key="template.id" class="template-provider-card" @click="previewTemplate(template.type || 'residency-certificate', template.name)">
        <div class="template-visual">
          <div class="mini-doc custom">
            <div class="mini-header"></div>
            <div class="mini-line long"></div>
            <div class="mini-line long"></div>
            <div class="mini-line medium"></div>
            <div class="mini-seal"></div>
          </div>
        </div>
        <div class="template-info">
          <h3>{{ template.name }}</h3>
          <p>{{ template.description || 'Custom customized template' }}</p>
        </div>
        <div class="template-footer">
          <button class="btn-template-action" @click.stop="editTemplate(template)">
             <i class="fas fa-pen"></i> Edit
          </button>
          <button class="btn-template-danger" @click.stop="deleteTemplate(template.id)">
             <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Removed Import Template Card -->
    </div>

    <!-- Create / Convert Wizard Modal -->
    <div v-if="showCreateWizard" class="modal-overlay">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>Create Certificate Template</h2>
          <button class="close-btn" @click="closeWizard"><i class="fas fa-times"></i></button>
        </div>
        
        <!-- Step 1: Select / Upload Scan -->
        <div v-if="wizardStep === 1 && !isScanning" class="modal-body wizard-select-body">
          <div class="wizard-tabs">
            <button class="tab-btn active"><i class="fas fa-file-invoice"></i> Convert Scan or Document</button>
            <button class="tab-btn" @click="proceedBlank"><i class="fas fa-pen-nib"></i> Start Blank</button>
          </div>
          
          <h3 class="section-title">Select a Certificate Scan to Convert</h3>
          <div class="preloaded-scans-grid">
            <div class="scan-card" @click="selectPreloadedScan('cert1')">
              <div class="scan-visual-wrapper">
                <img :src="cert1Img" class="scan-thumb" alt="Cert 1">
              </div>
              <div class="scan-info">
                <h4>Barangay Clearance</h4>
                <p>Convert actual clearance scan</p>
              </div>
            </div>
            
            <div class="scan-card" @click="selectPreloadedScan('cert2')">
              <div class="scan-visual-wrapper">
                <img :src="cert3Img" class="scan-thumb" alt="Cert 2">
              </div>
              <div class="scan-info">
                <h4>Certificate of Indigency (General Purpose)</h4>
                <p>Convert actual indigency (general) scan</p>
              </div>
            </div>
            
            <div class="scan-card" @click="selectPreloadedScan('cert3')">
              <div class="scan-visual-wrapper">
                <img :src="cert3Img" class="scan-thumb" alt="Cert 3">
              </div>
              <div class="scan-info">
                <h4>Certificate of Indigency (Financial Assistance)</h4>
                <p>Convert actual indigency (financial assistance) scan</p>
              </div>
            </div>
          </div>
          
          <div class="wizard-or-divider">
            <span>OR UPLOAD YOUR OWN SCAN / DOCUMENT</span>
          </div>
          
          <div class="wizard-upload-box" @click="triggerWizardUpload">
            <div class="upload-box-content">
              <i class="fas fa-cloud-arrow-up upload-box-icon"></i>
              <h3>Upload Scan or Document</h3>
              <p>Supports JPG, PNG, PDF, or Word (.doc, .docx)</p>
              <input 
                type="file" 
                ref="wizardFileInput" 
                style="display: none;" 
                accept="image/png, image/jpeg, application/pdf, .doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                @change="onWizardFileSelected"
              />
            </div>
          </div>
        </div>
        
        <!-- Step 1b: Scanning Animation -->
        <div v-if="isScanning" class="modal-body">
          <div class="scanner-container">
            <div class="scanner-visual" :class="uploadedFileType">
              <template v-if="uploadedFileType === 'pdf'">
                <div class="scanner-file-placeholder pdf-theme">
                  <i class="far fa-file-pdf file-icon"></i>
                  <span class="file-name-placeholder">{{ uploadedFileName }}</span>
                </div>
              </template>
              <template v-else-if="uploadedFileType === 'word'">
                <div class="scanner-file-placeholder word-theme">
                  <i class="far fa-file-word file-icon"></i>
                  <span class="file-name-placeholder">{{ uploadedFileName }}</span>
                </div>
              </template>
              <template v-else>
                <img :src="activeScanImgUrl || cert1Img" class="scanner-img" alt="Scanning Document">
              </template>
              <div class="scanning-bar"></div>
            </div>
            <div class="scan-progress-bar">
              <div class="scan-progress-fill" :style="{ width: scanProgress + '%' }"></div>
            </div>
            <p class="scan-status-text">{{ scanStatus }}</p>
          </div>
        </div>
        
        <!-- Step 2: Edit & Live Preview Converted Certificate (no scroll!) -->
        <div v-if="wizardStep === 2 && !isScanning" class="modal-body side-by-side">
          <div class="editor-form-pane custom-scroll">
            <div class="form-group">
              <label>Template Name</label>
              <input v-model="currentTemplate.name" class="form-control" type="text" />
            </div>
            <div class="form-group">
              <label>City / Barangay Header</label>
              <textarea v-model="currentTemplate.header" class="form-control" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Certificate Body Content</label>
              <textarea v-model="currentTemplate.body" class="form-control" rows="5"></textarea>
            </div>
            <div class="form-group">
              <label>Signatory Captain</label>
              <input v-model="currentTemplate.signatory" class="form-control" type="text" />
            </div>
          </div>
          <div class="editor-preview-pane">
            <div class="certificate-preview-paper">
              <div class="cert-outer-double-frame">
                <div class="cert-inner-frame">
                  <!-- Header -->
                  <div class="cert-preview-header">
                    <div class="cert-preview-logo-left">
                      <img :src="brgyLogo" class="circle-logo-small" alt="Brgy Logo">
                    </div>
                    <div class="cert-preview-logo-center">
                      <img :src="manilaLogo" class="circle-logo-small" alt="Manila Logo">
                    </div>
                    <div class="cert-preview-logo-right">
                      <img :src="bagongPhiLogo" class="circle-logo-small" alt="Bagong Pilipinas Logo">
                    </div>
                    <div class="cert-preview-header-text">
                      <div class="cert-p-line-1">REPUBLIC OF THE PHILIPPINES</div>
                      <div class="cert-p-line-2">CITY OF MANILA</div>
                      <div class="cert-p-line-sub">Vicente G. Cruz St. Corner Lardizabal Extension</div>
                      <div class="cert-p-line-3">BARANGAY 424 ZONE 43</div>
                      <div class="cert-p-line-dist">DISTRICT IV, MANILA</div>
                    </div>
                  </div>
                  
                  <!-- Divider -->
                  <div class="cert-header-divider"></div>
                  
                  <!-- Columns -->
                  <div class="cert-columns-container">
                    <!-- Right Column -->
                    <div class="cert-right-column">
                      <div class="cert-preview-title">{{ currentTemplate.name.toUpperCase().replace(' (EXTRACTED)', '').replace(' (CONVERTED)', '').replace(' (FINANCIAL ASSISTANCE)', '') }}</div>
                      <div class="cert-preview-no">{{ getCertificateNumber(currentTemplate.name, currentTemplate.type) }}</div>
                      <div class="cert-preview-body">
                        <p class="cert-p-to-whom">TO WHOM IT MAY CONCERN:</p>
                        <p v-for="(paragraph, idx) in getParagraphs(currentTemplate.body, currentTemplate.name, currentTemplate.type)" :key="idx" class="cert-p-main-text" :class="{ 'no-indent': (currentTemplate.type && currentTemplate.type.includes('financial')) || (currentTemplate.name && currentTemplate.name.toLowerCase().includes('financial')) }" v-html="formatParagraph(paragraph)"></p>
                      </div>
                      <div class="cert-preview-signatures-row">
                        <div class="cert-p-captain">
                          <div class="cert-p-name">{{ currentTemplate.signatory || 'ANGELITO G. DULA' }}</div>
                          <div class="cert-p-title-sub">Barangay Chairman</div>
                        </div>
                        <div class="cert-p-seal-official">
                          <div class="seal-inner-text">The certificate issued by Barangay 424, Zone 43 is not valid without a dry seal.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button v-if="wizardStep === 2" class="btn-secondary" @click="goBackToStep1">Back</button>
          <button v-else class="btn-secondary" @click="closeWizard">Cancel</button>
          <button v-if="wizardStep === 2" class="btn-primary" @click="saveWizardTemplate">Save Template</button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="preview-overlay" @click.self="closePreview">
      <!-- Top Bar -->
      <div class="preview-top-bar">
        <div class="preview-title-light">
          <i class="fas fa-magnifying-glass"></i>
          <span>{{ previewData.templateName }} Preview</span>
        </div>
        <div class="preview-top-actions">
          <button class="btn-top-action primary" @click="editTemplateFromPreview">
            <i class="fas fa-pen-to-square"></i> Edit Template
          </button>
          <button class="btn-top-action close" @click="closePreview" title="Close Preview">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Preview Body -->
      <div class="preview-canvas custom-scroll">
        <div 
          class="certificate-preview-paper paper-preview-full"
          :style="{ transform: `scale(${zoomLevel})` }"
        >
          <div class="cert-outer-double-frame">
            <div class="cert-inner-frame">
              <!-- Header -->
              <div class="cert-preview-header">
                <div class="cert-preview-logo-left">
                  <img :src="brgyLogo" class="circle-logo-small" alt="Brgy Logo">
                </div>
                <div class="cert-preview-logo-center">
                  <img :src="manilaLogo" class="circle-logo-small" alt="Manila Logo">
                </div>
                <div class="cert-preview-logo-right">
                  <img :src="bagongPhiLogo" class="circle-logo-small" alt="Bagong Pilipinas Logo">
                </div>
                <div class="cert-preview-header-text">
                  <div class="cert-p-line-1">REPUBLIC OF THE PHILIPPINES</div>
                  <div class="cert-p-line-2">CITY OF MANILA</div>
                  <div class="cert-p-line-sub">Vicente G. Cruz St. Corner Lardizabal Extension</div>
                  <div class="cert-p-line-3">BARANGAY 424 ZONE 43</div>
                  <div class="cert-p-line-dist">DISTRICT IV, MANILA</div>
                </div>
              </div>
              
              <!-- Divider -->
              <div class="cert-header-divider"></div>
              
              <!-- Columns -->
              <div class="cert-columns-container">
                <!-- Right Column -->
                <div class="cert-right-column">
                  <div class="cert-preview-title">{{ previewData.templateName.toUpperCase().replace(' (EXTRACTED)', '').replace(' (CONVERTED)', '').replace(' (FINANCIAL ASSISTANCE)', '') }}</div>
                  <div class="cert-preview-no">{{ getCertificateNumber(previewData.templateName, previewData.templateType) }}</div>
                  <div class="cert-preview-body">
                    <p class="cert-p-to-whom">TO WHOM IT MAY CONCERN:</p>
                    <p v-for="(paragraph, idx) in getParagraphs(previewData.body || 'This is to certify that [RESIDENT NAME] is a resident of [RESIDENT ADDRESS]...', previewData.templateName, previewData.templateType)" :key="idx" class="cert-p-main-text" :class="{ 'no-indent': (previewData.templateType && previewData.templateType.includes('financial')) || (previewData.templateName && previewData.templateName.toLowerCase().includes('financial')) }" v-html="formatParagraph(paragraph)"></p>
                  </div>
                  <div class="cert-preview-signatures-row">
                    <div class="cert-p-captain">
                      <div class="cert-p-name">{{ previewData.signatory || 'ANGELITO G. DULA' }}</div>
                      <div class="cert-p-title-sub">Barangay Chairman</div>
                    </div>
                    <div class="cert-p-seal-official">
                      <div class="seal-inner-text">The certificate issued by Barangay 424, Zone 43 is not valid without a dry seal.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Zoom Controls -->
      <div class="floating-controls">
        <button class="float-zoom-btn" @click="zoomOut" title="Zoom Out" :disabled="zoomLevel <= 0.6">
          <i class="fas fa-minus"></i>
        </button>
        <span class="float-zoom-text">{{ Math.round(zoomLevel * 100) }}%</span>
        <button class="float-zoom-btn" @click="zoomIn" title="Zoom In" :disabled="zoomLevel >= 2.0">
          <i class="fas fa-plus"></i>
        </button>
        <div class="float-zoom-divider"></div>
        <button class="float-zoom-btn reset" @click="resetZoom" title="Reset Zoom">
          <i class="fas fa-arrows-rotate"></i>
        </button>
      </div>
    </div>

    <!-- Editor Modal -->
    <div v-if="showEditor" class="modal-overlay">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>{{ isEditingDefault ? 'Edit Default Text' : 'Edit Template' }}</h2>
          <button class="close-btn" @click="closeEditor"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body side-by-side">
          <div class="editor-form-pane custom-scroll">
            <div class="form-group">
              <label>Template Name</label>
              <input v-model="currentTemplate.name" class="form-control" type="text" :disabled="isEditingDefault">
            </div>
            <div class="form-group">
              <label>City / Barangay Header</label>
              <textarea v-model="currentTemplate.header" class="form-control" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Certificate Body Content</label>
              <textarea v-model="currentTemplate.body" class="form-control" rows="5"></textarea>
            </div>
            <div class="form-group">
              <label>Signatory Captain</label>
              <input v-model="currentTemplate.signatory" class="form-control" type="text" />
            </div>
          </div>
          <div class="editor-preview-pane">
            <div class="certificate-preview-paper">
              <div class="cert-outer-double-frame">
                <div class="cert-inner-frame">
                  <!-- Header -->
                  <div class="cert-preview-header">
                    <div class="cert-preview-logo-left">
                      <img :src="brgyLogo" class="circle-logo-small" alt="Brgy Logo">
                    </div>
                    <div class="cert-preview-logo-center">
                      <img :src="manilaLogo" class="circle-logo-small" alt="Manila Logo">
                    </div>
                    <div class="cert-preview-logo-right">
                      <img :src="bagongPhiLogo" class="circle-logo-small" alt="Bagong Pilipinas Logo">
                    </div>
                    <div class="cert-preview-header-text">
                      <div class="cert-p-line-1">REPUBLIC OF THE PHILIPPINES</div>
                      <div class="cert-p-line-2">CITY OF MANILA</div>
                      <div class="cert-p-line-sub">Vicente G. Cruz St. Corner Lardizabal Extension</div>
                      <div class="cert-p-line-3">BARANGAY 424 ZONE 43</div>
                      <div class="cert-p-line-dist">DISTRICT IV, MANILA</div>
                    </div>
                  </div>
                  
                  <!-- Divider -->
                  <div class="cert-header-divider"></div>
                  
                  <!-- Columns -->
                  <div class="cert-columns-container">
                    <!-- Right Column -->
                    <div class="cert-right-column">
                      <div class="cert-preview-title">{{ currentTemplate.name.toUpperCase().replace(' (EXTRACTED)', '').replace(' (CONVERTED)', '').replace(' (FINANCIAL ASSISTANCE)', '') }}</div>
                      <div class="cert-preview-no">{{ getCertificateNumber(currentTemplate.name, currentTemplate.type) }}</div>
                      <div class="cert-preview-body">
                        <p class="cert-p-to-whom">TO WHOM IT MAY CONCERN:</p>
                        <p v-for="(paragraph, idx) in getParagraphs(currentTemplate.body, currentTemplate.name, currentTemplate.type)" :key="idx" class="cert-p-main-text" :class="{ 'no-indent': (currentTemplate.type && currentTemplate.type.includes('financial')) || (currentTemplate.name && currentTemplate.name.toLowerCase().includes('financial')) }" v-html="formatParagraph(paragraph)"></p>
                      </div>
                      <div class="cert-preview-signatures-row">
                        <div class="cert-p-captain">
                          <div class="cert-p-name">{{ currentTemplate.signatory || 'ANGELITO G. DULA' }}</div>
                          <div class="cert-p-title-sub">Barangay Chairman</div>
                        </div>
                        <div class="cert-p-seal-official">
                          <div class="seal-inner-text">The certificate issued by Barangay 424, Zone 43 is not valid without a dry seal.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeEditor">Cancel</button>
          <button class="btn-primary" @click="saveTemplate">Save Changes</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, watch } from 'vue';
import brgyLogo from '@/assets/brgy logo.jpg';
import manilaLogo from '@/assets/manila logo.png';
import bagongPhiLogo from '@/assets/bagong phi logo.png';
import cert1Img from '@/assets/cert1.jpeg';
import cert2Img from '@/assets/cert2.jpeg';
import cert3Img from '@/assets/cert3.jpeg';

export default {
  name: 'CertificateTemplates',
  setup() {
    const defaultTemplates = [
      { 
        id: 1, 
        name: 'Barangay Certificate', 
        description: 'Standard official Barangay Certificate', 
        body: 'This is to certify that [RESIDENT NAME] who resides at [RESIDENT ADDRESS] is a bonafide resident.\n\nHe/She is a person of good moral character and a law-abiding citizen. As per our record, no derogatory or criminal record has been filed with this barangay as of this date.\n\nThis certification is being issued upon the request of the above-named person for [PURPOSE].', 
        signatory: 'HON. ANGELITO G. DULA', 
        type: 'barangay-certificate' 
      },
      { 
        id: 2, 
        name: 'Certificate of Indigency (Financial Assistance)', 
        description: 'Certificate of Indigency for availing financial assistance', 
        body: 'This is to certify that [RESIDENT NAME], of legal age, is a bona fide resident of [RESIDENT ADDRESS] and belongs to an indigent family.\n\nThis certification is being issued upon the request of the above-named person for the purpose of availing of FINANCIAL ASSISTANCE.', 
        signatory: 'HON. ANGELITO G. DULA', 
        type: 'certificate-of-indigency-financial' 
      },
      { 
        id: 3, 
        name: 'Certificate of Indigency (General Purpose)', 
        description: 'Certificate of Indigency for general purposes', 
        body: 'This is to certify that [RESIDENT NAME], of legal age, is a bona fide resident of [RESIDENT ADDRESS] and belongs to an indigent family without any permanent source of income.\n\nThis certification is being issued upon the request of the above-named person for [PURPOSE].', 
        signatory: 'HON. HON. ANGELITO G. DULA', 
        type: 'certificate-of-indigency-general' 
      }
    ];

    const storedTemplates = localStorage.getItem('barangay_templates');
    let parsedTemplates = storedTemplates ? JSON.parse(storedTemplates) : defaultTemplates;
    parsedTemplates = parsedTemplates.map(template => {
        if (template.id === 1 && (template.body.includes('derogatory record filed') || template.body.includes('Barangay 424 Zone 43') || template.body.includes('bona fide resident of [RESIDENT ADDRESS].'))) {
            return defaultTemplates[0];
        }
        if (template.id === 2 && (template.body.includes('He/She is one of those') || template.body.includes('Barangay 424 Zone 43'))) {
            return defaultTemplates[1];
        }
        if (template.id === 3 && (template.body.includes('whatever purpose it may serve') || template.body.includes('Barangay 424 Zone 43'))) {
            return defaultTemplates[2];
        }
        return template;
    });
    const templates = ref(parsedTemplates);

    watch(templates, (newVal) => {
      localStorage.setItem('barangay_templates', JSON.stringify(newVal));
    }, { deep: true });
    
    const showPreview = ref(false);
    const previewData = ref({ templateType: '', templateName: '' });
    const showEditor = ref(false);
    const isEditingDefault = ref(false);
    const currentTemplate = ref({});
    const zoomLevel = ref(0.8);

    const zoomIn = () => {
        if (zoomLevel.value < 2.0) zoomLevel.value = Math.round((zoomLevel.value + 0.1) * 10) / 10;
    };

    const zoomOut = () => {
        if (zoomLevel.value > 0.6) zoomLevel.value = Math.round((zoomLevel.value - 0.1) * 10) / 10;
    };

    const resetZoom = () => {
        zoomLevel.value = 0.8;
    };

    // Wizard State
    const showCreateWizard = ref(false);
    const wizardStep = ref(1);
    const isScanning = ref(false);
    const scanStatus = ref('');
    const scanProgress = ref(0);
    const activeScanImgUrl = ref(null);
    const wizardFileInput = ref(null);
    const uploadedFileType = ref('image'); // 'image', 'pdf', 'word'
    const uploadedFileName = ref('');

    const closeWizard = () => {
        showCreateWizard.value = false;
        wizardStep.value = 1;
        isScanning.value = false;
        activeScanImgUrl.value = null;
        uploadedFileType.value = 'image';
        uploadedFileName.value = '';
    };

    const triggerWizardUpload = () => {
        wizardFileInput.value.click();
    };

    const onWizardFileSelected = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileName = file.name;
            const fileExt = fileName.split('.').pop().toLowerCase();
            uploadedFileName.value = fileName;
            
            if (fileExt === 'pdf') {
                uploadedFileType.value = 'pdf';
                activeScanImgUrl.value = null;
            } else if (fileExt === 'doc' || fileExt === 'docx') {
                uploadedFileType.value = 'word';
                activeScanImgUrl.value = null;
            } else {
                uploadedFileType.value = 'image';
                activeScanImgUrl.value = URL.createObjectURL(file);
            }
            startScan('custom', fileName.substring(0, fileName.lastIndexOf('.')) || fileName);
        }
    };

    const selectPreloadedScan = (type) => {
        uploadedFileType.value = 'image';
        uploadedFileName.value = '';
        if (type === 'cert1') activeScanImgUrl.value = cert1Img;
        if (type === 'cert2') activeScanImgUrl.value = cert3Img;
        if (type === 'cert3') activeScanImgUrl.value = cert3Img;
        startScan(type);
    };

    const startScan = (type, fileName) => {
        isScanning.value = true;
        
        let progressSteps = [];
        if (uploadedFileType.value === 'pdf') {
            progressSteps = [
                { status: 'Reading PDF document structure...', progress: 15, delay: 600 },
                { status: 'Extracting PDF text fields and metadata...', progress: 45, delay: 600 },
                { status: 'Mapping document contents to certificate sections...', progress: 80, delay: 500 }
            ];
        } else if (uploadedFileType.value === 'word') {
            progressSteps = [
                { status: 'Parsing DOCX xml layers...', progress: 20, delay: 600 },
                { status: 'Extracting paragraph styles and headings...', progress: 50, delay: 600 },
                { status: 'Molding content block layouts into certificate...', progress: 85, delay: 500 }
            ];
        } else {
            progressSteps = [
                { status: 'Detecting certificate layout...', progress: 15, delay: 500 },
                { status: 'Performing OCR text extraction...', progress: 45, delay: 500 },
                { status: 'Structuring sections (Header, Body, Signatures)...', progress: 85, delay: 400 }
            ];
        }
        
        scanStatus.value = progressSteps[0].status;
        scanProgress.value = progressSteps[0].progress;
        
        setTimeout(() => {
            scanStatus.value = progressSteps[1].status;
            scanProgress.value = progressSteps[1].progress;
            
            setTimeout(() => {
                scanStatus.value = progressSteps[2].status;
                scanProgress.value = progressSteps[2].progress;
                
                setTimeout(() => {
                    isScanning.value = false;
                    wizardStep.value = 2;
                                if (type === 'cert1') {
                        currentTemplate.value = {
                            name: 'Barangay Certificate (Extracted)',
                            header: 'REPUBLIC OF THE PHILIPPINES\nCITY OF MANILA\nBARANGAY 424 ZONE 43',
                            body: 'This is to certify that [RESIDENT NAME] who resides at [RESIDENT ADDRESS] is a bonafide resident.\n\nHe/She is a person of good moral character and a law-abiding citizen. As per our record, no derogatory or criminal record has been filed with this barangay as of this date.\n\nThis certification is being issued upon the request of the above-named person for [PURPOSE].',
                            signatory: 'ANGELITO G. DULA'
                        };
                    } else if (type === 'cert2') {
                        currentTemplate.value = {
                            name: 'Certificate of Indigency (General Purpose) (Extracted)',
                            header: 'REPUBLIC OF THE PHILIPPINES\nCITY OF MANILA\nBARANGAY 424 ZONE 43',
                            body: 'This is to certify that [RESIDENT NAME], of legal age, with address at: [RESIDENT ADDRESS], is a bonafide resident of this barangay and belongs to an indigent family without any permanent source of income.\n\nThis certification is being issued upon the request of the above-named person for [PURPOSE].\n\nIssued this 9th day of October 2025 at the Office of the Punong Barangay, Sampaloc Manila.',
                            signatory: 'ANGELITO G. DULA'
                        };
                    } else if (type === 'cert3') {
                        currentTemplate.value = {
                            name: 'Certificate of Indigency (Financial Assistance) (Extracted)',
                            header: 'REPUBLIC OF THE PHILIPPINES\nCITY OF MANILA\nBARANGAY 424 ZONE 43',
                            body: 'This is to certify that [RESIDENT NAME], of legal age, is a bona fide resident of [RESIDENT ADDRESS] and belongs to an indigent family.\n\nThis certification is being issued upon the request of the above-named person for the purpose of availing of FINANCIAL ASSISTANCE.\n\nIssued this 9th day of October 2025 at the Office of the Punong Barangay, Sampaloc Manila.',
                            signatory: 'ANGELITO G. DULA'
                        };
                    } else {
                        const baseName = fileName || 'Uploaded Document';
                        const lowerName = baseName.toLowerCase();
                        let mockBody = '';
                        
                        if (lowerName.includes('clearance') || lowerName.includes('certificate')) {
                            mockBody = 'This is to certify that [RESIDENT NAME] who resides at [RESIDENT ADDRESS] is a bonafide resident.\n\nHe/She is a person of good moral character and a law-abiding citizen. As per our record, no derogatory or criminal record has been filed with this barangay as of this date.\n\nThis certification is being issued upon the request of the above-named person for [PURPOSE].';
                        } else if (lowerName.includes('residency') || lowerName.includes('resident')) {
                            mockBody = 'This is to certify that [RESIDENT NAME] who resides at [RESIDENT ADDRESS] is a bonafide resident.\n\nHe/She is a person of good moral character and a law-abiding citizen. As per our record, no derogatory or criminal record has been filed with this barangay as of this date.\n\nThis certification is being issued upon the request of the above-named person for [PURPOSE].';
                        } else if (lowerName.includes('indigency') || lowerName.includes('indigent')) {
                            mockBody = 'This is to certify that [RESIDENT NAME], of legal age, with address at: [RESIDENT ADDRESS], is a bonafide resident of this barangay and belongs to an indigent family without any permanent source of income.\n\nThis certification is being issued upon the request of the above-named person for [PURPOSE].\n\nIssued this 9th day of October 2025 at the Office of the Punong Barangay, Sampaloc Manila.';
                        } else if (lowerName.includes('moral') || lowerName.includes('character')) {
                            mockBody = 'This is to certify that [RESIDENT NAME], a resident of Barangay 424 Zone 43, City of Manila, is known to be a person of good moral character, law-abiding, and peaceful citizen of this community.\n\nThis certification is issued for [PURPOSE].';
                        } else {
                            mockBody = `This certificate template has been parsed and generated from the uploaded document [${baseName}].\n\nThis is to certify that [RESIDENT NAME] has successfully completed the requirements for the official document.\n\nIssued upon request of the interested party for [PURPOSE].`;
                        }
 
                        currentTemplate.value = {
                            name: `${baseName} (Extracted)`,
                            header: 'REPUBLIC OF THE PHILIPPINES\nCITY OF MANILA\nBARANGAY 424 ZONE 43',
                            body: mockBody,
                            signatory: 'ANGELITO G. DULA'
                        };
                    }
                }, progressSteps[2].delay);
            }, progressSteps[1].delay);
        }, progressSteps[0].delay);
    };

    const goBackToStep1 = () => {
        wizardStep.value = 1;
        activeScanImgUrl.value = null;
        uploadedFileType.value = 'image';
        uploadedFileName.value = '';
    };

    const proceedBlank = () => {
        closeWizard();
        showEditor.value = true;
        isEditingDefault.value = false;
        currentTemplate.value = { name: 'New Template', header: 'REPUBLIC OF THE PHILIPPINES\nCITY OF MANILA\nBARANGAY 424 ZONE 43', body: '', signatory: 'ANGELITO G. DULA' };
    };

    const saveWizardTemplate = () => {
        templates.value.push({
            id: Date.now(),
            name: currentTemplate.value.name,
            description: 'OCR Converted Scan',
            body: currentTemplate.value.body,
            signatory: currentTemplate.value.signatory,
            type: 'custom'
        });
        closeWizard();
    };
    
    const previewTemplate = (type, name) => {
        let template = templates.value.find(t => t.name === name);
        if (!template && name === 'Standard Certificate') {
            template = {
                name: 'Standard Certificate',
                body: 'This is to certify that [RESIDENT NAME], of legal age, a resident of Barangay 424 Zone 43, Sampaloc, Manila, is a person of good moral character and has no pending derogatory record in this office.',
                signatory: 'ANGELITO G. DULA'
            };
        }
        previewData.value = {
            templateType: type,
            templateName: name,
            body: template ? template.body : '',
            signatory: template ? (template.signatory || 'ANGELITO G. DULA') : 'ANGELITO G. DULA'
        };
        zoomLevel.value = 0.8;
        showPreview.value = true;
    };

    const closePreview = () => {
        showPreview.value = false;
        zoomLevel.value = 1.0;
    };

    const editTemplateFromPreview = () => {
        const template = templates.value.find(t => t.name === previewData.value.templateName);
        if (template) {
            editTemplate(template);
        } else {
            editDefaultTemplate();
        }
        closePreview();
    };

    const createNewTemplate = () => {
        showCreateWizard.value = true;
        wizardStep.value = 1;
        isScanning.value = false;
        activeScanImgUrl.value = null;
        currentTemplate.value = { name: 'New Template', header: 'REPUBLIC OF THE PHILIPPINES\nCITY OF MANILA\nBARANGAY 424 ZONE 43', body: '', signatory: 'ANGELITO G. DULA' };
    };

    const editDefaultTemplate = () => {
        isEditingDefault.value = true;
        currentTemplate.value = { name: 'System Default', header: 'REPUBLIC OF THE PHILIPPINES\nCITY OF MANILA\nBARANGAY 424 ZONE 43', body: 'This is to certify that [RESIDENT NAME], of legal age, a resident of Barangay 424 Zone 43, Sampaloc, Manila, is a person of good moral character and has no pending derogatory record in this office.', signatory: 'ANGELITO G. DULA' };
        showEditor.value = true;
    };

    const editTemplate = (template) => {
        isEditingDefault.value = false;
        currentTemplate.value = { ...template, signatory: template.signatory || 'ANGELITO G. DULA' };
        showEditor.value = true;
    };

    const deleteTemplate = (id) => {
        if(confirm('Are you sure you want to delete this template?')) {
            templates.value = templates.value.filter(t => t.id !== id);
        }
    };

    const closeEditor = () => {
        showEditor.value = false;
        currentTemplate.value = {};
    };

    const saveTemplate = () => {
        if (isEditingDefault.value) {
            alert('Default template text updated!');
        } else {
             const index = templates.value.findIndex(t => t.id === currentTemplate.value.id);
             if (index !== -1) {
                 templates.value[index] = { ...currentTemplate.value };
             } else {
                 templates.value.push({ ...currentTemplate.value, id: Date.now() });
             }
        }
        closeEditor();
    };

    const getCertificateNumber = (templateName, templateType) => {
      const name = (templateName || '').toLowerCase();
      const type = (templateType || '').toLowerCase();
      if (type.includes('financial') || name.includes('financial')) {
        return 'CERT NO. 893-25';
      }
      if (type.includes('general') || name.includes('general')) {
        return 'CERT NO. 878-25';
      }
      if (type === 'certificate-of-indigency' || type === 'indigency-certificate') {
        return 'CERT NO. 878-25'; // legacy general
      }
      // Default / Barangay Certificate / Residency Certificate / legacy clearance
      return 'CERT NO. 917-25';
    };

    const getParagraphs = (text, name = '', type = '') => {
      if (!text) return [];
      let cleaned = text;
      const isFinancial = (name || '').toLowerCase().includes('financial') || 
                          (type || '').toLowerCase().includes('financial') ||
                          (currentTemplate.value.name || '').toLowerCase().includes('financial') ||
                          (currentTemplate.value.type || '').toLowerCase().includes('financial');
      if (isFinancial) {
        cleaned = cleaned.replace(/He\/She is one of those who are in need of financial assistance\.?\s*/gi, '');
      }
      return cleaned.split(/\r?\n/).filter(p => p.trim() !== '');
    };

    const formatParagraph = (text) => {
      if (!text) return '';
      
      const now = new Date();
      const getDaySuffix = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
        }
      };
      const currentDay = `${now.getDate()}${getDaySuffix(now.getDate())}`;
      const currentMonth = now.toLocaleString('en-US', { month: 'long' });
      const currentYear = now.getFullYear();

      const presentDateStr = `${currentDay} day of ${currentMonth}, ${currentYear}`;
      let formatted = text
        .replace(/Issued this\s+\d+(?:st|nd|rd|th)?\s+day\s+of\s+[A-Za-z]+,?\s+\d{4}/gi, `Issued this ${presentDateStr}`)
        .replace(/Issued this\s+\[current_date\]/gi, `Issued this ${presentDateStr}`)
        .replace(/Issued this\s+\[date\]/gi, `Issued this ${presentDateStr}`)
        .replace(/Issued this\s+\[day\]\s+day\s+of\s+\[month\],?\s+\[year\]/gi, `Issued this ${presentDateStr}`)
        .replace(/\[current_date\]/gi, presentDateStr)
        .replace(/\[date\]/gi, presentDateStr)
        .replace(/\[resident name\]/ig, '<strong>[RESIDENT NAME]</strong>')
        .replace(/\[resident address\]/ig, '<strong>[RESIDENT ADDRESS]</strong>')
        .replace(/\[purpose\]/ig, '<strong>[PURPOSE]</strong>');
      formatted = formatted.replace(/(financial assistance)/ig, '<strong>$1</strong>');
      return formatted;
    };

    return {
      getParagraphs,
      formatParagraph,
      templates,
      showEditor,
      currentTemplate,
      isEditingDefault,
      showPreview,
      previewData,
      createNewTemplate,
      editDefaultTemplate,
      editTemplate,
      deleteTemplate,
      closeEditor,
      saveTemplate,
      previewTemplate,
      closePreview,
      editTemplateFromPreview,
      showCreateWizard,
      wizardStep,
      isScanning,
      scanStatus,
      scanProgress,
      activeScanImgUrl,
      wizardFileInput,
      uploadedFileType,
      uploadedFileName,
      brgyLogo,
      manilaLogo,
      bagongPhiLogo,
      cert1Img,
      cert2Img,
      cert3Img,
      closeWizard,
      triggerWizardUpload,
      onWizardFileSelected,
      selectPreloadedScan,
      startScan,
      goBackToStep1,
      proceedBlank,
      saveWizardTemplate,
      zoomLevel,
      zoomIn,
      zoomOut,
      resetZoom,
      getCertificateNumber
    }
  }
}
</script>

<style scoped>
.certificate-templates-page {
  padding: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  color: #1e293b;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.025em;
}

.subtitle {
  color: #64748b;
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn.primary {
  background: #2563eb;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  background: #1d4ed8;
  box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.3);
}

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.template-provider-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.template-provider-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: rgba(37, 99, 235, 0.1);
}

.template-visual {
  height: 220px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background 0.3s;
}

.template-provider-card:hover .template-visual {
  background: #f1f5f9;
}

.preview-tag {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: #1e293b;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.025em;
}

/* Mini Document Visual */
.mini-doc {
  width: 130px;
  height: 160px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 1px #e2e8f0;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transform: translateY(0);
  transition: transform 0.4s;
}

.template-provider-card:hover .mini-doc {
  transform: translateY(-5px);
}

.mini-header {
  height: 12px;
  background: #f1f5f9;
  border-radius: 2px;
  margin-bottom: 4px;
}

.mini-line {
  height: 6px;
  background: #f8fafc;
  border-radius: 1px;
}

.mini-line.long { width: 100%; }
.mini-line.medium { width: 70%; }
.mini-line.short { width: 40%; }

.mini-seal {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid #2563eb;
  margin-top: auto;
  align-self: flex-end;
  opacity: 0.6;
}

.template-info {
  padding: 1.5rem;
  flex-grow: 1;
}

.template-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.template-info p {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}

.template-footer {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
}

.btn-template-action, .btn-template-danger {
  flex: 1;
  padding: 0.625rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #475569;
}

.btn-template-action:hover {
  background: #f1f5f9;
  color: #2563eb;
  border-color: #dbeafe;
}

.btn-template-danger {
  flex: 0 0 46px;
  color: #64748b;
}

.btn-template-danger:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fee2e2;
}

/* Scanner Visual File Themes */
.scanner-visual.pdf {
  border-color: #ef4444;
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.15);
}

.scanner-visual.word {
  border-color: #2563eb;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.15);
}

.scanner-file-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 1.5rem;
  box-sizing: border-box;
  text-align: center;
}

.scanner-file-placeholder.pdf-theme {
  background: #fff5f5;
  color: #ef4444;
}

.scanner-file-placeholder.word-theme {
  background: #f0f4ff;
  color: #2563eb;
}

.scanner-file-placeholder .file-icon {
  font-size: 3.5rem;
  margin-bottom: 1.25rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08));
}

.file-name-placeholder {
  font-size: 0.8125rem;
  font-weight: 700;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  color: #475569;
}

/* Preview Modal */
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  z-index: 1100;
  padding: 0;
  box-sizing: border-box;
}

.preview-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2.5rem;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 10;
}

.preview-title-light {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.15rem;
  color: #f8fafc;
}

.preview-title-light i {
  color: #3b82f6;
}

.preview-top-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-top-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-top-action.primary {
  background: #2563eb;
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
}

.btn-top-action.primary:hover {
  background: #1d4ed8;
}

.btn-top-action.close {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  justify-content: center;
}

.btn-top-action.close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.preview-canvas {
  flex: 1;
  height: 100%;
  min-height: 0;
  padding: 2rem 1.5rem 6rem 1.5rem;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 5;
}

.paper-preview-full {
  height: auto !important;
  max-height: none !important;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  transform-origin: top center;
  transition: transform 0.2s ease-out;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55);
}

.floating-controls {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 20;
}

.float-zoom-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.float-zoom-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.float-zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.float-zoom-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #f8fafc;
  min-width: 50px;
  text-align: center;
}

.float-zoom-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 0.25rem;
}

.certificate-preview-paper {
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  aspect-ratio: 1 / 1.414;
  background: white;
  padding: 4.4cqw 5cqw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  container-type: inline-size;
  font-family: "Times New Roman", Times, Georgia, serif;
  color: #0f172a;
}

.cert-outer-double-frame {
  border: 3.5px double #1e3a8a;
  padding: 0.5cqw;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex: 1;
}

.cert-inner-frame {
  border: 1px solid #1e3a8a;
  padding: 3cqw;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex: 1;
}

/* Internal Certificate Mock Styles */
.cert-preview-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-bottom: 1cqw;
  min-height: 13.8cqw;
  box-sizing: border-box;
}

.cert-preview-logo-left {
  position: absolute;
  left: 7.5cqw;
  top: 0;
  bottom: 0;
  margin-top: auto;
  margin-bottom: auto;
  width: 11.9cqw;
  height: 11.9cqw;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.cert-preview-logo-left img {
  width: 140%;
  height: 140%;
  object-fit: cover;
}

.cert-preview-logo-right {
  position: absolute;
  right: 7.5cqw;
  top: 0;
  bottom: 0;
  margin-top: auto;
  margin-bottom: auto;
  width: 11.9cqw;
  height: 11.9cqw;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cert-preview-logo-right img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cert-preview-header-text {
  width: 100%;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 15.6cqw;
  box-sizing: border-box;
}

.cert-preview-logo-center {
  width: 6.9cqw;
  height: 6.9cqw;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5cqw;
}

.cert-preview-logo-center img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cert-p-line-1 {
  font-weight: 700;
  font-size: 1.8cqw;
  color: #1e3a8a;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.cert-p-line-2 {
  font-weight: 700;
  font-size: 1.8cqw;
  color: #1e3a8a;
  line-height: 1.2;
}

.cert-p-line-sub {
  font-weight: 600;
  font-size: 1.4cqw;
  color: #475569;
  line-height: 1.2;
  white-space: nowrap;
}

.cert-p-line-3 {
  font-weight: 800;
  font-size: 2.1cqw;
  color: #1e3a8a;
  line-height: 1.2;
}

.cert-p-line-dist {
  font-weight: 700;
  font-size: 1.8cqw;
  color: #1e3a8a;
  line-height: 1.2;
}

.cert-header-divider {
  width: 100%;
  height: 1.5px;
  background-color: #1e3a8a;
  margin-top: 0.5cqw;
}

.cert-columns-container {
  display: flex;
  flex: 1;
  margin-top: 1.5cqw;
  min-height: 0;
}

.cert-left-column {
  width: 33%;
  border-right: 1px solid #1e3a8a;
  padding-right: 1.5cqw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.cert-sb-title {
  font-size: 2.4cqw;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1cqw;
  color: #1e3a8a;
  letter-spacing: -0.01em;
}

.cert-sb-subtitle {
  font-size: 2.2cqw;
  font-weight: 800;
  text-align: center;
  margin: 0;
  color: #1e3a8a;
}

.cert-official-list {
  display: flex;
  flex-direction: column;
  gap: 0.8cqw;
}

.cert-official-item {
  text-align: center;
  line-height: 1.35;
}

.cert-official-item.leader {
  margin-bottom: 0;
}

.cert-official-item.secretary-treasurer {
  margin-top: 0;
}

.cert-off-name {
  font-size: 2.1cqw;
  font-weight: 800;
  color: #0f172a;
}

.cert-off-title {
  font-size: 1.7cqw;
  color: #1e293b;
  font-weight: 700;
}

.cert-left-qr-container {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 1cqw;
}

.cert-mini-qr {
  width: 9cqw;
  height: 9cqw;
  border: 1px solid #1e3a8a;
  padding: 0.5cqw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.qr-row {
  display: flex;
  justify-content: space-between;
  height: 15%;
}

.qr-row span {
  width: 15%;
  height: 100%;
  background: transparent;
}

.qr-row span.black {
  background: #1e3a8a;
}

.cert-right-column {
  width: 100%;
  padding: 0 5.6cqw;
  display: flex;
  flex-direction: column;
  text-align: left;
  box-sizing: border-box;
}

.cert-preview-title {
  font-size: 3.7cqw;
  font-weight: 800;
  color: #1e3a8a;
  text-align: center;
  margin-top: 4.4cqw;
  margin-bottom: 1cqw;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.2;
  align-self: center;
}

.cert-preview-no {
  font-size: 2.1cqw;
  font-weight: 700;
  color: #1e293b;
  text-align: right;
  margin-bottom: 3.1cqw;
  letter-spacing: 0.02em;
}

.cert-preview-body {
  font-size: 2.5cqw;
  line-height: 1.85;
  color: #1e293b;
  text-align: justify;
  flex: 1;
}

.cert-p-to-whom {
  font-weight: 800;
  margin-bottom: 1cqw;
}

.cert-p-main-text {
  margin-bottom: 4cqw;
  text-indent: 0;
  white-space: pre-line;
  line-height: 1.85;
  text-align: justify;
}

.cert-preview-signatures-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
  padding-bottom: 3.8cqw;
}

.cert-p-captain {
  text-align: center;
  width: 55%;
}

.cert-p-name {
  font-weight: 800;
  font-size: 2.1cqw;
  border-top: 1.5px solid #1e3a8a;
  padding-top: 0.5cqw;
  margin-bottom: 0.25cqw;
  color: #1e3a8a;
  white-space: nowrap;
}

.cert-p-title-sub {
  font-size: 1.6cqw;
  color: #64748b;
  font-weight: 700;
}

.cert-p-seal-official {
  width: 13.8cqw;
  height: 13.8cqw;
  border: 1.5px dashed #1e3a8a;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  padding: 0.75cqw;
  box-sizing: border-box;
  transform: rotate(-10deg);
  opacity: 0.7;
}

.seal-outer-text {
  font-size: 1.1cqw;
  font-weight: 800;
  color: #1e3a8a;
  line-height: 1.1;
  text-transform: uppercase;
}

.seal-inner-text {
  font-size: 1.2cqw;
  font-weight: 700;
  color: #1e3a8a;
  line-height: 1.1;
  margin-top: 0.2cqw;
}



.btn-use-template {
  background: #2563eb;
  color: white;
  padding: 0.75rem 1.75rem;
  border-radius: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
}

.btn-close-preview {
  background: #f1f5f9;
  color: #64748b;
  padding: 0.75rem 1.75rem;
  border-radius: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

/* Custom Scroll */
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

/* Modal Content (Editor) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.5); /* Slightly darker */
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  padding: 1.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content.large {
  max-width: 960px;
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
}

.modal-header h2 { 
  font-weight: 700; 
  font-size: 1.25rem; 
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.modal-body { 
  padding: 2rem; 
  overflow-y: auto; 
  background: #fdfdfd;
}

/* Side by Side layout */
.modal-body.side-by-side {
  display: flex;
  gap: 2rem;
  padding: 1.5rem 2rem;
  height: 60vh;
  overflow: hidden;
}

.editor-form-pane {
  flex: 1.2;
  overflow-y: auto;
  padding-right: 1.25rem;
}

.editor-preview-pane {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  overflow: hidden;
}

/* Form Styling */
.form-group { margin-bottom: 1.5rem; }
.form-group label { 
  display: block; 
  font-weight: 600; 
  font-size: 0.875rem; 
  margin-bottom: 0.5rem; 
  color: #334155; 
}

.form-control { 
  width: 100%; 
  padding: 0.75rem 1rem; 
  border-radius: 10px; 
  border: 1px solid #cbd5e1; 
  font-family: inherit; 
  font-size: 0.9375rem; 
  color: #1e293b;
  background: #ffffff;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-control:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

.alert-info {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  color: #1e40af;
  font-size: 0.875rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 1.5rem;
  line-height: 1.5;
}

.alert-info i {
  font-size: 1.25rem;
  color: #3b82f6;
  margin-top: 0.125rem;
}

.modal-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background: #ffffff;
}

.btn-secondary {
  padding: 0.5rem 1.25rem;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

.btn-primary {
  padding: 0.5rem 1.25rem;
  background: #2563eb;
  border: 1px solid transparent;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-primary:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

/* Wizard Selection Body */
.wizard-select-body {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.wizard-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.tab-btn.active {
  color: #2563eb;
  background: #eff6ff;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
}

.preloaded-scans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.scan-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scan-card:hover {
  transform: translateY(-4px);
  border-color: #2563eb;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.15);
}

.scan-visual-wrapper {
  height: 120px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid #e2e8f0;
}

.scan-thumb {
  width: 90%;
  height: 90%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.scan-info {
  padding: 1rem;
}

.scan-info h4 {
  font-size: 0.9375rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #0f172a;
}

.scan-info p {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.wizard-or-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.wizard-or-divider::before,
.wizard-or-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.wizard-or-divider:not(:empty)::before {
  margin-right: 1em;
}

.wizard-or-divider:not(:empty)::after {
  margin-left: 1em;
}

.wizard-upload-box {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s;
}

.wizard-upload-box:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.upload-box-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.upload-box-icon {
  font-size: 2rem;
  color: #2563eb;
  margin-bottom: 0.75rem;
}

.upload-box-content h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.upload-box-content p {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
}

/* Scanner Animation UI */
.scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  height: 50vh;
}

.scanner-visual {
  position: relative;
  width: 180px;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #3b82f6;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
  margin-bottom: 2rem;
}

.scanner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}

.scanning-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to bottom, rgba(59, 130, 246, 0), #3b82f6);
  box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6;
  animation: scan 2s infinite linear;
}

@keyframes scan {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}

.scan-progress-bar {
  width: 250px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.scan-progress-fill {
  height: 100%;
  background: #2563eb;
  transition: width 0.3s ease;
}

.scan-status-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #64748b;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@media (max-width: 768px) {
  .preview-modal-container { height: 100vh; border-radius: 0; }
  .certificate-preview-paper { padding: 2rem; }
}

.cert-p-main-text.no-indent {
  text-indent: 0 !important;
}

/* Printable Layout Overrides for Full Preview Modal (Exact Copy from PrintableDocument.vue) */
.paper-preview-full {
  max-width: 800px !important;
  width: 100% !important;
  padding: 35px 40px !important;
}

.paper-preview-full .cert-outer-double-frame {
  border: 3.5px double #1e3a8a !important;
  padding: 4px !important;
}

.paper-preview-full .cert-inner-frame {
  border: 1px solid #1e3a8a !important;
  padding: 24px !important;
}

.paper-preview-full .cert-preview-header {
  padding-bottom: 8px !important;
  min-height: 110px !important;
}

.paper-preview-full .cert-preview-logo-left {
  left: 60px !important;
  width: 95px !important;
  height: 95px !important;
}

.paper-preview-full .cert-preview-logo-right {
  right: 60px !important;
  width: 95px !important;
  height: 95px !important;
}

.paper-preview-full .cert-preview-logo-center {
  width: 55px !important;
  height: 55px !important;
  margin-bottom: 12px !important;
}

.paper-preview-full .cert-preview-header-text {
  padding: 0 125px !important;
}

.paper-preview-full .cert-p-line-1 {
  font-size: 0.9rem !important;
  font-weight: 700;
  color: #1e3a8a;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.paper-preview-full .cert-p-line-2 {
  font-size: 0.9rem !important;
  font-weight: 700;
  color: #1e3a8a;
  line-height: 1.2;
}

.paper-preview-full .cert-p-line-sub {
  font-size: 0.7rem !important;
  font-weight: 600;
  color: #475569;
  line-height: 1.2;
}

.paper-preview-full .cert-p-line-3 {
  font-size: 1.05rem !important;
  font-weight: 800;
  color: #1e3a8a;
  line-height: 1.2;
}

.paper-preview-full .cert-p-line-dist {
  font-size: 0.9rem !important;
  font-weight: 700;
  color: #1e3a8a;
  line-height: 1.2;
}

.paper-preview-full .cert-header-divider {
  width: 100% !important;
  height: 1.5px !important;
  background-color: #1e3a8a !important;
  margin-top: 4px !important;
}

.paper-preview-full .cert-columns-container {
  margin-top: 10px !important;
}

.paper-preview-full .cert-left-column {
  padding-right: 10px !important;
}

.paper-preview-full .cert-sb-title {
  font-size: 1.05rem !important;
  margin-bottom: 6px !important;
}

.paper-preview-full .cert-sb-subtitle {
  font-size: 0.95rem !important;
}

.paper-preview-full .cert-off-name {
  font-size: 0.88rem !important;
}

.paper-preview-full .cert-off-title {
  font-size: 0.72rem !important;
}

.paper-preview-full .cert-right-column {
  padding: 0 45px !important;
}

.paper-preview-full .cert-preview-title {
  font-size: 1.85rem !important;
  margin-top: 35px !important;
  margin-bottom: 8px !important;
}

.paper-preview-full .cert-preview-no {
  font-size: 1.05rem !important;
  margin-bottom: 25px !important;
}

.paper-preview-full .cert-preview-body {
  font-size: 1.25rem !important;
  line-height: 1.85 !important;
}

.paper-preview-full .cert-p-to-whom {
  margin-bottom: 8px !important;
}

.paper-preview-full .cert-p-main-text {
  margin-bottom: 32px !important;
}

.paper-preview-full .cert-preview-signatures-row {
  padding-bottom: 30px !important;
}

.paper-preview-full .cert-p-name {
  font-size: 1.05rem !important;
  border-top: 1.5px solid #1e3a8a !important;
  padding-top: 4px !important;
  margin-bottom: 2px !important;
}

.paper-preview-full .cert-p-title-sub {
  font-size: 0.8rem !important;
}

.paper-preview-full .cert-p-seal-official {
  width: 110px !important;
  height: 110px !important;
  border: 1.5px dashed #1e3a8a !important;
}

.paper-preview-full .seal-inner-text {
  font-size: 0.58rem !important;
  margin-top: 2px !important;
}
</style>