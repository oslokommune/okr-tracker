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

  isAdmin: (state) => {
    // Returns `true` if user has `admin: true` or if user is member of `activeItem`
    const { user, activeItem } = state;

    if (user && user.superAdmin) return true;
    if (user && user.admin && user.admin.length > 0) return true;
    if (!user || !activeItem || !activeItem.team) return false;
    return activeItem.team.map(({ id }) => id).includes(user.id);
  },

  hasEditRights: (state) => {
    // Returns `true` if user has `admin: true` or if user is member of `activeItem`
    const { user, activeItem } = state;
    const { organization } = activeItem;

    const isAdminOfOrganization = organization
      ? user.admin && user.admin.includes(organization.id)
      : user.admin && user.admin.includes(activeItem.id);

    if (user && user.superAdmin) return true;
    if (isAdminOfOrganization) return true;
    if (!user || !activeItem || !activeItem.team) return false;
    return activeItem.team.map(({ id }) => id).includes(user.id);
  },

  allowedToEditPeriod: (state) => {
    const { user, activePeriod, activeItem } = state;
    const { organization } = activeItem;

    const isAdminOfOrganization = organization
      ? user.admin && user.admin.includes(organization.id)
      : user.admin && user.admin.includes(activeItem.id);

    if (user && user.superAdmin) return true;
    if (isAdminOfOrganization) return true;

    return activePeriod.endDate.toDate() > new Date();
  },

  sidebarGroups: (state) => {
    const { organizations, departments, products, activeItem } = state;

    const filterDepartments = ({ organization }) => {
      // No active item is set, show no departments
      if (!activeItem) return false;
      if (!organization) return false;

      // Active item is organization, show all its departments
      if (activeItem.id === organization.id) return true;
      // Active item is a child of organization, show its all departments
      return !!(activeItem.organization && activeItem.organization.id === organization.id);
    };

    const filterProducts = ({ department }) => {
      if (!activeItem) return false;
      // Active item is a department, show all its products
      if (activeItem.id === department.id) return true;
      // Active item is a product, show all its siblings
      return !!(activeItem.department && activeItem.department.id === department.id);
    };

    return [
      { name: i18n.t('general.organizations'), items: organizations, icon: 'industry' },
      { name: i18n.t('general.departments'), items: departments.filter(filterDepartments), icon: 'cubes' },
      { name: i18n.t('general.products'), items: products.filter(filterProducts), icon: 'cube' },
    ];
  },

  hasCheckedOrganizations: (state) => {
    const { organizations, user } = state;
    const orgs = user.preferences.home.collapse.organization;

    const checked = [];

    organizations.forEach(org => {
      if (orgs[org.slug]) {
        checked.push(orgs[org.slug]);
      }
    })

    return checked.length > 0;
  }
};

export const actions = {
  ...moduleActions,

  setTheme: async ({ state, commit }, payload) => {
    commit('SET_THEME', payload);
    localStorage.setItem(state.LS_MODE, payload);

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
    return true;
  },

  setLoading: async ({ commit }, payload) => {
    commit('SET_LOADING', payload);

    return true;
  },

  setPreviousUrl: async ({ commit }, payload) => {
    if (payload.fullPath === '/') {
      return true;
    }

    commit('SET_PREVIOUS_URL', payload);

    return true;
  },

  setActiveOrganization: async ({ commit }, payload) => {
    commit('SET_ACTIVE_ORGANIZATION', payload);
    return true;
  },
};

export const mutations = {
  ...vuexfireMutations,

  SET_ACTIVE_ITEM_REF(state, payload) {
    state.activeItemRef = payload;
  },

  SET_LOGIN_ERROR(state, payload) {
    state.loginError = payload;
  },

  SET_LOADING(state, payload) {
    state.loading = payload;
  },

  SET_LOGIN_LOADING(state, payload) {
    state.loginLoading = payload;
  },

  SET_DATA_LOADING(state, payload) {
    state.dataLoading = payload;
  },

  SET_THEME(state, payload) {
    state.theme = payload;
  },

  SET_COLLECTION(state, payload) {
    Vue.set(state, payload.type, [...payload.data]);
  },

  SET_UNSUBSCRIBE_COLLECTION(state, payload) {
    state[`${payload.type}Unsubscribe`] = payload.unsubscribe;
  },

  SET_PREVIOUS_URL(state, payload) {
    state.previousUrl = payload;
  },

  SET_ACTIVE_ORGANIZATION(state, payload) {
    state.activeOrganization = payload;
  },
};

export default new Vuex.Store({
  state: {
    user: null,
    users: [],
    departments: [],
    organizations: [],
    products: [],
    activeItem: null,
    activeItemRef: null,
    activeKeyResult: null,
    activePeriod: null,
    activeObjective: null,
    activeOrganization: null,
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
    providers: import.meta.env.VITE_LOGIN_PROVIDERS.split('-'),
    loginLoading: false,
    dataLoading: false,
    theme: 'blue',
    organizationsUnsubscribe: () => {},
    departmentsUnsubscribe: () => {},
    productsUnsubscribe: () => {},
    previousUrl: null,
    LS_MODE: 'okr-tracker-theme',
  },
  getters,
  mutations,
  actions,
});
