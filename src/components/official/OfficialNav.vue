<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <router-link class="sidebar-brand" to="/official/dashboard">
          <div class="brand-content">
            <div class="brand-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022zM6 8.694 1 10.36V15h5V8.694zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5V15z"/>
                <path d="M2 11h1v1H2v-1zm2 0h1v1H4v-1zm-2 2h1v1H2v-1zm2 0h1v1H4v-1zm4-4h1v1H8V9zm2 0h1v1h-1V9zm-2 2h1v1H8v-1zm2 0h1v1h-1v-1zm2-2h1v1h-1V9zm0 2h1v1h-1v-1zM8 7h1v1H8V7zm2 0h1v1h-1V7zm2 0h1v1h-1V7zM8 5h1v1H8V5zm2 0h1v1h-1V5zm2 0h1v1h-1V5zm0-2h1v1h-1V3z"/>
              </svg>
            </div>
            <span class="brand-text" v-show="!isCollapsed">Barangay Staff Portal</span>
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
            <router-link class="nav-link" active-class="active" to="/official/dashboard">
              <i class="nav-icon fas fa-tachometer-alt"></i>
              <span class="nav-text">Dashboard</span>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/official/residents">
              <i class="nav-icon fas fa-users"></i>
              <span class="nav-text">Residents</span>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/official/requests">
              <i class="nav-icon fas fa-clipboard-list"></i>
              <span class="nav-text">Requests</span>
            </router-link>
          </li>

          <!-- NEW: Reports -->
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/official/reports">
              <i class="nav-icon fas fa-file-alt"></i>
              <span class="nav-text">Reports</span>
            </router-link>
          </li>

          <!-- NEW: Templates -->
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/official/templates">
              <i class="nav-icon fas fa-certificate"></i>
              <span class="nav-text">Templates</span>
            </router-link>
          </li>
          
          <li class="nav-item">
  <router-link class="nav-link" active-class="active" to="/official/settings">
    <i class="nav-icon fas fa-cog"></i>
    <span class="nav-text">Settings</span>
  </router-link>
</li>


        </ul>
        
      </nav>

      
      <div class="sidebar-footer">
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
import { useRouter } from 'vue-router';
import { ref, getCurrentInstance } from 'vue';

export default {
  name: 'OfficialSidebarLayout',
  setup() {
    const router = useRouter();
    const vm = getCurrentInstance();
    const isCollapsed = ref(false);

    const logout = async () => {
      await vm.proxy.$store.dispatch('logout');
      router.push('/login');
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

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background: linear-gradient(135deg, #1e3a8a, #1e40af);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  position: fixed;
  height: 100vh;
  /* Remove overflow-y: auto to disable scrolling */
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
  flex-shrink: 0;
}

.brand-logo svg {
  width: 20px;
  height: 20px;
}

.brand-text {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .brand-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Improved Toggle Button */
.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  border: 2px solid #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #1e3a8a;
  font-size: 0.7rem;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
}

.sidebar-toggle:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: #f8f9fa;
}

.sidebar-toggle:active {
  transform: translateY(-50%) scale(0.95);
}

/* Navigation Styles */
.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
  /* Ensure no scrolling */
  overflow: hidden;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  /* Prevent any potential scrolling */
  height: 100%;
  overflow: hidden;
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
  flex-shrink: 0;
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

/* Footer Styles */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  /* Ensure footer stays at bottom without causing scroll */
  flex-shrink: 0;
}

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
  flex-shrink: 0;
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

/* Main Content Styles */
.main-content {
  flex: 1;
  transition: all 0.3s ease;
  overflow-x: auto;
  margin-left: 260px;
}

.main-content.expanded {
  margin-left: 70px;
}

.content-wrapper {
  padding: 2rem;
  min-height: 100%;
}

/* Responsive Design */
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
  
  .main-content {
    margin-left: 0 !important;
  }
  
  .mobile-menu-toggle {
    display: block;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1001;
    background: #1e3a8a;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem;
    cursor: pointer;
  }

  .sidebar-toggle {
    right: -14px;
    width: 32px;
    height: 32px;
  }
}

/* Animation for sidebar items */
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

/* Smooth transitions for all collapsed states */
.sidebar.collapsed .nav-link,
.sidebar.collapsed .logout-btn,
.sidebar.collapsed .brand-content {
  transition: all 0.3s ease;
}
</style>