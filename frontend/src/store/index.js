import { createStore } from 'vuex';
import localDb from '@/services/localDb';

export default createStore({
  state: {
    auth: {
      isAuthenticated: false,
      user: null,
    },
    notification: {
      message: null,
      type: null,
    },
    system: {
      maintenance: false,
      maintenanceMessage: '',
      maintenanceEstimate: '',
      loading: true,
    },
  },
  mutations: {
    setAuth(state, user) {
      state.auth.isAuthenticated = !!user;
      state.auth.user = user;
    },
    setNotification(state, { message, type }) {
      state.notification.message = message;
      state.notification.type = type;
    },
    clearNotification(state) {
      state.notification.message = null;
      state.notification.type = null;
    },
    setLoading(state, isLoading) {
      state.system.loading = isLoading;
    },
    setMaintenance(state, payload) {
      if (payload && typeof payload === 'object') {
        state.system.maintenance = !!payload.enabled;
        state.system.maintenanceMessage = payload.message || '';
        state.system.maintenanceEstimate = payload.estimatedCompletion || '';
      } else {
        state.system.maintenance = !!payload;
      }
    },
  },
  actions: {
    async initializeAuth({ commit }) {
      commit('setLoading', true);
      try {
        const response = await fetch('/api/sync-local');
        if (response.ok) {
          const dbData = await response.json();
          if (dbData) {
            localStorage.setItem('barangay_local_db_v2', JSON.stringify(dbData));
            const maintenance = dbData.maintenance || {};
            commit('setMaintenance', maintenance);
          }
        }
      } catch (error) {
        console.error('Failed to sync database with server:', error);
      }
      try {
        const { db } = require('@/firebase/config');
        const isFirebase = !!(db && typeof db === 'object' && typeof db.app !== 'undefined');
        if (isFirebase) {
          const { doc, getDoc } = require('firebase/firestore');
          const docRef = doc(db, 'system', 'maintenance');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            commit('setMaintenance', docSnap.data());
          }
        }
      } catch (error) {
        console.warn('Firebase maintenance check skipped or failed:', error);
      }
      const sessionUser = localDb.getSessionUser();
      if (sessionUser) {
        commit('setAuth', {
          uid: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.profile?.name || sessionUser.email,
          role: sessionUser.role,
        });
      } else {
        commit('setAuth', null);
      }
      commit('setLoading', false);
    },
    logout({ commit }) {
      localDb.clearSession();
      commit('setAuth', null);
      commit('setNotification', {
        message: 'Successfully logged out',
        type: 'success',
      });
    },
  },
  getters: {
    isAuthenticated(state) {
      return state.auth.isAuthenticated;
    },
    currentUser(state) {
      return state.auth.user;
    },
  },
});