import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';
import i18n from '@/locale/i18n';
import { sortByLocale } from '@/store/actions/actionUtils';

import moduleActions from './actions';

Vue.use(Vuex);

export const getters = {
  tree: (state) => {
    const { organizations, departments, products } = state;

    const sortedOrganziations = sortByLocale(organizations);
    const sortedDepartments = sortByLocale(departments);
    const sortedProducts = sortByLocale(products);

    return sortedOrganziations.map((org) => {
      org.children = sortedDepartments
        .filter(({ organization }) => organization.id === org.id)
        .map((dept) => {
          dept.children = sortedProducts.filter(({ department }) => department && department.id === dept.id);
          return dept;
        });
      return org;
    });
  },

  hasEditRights: (state) => {
    // Returns `true` if user has `admin: true` or if user is member of `activeItem`
    const { user, activeItem } = state;
    if (user && user.admin) return true;
    if (!user || !activeItem || !activeItem.team) return false;
    return activeItem.team.map(({ id }) => id).includes(user.id);
  },
};

export const actions = {
  ...moduleActions,

  initKeycloak: async ({ commit }, keycloak) => {
    commit('SET_KEYCLOAK', keycloak);

    return true;
  },

  cleanKeycloak: async ({ commit, state }, uri) => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');

    state.keycloak.logout({ redirectUri: `${process.env.VUE_APP_KEYCLOAK_LOGOUT_URL}${uri}` });

    commit('SET_AUTHENTICATION', false);
    commit('DELETE_KEYCLOAK');

    return true;
  },

  setLoginLoading: async ({ commit }, payload) => {
    commit('SET_LOGIN_LOADING', payload);

    return true;
  },

  setLoginError: async ({ commit }, payload) => {
    commit('SET_LOGIN_ERROR', payload);

    return true;
  },

  setDataLoading: async ({ commit }, payload) => {
    commit('SET_DATA_LOADING', payload);
  },
};

export const mutations = {
  ...vuexfireMutations,

  SET_SIDEBAR_GROUPS(state, payload) {
    state.sidebarGroups = payload;
  },

  SET_ACTIVE_ITEM_REF(state, payload) {
    state.activeItemRef = payload;
  },

  SET_LOGIN_ERROR(state, payload) {
    state.loginError = payload;
  },

  SET_LOADING(state, payload) {
    state.loading = payload;
  },

  SET_KEYCLOAK(state, payload) {
    state.keycloak = payload;
  },

  SET_LOGIN_LOADING(state, payload) {
    state.loginLoading = payload;
  },

  DELETE_KEYCLOAK(state) {
    state.keycloak = null;
  },

  SET_AUTHENTICATION(state, payload) {
    state.authenticated = payload;
  },

  SET_DATA_LOADING(state, payload) {
    state.dataLoading = payload;
  },
};

export default new Vuex.Store({
  state: {
    user: null,
    sidebarGroups: [],
    departments: [],
    organizations: [],
    products: [],
    activeItem: null,
    activeItemRef: null,
    activeKeyResult: null,
    activePeriod: null,
    activeObjective: null,
    periods: [],
    objectives: [],
    keyResults: [],
    kpis: [],
    loginError: null,
    views: [
      { label: i18n.t('view.compact'), id: 'compact', icon: '' },
      { label: i18n.t('view.details'), id: 'details', icon: '' },
    ],
    loading: false,
    providers: process.env.VUE_APP_LOGIN_PROVIDERS.split('-'),
    keycloak: null,
    authenticated: false,
    loginLoading: false,
    dataLoading: false,
  },
  getters,
  mutations,
  actions,
});
