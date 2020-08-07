import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';

import actions from './actions';

Vue.use(Vuex);

export const getters = {};

export const mutations = {
  ...vuexfireMutations,

  SET_USER(state, payload) {
    state.user = payload;
  },

  SET_SIDEBAR_GROUPS(state, payload) {
    state.sidebarGroups = payload;
  },

  SET_ACTIVE_ITEM_REF(state, payload) {
    state.activeItemRef = payload;
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
    periods: [],
    objectives: [],
    keyResults: [],
    kpis: [],
  },
  getters,
  mutations,
  actions,
});
