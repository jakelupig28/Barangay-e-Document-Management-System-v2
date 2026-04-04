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
          <p>The default cleanup certificate layout provided by the system.</p>
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

      <!-- Import Card -->
      <div class="template-import-card" @click="triggerImport">
        <div class="import-dashed-area">
          <div class="import-icon">
            <i class="fas fa-cloud-arrow-up"></i>
          </div>
          <h3>Import Template</h3>
          <p>Upload a ready-made template (JSON/HTML)</p>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none" 
            accept=".json,.html" 
            @change="handleImport"
          />
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="preview-overlay" @click.self="closePreview">
      <div class="preview-modal-container">
        <div class="preview-modal-header">
          <div class="preview-title">
            <i class="fas fa-magnifying-glass"></i>
            <span>{{ previewData.templateName }} Preview</span>
          </div>
          <button class="preview-close-btn" @click="closePreview">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="preview-modal-body custom-scroll">
          <div class="certificate-preview-paper">
            <!-- Mock Certificate Content -->
            <div class="cert-header">
               <div class="cert-logo">LOGO</div>
               <div class="cert-header-text">
                  <div class="cert-line-b">REPUBLIC OF THE PHILIPPINES</div>
                  <div class="cert-line-b">CITY OF MANILA</div>
                  <div class="cert-line-b">BARANGAY 123, DISTRICT IV</div>
               </div>
               <div class="cert-logo">SEAL</div>
            </div>
            
            <div class="cert-title">CERTIFICATE OF RESIDENCY</div>
            
            <div class="cert-body">
               <p class="cert-to-whom">TO WHOM IT MAY CONCERN:</p>
               <p class="cert-main-text">
                 This is to certify that <strong>DEMO RESIDENT NAME</strong>, of legal age, is a bona fide resident of <strong>BARANGAY 123</strong>.
               </p>
               <p class="cert-main-text">
                 This certification is issued upon the request of the above-named person for <strong>LOCAL EMPLOYMENT</strong> purposes.
               </p>
               <p class="cert-main-text">
                 Issued this <strong>31st</strong> day of <strong>March</strong>, <strong>2026</strong> at Barangay 123, District IV, City of Manila.
               </p>
            </div>
            
            <div class="cert-signatures">
               <div class="cert-seal-place">OFFICIAL SEAL</div>
               <div class="cert-captain">
                  <div class="cert-name">HON. JUAN DELA CRUZ</div>
                  <div class="cert-title-sub">Barangay Captain</div>
               </div>
            </div>
          </div>
        </div>
        <div class="preview-modal-footer">
          <button class="btn-use-template" @click="editTemplateFromPreview">
            <i class="fas fa-pen-to-square"></i> Edit template
          </button>
          <button class="btn-close-preview" @click="closePreview">
            Close Preview
          </button>
        </div>
      </div>
    </div>

    <!-- Editor Modal (Simplified Placeholder) -->
    <div v-if="showEditor" class="modal-overlay">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>{{ isEditingDefault ? 'Edit Default Text' : 'Edit Template' }}</h2>
          <button class="close-btn" @click="closeEditor"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <!-- Mock Editor Controls -->
            <div class="form-group">
                <label>Template Name</label>
                <input v-model="currentTemplate.name" class="form-control" type="text" :disabled="isEditingDefault">
            </div>
            
             <div class="form-group">
                <label>Certificate Header Text</label>
                <input v-model="currentTemplate.header" class="form-control" type="text">
            </div>

            <div class="form-group">
                <label>Body Content (Default Content)</label>
                <textarea v-model="currentTemplate.body" class="form-control" rows="5"></textarea>
            </div>
             <div class="alert-info">
                <i class="fas fa-info-circle"></i> This is a simplified editor. In a real implementation, a rich text editor or drag-and-drop builder would appear here.
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
import { ref } from 'vue';

export default {
  name: 'CertificateTemplates',
  setup() {
    const templates = ref([
      // Example initial data
      { id: 1, name: 'Modern Minimal', description: 'Clean layout with blue accents', body: 'This is to certify that...', type: 'residency-certificate' },
      { id: 2, name: 'Traditional Official', description: 'Classic official document style', body: 'OFFICE OF THE PUNONG BARANGAY...', type: 'barangay-clearance' }
    ]);
    
    const showPreview = ref(false);
    const previewData = ref({ templateType: '', templateName: '' });
    const showEditor = ref(false);
    const isEditingDefault = ref(false);
    const currentTemplate = ref({});
    const fileInput = ref(null);

    const previewTemplate = (type, name) => {
        previewData.value = { templateType: type, templateName: name };
        showPreview.value = true;
    };

    const closePreview = () => {
        showPreview.value = false;
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
        isEditingDefault.value = false;
        currentTemplate.value = { name: 'New Template', header: 'OFFICE OF THE BARANGAY', body: '' };
        showEditor.value = true;
    };

    const editDefaultTemplate = () => {
        isEditingDefault.value = true;
        currentTemplate.value = { name: 'System Default', header: 'OFFICE OF THE BARANGAY', body: 'This is to certify that [NAME] is a resident of...' }; // Load actual default values here
        showEditor.value = true;
    };

    const editTemplate = (template) => {
        isEditingDefault.value = false;
        currentTemplate.value = { ...template };
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
            // Logic to save default text overrides
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

    const triggerImport = () => {
        fileInput.value.click();
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Mock import logic
            alert(`Imported ${file.name} successfully! (Mock)`);
            templates.value.push({
                id: Date.now(),
                name: file.name.split('.')[0], 
                description: 'Imported externally',
                body: 'Imported content placeholder'
            });
        }
    };

    return {
      templates,
      showEditor,
      currentTemplate,
      isEditingDefault,
      fileInput,
      showPreview,
      previewData,
      createNewTemplate,
      editDefaultTemplate,
      editTemplate,
      deleteTemplate,
      closeEditor,
      saveTemplate,
      triggerImport,
      handleImport,
      previewTemplate,
      closePreview,
      editTemplateFromPreview
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

/* Import Card */
.template-import-card {
  border: 2px dashed #e2e8f0;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
}

.import-dashed-area {
  padding: 3rem 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.template-import-card:hover {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.02);
  transform: translateY(-5px);
}

.import-icon {
  width: 64px;
  height: 64px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Preview Modal */
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 2rem;
}

.preview-modal-container {
  background: #f8fafc;
  border-radius: 32px;
  width: 100%;
  max-width: 900px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-modal-header {
  padding: 1.5rem 2.5rem;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 800;
  font-size: 1.25rem;
  color: #1e293b;
}

.preview-title i {
  color: #2563eb;
}

.preview-close-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.preview-modal-body {
  flex: 1;
  padding: 3rem;
  overflow-y: auto;
  display: flex;
  justify-content: center;
}

.certificate-preview-paper {
  width: 100%;
  max-width: 800px;
  background: white;
  min-height: 1000px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  padding: 4rem;
}

/* Internal Certificate Mock Styles */
.cert-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   border-bottom: 2px solid #1e3a8a;
   padding-bottom: 2rem;
   margin-bottom: 3rem;
}

.cert-logo {
   width: 80px;
   height: 80px;
   background: #f1f5f9;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 0.75rem;
   font-weight: 700;
   color: #94a3b8;
}

.cert-header-text {
   text-align: center;
}

.cert-line-b {
   font-weight: 800;
   font-size: 0.875rem;
   color: #1e3a8a;
}

.cert-title {
   text-align: center;
   font-size: 1.75rem;
   font-weight: 900;
   color: #1e3a8a;
   text-decoration: underline;
   margin-bottom: 4rem;
   letter-spacing: 0.05em;
}

.cert-body {
   line-height: 2;
   font-size: 1.125rem;
   color: #1e293b;
   margin-bottom: 5rem;
}

.cert-to-whom {
   font-weight: 800;
   margin-bottom: 2rem;
}

.cert-main-text {
   margin-bottom: 1.5rem;
   text-indent: 3rem;
}

.cert-signatures {
   display: flex;
   justify-content: space-between;
   align-items: flex-end;
}

.cert-seal-place {
   width: 140px;
   height: 140px;
   border: 3px solid #1e3a8a;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-weight: 800;
   color: #1e3a8a;
   opacity: 0.6;
   transform: rotate(-15deg);
}

.cert-captain {
   text-align: center;
}

.cert-name {
   font-weight: 800;
   border-bottom: 1px solid #1e293b;
   padding-bottom: 0.25rem;
   margin-bottom: 0.25rem;
   min-width: 250px;
}

.cert-title-sub {
   font-size: 0.875rem;
   color: #64748b;
}

.preview-modal-footer {
  padding: 1.5rem 2.5rem;
  background: white;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content.large {
  max-width: 750px;
  background: #ffffff;
  border-radius: 20px;
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

@media (max-width: 768px) {
  .preview-modal-container { height: 100vh; border-radius: 0; }
  .certificate-preview-paper { padding: 2rem; }
}
</style>