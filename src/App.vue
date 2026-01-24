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
      <template v-if="!maintenanceMode || isAdmin">
        
        <!-- SK Layout -->
        <template v-if="userRole === 'sk' && showNav">
          <SKNav>
            <Notification />
            <main><router-view /></main>
          </SKNav>
        </template>

        <!-- Resident Layout -->
        <template v-else-if="userRole === 'resident' && showNav">
          <ResidentNav>
            <Notification />
            <router-view />
          </ResidentNav>
        </template>

        <!-- Official Layout -->
        <template v-else-if="userRole === 'official' && showNav">
          <OfficialNav>
            <Notification />
            <router-view />
          </OfficialNav>
        </template>

        <!-- Admin Layout -->
        <template v-else-if="userRole === 'admin' && showNav">
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
      <UnderMaintenance v-if="maintenanceMode && !isAdmin" />
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
        'maintenance'
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
      return this.$store.state.maintenance;
    },
    isAdmin() {
      return this.userRole === 'admin';
    }
  },
  watch: {
    userRole(newVal) {
      if (newVal !== undefined && newVal !== null) {
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
    try {
      await this.$store.dispatch('auth/initializeAuth');
      await this.$store.dispatch('checkMaintenanceStatus');
    } catch (e) {
      console.error('Error initializing auth:', e);
    }

    this.loading = false;

    if (this.userRole !== undefined && this.userRole !== null) {
      this.roleLoading = false;
    }
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
</style>