<template>
  <div class="official-dashboard">
    <div class="dashboard-header">
      <h2><i class=""></i> Barangay Official Dashboard</h2>
      <div class="header-right">
        <RealTimeClock />
        <div class="notification-container">
          <button class="notification-btn" @click="toggleNotifications">
            <i class="fas fa-bell"></i>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>
          <div v-if="showNotifications" class="notification-dropdown">
            <div class="notification-header">
              <h4>Notifications</h4>
              <button @click="markAllAsRead" class="mark-read-btn">Mark all as read</button>
            </div>
            <div v-if="notifications.length > 0" class="notification-list">
              <div v-for="notification in notifications" 
                   :key="notification.id" 
                   class="notification-item"
                   :class="{ 'unread': !notification.read }"
                   @click="handleNotificationClick(notification)">
                <div class="notification-icon">
                  <i class="fas" :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-content">
                  <p class="notification-message">{{ notification.message }}</p>
                  <span class="notification-time">{{ formatTimeAgo(notification.timestamp) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-notifications">
              No new notifications
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="stats-grid mb-5">
      <div class="premium-stat-card blue" v-for="(stat, index) in statCards" :key="index">
        <div class="card-glass-overlay"></div>
        <div class="card-content">
          <div class="stat-icon-box" :class="stat.iconClass">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-title">{{ stat.title }}</h3>
            <div class="stat-value-row">
              <span class="stat-value text-dark">{{ stat.value }}</span>
              <span class="stat-badge" v-if="stat.trend">
                <i :class="stat.trendIcon"></i> {{ stat.trend }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3><i class="fas fa-chart-line"></i> Analytics</h3>
      </div>
      <div class="analytics-grid">
        <div class="chart-card">
          <h4>Request Types</h4>
          <div class="chart-container">
            <canvas id="requestTypeChart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h4>Request Demographics (Age)</h4>
          <div class="chart-container">
            <canvas id="ageChart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h4>Request Demographics (Gender)</h4>
          <div class="chart-container">
            <canvas id="genderChart"></canvas>
          </div>
        </div>
      </div>
    </div>
    
    <div class="dashboard-section">
      <div class="section-header">
        <h3><i class="fas fa-clock"></i> Recent Requests</h3>
      </div>
      
      <div class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Resident Name</th>
              <th>Document Type</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in sortedRecentRequests" :key="request.id">
              <td>{{ request.id.length > 8 ? request.id.substring(0, 8) + '...' : request.id }}</td>
              <td>
                <div class="user-info">
                  {{ request.userName }}
                </div>
              </td>
              <td>{{ request.type }}</td>
              <td>{{ formatDate(request.createdAt) }}</td>
              <td>
                <span :class="'status-badge ' + request.status">
                  {{ request.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="dashboard-section">
      <div class="section-header">
        <h3><i class="fas fa-flag"></i> Recent Reports</h3>
      </div>
      
      <div class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Resident Name</th>
              <th>Report Type</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in sortedRecentReports" :key="report.id">
              <td>{{ report.id.length > 8 ? report.id.substring(0, 8) + '...' : report.id }}</td>
              <td>
                <div class="user-info">
                  {{ report.userName }}
                </div>
              </td>
              <td>{{ report.reportType }}</td>
              <td>{{ formatDate(report.createdAt) }}</td>
              <td>
                <span :class="'status-badge ' + report.status">
                  {{ report.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase/config'
import { collection, getDocs, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore'
import RealTimeClock from '@/components/common/RealTimeClock.vue'
import localDb from '@/services/localDb'

export default {
  components: {
    RealTimeClock
  },
  data() {
    return {
      stats: {
        totalResidents: 0,
        pendingRequests: 0,
        completedRequests: 0,
        pendingReports: 0,
        resolvedReports: 0
      },
      recentRequests: [],
      recentReports: [],
      currentTime: new Date().toLocaleString(),
      showNotifications: false,
      notifications: [],
      unreadCount: 0,
      unsubscribeRequests: null,
      unsubscribeReports: null,
      lastRequestCount: 0,
      lastReportCount: 0
    }
  },
  computed: {
    statCards() {
      return [
        {
          title: "Total Residents",
          value: this.stats.totalResidents,
          icon: "fas fa-users",
          iconClass: "bg-blue",
          trendIcon: "fas fa-caret-up"
        },
        {
          title: "Pending Requests",
          value: this.stats.pendingRequests,
          icon: "fas fa-clock",
          iconClass: "bg-orange",
          trendIcon: "fas fa-caret-up"
        },
        // {
        //   title: "Completed Requests",
        //   value: this.stats.completedRequests,
        //   icon: "fas fa-check-circle",
        //   iconClass: "bg-green",
        //   trendIcon: "fas fa-caret-up"
        // },
        {
          title: "Pending Reports",
          value: this.stats.pendingReports,
          icon: "fas fa-exclamation-triangle",
          iconClass: "bg-yellow",
          trendIcon: "fas fa-caret-up"
        },
        // {
        //   title: "Resolved Reports",
        //   value: this.stats.resolvedReports,
        //   icon: "fas fa-check",
        //   iconClass: "bg-green",
        //   trendIcon: "fas fa-caret-up"
        // }
      ]
    },
    sortedRecentRequests() {
      return [...this.recentRequests].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    },
    sortedRecentReports() {
      return [...this.recentReports].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }
  },
  async created() {
    await this.initializeDashboard()

    setInterval(() => {
      this.currentTime = new Date().toLocaleString()
    }, 60000)
  },
  beforeUnmount() {
    if (this.unsubscribeRequests) {
      this.unsubscribeRequests()
    }
    if (this.unsubscribeReports) {
      this.unsubscribeReports()
    }
  },
  methods: {
    isFirebaseReady() {
      return !!(db && typeof db === 'object' && typeof db.app !== 'undefined')
    },
    async initializeDashboard() {
      if (!this.isFirebaseReady()) {
        this.loadLocalDashboardData()
        return
      }
      await this.fetchStats()
      await this.fetchRecentRequests()
      await this.fetchRecentReports()
      await this.fetchAnalytics()
      this.setupRealTimeNotifications()
    },
    loadLocalDashboardData() {
      const dbData = localDb.readDb();
      this.stats.totalResidents = dbData.users?.filter(u => u.role === 'resident').length || 0;
      this.stats.pendingRequests = dbData.requests?.filter(r => r.status === 'pending').length || 0;
      this.stats.completedRequests = dbData.requests?.filter(r => r.status === 'approved').length || 0;
      this.stats.pendingReports = dbData.reports?.filter(r => r.status === 'pending').length || 0;
      this.stats.resolvedReports = dbData.reports?.filter(r => r.status === 'resolved').length || 0;
      
      this.recentRequests = (dbData.requests || []).slice(-5).reverse().map(r => ({
        id: r.id,
        userName: r.userName || 'Unknown',
        type: r.type || r.documentType || 'Unknown',
        status: r.status || 'pending',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }));
      
      this.recentReports = (dbData.reports || []).slice(-5).reverse().map(r => ({
        id: r.id,
        userName: r.userName || 'Unknown',
        reportType: r.reportType || 'Unknown',
        status: r.status || 'pending',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }));
      
      this.unreadCount = 0;
    },
    async fetchStats() {
      if (!this.isFirebaseReady()) {
        this.loadLocalDashboardData()
        return
      }
      // Get total residents count
      const residentsQuery = query(collection(db, 'users'), where('role', '==', 'resident'))
      const residentsSnapshot = await getDocs(residentsQuery)
      this.stats.totalResidents = residentsSnapshot.size

      // Get pending requests count
      const pendingQuery = query(collection(db, 'requests'), where('status', '==', 'pending'))
      const pendingSnapshot = await getDocs(pendingQuery)
      this.stats.pendingRequests = pendingSnapshot.size
      this.lastRequestCount = pendingSnapshot.size

      // Get completed requests count (only from this month)
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const completedQuery = query(
        collection(db, 'requests'),
        where('status', '==', 'approved'),
        where('updatedAt', '>=', startOfMonth)
      )
      const completedSnapshot = await getDocs(completedQuery)
      this.stats.completedRequests = completedSnapshot.size

      // Get pending reports count
      const pendingReportsQuery = query(collection(db, 'reports'), where('status', '==', 'pending'))
      const pendingReportsSnapshot = await getDocs(pendingReportsQuery)
      this.stats.pendingReports = pendingReportsSnapshot.size
      this.lastReportCount = pendingReportsSnapshot.size

      // Get resolved reports count
      const resolvedQuery = query(collection(db, 'reports'), where('status', '==', 'resolved'))
      const resolvedSnapshot = await getDocs(resolvedQuery)
      this.stats.resolvedReports = resolvedSnapshot.size
    },

    async fetchRecentRequests() {
      const q = query(
        collection(db, 'requests'),
        orderBy('createdAt', 'desc'),
        limit(5)
      )

      const snapshot = await getDocs(q)
      this.recentRequests = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: data.id || doc.id,
          userName: data.userName || 'Unknown',
          type: data.type || data.documentType || 'Unknown',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null
        }
      })
    },

    async fetchRecentReports() {
      const q = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(5)
      )

      const snapshot = await getDocs(q)
      this.recentReports = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          userName: data.userName || 'Unknown',
          reportType: data.reportType || 'Unknown',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null
        }
      })
    },

    async fetchAnalytics() {
        try {
            // 1. Fetch all residents to build demographic map
            const residentsQuery = query(collection(db, 'users'), where('role', '==', 'resident'));
            const residentsSnapshot = await getDocs(residentsQuery);
            const userMap = {};
            
            residentsSnapshot.forEach(doc => {
                const data = doc.data();
                userMap[doc.id] = {
                    gender: data.gender ? data.gender.toLowerCase() : 'unknown',
                    birthdate: data.birthdate
                };
            });

            // 2. Fetch all requests
            // In a large app, you would use aggregation queries or process this in a cloud function.
            // For this app, fetching all is acceptable.
            const requestsQuery = query(collection(db, 'requests'));
            const requestsSnapshot = await getDocs(requestsQuery);

            const typeCounts = {};
            const ageCounts = { '0-17': 0, '18-29': 0, '30-49': 0, '50-64': 0, '65+': 0, 'Unknown': 0 };
            const genderCounts = { 'male': 0, 'female': 0, 'other': 0, 'unknown': 0 };

            requestsSnapshot.forEach(doc => {
                const data = doc.data();
                const type = data.type || data.documentType || 'Other';
                
                // Count Types
                typeCounts[type] = (typeCounts[type] || 0) + 1;

                // Demographics
                const userId = data.userId;
                if (userId && userMap[userId]) {
                    const user = userMap[userId];
                    
                    // Gender
                    const gender = user.gender;
                    if (genderCounts[gender] !== undefined) {
                        genderCounts[gender]++;
                    } else {
                        genderCounts['unknown']++;
                    }

                    // Age
                    if (user.birthdate) {
                        const age = this.calculateAge(user.birthdate);
                        if (age < 18) ageCounts['0-17']++;
                        else if (age < 30) ageCounts['18-29']++;
                        else if (age < 50) ageCounts['30-49']++;
                        else if (age < 65) ageCounts['50-64']++;
                        else ageCounts['65+']++;
                    } else {
                        ageCounts['Unknown']++;
                    }
                } else {
                    genderCounts['unknown']++;
                    ageCounts['Unknown']++;
                }
            });

            this.analyticsData = { typeCounts, ageCounts, genderCounts };
            this.renderCharts();

        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    },

    calculateAge(birthdateString) {
        if (!birthdateString) return -1;
        const today = new Date();
        const birthDate = new Date(birthdateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },

    renderCharts() {
        const { typeCounts, ageCounts, genderCounts } = this.analyticsData;

        // 1. Request Types (Doughnut)
        const typeCtx = document.getElementById('requestTypeChart');
        if (typeCtx) {
            new Chart(typeCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(typeCounts).map(k => k.replace(/-/g, ' ').toUpperCase()),
                    datasets: [{
                        data: Object.values(typeCounts),
                        backgroundColor: [
                            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
        }

        // 2. Age (Bar)
        const ageCtx = document.getElementById('ageChart');
        if (ageCtx) {
            new Chart(ageCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(ageCounts),
                    datasets: [{
                        label: 'Requests by Age',
                        data: Object.values(ageCounts),
                        backgroundColor: '#36b9cc'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // 3. Gender (Pie/Doughnut)
        const genderCtx = document.getElementById('genderChart');
        if (genderCtx) {
             const genderLabels = Object.keys(genderCounts).map(g => g.charAt(0).toUpperCase() + g.slice(1));
             new Chart(genderCtx, {
                type: 'pie',
                data: {
                    labels: genderLabels,
                    datasets: [{
                        data: Object.values(genderCounts),
                        backgroundColor: ['#4e73df', '#e74a3b', '#f6c23e', '#858796'] // Male(Blue), Female(Red), Other(Yellow), Unknown(Gray)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
        }
    },

    setupRealTimeNotifications() {
      // Requests listener
      const requestsQuery = query(collection(db, 'requests'), orderBy('createdAt', 'desc'))
      
      this.unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
        // Check for new requests
        const currentCount = snapshot.docs.filter(doc => 
          doc.data().status === 'pending').length
        
        if (currentCount > this.lastRequestCount) {
          const newRequests = currentCount - this.lastRequestCount
          this.addNotification(
            'new_request',
            `${newRequests} new request${newRequests > 1 ? 's' : ''} received`,
            new Date()
          )
        }
        this.lastRequestCount = currentCount
        
        // Update recent requests
        this.recentRequests = snapshot.docs.slice(0, 5).map(doc => {
          const data = doc.data()
          return {
            id: data.id || doc.id,
            userName: data.userName || 'Unknown',
            type: data.type || data.documentType || 'Unknown',
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate?.() || null,
            updatedAt: data.updatedAt?.toDate?.() || null
          }
        })
      })

      // Reports listener
      const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
      
      this.unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
        // Check for new reports
        const currentCount = snapshot.docs.filter(doc => 
          doc.data().status === 'pending').length
        
        if (currentCount > this.lastReportCount) {
          const newReports = currentCount - this.lastReportCount
          this.addNotification(
            'new_report',
            `${newReports} new report${newReports > 1 ? 's' : ''} received`,
            new Date()
          )
        }
        this.lastReportCount = currentCount
        
        // Update recent reports
        this.recentReports = snapshot.docs.slice(0, 5).map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            userName: data.userName || 'Unknown',
            reportType: data.reportType || 'Unknown',
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate?.() || null,
            updatedAt: data.updatedAt?.toDate?.() || null
          }
        })
      })
    },

    addNotification(type, message, timestamp) {
      const newNotification = {
        id: Date.now(),
        type,
        message,
        timestamp,
        read: false
      }
      this.notifications.unshift(newNotification)
      this.unreadCount++
      
      // Play notification sound
      this.playNotificationSound()
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('New Barangay Request', {
          body: message,
          icon: '/favicon.ico'
        })
      }
    },

    playNotificationSound() {
      const audio = new Audio('/notification-sound.mp3')
      audio.play().catch(e => console.log('Audio play failed:', e))
    },

    toggleNotifications() {
      this.showNotifications = !this.showNotifications
      if (this.showNotifications) {
        this.markAllAsRead()
      }
    },

    markAllAsRead() {
      this.notifications.forEach(notification => {
        notification.read = true
      })
      this.unreadCount = 0
    },

    handleNotificationClick(notification) {
      notification.read = true
      this.unreadCount = Math.max(0, this.unreadCount - 1)
      
      // You can add navigation logic here based on notification type
      if (notification.type === 'new_request') {
        // Navigate to requests page or refresh data
        this.fetchRecentRequests()
        this.fetchStats()
      }
      if (notification.type === 'new_report') {
        // Navigate to reports page or refresh data
        this.fetchRecentReports()
        this.fetchStats()
      }
    },

    getNotificationIcon(type) {
      switch (type) {
        case 'new_request': return 'fa-file-alt'
        case 'new_report': return 'fa-flag'
        case 'status_update': return 'fa-sync-alt'
        default: return 'fa-info-circle'
      }
    },

    formatTimeAgo(timestamp) {
      const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
      
      const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
      }
      
      for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit)
        if (interval >= 1) {
          return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`
        }
      }
      
      return 'Just now'
    },

    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  mounted() {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission)
      })
    }
  }
}
</script>

<style scoped>
.official-dashboard {
  padding: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.dashboard-header h2 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #64748b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.025em;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.notification-container {
  position: relative;
}

.notification-btn {
  background: white;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.notification-btn:hover {
  background-color: #f8fafc;
  transform: translateY(-1px);
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  border-radius: 9999px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0 4px;
  border: 2px solid white;
}

/* Premium Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.premium-stat-card {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 1.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.premium-stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.stat-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1.25rem;
}

.bg-blue { background: #eff6ff; color: #2563eb; }
.bg-orange { background: #fff7ed; color: #ea580c; }
.bg-yellow { background: #fefce8; color: #ca8a04; }
.bg-green { background: #f0fdf4; color: #16a34a; }

.stat-title {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.025em;
}

/* Sections */
.dashboard-section {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header h3 i {
  color: #3b82f6;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.75rem;
}

.modern-table th {
  padding: 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  border: none;
}

.modern-table tbody tr {
  background: white;
  transition: all 0.2s;
}

.modern-table td {
  padding: 1.25rem 1rem;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.925rem;
}

.modern-table td:first-child {
  border-left: 1px solid #f1f5f9;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.modern-table td:last-child {
  border-right: 1px solid #f1f5f9;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.approved { background: #dcfce7; color: #166534; }
.status-badge.rejected { background: #fee2e2; color: #991b1b; }
.status-badge.resolved { background: #dcfce7; color: #166534; }

/* Analytics */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.chart-card h4 {
  font-size: 0.875rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 1rem;
  text-align: center;
}

.chart-container {
  position: relative;
  height: 250px;
}

@media (max-width: 768px) {
  .official-dashboard {
    padding: 1.5rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}
</style>