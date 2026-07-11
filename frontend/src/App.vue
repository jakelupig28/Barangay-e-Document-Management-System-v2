<template>
  <div id="app">
    <!-- Loader -->
    <div
      v-if="(loading || roleLoading) && !hideLoadingRoutes.includes($route.name)"
      class="loading-overlay"
    >
      <div class="loading-content">
        <img src="@/assets/bis-logo.png" alt="Loading..." class="loading-logo" />
      </div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Maintenance mode -->
      <template v-if="!maintenanceMode || isAdmin || $route.name === 'login'">
        
        <!-- SK Layout -->
        <template v-if="userRole === 'sk' && showNav && isSkRoute">
          <SKNav>
            <Notification />
            <main><router-view /></main>
          </SKNav>
        </template>

        <!-- Resident Layout -->
        <template v-else-if="userRole === 'resident' && showNav && isResidentRoute">
          <ResidentNav>
            <Notification />
            <router-view />
          </ResidentNav>
        </template>

        <!-- Official Layout -->
        <template v-else-if="userRole === 'barangay_staff' && showNav && isStaffRoute">
          <OfficialNav>
            <Notification />
            <router-view />
          </OfficialNav>
        </template>

        <!-- Admin Layout -->
        <template v-else-if="userRole === 'super_admin' && showNav && isAdminRoute">
          <AdminNav />
          <Notification />
          <main><router-view /></main>
        </template>

        <!-- Public Layout -->
        <template v-else-if="showNav && !$route.meta.hideLayout">
          <NavBar />
          <Notification />
          <router-view />
          <Footer v-if="showFooter" />
        </template>

        <!-- No Layout (login/register/etc.) -->
        <template v-else>
          <Notification />
          <router-view />
        </template>

      </template>

      <!-- Maintenance Mode -->
      <UnderMaintenance v-if="maintenanceMode && !isAdmin && $route.name !== 'login'" />
    </template>
  </div>
</template>

<script>
import NavBar from '@/components/common/NavBar'
import ResidentNav from '@/components/resident/ResidentNav'
import OfficialNav from '@/components/official/OfficialNav'
import SKNav from '@/components/sk/SKNav'
import AdminNav from '@/components/admin/AdminNav'
import Footer from '@/components/common/Footer'
import Notification from '@/components/common/Notification'
import UnderMaintenance from '@/components/UnderMaintenance.vue'
import eReports from '@/views/Reports.vue'


export default {
  name: 'App',
  components: {
    NavBar,
    ResidentNav,
    OfficialNav,
    SKNav,
    AdminNav,
    Footer,
    Notification,
    UnderMaintenance
  },
  data() {
    return {
      loading: true,
      roleLoading: true,
      hideLoadingRoutes: [
        'home',
        'about',
        'services',
        'announcements',
        'login',
        'register',
        'eReports',
        'NotFound',
        'maintenance',
        'privacy',
        'terms'
      ]
    }
  },
  computed: {
    showNav() {
      return this.$route.name !== 'login' && 
             this.$route.name !== 'register' && 
             this.$route.name !== 'NotFound' &&
             this.$route.name !== 'pending-approval' &&
             !this.$route.meta.hideLayout;
    },
    showFooter() {
      const noFooterRoutes = ['login', 'register', 'admin-dashboard', 'NotFound', 'sk-member', 'sk-projects', 'sk-dashboard', 'RequestForm', 'ResidentProfile', 'ResidentDashboard'];
      return !noFooterRoutes.includes(this.$route.name) && !this.$route.meta.hideLayout;
    },
    userRole() {
      return this.$store.state.auth.user?.role ?? null;
    },
    maintenanceMode() {
      return this.$store.state.system?.maintenance || false;
    },
    isAdmin() {
      return this.userRole === 'super_admin';
    },
    isResidentRoute() {
      return this.$route.path.startsWith('/resident');
    },
    isStaffRoute() {
      return this.$route.path.startsWith('/official') || this.$route.path.startsWith('/staff');
    },
    isAdminRoute() {
      return this.$route.path.startsWith('/admin');
    },
    isSkRoute() {
      return this.$route.path.startsWith('/sk');
    }
  },
  watch: {
    userRole(newVal) {
      if (newVal !== undefined) {
        this.roleLoading = false;
      }
    },
    '$route'(to) {
      document.title = to.meta.title ? 
        `${to.meta.title} | Barangay Information System` : 
        'Barangay Information System';
    }
  },
  async created() {
    const isDark = localStorage.getItem('global-dark-mode') === 'true';
    document.body.classList.toggle('dark-mode', isDark);
    document.documentElement.classList.toggle('dark-mode', isDark);
    try {
      await this.$store.dispatch('initializeAuth');
    } catch (e) {
      console.error('Error initializing auth:', e);
    }

    this.loading = false;
    this.roleLoading = false;
  }
}
</script>

<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  z-index: 9999;
  flex-direction: column;
}

.loading-content {
  text-align: center;
}

.loading-logo {
  width: 400px;
  height: auto;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


/* Ensure main content doesn't have conflicting styles */
main {
  min-height: calc(100vh - 80px); /* Adjust based on your footer height */
}

/* Global Preview Modal Overlay Container (like templates preview) */
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
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  height: 100%;
  max-height: 100% !important;
  margin: 0 auto;
  transform-origin: top center;
  transition: transform 0.2s ease-out;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55);
}
</style>