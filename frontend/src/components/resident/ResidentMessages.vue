<template>
  <div class="messages-container">
    <div class="messages-header">
      <h1 class="page-title">Messages</h1>
      <p class="page-subtitle">Communicate with Barangay Staff regarding your document requests</p>
    </div>

    <div class="messages-layout">
      <!-- Sidebar / Conversations List -->
      <div class="threads-sidebar card">
        <div class="sidebar-header-actions">
          <h3>Conversations</h3>
          <button @click="showNewMessageModal = true" class="btn btn-primary btn-sm">
            <i class="fas fa-plus"></i> New Message
          </button>
        </div>

        <div class="threads-list">
          <div 
            v-for="thread in threads" 
            :key="thread.requestId" 
            class="thread-item"
            :class="{ active: activeThreadId === thread.requestId }"
            @click="selectThread(thread.requestId)"
          >
            <div class="thread-icon">
              <i class="fas fa-envelope-open-text"></i>
            </div>
            <div class="thread-info">
              <div class="thread-subject">{{ thread.subject }}</div>
              <div class="thread-id text-muted">{{ thread.requestId === 'other-matters' ? 'General Inquiry' : thread.requestId }}</div>
              <div class="thread-last-msg text-truncate">{{ thread.lastMessage }}</div>
            </div>
          </div>

          <div v-if="threads.length === 0" class="no-threads text-center p-4">
            <i class="fas fa-comments fs-1 text-muted mb-2 d-block"></i>
            <span class="text-muted">No messages yet. Click "New Message" to start a conversation.</span>
          </div>
        </div>
      </div>

      <!-- Chat Screen -->
      <div class="chat-screen card">
        <div v-if="activeThreadId" class="chat-wrapper">
          <div class="chat-header">
            <div class="chat-thread-title">
              <h4>{{ activeThread.subject }}</h4>
              <small class="text-muted">Reference: {{ activeThread.requestId === 'other-matters' ? 'General Inquiry' : activeThread.requestId }}</small>
            </div>
          </div>

          <div class="chat-history" ref="chatHistory">
            <div 
              v-for="msg in activeThreadMessages" 
              :key="msg.id" 
              class="message-bubble-wrapper"
              :class="{ 'mine': msg.senderRole === 'resident' }"
            >
              <div class="message-bubble">
                <div class="msg-sender-name">{{ msg.senderName }}</div>
                <div class="msg-content">{{ msg.content }}</div>
                <div class="msg-time">
                  {{ formatTime(msg.createdAt) }}
                  <template v-if="msg.senderRole === 'resident'">
                    <span class="msg-status-separator">•</span>
                    <span class="msg-status" :class="getMessageStatusClass(msg)">{{ getMessageStatus(msg) }}</span>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input-bar">
            <textarea 
              v-model="replyText" 
              placeholder="Type your reply here..." 
              @keyup.enter.exact.prevent="sendReply"
              rows="2"
            ></textarea>
            <button @click="sendReply" :disabled="!replyText.trim()" class="btn btn-primary">
              <i class="fas fa-paper-plane"></i> Send
            </button>
          </div>
        </div>

        <div v-else class="no-active-chat text-center">
          <div class="no-chat-illustration">
            <i class="fas fa-comments"></i>
          </div>
          <h3>Select a Conversation</h3>
          <p class="text-muted">Choose a request conversation from the sidebar or send a new message to the Barangay Staff.</p>
        </div>
      </div>
    </div>

    <!-- New Message Modal -->
    <div v-if="showNewMessageModal" class="modal-overlay" @click.self="showNewMessageModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Start a New Message</h3>
          <button class="close-btn" @click="showNewMessageModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-3">
            <label class="form-label">Related Request Certificate</label>
            <select v-model="newMessage.requestId" class="form-select" @change="onSelectRequest">
              <option value="" disabled>Select a certificate request</option>
              <option value="other-matters">Other matters / general inquiry</option>
              <option 
                v-for="req in userRequests" 
                :key="req.id" 
                :value="req.id"
              >
                {{ formatDocType(req.documentType || req.type) }} ({{ req.id }}) - {{ req.status }}
              </option>
            </select>
            <p v-if="userRequests.length === 0 && newMessage.requestId !== 'other-matters'" class="text-danger mt-1 small">
              You must have an existing document request or select "Other matters" to send a message.
            </p>
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Subject</label>
            <input 
              v-model="newMessage.subject" 
              type="text" 
              :placeholder="newMessage.requestId === 'other-matters' ? 'Enter message subject' : 'Subject (auto-filled from request)'" 
              class="form-control" 
              :disabled="newMessage.requestId !== 'other-matters'"
              required
            />
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Message Content</label>
            <textarea 
              v-model="newMessage.content" 
              rows="4" 
              placeholder="Type your question or message to Barangay Staff here..." 
              class="form-control"
              required
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showNewMessageModal = false">Cancel</button>
          <button 
            class="btn btn-primary" 
            :disabled="!newMessage.requestId || !newMessage.content.trim() || (newMessage.requestId === 'other-matters' && !newMessage.subject.trim())"
            @click="submitNewMessage"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import localDb from '@/services/localDb';

export default {
  name: 'ResidentMessages',
  data() {
    return {
      messages: [],
      userRequests: [],
      showNewMessageModal: false,
      activeThreadId: null,
      replyText: '',
      newMessage: {
        requestId: '',
        subject: '',
        content: ''
      },
      intervalId: null
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user || {};
    },
    threads() {
      // Group messages by requestId
      const groups = {};
      this.messages.forEach(msg => {
        if (!groups[msg.requestId]) {
          groups[msg.requestId] = {
            requestId: msg.requestId,
            subject: msg.subject,
            lastMessage: msg.content,
            timestamp: new Date(msg.createdAt)
          };
        } else {
          const msgDate = new Date(msg.createdAt);
          if (msgDate > groups[msg.requestId].timestamp) {
            groups[msg.requestId].lastMessage = msg.content;
            groups[msg.requestId].timestamp = msgDate;
          }
        }
      });
      return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
    },
    activeThread() {
      return this.threads.find(t => t.requestId === this.activeThreadId) || {};
    },
    activeThreadMessages() {
      return this.messages
        .filter(msg => msg.requestId === this.activeThreadId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  },
  methods: {
    loadLocalData() {
      const allMessages = localDb.getMessages();
      // Filter messages related to this resident
      this.messages = allMessages.filter(msg => msg.userId === this.currentUser.uid);

      // Load user's certificate requests
      const dbData = localDb.readDb();
      this.userRequests = (dbData.requests || []).filter(r => r.userId === this.currentUser.uid);

      if (this.activeThreadId) {
        this.markAsRead(this.activeThreadId);
      }
    },
    markAsRead(requestId) {
      const dbData = localDb.readDb();
      let updated = false;
      if (dbData.messages) {
        dbData.messages.forEach(msg => {
          if (msg.requestId === requestId && msg.senderRole === 'staff' && !msg.isRead) {
            msg.isRead = true;
            updated = true;
          }
        });
      }
      if (updated) {
        localDb.writeDb(dbData);
        // Sync local memory state
        this.messages.forEach(msg => {
          if (msg.requestId === requestId && msg.senderRole === 'staff') {
            msg.isRead = true;
          }
        });
      }
    },
    formatDocType(type) {
      if (!type) return 'Certificate';
      return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },
    onSelectRequest() {
      if (this.newMessage.requestId === 'other-matters') {
        this.newMessage.subject = '';
      } else {
        const selectedReq = this.userRequests.find(r => r.id === this.newMessage.requestId);
        if (selectedReq) {
          this.newMessage.subject = `Regarding Request for ${this.formatDocType(selectedReq.documentType || selectedReq.type)}`;
        }
      }
    },
    submitNewMessage() {
      if (!this.newMessage.requestId || !this.newMessage.content.trim()) return;
      if (this.newMessage.requestId === 'other-matters' && !this.newMessage.subject.trim()) return;

      const userProfile = localDb.readDb().users?.find(u => u.id === this.currentUser.uid)?.profile || {};
      const senderName = userProfile.name || this.currentUser.email || 'Resident';

      localDb.sendMessage({
        userId: this.currentUser.uid,
        residentName: senderName,
        requestId: this.newMessage.requestId,
        subject: this.newMessage.subject,
        senderId: this.currentUser.uid,
        senderRole: 'resident',
        senderName: senderName,
        content: this.newMessage.content
      });

      this.activeThreadId = this.newMessage.requestId;
      this.newMessage = { requestId: '', subject: '', content: '' };
      this.showNewMessageModal = false;
      this.loadLocalData();
      this.scrollToBottom();
      this.$notify.success('Message sent to Barangay Staff');
    },
    selectThread(requestId) {
      this.activeThreadId = requestId;
      this.markAsRead(requestId);
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    sendReply() {
      if (!this.replyText.trim() || !this.activeThreadId) return;

      const userProfile = localDb.readDb().users?.find(u => u.id === this.currentUser.uid)?.profile || {};
      const senderName = userProfile.name || this.currentUser.email || 'Resident';

      localDb.sendMessage({
        userId: this.currentUser.uid,
        residentName: senderName,
        requestId: this.activeThreadId,
        subject: this.activeThread.subject,
        senderId: this.currentUser.uid,
        senderRole: 'resident',
        senderName: senderName,
        content: this.replyText
      });

      this.replyText = '';
      this.loadLocalData();
      this.scrollToBottom();
    },
    scrollToBottom() {
      const history = this.$refs.chatHistory;
      if (history) {
        history.scrollTop = history.scrollHeight;
      }
    },
    formatTime(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    },
    getMessageStatus(msg) {
      if (msg.isFailed) return 'Not Sent';
      if (msg.isRead) return 'Seen by Barangay Staff';
      return 'Delivered';
    },
    getMessageStatusClass(msg) {
      if (msg.isFailed) return 'status-failed';
      if (msg.isRead) return 'status-seen';
      return 'status-delivered';
    }
  },
  created() {
    this.loadLocalData();
    this.intervalId = setInterval(() => {
      this.loadLocalData();
    }, 2000);
  },
  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
};
</script>

<style scoped>
.messages-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.messages-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  height: calc(100vh - 180px);
  min-height: 500px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.threads-sidebar {
  border-right: 1px solid #e2e8f0;
}

.sidebar-header-actions {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header-actions h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.threads-list {
  flex: 1;
  overflow-y: auto;
}

.thread-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s ease;
}

.thread-item:hover {
  background: #f8fafc;
}

.thread-item.active {
  background: #f1f5f9;
  border-left: 4px solid #4361ee;
}

.thread-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4361ee;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thread-info {
  flex: 1;
  min-width: 0;
}

.thread-subject {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
  margin-bottom: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thread-id {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.thread-last-msg {
  font-size: 0.8rem;
  color: #64748b;
}

.chat-screen {
  flex: 1;
  position: relative;
}

.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.chat-header h4 {
  margin: 0 0 0.15rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.chat-history {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-bubble-wrapper {
  display: flex;
  width: 100%;
}

.message-bubble-wrapper.mine {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: #f1f5f9;
  color: #334155;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message-bubble-wrapper.mine .message-bubble {
  background: #4361ee;
  color: white;
}

.msg-sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  opacity: 0.8;
}

.msg-content {
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
}

.msg-time {
  font-size: 0.65rem;
  text-align: right;
  margin-top: 0.25rem;
  opacity: 0.7;
}

.msg-status-separator {
  margin: 0 4px;
}

.msg-status {
  font-weight: 600;
}

.message-bubble-wrapper.mine .msg-status {
  opacity: 0.9;
}

.status-seen {
  color: #10b981;
}

.message-bubble-wrapper.mine .status-seen {
  color: #d1fae5;
}

.status-delivered {
  color: #64748b;
}

.message-bubble-wrapper.mine .status-delivered {
  color: #e2e8f0;
}

.status-failed {
  color: #ef4444;
}

.message-bubble-wrapper.mine .status-failed {
  color: #fecaca;
}

.chat-input-bar {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  background: white;
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.chat-input-bar textarea {
  flex: 1;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-family: inherit;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input-bar textarea:focus {
  border-color: #4361ee;
}

.no-active-chat {
  margin: auto;
  padding: 2rem;
}

.no-chat-illustration {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.no-chat-illustration i {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-card {
  background: white;
  border-radius: 12px;
  width: 500px;
  max-width: 95%;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 1.25rem;
}

.form-label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.35rem;
  display: block;
}

.form-select, .form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #4361ee;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #304fd0;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}
</style>
