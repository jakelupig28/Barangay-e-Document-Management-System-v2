import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

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
app.mount('#app');