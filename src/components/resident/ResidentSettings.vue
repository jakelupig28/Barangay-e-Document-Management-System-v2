<template>
  <div class="settings-wrapper">
    <!-- Header -->
    <div class="settings-header">
      <div class="header-content">
        <h1 class="settings-title">Settings</h1>
    
      </div>
    </div>

    <!-- Main Content -->
    <div class="settings-content">
      <div class="settings-card">

        <!-- Account Section -->
        <div class="settings-section">
          <h3 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Account
          </h3>
          <div class="section-body">
            <div class="setting-item">
              <div class="setting-label">Email Notifications</div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.emailNotifications">
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-label">SMS Alerts</div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.smsAlerts" :disabled="!contactVerified">
                <span class="slider"></span>
              </label>
              <p class="setting-note" v-if="!contactVerified">
                Verify your contact number first
              </p>
            </div>
          </div>
        </div>

        <!-- Privacy Section -->
        <div class="settings-section">
          <h3 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Privacy & Security
          </h3>
          <div class="section-body">
            <div class="setting-item">
              <div class="setting-label">Make Profile Public</div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.publicProfile">
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-label">Two-Factor Authentication</div>
              <button @click="setup2FA" class="action-btn secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"></path>
                </svg>
                Setup 2FA
              </button>
            </div>
            <!-- <div class="setting-item">
              <div class="setting-label">Change Password</div>
              <button @click="changePassword" class="action-btn secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Update
              </button>
            </div> -->
          </div>
        </div>

        <!-- Data & Storage -->
        <div class="settings-section">
          <h3 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2H2.5a.5.5 0 0 0-.5.5v19a.5.5 0 0 0 .5.5h19a.5.5 0 0 0 .5-.5v-19a.5.5 0 0 0-.5-.5z"></path>
              <path d="M2 8h20"></path>
              <path d="M6 2v6"></path>
              <path d="M10 2v6"></path>
              <path d="M14 2v6"></path>
              <path d="M18 2v6"></path>
            </svg>
            Data Management
          </h3>
          <div class="section-body">
            <div class="setting-item">
              <div class="setting-label">Download My Data</div>
              <button @click="downloadData" class="action-btn primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </button>
            </div>
            <div class="setting-item">
              <div class="setting-label">Delete Account</div>
              <button @click="confirmDelete" class="action-btn danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Save Button
        <div class="form-actions">
          <button @click="saveSettings" class="save-button" :disabled="saving">
            <span v-if="saving">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div> -->
      </div>
    </div>

    <!-- Toast Message -->
    <transition name="fade">
      <div v-if="message" :class="['status-message', messageType]">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="messageType === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline v-if="messageType === 'success'" points="22 4 12 14.01 9 11.01"></polyline>
          <circle v-if="messageType === 'error'" cx="12" cy="12" r="10"></circle>
          <line v-if="messageType === 'error'" x1="15" y1="9" x2="9" y2="15"></line>
          <line v-if="messageType === 'error'" x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        {{ message }}
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <h3>Delete Account?</h3>
            <button @click="showDeleteConfirm = false" class="close-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>This action <strong>cannot be undone</strong>. All your data will be permanently deleted.</p>
            <p class="warning">Type your email to confirm:</p>
            <input v-model="deleteConfirmEmail" type="email" class="form-input" placeholder="your@email.com">
          </div>
          <div class="modal-actions">
            <button @click="showDeleteConfirm = false" class="cancel-button">Cancel</button>
            <button @click="deleteAccount" class="danger-button" :disabled="deleting || deleteConfirmEmail !== profile.email">
              <span v-if="deleting">Deleting...</span>
              <span v-else>Delete Permanently</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { db, auth } from '@/firebase/config'
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'

export default {
  name: 'ResidentSettings',
  data() {
    return {
      profile: null,
      settings: {
        emailNotifications: true,
        smsAlerts: false,
        publicProfile: false
      },
      saving: false,
      deleting: false,
      message: '',
      messageType: '',
      showDeleteConfirm: false,
      deleteConfirmEmail: ''
    }
  },
  computed: {
    contactVerified() {
      return this.profile && this.profile.contact && this.profile.contact.length >= 10
    }
  },
  async created() {
    await this.loadProfile()
    await this.loadSettings()
  },
  methods: {
    async loadProfile() {
      try {
        const user = this.$store.state.auth.user
        if (!user) throw new Error('Not authenticated')
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          this.profile = { ...docSnap.data(), email: user.email }
        }
      } catch (error) {
        this.showMessage('Error loading profile', 'error')
      }
    },
    async loadSettings() {
      try {
        const user = this.$store.state.auth.user
        const docRef = doc(db, 'user_settings', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          this.settings = { ...this.settings, ...docSnap.data() }
        }
      } catch (error) {
        console.log('No settings found, using defaults')
      }
    },
    async saveSettings() {
      this.saving = true
      try {
        const user = this.$store.state.auth.user
        const settingsRef = doc(db, 'user_settings', user.uid)
        await setDoc(settingsRef, this.settings, { merge: true })
        this.showMessage('Settings saved successfully!', 'success')
      } catch (error) {
        this.showMessage('Failed to save settings', 'error')
      } finally {
        this.saving = false
      }
    },
    setup2FA() {
      this.showMessage('2FA setup coming soon', 'info')
    },
    changePassword() {
      this.showMessage('Password reset link sent to email', 'success')
    },
    async downloadData() {
      try {
        const user = this.$store.state.auth.user
        const profileRef = doc(db, 'users', user.uid)
        const profileSnap = await getDoc(profileRef)
        const data = profileSnap.data()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `my-barangay-data-${user.uid}.json`
        a.click()
        URL.revokeObjectURL(url)
        this.showMessage('Data exported!', 'success')
      } catch (error) {
        this.showMessage('Export failed', 'error')
      }
    },
    confirmDelete() {
      this.showDeleteConfirm = true
    },
    async deleteAccount() {
      if (this.deleteConfirmEmail !== this.profile.email) return
      this.deleting = true
      try {
        const user = auth.currentUser
        await deleteDoc(doc(db, 'users', user.uid))
        await deleteDoc(doc(db, 'user_settings', user.uid))
        await deleteUser(user)
        this.showMessage('Account deleted', 'success')
        this.$router.push('/login')
      } catch (error) {
        this.showMessage('Delete failed: ' + error.message, 'error')
      } finally {
        this.deleting = false
        this.showDeleteConfirm = false
      }
    },
    showMessage(msg, type = 'info') {
      this.message = msg
      this.messageType = type
      setTimeout(() => { this.message = '' }, 5000)
    }
  }
}
</script>

<!-- STYLES (SAME AS BEFORE) -->
<style scoped>
/* [Copy ALL the styles from my previous message - they are identical] */
.settings-wrapper {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: 3rem;
}

/* ... [ALL OTHER STYLES EXACTLY THE SAME] ... */

/* Responsive */
@media (max-width: 768px) {
  .settings-header { padding: 2rem 1rem 1.5rem; }
  .settings-title { font-size: 1.75rem; }
  .settings-card { padding: 2rem 1.5rem; }
  .setting-item { flex-direction: column; align-items: flex-start; }
  .form-actions { justify-content: center; }
}

@media (max-width: 480px) {
  .settings-title { font-size: 1.5rem; }
  .modal-actions { flex-direction: column; }
}
</style>

<style scoped>
/* -------------------------------------------------
   Page Wrapper
   ------------------------------------------------- */
.settings-wrapper {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: 3rem;
}

/* -------------------------------------------------
   Header
   ------------------------------------------------- */
.settings-header {
  background: transparent;
  color: #1f2937;
  margin-top: -30px;
  padding: 3rem 2rem 1.5rem;
  text-align: center;
}

.header-content {
  max-width: 1000px;
  text-align: start;
  margin: 0 auto;
}

.settings-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.settings-subtitle {
  font-size: 1.1rem;
  margin: 0.75rem 0 0;
  color: #4b5563;
}

/* -------------------------------------------------
   Content
   ------------------------------------------------- */
.settings-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

.settings-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

/* -------------------------------------------------
   Section
   ------------------------------------------------- */
.settings-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.25rem;
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* -------------------------------------------------
   Setting Item
   ------------------------------------------------- */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.setting-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
}

.setting-note {
  font-size: 0.8rem;
  color: #ef4444;
  margin: 0.25rem 0 0;
  flex-basis: 100%;
}

/* -------------------------------------------------
   Toggle Switch
   ------------------------------------------------- */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: .3s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* -------------------------------------------------
   Action Buttons
   ------------------------------------------------- */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.action-btn.danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* -------------------------------------------------
   Save Button
   ------------------------------------------------- */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.save-button {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79,70,229,.3);
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* -------------------------------------------------
   Modal
   ------------------------------------------------- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem;
  color: #374151;
}

.warning {
  color: #dc2626;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 0 1.5rem 1.5rem;
}

.danger-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
}

.danger-button:hover:not(:disabled) {
  background: #b91c1c;
}

.danger-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* -------------------------------------------------
   Toast
   ------------------------------------------------- */
.status-message {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  animation: slideUp 0.4s ease-out;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  max-width: 90%;
}

.status-message.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.status-message.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.status-message.info { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translateX(-50%); }
}

/* -------------------------------------------------
   Responsive
   ------------------------------------------------- */
@media (max-width: 768px) {
  .settings-header { padding: 2rem 1rem 1.5rem; }
  .settings-title { font-size: 1.75rem; }
  .settings-card { padding: 2rem 1.5rem; }
  .setting-item { flex-direction: column; align-items: flex-start; }
  .form-actions { justify-content: center; }
}

@media (max-width: 480px) {
  .settings-title { font-size: 1.5rem; }
  .modal-actions { flex-direction: column; }
}
</style>