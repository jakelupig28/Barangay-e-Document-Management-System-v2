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
      <div class="template-card default">
        <div class="card-preview">
          <i class="fas fa-file-alt fa-3x"></i>
          <span class="preview-badge">System Default</span>
        </div>
        <div class="card-content">
          <h3>Standard Certificate</h3>
          <p>The default cleanup certificate layout provided by the system.</p>
        </div>
        <div class="card-actions">
          <button class="btn-outline" @click="editDefaultTemplate">
            <i class="fas fa-edit"></i> Edit Text
          </button>
        </div>
      </div>

      <!-- User Custom Templates -->
      <div v-for="template in templates" :key="template.id" class="template-card">
        <div class="card-preview" :style="{ backgroundImage: `url(${template.previewUrl || ''})` }">
          <div v-if="!template.previewUrl" class="placeholder-preview">
            <i class="fas fa-file-invoice"></i>
          </div>
        </div>
        <div class="card-content">
          <h3>{{ template.name }}</h3>
          <p>{{ template.description || 'Custom customized template' }}</p>
        </div>
        <div class="card-actions">
          <button class="btn-outline" @click="editTemplate(template)">
             <i class="fas fa-pen"></i> Edit
          </button>
          <button class="btn-danger-outline" @click="deleteTemplate(template.id)">
             <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Import Card -->
      <div class="template-card import" @click="triggerImport">
        <div class="import-content">
          <div class="icon-circle">
            <i class="fas fa-file-import"></i>
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
      { id: 1, name: 'Modern Minimal', description: 'Clean layout with blue accents', body: 'This is to certify that...' },
      { id: 2, name: 'Traditional Official', description: 'Classic official document style', body: 'OFFICE OF THE PUNONG BARANGAY...' }
    ]);
    
    const showEditor = ref(false);
    const isEditingDefault = ref(false);
    const currentTemplate = ref({});
    const fileInput = ref(null);

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
      createNewTemplate,
      editDefaultTemplate,
      editTemplate,
      deleteTemplate,
      closeEditor,
      saveTemplate,
      triggerImport,
      handleImport
    }
  }
}
</script>

<style scoped>
.certificate-templates-page {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.subtitle {
  color: #6c757d;
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

.action-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
  color: white;
  box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(13, 110, 253, 0.3);
}

/* Grid Layout */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.card-preview {
  height: 180px;
  background-color: #e9ecef;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.placeholder-preview {
    color: #adb5bd;
    font-size: 3rem;
}

.card-content {
  padding: 1.25rem;
  flex-grow: 1;
}

.card-content h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 0.5rem;
}

.card-content p {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.card-actions {
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 0.75rem;
}

.btn-outline, .btn-danger-outline {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-outline:hover {
  background-color: #e9ecef;
  color: #0d6efd;
}

.btn-danger-outline {
    flex: 0 0 auto;
    width: 40px;
}

.btn-danger-outline:hover {
    background-color: #fee2e2;
    color: #dc3545;
    border-color: #f5c2c7;
}

/* Import Card Special Styles */
.template-card.import {
  cursor: pointer;
  border: 2px dashed #dee2e6;
  background: transparent;
  box-shadow: none;
}

.template-card.import:hover {
  border-color: #0d6efd;
  background: rgba(13, 110, 253, 0.02);
}

.import-content {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.icon-circle {
  width: 60px;
  height: 60px;
  background-color: #e7f1ff;
  color: #0d6efd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-content.large {
    max-width: 700px;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
    font-size: 1.2rem;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #6c757d;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
}

.form-control {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 0.95rem;
}

.alert-info {
    background-color: #cff4fc;
    color: #055160;
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary {
    padding: 0.6rem 1.2rem;
    border: 1px solid #dee2e6;
    background: white;
    border-radius: 6px;
    cursor: pointer;
}

.btn-primary {
    padding: 0.6rem 1.2rem;
    background: #0d6efd;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
</style>