import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';

import actions from './actions';

Vue.use(Vuex);

export const getters = {
  tree: state => {
    const { organizations, departments, products } = state;

    return organizations.map(org => {
      org.children = departments
        .filter(({ organization }) => organization.id === org.id)
        .map(dept => {
          dept.children = products.filter(({ department }) => department.id === dept.id);
          return dept;
        });
      return org;
    });
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

  SET_PREFERENCES(state, payload) {
    state.user.preferences = payload;
  },

  SET_LOGIN_ERROR(state, payload) {
    state.loginError = payload;
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
      { label: 'Kompakt', id: 'compact', icon: '' },
      { label: 'Detaljer', id: 'details', icon: '' },
      { label: 'Utvided', id: 'expanded', icon: '' },
    ],
  },
  getters,
  mutations,
  actions,
});
