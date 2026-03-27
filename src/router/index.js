import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';
import localDb from '@/services/localDb';

// Public views
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import About from '@/views/About.vue';
import Services from '@/views/Services.vue';
import Announcements from '@/views/Announcements.vue';
import eReports from '@/views/Reports.vue';
import PendingApproval from '@/views/PendingApproval.vue';

// Resident components
import ResidentDashboard from '@/components/resident/ResidentDashboard.vue';
import ResidentProfile from '@/components/resident/ResidentProfile.vue';
import RequestForm from '@/components/resident/RequestForm.vue';

// Barangay Official components
import OfficialDashboard from '@/components/official/OfficialDashboard.vue';
import ManageResidents from '@/components/official/ManageResidents.vue';
import ManageRequests from '@/components/official/ManageRequests.vue';
import CertificateTemplates from '@/components/official/CertificateTemplates.vue';


// SK Official components
import SKDashboard from '@/components/sk/SKDashboard.vue';
import SKProjects from '@/components/sk/SKProjects.vue';
import SKMember from '@/components/sk/SKMember.vue';

// Admin components
import AdminDashboard from '@/components/admin/AdminDashboard.vue';
import StaffPasswordChange from '@/components/official/StaffPasswordChange.vue';

import NotFound from '@/views/NotFound.vue'



const routes = [
  { path: '/', name: 'home', component: Home, meta: { title: 'Home' } },
  { path: '/login', name: 'login', component: Login, meta: { requiresGuest: true, title: 'Login' } },
  { path: '/register', name: 'register', component: Register, meta: { requiresGuest: true, title: 'Register' } },
  { path: '/about', name: 'about', component: About, meta: { title: 'About' } },
  { path: '/services', name: 'services', component: Services, meta: { title: 'Services' } },
  { path: '/announcements', name: 'announcements', component: Announcements, meta: { title: 'Announcements' } },
  { path: '/eReports', name: 'eReports', component: eReports, meta: { title: 'eReports' } },
  { path: '/pending-approval', name: 'pending-approval', component: PendingApproval, meta: { requiresAuth: true, title: 'Pending Approval' } },

  // Resident routes
  { path: '/resident/dashboard', name: 'resident-dashboard', component: ResidentDashboard, meta: { requiresAuth: true, allowedRoles: ['resident'], title: 'Resident Dashboard' } },
  { path: '/resident/profile', name: 'resident-profile', component: ResidentProfile, meta: { requiresAuth: true, allowedRoles: ['resident'], title: 'Resident Profile' } },
  { path: '/resident/request', name: 'resident-request', component: RequestForm, meta: { requiresAuth: true, allowedRoles: ['resident'], title: 'Resident Request Form' } },
  {
    path: '/resident/report',
    name: 'resident-report',
    component: () => import('@/components/resident/ResidentReport.vue'),
    meta: { requiresAuth: true, allowedRoles: ['resident'], title: 'Resident Report' }
  },
    {
    path: '/resident/feedback',
    name: 'resident-feedback',
    component: () => import('@/components/resident/ResidentFeedback.vue'),
    meta: { requiresAuth: true, allowedRoles: ['resident'], title: 'Resident Feedback' }
  },

      {
    path: '/resident/settings',
    name: 'resident-setting',
    component: () => import('@/components/resident/ResidentSettings.vue'),
    meta: { requiresAuth: true, allowedRoles: ['resident'], title: 'Resident Setting' }
  },
  // Barangay Official routes
  { path: '/official/dashboard', name: 'official-dashboard', component: OfficialDashboard, meta: { requiresAuth: true, allowedRoles: ['barangay_staff'], title: 'Barangay Staff Dashboard' } },
  { path: '/official/residents', name: 'official-residents', component: ManageResidents, meta: { requiresAuth: true, allowedRoles: ['barangay_staff'], title: 'Manage Residents' } },
  { path: '/official/requests', name: 'official-requests', component: ManageRequests, meta: { requiresAuth: true, allowedRoles: ['barangay_staff'], title: 'Manage Requests' } },
  {
  path: '/official/reports',
  name: 'OfficialReports',
  component: () => import('@/components/official/ManageReports.vue'),
  meta: { requiresAuth: true, allowedRoles: ['barangay_staff'], title: 'Reports' }
  },
  {
  path: '/official/requests/:id',
  name: 'ViewRequest',
  component: () => import('@/components/official/ViewRequest.vue'),
  meta: { requiresAuth: true, requiresOfficial: true }
  },

      {
      path: '/official/requests/:id/generate',
      name: 'GenerateDocument',
      component: () => import('@/components/official/GenerateDocument.vue'),
      meta: { requiresAuth: true, requiresOfficial: true }
    },

    {
    path: '/official/settings',
    name: 'official-settings',
    component: () => import('@/components/official/BarangaySettings.vue'),
    meta: { requiresAuth: true, allowedRoles: ['barangay_staff'], title: 'Barangay Settings' },
  },
  {
    path: '/official/templates',
    name: 'certificate-templates',
    component: () => import('@/components/official/CertificateTemplates.vue'),
    meta: { requiresAuth: true, allowedRoles: ['barangay_staff'], title: 'Certificate Templates' },
  },
{
  path: '/official/resident/:id',
  name: 'ResidentDetails',
  component: () => import('@/components/official/ResidentDetails.vue'),
  meta: { requiresAuth: true, requiresOfficial: true }
},
{
    path: '/reports/:id',           // <-- dynamic segment → the report ID
    name: 'ReportDetails',
     component: () => import('@/components/official/ReportDetails.vue'),
    props: true,                    // automatically pass `route.params.id` as a prop
    meta: { title: 'Report Details' }
  },
  // SK Official routes
  { path: '/sk/dashboard', name: 'sk-dashboard', component: SKDashboard, meta: { requiresAuth: true, allowedRoles: ['sk'], title: 'SK Dashboard' } },
  { path: '/sk/forum', name: 'sk-projects', component: SKProjects, meta: { requiresAuth: true, allowedRoles: ['sk'], title: 'SK Projects' } },
  { path: '/sk/members', name: 'sk-member', component: SKMember, meta: { requiresAuth: true, allowedRoles: ['sk'], title: 'SK Member' } },

  // Admin routes
  { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard, meta: { requiresAuth: true, allowedRoles: ['super_admin'], title: 'Super Admin Dashboard' } },
  { path: '/staff/change-password', name: 'staff-change-password', component: StaffPasswordChange, meta: { requiresAuth: true, allowedRoles: ['barangay_staff'], title: 'Change Password' } },

  // Catch-all
 {
    path: '/404',
    name: 'NotFound',
    component: NotFound
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  },

  {
  path: '/id/:residentId',
  name: 'id-generator',
  component: () => import('@/components/IDGenerator.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/verify',
  name: 'verify',
  component: () => import('@/components/VerificationPage.vue')
},
{
  path: '/verify/:idNumber',
  name: 'verify-id',
  component: () => import('@/components/VerificationPage.vue')
}

];


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

function getDashboardRoute(role) {
  const routes = {
    resident: { name: 'resident-dashboard' },
    barangay_staff: { name: 'official-dashboard' },
    super_admin: { name: 'admin-dashboard' },
  };
  return routes[role] || { name: 'home' };
}

// Router guard
router.beforeEach(async (to, from, next) => {
  const currentUser = localDb.getSessionUser();

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const allowedRoles = to.meta.allowedRoles || [];

  // Set document title
  document.title = to.meta.title ? `${to.meta.title} | Barangay Information System` : 'Barangay Information System';

  if (requiresAuth && !currentUser) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (requiresGuest && currentUser) {
    return next(getDashboardRoute(currentUser.role));
  }

  if (currentUser && !store.state.auth.user) {
    store.commit('setAuth', {
      uid: currentUser.id,
      email: currentUser.email,
      name: currentUser.profile?.name || currentUser.email,
      role: currentUser.role,
    });
  }

  if (requiresAuth && currentUser && currentUser.role === 'resident') {
    const residentRecord = localDb.readDb().residents.find((r) => r.userId === currentUser.id);
    if (residentRecord && residentRecord.status !== 'approved' && to.name !== 'pending-approval') {
      return next({ name: 'pending-approval' });
    }
  }

  if (requiresAuth && allowedRoles.length) {
    const currentRole = currentUser?.role;
    if (!allowedRoles.includes(currentRole)) {
      return next(getDashboardRoute(currentRole));
    }
  }

  next();
});

export default router;