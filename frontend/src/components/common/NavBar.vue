<template>
  <nav class="navbar-modern">
    <div class="container">
      <!-- Brand Logo -->
      <router-link to="/" class="navbar-brand" @click="closeMenus">
        <div class="logo-container">
          <svg class="brand-icon-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="brand-text">Barangay e-Document Request</span>
        </div>
      </router-link>

      <!-- Hamburger menu (for mobile) -->
      <button 
        class="navbar-toggler" 
        type="button" 
        @click="isOpen = !isOpen"
        aria-label="Toggle navigation"
      >
        <div class="hamburger" :class="{ 'active': isOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <!-- Navigation Content -->
      <div class="navbar-content" :class="{ 'show': isOpen }">
        <ul class="nav-links">
          <li class="nav-item" v-for="link in mainLinks" :key="link.to">
            <router-link 
              :to="link.to" 
              class="nav-link" 
              :class="{ 'active': $route.path === link.to }"
              @click="isOpen = false"
            >
              {{ link.text }}
            </router-link>
          </li>
        </ul>

        <!-- Auth Section -->
        <div class="auth-section">
          <!-- Dark Mode Toggle Icon -->
          <button 
            class="theme-toggle-nav-btn" 
            @click="toggleDarkMode" 
            :aria-label="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            type="button"
          >
            <i :class="isDarkMode ? 'fas fa-moon' : 'fas fa-sun'"></i>
          </button>

          <template v-if="isAuthenticated && user">
            <!-- User Dropdown -->
            <div class="user-dropdown" v-click-outside="() => showUserMenu = false">
              <button 
                class="user-btn"
                @click="toggleUserMenu"
                aria-label="User menu"
              >
                <div class="user-avatar">
                  {{ userInitials }}
                </div>
                <div class="user-info">
                  <span class="user-name">{{ user.name || user.email }}</span>
                  <span class="user-role">{{ roleDisplayName }}</span>
                </div>
                <svg class="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              
              <div class="dropdown-menu" :class="{ 'show': showUserMenu }">
                <div class="dropdown-header">
                  <div class="user-avatar large">
                    {{ userInitials }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.name || user.email }}</div>
                    <div class="user-role">{{ roleDisplayName }}</div>
                  </div>
                </div>
                
                <div class="dropdown-divider"></div>
                
                <router-link 
                  v-for="link in authLinks" 
                  :key="link.to"
                  :to="link.to" 
                  class="dropdown-item"
                  @click="closeMenus"
                >
                  <span>{{ link.text }}</span>
                </router-link>
                
                <div class="dropdown-divider"></div>
                
                <button class="dropdown-item logout" @click="handleLogout">
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link 
              to="/login" 
              class="auth-link login"
              @click="isOpen = false"
            >
              Login
            </router-link>
            <router-link 
              to="/register" 
              class="auth-link register"
              @click="isOpen = false"
            >
              Register
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'ModernNavbar',
  data() {
    return {
      isOpen: false,
      showUserMenu: false,
      isDarkMode: localStorage.getItem('global-dark-mode') === 'true',
      mainLinks: [
        { to: '/', text: 'Home' },
        { to: '/services', text: 'Services' },
        { to: '/about', text: 'About' },
      ],
    };
  },
  computed: {
    ...mapState({
      user: state => state.auth.user,
      isAuthenticated: state => state.auth.isAuthenticated,
    }),
    authLinks() {
      if (!this.isAuthenticated || !this.user?.role) return [];
      
      const userRole = this.user.role;
      const baseLinks = [];
      
      if (userRole === 'resident') {
        baseLinks.push({ to: '/resident/dashboard', text: 'Dashboard' });
        baseLinks.push(
          { to: '/resident/profile', text: 'My Profile' },
          { to: '/resident/request', text: 'My Requests' },
        );
      } else if (userRole === 'official' || userRole === 'barangay_staff') {
        baseLinks.push({ to: '/official/dashboard', text: 'Dashboard' });
        baseLinks.push(
          { to: '/official/residents', text: 'Residents' },
          { to: '/official/requests', text: 'Requests' },
        );
      } else if (userRole === 'sk') {
        baseLinks.push({ to: '/sk/dashboard', text: 'Dashboard' });
        baseLinks.push(
          { to: '/sk/projects', text: 'Projects' },
          { to: '/sk/youth', text: 'Youth Programs' },
        );
      } else if (userRole === 'admin' || userRole === 'super_admin') {
        baseLinks.push(
          { to: '/admin/dashboard', text: 'Admin Dashboard' },
        );
      }
      
      return baseLinks;
    },
    userInitials() {
      if (!this.user) return 'U';
      const displayName = this.user.name || this.user.email || 'User';
      const names = displayName.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    },
    roleDisplayName() {
      if (!this.user?.role) return 'User';
      const roles = {
        resident: 'Resident',
        barangay_staff: 'Barangay Staff',
        official: 'Barangay Official',
        sk: 'SK Official',
        super_admin: 'Administrator',
      };
      return roles[this.user.role] || this.user.role;
    },
  },
  methods: {
    ...mapActions(['logout']),
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('global-dark-mode', this.isDarkMode);
      document.body.classList.toggle('dark-mode', this.isDarkMode);
      document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    closeMenus() {
      this.isOpen = false;
      this.showUserMenu = false;
    },
    async handleLogout() {
      try {
        await this.$store.dispatch('logout');
        this.closeMenus();
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        this.$store.commit('setNotification', {
          message: 'Logout failed. Please try again.',
          type: 'error',
        });
      }
    },
  },
  mounted() {
    const isDark = localStorage.getItem('global-dark-mode') === 'true';
    this.isDarkMode = isDark;
    document.body.classList.toggle('dark-mode', isDark);
    document.documentElement.classList.toggle('dark-mode', isDark);
  },
  directives: {
    'click-outside': {
      beforeMount(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      },
    },
  },
};
</script>

<style scoped>
/* Modern Navbar Base */
.navbar-modern {
  background-color: #ffffff;
  color: #1e293b;
  padding: 0.85rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  font-family: 'Inter', sans-serif;
  border-bottom: 1px solid #f1f5f9;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 48px;
  position: relative;
}

.navbar-brand {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #2563eb;
}

.brand-icon-svg {
  color: #2563eb;
  fill: rgba(37, 99, 235, 0.08);
  flex-shrink: 0;
}

.brand-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
  color: #0f172a;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

/* Hamburger Menu (Mobile) */
.navbar-toggler {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: none;
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  cursor: pointer;
}

.hamburger span {
  display: block;
  height: 2px;
  width: 100%;
  background-color: #334155;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Navigation Content */
.navbar-content {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 993px) {
  .nav-links {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}

.nav-link {
  position: relative;
  padding: 0.5rem 0.75rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.nav-link:hover {
  color: #0f172a;
}

.nav-link.active {
  color: #2563eb;
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0.75rem;
  right: 0.75rem;
  height: 2px;
  background-color: #2563eb;
  border-radius: 2px;
}

/* Auth Section */
.auth-section {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.auth-link {
  padding: 0.55rem 1.25rem;
  border-radius: 50px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  font-size: 0.9rem;
}

.login {
  color: #0f172a;
  background: transparent;
}

.login:hover {
  color: #2563eb;
}

.register {
  background-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.register:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
}

/* User Dropdown */
.user-dropdown {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.user-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.user-avatar.large {
  width: 44px;
  height: 44px;
  font-size: 1.05rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 120px;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
}

.user-role {
  font-size: 0.7rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  color: #64748b;
}

.user-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 240px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 0.75rem 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.2s ease;
  z-index: 1000;
  border: 1px solid #e2e8f0;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details .user-name {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.user-details .user-role {
  color: #64748b;
  font-size: 0.75rem;
}

.dropdown-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 0.5rem 0;
}

.dropdown-item {
  display: block;
  padding: 0.65rem 1.25rem;
  color: #334155;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
  color: #2563eb;
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-item.logout:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

/* Mobile Responsiveness */
@media (max-width: 992px) {
  .brand-text {
    font-size: 1.15rem;
  }
  .navbar-toggler {
    display: block;
  }
  
  .navbar-content {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    background: #ffffff;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border-top: 1px solid #f1f5f9;
    max-height: calc(100vh - 72px);
    overflow-y: auto;
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    transform: translateY(-20px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    margin-left: 0;
  }
  
  .navbar-content.show {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-links {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .nav-link.active::after {
    display: none;
  }
  
  .auth-section {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    border-top: 1px solid #f1f5f9;
    padding-top: 1.25rem;
  }
  
  .login, .register {
    text-align: center;
  }
  
  .user-dropdown {
    margin-top: 0.5rem;
  }
  
  .dropdown-menu {
    position: static;
    box-shadow: none;
    border: 1px solid #f1f5f9;
    margin-top: 0.5rem;
    transform: none;
    opacity: 1;
    visibility: visible;
    display: none;
  }

  .dropdown-menu.show {
    display: block;
  }

  :global(body.dark-mode .navbar-content) {
    border-top: 1px solid #1e293b;
  }

  :global(body.dark-mode .auth-section) {
    border-top: 1px solid #1e293b;
  }
}

.theme-toggle-nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 1.25rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}

.theme-toggle-nav-btn:hover {
  color: #2563eb;
  background-color: #f1f5f9;
  transform: rotate(15deg);
}

.theme-toggle-nav-btn i {
  transition: transform 0.3s ease;
}

/* --- Dark Mode Styles --- */
:global(body.dark-mode .navbar-modern) {
  background-color: #0f172a;
  color: #f8fafc;
  border-bottom: 1px solid #1e293b;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

:global(body.dark-mode .brand-text) {
  color: #f8fafc;
}

:global(body.dark-mode .nav-link) {
  color: #94a3b8;
}

:global(body.dark-mode .nav-link:hover) {
  color: #f8fafc;
}

:global(body.dark-mode .nav-link.active) {
  color: #60a5fa;
}

:global(body.dark-mode .nav-link.active::after) {
  background-color: #60a5fa;
}

:global(body.dark-mode .login) {
  color: #f8fafc;
}

:global(body.dark-mode .login:hover) {
  color: #60a5fa;
}

:global(body.dark-mode .theme-toggle-nav-btn) {
  color: #94a3b8;
}

:global(body.dark-mode .theme-toggle-nav-btn:hover) {
  color: #60a5fa;
  background-color: #1e293b;
}

:global(body.dark-mode .navbar-content) {
  background-color: #0f172a;
}

:global(body.dark-mode .theme-toggle-nav-btn i.fa-sun) {
  color: #f59e0b;
}

:global(body.dark-mode .theme-toggle-nav-btn i.fa-moon) {
  color: #94a3b8;
}

:global(body.dark-mode .user-btn) {
  border-color: #334155;
  color: #f8fafc;
}

:global(body.dark-mode .user-btn:hover) {
  background-color: #1e293b;
  border-color: #475569;
}

:global(body.dark-mode .user-name) {
  color: #f8fafc;
}

:global(body.dark-mode .user-role) {
  color: #94a3b8;
}

:global(body.dark-mode .dropdown-menu) {
  background-color: #1e293b;
  border-color: #334155;
}

:global(body.dark-mode .dropdown-header .user-name) {
  color: #f8fafc;
}

:global(body.dark-mode .dropdown-header .user-role) {
  color: #94a3b8;
}

:global(body.dark-mode .dropdown-divider) {
  background-color: #334155;
}

:global(body.dark-mode .dropdown-item) {
  color: #cbd5e1;
}

:global(body.dark-mode .dropdown-item:hover) {
  background-color: #334155;
  color: #60a5fa;
}

:global(body.dark-mode .dropdown-item.logout) {
  color: #f87171;
}

:global(body.dark-mode .dropdown-item.logout:hover) {
  background-color: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

:global(body.dark-mode .navbar-toggler) {
  color: #f8fafc;
}

:global(body.dark-mode .hamburger span) {
  background-color: #cbd5e1;
}
</style>