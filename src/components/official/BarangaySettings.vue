<template>
  <div class="settings-container">
    <!-- Header Section -->
    <div class="settings-header">
      <div class="header-content">
        <h1 class="settings-title">Barangay Settings</h1>
        <p class="settings-subtitle">Manage your barangay information and configuration</p>
      </div>
    </div>

    <!-- Settings Form -->
    <div class="settings-card">
      <div class="card-header">
        <h2><i class="fas fa-landmark"></i> Barangay Information</h2>
        <p>Update your barangay details and contact information</p>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="barangay-name">Barangay Name</label>
          <div class="input-container">
            <i class="fas fa-landmark input-icon"></i>
            <input 
              id="barangay-name"
              v-model="barangayInfo.name" 
              type="text" 
              placeholder="Enter barangay name" 
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="city">City / Municipality</label>
          <div class="input-container">
            <i class="fas fa-city input-icon"></i>
            <input 
              id="city"
              v-model="barangayInfo.city" 
              type="text" 
              placeholder="Enter city or municipality" 
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="province">Province</label>
          <div class="input-container">
            <i class="fas fa-map-marker-alt input-icon"></i>
            <input 
              id="province"
              v-model="barangayInfo.province" 
              type="text" 
              placeholder="Enter province" 
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="captain">Barangay Captain</label>
          <div class="input-container">
            <i class="fas fa-user-tie input-icon"></i>
            <input 
              id="captain"
              v-model="barangayInfo.captain" 
              type="text" 
              placeholder="Enter barangay captain name" 
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="secretary">Barangay Secretary</label>
          <div class="input-container">
            <i class="fas fa-user input-icon"></i>
            <input 
              id="secretary"
              v-model="barangayInfo.secretary" 
              type="text" 
              placeholder="Enter barangay secretary name" 
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="contact">Contact Number</label>
          <div class="input-container">
            <i class="fas fa-phone input-icon"></i>
            <input 
              id="contact"
              v-model="barangayInfo.contact" 
              type="text" 
              placeholder="Enter contact number" 
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-container">
            <i class="fas fa-envelope input-icon"></i>
            <input 
              id="email"
              v-model="barangayInfo.email" 
              type="email" 
              placeholder="Enter email address" 
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="address">Complete Address</label>
          <div class="input-container">
            <i class="fas fa-home input-icon"></i>
            <input 
              id="address"
              v-model="barangayInfo.address" 
              type="text" 
              placeholder="Enter complete address" 
              class="form-input"
            />
          </div>
        </div>
      </div>

      <!-- Additional Settings Section -->
      <div class="additional-settings">
        <div class="section-header">
          <h3><i class="fas fa-sliders-h"></i> Additional Settings</h3>
        </div>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="barangayInfo.autoApproveRequests"
                class="setting-checkbox"
              />
              <span class="checkmark"></span>
              Auto-approve simple requests
            </label>
            <p class="setting-description">Automatically approve basic document requests</p>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="barangayInfo.emailNotifications"
                class="setting-checkbox"
              />
              <span class="checkmark"></span>
              Email notifications
            </label>
            <p class="setting-description">Receive email alerts for new requests</p>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="barangayInfo.smsNotifications"
                class="setting-checkbox"
              />
              <span class="checkmark"></span>
              SMS notifications
            </label>
            <p class="setting-description">Receive SMS alerts for urgent matters</p>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button 
          class="cancel-btn" 
          @click="resetSettings"
          :disabled="isSaving"
        >
          <i class="fas fa-times"></i>
          <span>Cancel</span>
        </button>
        <button 
          class="save-btn" 
          @click="saveSettings" 
          :disabled="isSaving"
          :class="{ 'saving': isSaving }"
        >
          <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          <span>{{ isSaving ? 'Saving...' : 'Save Settings' }}</span>
        </button>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="message" class="message" :class="messageType">
      <i :class="messageIcon"></i>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default {
  name: "BarangaySettings",
  setup() {
    const barangayInfo = ref({
      name: "",
      city: "",
      province: "",
      captain: "",
      secretary: "",
      contact: "",
      email: "",
      address: "",
      autoApproveRequests: false,
      emailNotifications: true,
      smsNotifications: false,
    });

    const originalSettings = ref({});
    const message = ref("");
    const isSaving = ref(false);
    const getSettingsRef = () => doc(db, "config", "barangaySettings");

    const messageType = computed(() => {
      return message.value.includes("❌") ? "error" : "success";
    });

    const messageIcon = computed(() => {
      return messageType.value === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle";
    });

    const isFirebaseReady = () => !!(db && typeof db === 'object' && typeof db.app !== 'undefined');

    const fetchSettings = async () => {
      if (!isFirebaseReady()) {
        message.value = "Local mode: default settings loaded.";
        setTimeout(() => message.value = "", 3000);
        return;
      }
      try {
        const snap = await getDoc(getSettingsRef());
        if (snap.exists()) {
          const data = snap.data();
          barangayInfo.value = {
            ...barangayInfo.value,
            ...data,
          };
          originalSettings.value = { ...barangayInfo.value };
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        message.value = "❌ Failed to load settings.";
      }
    };

    const saveSettings = async () => {
      if (!isFirebaseReady()) {
        message.value = "❌ Cannot save settings in local mode.";
        setTimeout(() => message.value = "", 3500);
        return;
      }
      isSaving.value = true;
      try {
        await setDoc(getSettingsRef(), {
          ...barangayInfo.value,
          updatedAt: new Date().toISOString(),
        });
        originalSettings.value = { ...barangayInfo.value };
        message.value = "✅ Settings saved successfully!";
      } catch (error) {
        console.error("Error saving:", error.code, error.message);
        message.value = `❌ Error: ${error.message}`;
      } finally {
        isSaving.value = false;
        setTimeout(() => (message.value = ""), 3500);
      }
    };

    const resetSettings = () => {
      barangayInfo.value = { ...originalSettings.value };
      message.value = "Settings reset to previous values";
      setTimeout(() => (message.value = ""), 2000);
    };

    onMounted(fetchSettings);

    return { 
      barangayInfo, 
      message, 
      isSaving, 
      saveSettings,
      resetSettings,
      messageType,
      messageIcon
    };
  },
};
</script>

<style scoped>
.settings-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* Header Section */
.settings-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eef2f7;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border-radius: 12px;
  color: white;
  font-size: 1.5rem;
}

.header-content {
  flex: 1;
}

.settings-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1e293b;
}

.settings-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
}

/* Settings Card */
.settings-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eef2f7;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.9rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 1rem;
  z-index: 1;
}

.form-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Additional Settings */
.additional-settings {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.setting-item {
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  margin-bottom: 0.25rem;
}

.setting-checkbox {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.setting-checkbox:checked + .checkmark {
  background: #2563eb;
  border-color: #2563eb;
}

.setting-checkbox:checked + .checkmark::after {
  content: "✓";
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.setting-description {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
  margin-left: 1.75rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eef2f7;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(37, 99, 235, 0.25);
}

.save-btn:active:not(:disabled) {
  transform: translateY(0);
}

.save-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.save-btn.saving {
  background: #64748b;
}

.cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  color: #64748b;
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Message */
.message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.message.success {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.message.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-container {
    padding: 1rem;
  }
  
  .settings-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .header-icon {
    margin-bottom: 0.5rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-btn, .cancel-btn {
    justify-content: center;
  }
}
</style>