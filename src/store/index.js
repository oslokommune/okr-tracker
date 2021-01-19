import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';
import i18n from '@/locale/i18n';
import { sortByLocale } from '@/store/actions/actionUtils';

import actions from './actions';

Vue.use(Vuex);

export const getters = {
  tree: (state) => {
    const { organizations, departments, products } = state;

    const sortedDepartments = sortByLocale(departments);
    const sortedProducts = sortByLocale(products);

    return organizations.map((org) => {
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
  },
  getters,
  mutations,
  actions,
});
