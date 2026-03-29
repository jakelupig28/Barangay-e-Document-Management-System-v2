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
    
    <div class="stats-container">
      <div class="stat-card" v-for="(stat, index) in statCards" :key="index">
        <div class="stat-icon" :class="stat.iconClass">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stat.title }}</h3>
          <p>{{ stat.value }}</p>
          <span class="stat-trend" v-if="stat.trend">
            <i :class="stat.trendIcon"></i> {{ stat.trend }}% from last month
          </span>
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
      // Keep the original layout while running in local JSON mode.
      this.stats.totalResidents = 0
      this.stats.pendingRequests = 0
      this.stats.completedRequests = 0
      this.stats.pendingReports = 0
      this.stats.resolvedReports = 0
      this.recentRequests = []
      this.recentReports = []
      this.notifications = []
      this.unreadCount = 0
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
.analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.chart-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e3e6f0;
}

.chart-card h4 {
    margin-bottom: 1rem;
    color: #5a5c69;
    font-size: 1.1rem;
    font-weight: 700;
    text-align: center;
}

.chart-container {
    position: relative;
    height: 300px;
    width: 100%;
}

.official-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dashboard-header h2 i {
  font-size: 1.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.last-updated {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.notification-container {
  position: relative;
}

.notification-btn {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.notification-btn:hover {
  background-color: #f0f0f0;
}

.notification-btn i {
  font-size: 1.2rem;
  color: #555;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.notification-dropdown {
  position: absolute;
  right: 0;
  top: 50px;
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 500px;
  overflow-y: auto;
}

.notification-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
}

.mark-read-btn:hover {
  text-decoration: underline;
}

.notification-list {
  padding: 0;
}

.notification-item {
  padding: 1rem;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: #f8fafd;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  flex-shrink: 0;
}

.notification-content {
  flex-grow: 1;
}

.notification-message {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 0.9rem;
}

.notification-time {
  color: #999;
  font-size: 0.75rem;
}

.empty-notifications {
  padding: 1.5rem;
  text-align: center;
  color: #999;
}

/* Rest of your existing styles... */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.bg-blue {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.bg-orange {
  background: linear-gradient(135deg, #e67e22, #d35400);
}

.bg-green {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.bg-yellow {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.stat-content h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.stat-content p {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-trend {
  font-size: 0.75rem;
  color: #95a5a6;
}

.stat-trend i {
  margin-right: 0.25rem;
}

.dashboard-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.table-container {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table thead {
  background-color: #f8f9fa;
}

.modern-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #7f8c8d;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid #ecf0f1;
  font-size: 0.95rem;
}

.modern-table tr:last-child td {
  border-bottom: none;
}

.modern-table tr:hover {
  background-color: #f8f9fa;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-info i {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.processing {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.in-progress {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.resolved {
  background-color: #d4edda;
  color: #155724;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .notification-dropdown {
    width: 280px;
    right: -20px;
  }
  
  .modern-table th, 
  .modern-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>