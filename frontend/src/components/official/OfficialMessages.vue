<template>
  <div class="messages-container">
    <div class="messages-header">
      <h1 class="page-title">Message Center</h1>
      <p class="page-subtitle">Reply to resident inquiries regarding their document request certificates</p>
    </div>

    <div class="messages-layout">
      <!-- Sidebar / Conversations List -->
      <div class="threads-sidebar card">
        <div class="sidebar-header-actions">
          <h3>Inboxes</h3>
          <span class="badge bg-primary rounded-pill" v-if="threads.length">{{ threads.length }}</span>
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
              <i class="fas fa-envelope"></i>
            </div>
            <div class="thread-info">
              <div class="thread-meta-row">
                <span class="thread-sender-name">{{ thread.residentName }}</span>
                <span class="thread-time">{{ formatShortTime(thread.timestamp) }}</span>
              </div>
              <div class="thread-subject">{{ thread.subject }}</div>
              <div class="thread-id text-muted">{{ thread.requestId === 'other-matters' ? 'General Inquiry' : thread.requestId }}</div>
              <div class="thread-last-msg text-truncate">{{ thread.lastMessage }}</div>
            </div>
          </div>

          <div v-if="threads.length === 0" class="no-threads text-center p-4">
            <i class="fas fa-inbox fs-1 text-muted mb-2 d-block"></i>
            <span class="text-muted">No resident messages in the inbox.</span>
          </div>
        </div>
      </div>

      <!-- Chat Screen -->
      <div class="chat-screen card">
        <div v-if="activeThreadId" class="chat-wrapper">
          <div class="chat-header">
            <div class="chat-thread-title">
              <h4>{{ activeThread.subject }}</h4>
              <div class="d-flex justify-content-between align-items-center mt-1">
                <small class="text-muted">Resident: <strong>{{ activeThread.residentName }}</strong> (Request ID: {{ activeThread.requestId === 'other-matters' ? 'General Inquiry' : activeThread.requestId }})</small>
                <button v-if="activeThread.requestId !== 'other-matters'" @click="viewRequestDetails(activeThread.requestId)" class="btn-view-request">
                  <i class="fas fa-external-link-alt"></i> View Request Details
                </button>
              </div>
            </div>
          </div>

          <div class="chat-history" ref="chatHistory">
            <div 
              v-for="msg in activeThreadMessages" 
              :key="msg.id" 
              class="message-bubble-wrapper"
              :class="{ 'mine': msg.senderRole === 'staff' }"
            >
              <div class="message-bubble">
                <div class="msg-sender-name">{{ msg.senderName }}</div>
                <div class="msg-content">{{ msg.content }}</div>
                <div class="msg-time">
                  {{ formatTime(msg.createdAt) }}
                  <template v-if="msg.senderRole === 'staff'">
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
              placeholder="Type your reply to the resident here..." 
              @keyup.enter.exact.prevent="sendReply"
              rows="2"
            ></textarea>
            <button @click="sendReply" :disabled="!replyText.trim()" class="btn btn-primary">
              <i class="fas fa-reply"></i> Reply
            </button>
          </div>
        </div>

        <div v-else class="no-active-chat text-center">
          <div class="no-chat-illustration">
            <i class="fas fa-inbox"></i>
          </div>
          <h3>Select an Inquiry</h3>
          <p class="text-muted">Choose an incoming resident message from the sidebar to review and reply to the conversation.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import localDb from '@/services/localDb';

export default {
  name: 'OfficialMessages',
  data() {
    return {
      messages: [],
      activeThreadId: null,
      replyText: '',
      intervalId: null
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user || {};
    },
    threads() {
      // Group all messages in the system by requestId
      const groups = {};
      this.messages.forEach(msg => {
        if (!groups[msg.requestId]) {
          groups[msg.requestId] = {
            requestId: msg.requestId,
            subject: msg.subject,
            residentName: msg.residentName || 'Resident',
            userId: msg.userId,
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
      this.messages = localDb.getMessages();
      if (this.activeThreadId) {
        this.markAsRead(this.activeThreadId);
      }
    },
    markAsRead(requestId) {
      const dbData = localDb.readDb();
      let updated = false;
      if (dbData.messages) {
        dbData.messages.forEach(msg => {
          if (msg.requestId === requestId && msg.senderRole === 'resident' && !msg.isRead) {
            msg.isRead = true;
            updated = true;
          }
        });
      }
      if (updated) {
        localDb.writeDb(dbData);
        // Sync local memory state
        this.messages.forEach(msg => {
          if (msg.requestId === requestId && msg.senderRole === 'resident') {
            msg.isRead = true;
          }
        });
      }
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

      const staffName = this.currentUser.name || this.currentUser.email || 'Barangay Staff';

      localDb.sendMessage({
        userId: this.activeThread.userId,
        residentName: this.activeThread.residentName,
        requestId: this.activeThreadId,
        subject: this.activeThread.subject,
        senderId: this.currentUser.uid,
        senderRole: 'staff',
        senderName: staffName,
        content: this.replyText
      });

      this.replyText = '';
      this.loadLocalData();
      this.scrollToBottom();
    },
    viewRequestDetails(requestId) {
      this.$router.push(`/official/requests/${requestId}`);
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
    formatShortTime(date) {
      if (!date) return '';
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    },
    getMessageStatus(msg) {
      if (msg.isFailed) return 'Not Sent';
      if (msg.isRead) return 'Seen by Resident';
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
  grid-template-columns: 340px 1fr;
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
  border-left: 4px solid #1e3a8a;
}

.thread-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thread-info {
  flex: 1;
  min-width: 0;
}

.thread-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.thread-sender-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
}

.thread-time {
  font-size: 0.75rem;
  color: #64748b;
}

.thread-subject {
  font-weight: 500;
  font-size: 0.85rem;
  color: #475569;
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
  background: #1e3a8a;
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
  border-color: #1e3a8a;
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
  background: #1e3a8a;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #172554;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
}

.badge {
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
}

.bg-primary {
  background-color: #1e3a8a !important;
}

.btn-view-request {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.btn-view-request:hover {
  background: linear-gradient(135deg, #172554, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-view-request:active {
  transform: translateY(0);
}
</style>
