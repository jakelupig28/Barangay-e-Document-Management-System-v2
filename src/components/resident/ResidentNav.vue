<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <router-link class="sidebar-brand" to="/resident/dashboard">
          <div class="brand-content">
            <div class="brand-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span class="brand-text" v-show="!isCollapsed">Resident Portal</span>
          </div>
        </router-link>
        <button 
          class="sidebar-toggle" 
          @click="toggleSidebar"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/resident/dashboard">
              <i class="nav-icon fas fa-tachometer-alt"></i>
              <span class="nav-text">Dashboard</span>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/resident/profile">
              <i class="nav-icon fas fa-user"></i>
              <span class="nav-text">Profile</span>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/resident/request">
              <i class="nav-icon fas fa-clipboard-list"></i>
              <span class="nav-text">Requests</span>
            </router-link>
          </li>

          <!-- New Report Section -->
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/resident/report">
              <i class="nav-icon fas fa-flag"></i>
              <span class="nav-text">eReports</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/resident/feedback">
              <i class="nav-icon fas fa-comment-dots"></i>
              <span class="nav-text">Feedback</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/resident/settings">
              <i class="nav-icon fas fa-cog"></i>
              <span class="nav-text">Settings</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Fixed Logout Button -->
      <div class="sidebar-footer" :class="{ collapsed: isCollapsed }">
        <button class="logout-btn" @click="logout">
          <i class="logout-icon fas fa-sign-out-alt"></i>
          <span class="logout-text" v-show="!isCollapsed">Logout</span>
        </button>
      </div>
    </aside>
    
    <!-- Main Content -->
    <main class="main-content" :class="{ 'expanded': isCollapsed }">
      <div class="content-wrapper">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script>
import { auth } from '@/firebase/config';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

export default {
  name: 'ResidentNav',
  setup() {
    const router = useRouter();
    const isCollapsed = ref(false);

    const logout = async () => {
      try {
        await auth.signOut();
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    return { logout, isCollapsed, toggleSidebar };
  },
};
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  position: relative;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem 1rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.sidebar-brand {
  color: white;
  text-decoration: none;
  display: block;
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.brand-logo svg {
  width: 20px;
  height: 20px;
}

.brand-text {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.5px;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .brand-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Sidebar toggle */
.sidebar-toggle {
  position: absolute;
  top: 1.5rem;
  right: -12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  color: #4361ee;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  transform: scale(1.1);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 0;
  padding-bottom: 5rem; /* Space for footer */
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  margin: 0 0.5rem;
  border-radius: 0 8px 8px 0;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border-left-color: white;
  font-weight: 600;
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
}

.nav-text {
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Fixed Footer */
.sidebar-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 260px;

  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1001;
}

.sidebar.collapsed .sidebar-footer {
  width: 70px;
}

/* Logout button */
.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.logout-icon {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
}

.logout-text {
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .logout-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Main content */
.main-content {
  flex: 1;
  transition: all 0.3s ease;
  overflow-x: auto;
}

.main-content.expanded {
  margin-left: 0;
}

.content-wrapper {
  padding: 2rem;
  min-height: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100%;
    transform: translateX(-100%);
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 260px;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-footer {
    width: 260px !important;
  }

  .main-content {
    margin-left: 0 !important;
  }

  .mobile-menu-toggle {
    display: block;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1001;
    background: #4361ee;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem;
    cursor: pointer;
  }
}

/* Glow hover effect */
.nav-link, .logout-btn {
  position: relative;
  overflow: hidden;
}

.nav-link::after, .logout-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-link:hover::after, .logout-btn:hover::after {
  left: 100%;
}
</style>
