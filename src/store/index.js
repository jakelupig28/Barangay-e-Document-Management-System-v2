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
  },
  actions: {
    initializeAuth({ commit }) {
      commit('setLoading', true);
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