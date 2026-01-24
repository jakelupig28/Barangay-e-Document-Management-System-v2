<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <router-link class="sidebar-brand" to="/sk/dashboard">
          <div class="brand-content">
            <div class="sk-logo">
              <i class="fas fa-users"></i>
            </div>
            <span class="brand-text" v-show="!isCollapsed">SK Portal</span>
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
          <!-- Dashboard (commented out in your original) -->
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/sk/dashboard">
              <i class="nav-icon fas fa-tachometer-alt"></i>
              <span class="nav-text">Dashboard</span>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/sk/members">
              <i class="nav-icon fas fa-users"></i>
              <span class="nav-text">Members</span>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" to="/sk/forum">
              <i class="nav-icon fas fa-comments"></i>
              <span class="nav-text">Forum</span>
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
import { auth } from '@/firebase/config';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

export default {
  name: 'SidebarLayout',
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

    return { 
      logout, 
      isCollapsed, 
      toggleSidebar 
    };
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
  background: linear-gradient(135deg, #28a745, #218838);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
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

.sk-logo {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  flex-shrink: 0;
}

.sk-logo i {
  font-size: 1.2rem;
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
  color: #28a745;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  transform: scale(1.1);
}

/* Navigation Styles */
.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
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
}

.main-content.expanded {
  margin-left: 0;
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
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem;
    cursor: pointer;
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
</style>