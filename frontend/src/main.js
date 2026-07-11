import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// Client-side Security: Anti-scraping, Anti-inspection, and Console Protection
(function() {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.error = noop;
  console.debug = noop;
  console.dir = noop;
  console.table = noop;

  // Disable right-click context menu (anti-scraping)
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  // Disable keyboard shortcuts for Developer Tools (F12, Ctrl+Shift+I/J/C, Ctrl+U)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'F12') {
      event.preventDefault();
      return false;
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && 
        (event.key === 'I' || event.key === 'i' || 
         event.key === 'J' || event.key === 'j' || 
         event.key === 'C' || event.key === 'c')) {
      event.preventDefault();
      return false;
    }
    if ((event.ctrlKey || event.metaKey) && (event.key === 'U' || event.key === 'u')) {
      event.preventDefault();
      return false;
    }
  });
})();

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Font Awesome Setup
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

// Import Notification components
import Notification from '@/components/Notification.vue';
import NotificationService from '@/services/notification';


import './assets/styles/sk-portal.css'  


// Add all solid icons to the library
library.add(fas);

const app = createApp(App);

// Register Font Awesome globally
app.component('font-awesome-icon', FontAwesomeIcon);

// Register Notification component globally
app.component('Notification', Notification);

// Register Notification service
app.use(NotificationService);
app.use(store);
app.use(router);
// Sync localStorage with local.json on startup
fetch('/api/sync-local')
  .then(res => res.json())
  .then(data => {
    if (data) {
      localStorage.setItem('barangay_local_db_v2', JSON.stringify(data));
    }
  })
  .catch(err => console.error('Failed to sync local database:', err))
  .finally(() => {
    app.mount('#app');
  });