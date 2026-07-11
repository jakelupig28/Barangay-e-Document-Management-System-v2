<template>
  <div class="official-dashboard">
    <div class="dashboard-header">
      <h2><i class=""></i> Barangay Official Dashboard</h2>
      <div class="header-right">
        <RealTimeClock />
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
        <div class="chart-card">
          <h4>Resident Registrations</h4>
          <div class="chart-container">
            <canvas id="registrationChart"></canvas>
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
              <td>{{ formatDocType(request.type) }}</td>
              <td>{{ formatDate(request.createdAt) }}</td>
              <td>
                <span :class="'status-badge ' + (request.status || '').toLowerCase()">
                  {{ request.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Resident Registrations -->
    <div class="dashboard-section">
      <div class="section-header">
        <h3><i class="fas fa-user-plus"></i> Recent Resident Registrations</h3>
      </div>
      
      <div class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Resident Name</th>
              <th>Registered</th>
              <th>Tagged Compliance</th>
              <th>Approved</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="resident in recentResidents" :key="resident.id">
              <td>
                <div class="user-info">
                  {{ resident.name }}
                </div>
              </td>
              <td>{{ formatDate(resident.createdAt) }}</td>
              <td>{{ resident.complianceAt ? formatDate(resident.complianceAt) : 'N/A' }}</td>
              <td>{{ resident.approvedAt ? formatDate(resident.approvedAt) : 'N/A' }}</td>
              <td>
                <span :class="'status-badge ' + getResidentStatusClass(resident.status)">
                  {{ getResidentStatusText(resident.status) }}
                </span>
              </td>
            </tr>
            <tr v-if="!recentResidents || recentResidents.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">No recent registrations</td>
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
import Chart from 'chart.js/auto'

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
      recentResidents: [],
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
      await this.fetchRecentResidents()
      await this.fetchAnalytics()
      this.setupRealTimeNotifications()
    },
    loadLocalDashboardData() {
      const dbData = localDb.readDb();
      this.stats.totalResidents = dbData.users?.filter(u => u.role === 'resident').length || 0;
      this.stats.pendingRequests = dbData.requests?.filter(r => r.status === 'pending').length || 0;
      this.stats.completedRequests = dbData.requests?.filter(r => r.status === 'approved' || r.status === 'claimed').length || 0;
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
      
      this.recentResidents = (dbData.users || [])
        .filter(u => u.role === 'resident')
        .slice(-5)
        .reverse()
        .map(u => ({
          id: u.id,
          name: u.profile?.name || u.name || 'Not provided',
          status: u.status || 'pending',
          createdAt: u.createdAt || u.profile?.createdAt || null,
          complianceAt: u.complianceAt || null,
          approvedAt: u.approvedAt || (u.status === 'approved' || u.isApproved ? u.updatedAt || u.createdAt : null)
        }));

      // Compute local analytics for charts
      const residents = dbData.users?.filter(u => u.role === 'resident') || [];
      const requests = dbData.requests || [];

      // 1. Request Types
      const typeCounts = {
        'barangay-certificate': 0,
        'certificate-of-indigency-financial': 0,
        'certificate-of-indigency-general': 0
      };
      requests.forEach(r => {
        const rawType = r.type || r.documentType || '';
        const mappedType = this.mapRequestType(rawType);
        typeCounts[mappedType] = (typeCounts[mappedType] || 0) + 1;
      });

      // 2. Age & Gender & Registration Demographics
      const ageCounts = { '0-17': 0, '18-29': 0, '30-49': 0, '50-64': 0, '65+': 0, 'Unknown': 0 };
      const genderCounts = { 'male': 0, 'female': 0, 'other': 0, 'unknown': 0 };
      const regCounts = { 'In Validation': 0, 'Approved': 0, 'Rejected': 0, 'In Compliance': 0 };

      // Map to quickly find user profile
      const userMap = {};
      residents.forEach(u => {
        userMap[u.id] = {
          gender: u.profile?.gender ? u.profile.gender.toLowerCase() : 'unknown',
          birthdate: u.profile?.birthdate
        };

        // Populate registration counts
        const status = u.status || 'pending';
        const isApproved = u.isApproved || false;
        if (status === 'approved' || status === 'active' || isApproved) {
          regCounts['Approved']++;
        } else if (status === 'compliance') {
          regCounts['In Compliance']++;
        } else if (status === 'rejected') {
          regCounts['Rejected']++;
        } else {
          regCounts['In Validation']++;
        }
      });

      requests.forEach(r => {
        const userId = r.userId;
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

      this.analyticsData = { typeCounts, ageCounts, genderCounts, registrationCounts: regCounts };
      this.$nextTick(() => {
        this.renderCharts();
      });
      
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
      
      const approvedQuery = query(
        collection(db, 'requests'),
        where('status', '==', 'approved'),
        where('updatedAt', '>=', startOfMonth)
      )
      const claimedQuery = query(
        collection(db, 'requests'),
        where('status', '==', 'claimed'),
        where('updatedAt', '>=', startOfMonth)
      )
      const [approvedSnap, claimedSnap] = await Promise.all([
        getDocs(approvedQuery),
        getDocs(claimedQuery)
      ])
      this.stats.completedRequests = approvedSnap.size + claimedSnap.size

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

    async fetchRecentResidents() {
      if (!this.isFirebaseReady()) {
        this.loadLocalDashboardData()
        return
      }
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'resident'),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const snapshot = await getDocs(q)
        this.recentResidents = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.profile?.name || data.name || 'Not provided',
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
            complianceAt: data.complianceAt?.toDate?.() || data.complianceAt || null,
            approvedAt: data.approvedAt?.toDate?.() || data.approvedAt || (data.status === 'approved' || data.isApproved ? data.updatedAt || data.createdAt : null)
          }
        })
      } catch (error) {
        console.error("Error fetching recent residents:", error);
      }
    },

    async fetchAnalytics() {
        try {
            // 1. Fetch all residents to build demographic map
            const residentsQuery = query(collection(db, 'users'), where('role', '==', 'resident'));
            const residentsSnapshot = await getDocs(residentsQuery);
            const userMap = {};
            const regCounts = { 'In Validation': 0, 'Approved': 0, 'Rejected': 0, 'In Compliance': 0 };
            
            residentsSnapshot.forEach(doc => {
                const data = doc.data();
                userMap[doc.id] = {
                    gender: data.gender ? data.gender.toLowerCase() : (data.profile?.gender ? data.profile.gender.toLowerCase() : 'unknown'),
                    birthdate: data.birthdate || data.profile?.birthdate
                };

                // Populate registration counts
                const status = data.status || 'pending';
                const isApproved = data.isApproved || false;
                if (status === 'approved' || status === 'active' || isApproved) {
                    regCounts['Approved']++;
                } else if (status === 'compliance') {
                    regCounts['In Compliance']++;
                } else if (status === 'rejected') {
                    regCounts['Rejected']++;
                } else {
                    regCounts['In Validation']++;
                }
            });

            // 2. Fetch all requests
            // In a large app, you would use aggregation queries or process this in a cloud function.
            // For this app, fetching all is acceptable.
            const requestsQuery = query(collection(db, 'requests'));
            const requestsSnapshot = await getDocs(requestsQuery);

            const typeCounts = {
              'barangay-certificate': 0,
              'certificate-of-indigency-financial': 0,
              'certificate-of-indigency-general': 0
            };
            const ageCounts = { '0-17': 0, '18-29': 0, '30-49': 0, '50-64': 0, '65+': 0, 'Unknown': 0 };
            const genderCounts = { 'male': 0, 'female': 0, 'other': 0, 'unknown': 0 };

            requestsSnapshot.forEach(doc => {
                const data = doc.data();
                const type = data.type || data.documentType || '';
                const mappedType = this.mapRequestType(type);
                
                // Count Types
                typeCounts[mappedType] = (typeCounts[mappedType] || 0) + 1;

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

            this.analyticsData = { typeCounts, ageCounts, genderCounts, registrationCounts: regCounts };
            this.renderCharts();

        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    },

    mapRequestType(rawType) {
      if (!rawType) return 'barangay-certificate';
      const t = rawType.toLowerCase().trim();
      if (t.includes('indigency-financial') || t.includes('financial')) {
        return 'certificate-of-indigency-financial';
      }
      if (t.includes('indigency-general') || t.includes('general') || t.includes('indigency') || t.includes('indigent')) {
        return 'certificate-of-indigency-general';
      }
      return 'barangay-certificate';
    },
    formatDocType(type) {
      const mapped = this.mapRequestType(type);
      if (mapped === 'barangay-certificate') return 'Barangay Certificate';
      if (mapped === 'certificate-of-indigency-financial') return 'Certificate of Indigency (Financial Assistance)';
      if (mapped === 'certificate-of-indigency-general') return 'Certificate of Indigency (General Purpose)';
      return type;
    },
    getResidentStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved' || s === 'active') return 'approved';
      if (s === 'pending_validation' || s === 'pending') return 'pending';
      if (s === 'compliance') return 'compliance';
      if (s === 'rejected') return 'rejected';
      return 'pending';
    },
    getResidentStatusText(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved' || s === 'active') return 'Approved';
      if (s === 'pending_validation' || s === 'pending') return 'Pending';
      if (s === 'compliance') return 'Compliance';
      if (s === 'rejected') return 'Rejected';
      return 'Pending';
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
        const { typeCounts, ageCounts, genderCounts, registrationCounts } = this.analyticsData;

        // 1. Request Types (Doughnut)
        const typeCtx = document.getElementById('requestTypeChart');
        if (typeCtx) {
            new Chart(typeCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(typeCounts).map(k => {
                      if (k === 'barangay-certificate') return 'BARANGAY CERTIFICATE';
                      if (k === 'certificate-of-indigency-financial') return 'CERTIFICATE OF INDIGENCY (FINANCIAL ASSISTANCE)';
                      if (k === 'certificate-of-indigency-general') return 'CERTIFICATE OF INDIGENCY (GENERAL PURPOSE)';
                      return k.replace(/-/g, ' ').toUpperCase();
                    }),
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
             const filteredGenderCounts = {
                 'Male': genderCounts['male'] || 0,
                 'Female': genderCounts['female'] || 0
             };
             new Chart(genderCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(filteredGenderCounts),
                    datasets: [{
                        data: Object.values(filteredGenderCounts),
                        backgroundColor: ['#4e73df', '#e74a3b'] // Male(Blue), Female(Red)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
        }

        // 4. Resident Registration (Bar)
        const regCtx = document.getElementById('registrationChart');
        if (regCtx) {
             const regCounts = registrationCounts || { 'In Validation': 0, 'Approved': 0, 'Rejected': 0, 'In Compliance': 0 };
             new Chart(regCtx, {
                 type: 'bar',
                 data: {
                     labels: Object.keys(regCounts),
                     datasets: [{
                         label: 'Residents Count',
                         data: Object.values(regCounts),
                         backgroundColor: ['#f6c23e', '#1cc88a', '#e74a3b', '#36b9cc'],
                         borderRadius: 8
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
.status-badge.claimed { background: #e0f2fe; color: #0369a1; }
.status-badge.compliance { background: #e0f2fe; color: #0369a1; }

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