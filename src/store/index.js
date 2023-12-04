import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';
import i18n from '@/locale/i18n';
import { sortByLocale } from '@/store/actions/actionUtils';

import { isDepartment, isProduct } from '@/util/getActiveItemType';
import defaultPreferences from '@/db/User/defaultPreferences';
import moduleActions from './actions';
import okrsModule from './modules/okrs';
import kpisModule from './modules/kpis';

Vue.use(Vuex);

export const storeGetters = {
  tree: (state) => {
    const { organizations, departments, products } = state;

    const sortedOrganziations = sortByLocale(organizations);
    const sortedDepartments = sortByLocale(departments);
    const sortedProducts = sortByLocale(products);

    return sortedOrganziations.map((org) => {
      org.children = sortedDepartments
        .filter(({ organization }) => organization.id === org.id)
        .map((dept) => {
          dept.children = sortedProducts.filter(
            ({ department }) => department && department.id === dept.id
          );
          return dept;
        });
      return org;
    });
  },

  /**
   * Returns `true` if the current user is an admin of the parent organization
   * of `activeItem`.
   */
  isAdminOfCurrentOrganization: (state) => {
    const { user, activeItem } = state;

    if (!user || !activeItem) {
      return false;
    }

    return (
      user.admin?.includes(
        activeItem.organization ? activeItem.organization.id : activeItem.id
      ) || false
    );
  },

  /**
   * Returns `true` if the current user has admin rights or is member of
   * `activeItem`.
   */
  hasEditRights: (state, getters) => {
    const { user, activeItem } = state;

    if (!user || !activeItem) {
      return false;
    }

    if (user.superAdmin || getters.isAdminOfCurrentOrganization) {
      return true;
    }

    if (!activeItem.team) {
      return false;
    }

    return activeItem.team.map(({ id }) => id).includes(user.id);
  },

  /**
   * Return `true` if the current user is an admin of the active item or a
   * member of its parent item.
   */
  hasParentEditRights: (state, getters) => {
    const { user, activeItem } = state;

    if (!user || !activeItem) {
      return false;
    }

    if (user.superAdmin || getters.isAdminOfCurrentOrganization) {
      return true;
    }

    if (isProduct(activeItem) && activeItem.department.team) {
      return activeItem.department.team
        .map((userDoc) => userDoc.split('/')[1])
        .includes(user.id);
    }

    if (isDepartment(activeItem) && activeItem.organization.team) {
      return activeItem.organization.team
        .map((userDoc) => userDoc.split('/')[1])
        .includes(user.id);
    }

    return false;
  },

  sidebarGroups: (state) => {
    const { organizations, departments, products, activeItem } = state;

    const filterDepartments = ({ organization }) => {
      // No active item is set, show no departments
      if (!activeItem) {
        return false;
      }
      if (!organization) {
        return false;
      }

      // Active item is organization, show all its departments
      if (activeItem.id === organization.id) {
        return true;
      }
      // Active item is a child of organization, show its all departments
      return !!(
        activeItem.organization && activeItem.organization.id === organization.id
      );
    };

    const filterProducts = ({ department }) => {
      if (!activeItem) {
        return false;
      }
      // Active item is a department, show all its products
      if (activeItem.id === department.id) {
        return true;
      }
      // Active item is a product, show all its siblings
      return !!(activeItem.department && activeItem.department.id === department.id);
    };

    return [
      { name: i18n.t('general.organizations'), items: organizations, icon: 'industry' },
      {
        name: i18n.t('general.departments'),
        items: departments.filter(filterDepartments),
        icon: 'cubes',
      },
      {
        name: i18n.t('general.products'),
        items: products.filter(filterProducts),
        icon: 'cube',
      },
    ];
  },

  activeOrganization: (state) => {
    const { organizations, user } = state;
    const organizationSlug = user?.preferences?.homeOrganization;
    if (!organizationSlug) {
      return null;
    }
    return organizations.find((org) => org.slug === organizationSlug) || null;
  },
};

export const actions = {
  ...moduleActions,

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

  setActiveOrganization: async ({ commit, dispatch, state }, orgId) => {
    const orgSlug = orgId
      ? state.organizations.find((org) => org.id === orgId)?.slug || null
      : null;
    commit('SET_HOME_ORGANIZATION', orgSlug);
    dispatch('update_preferences');
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

  SET_COLLECTION(state, payload) {
    Vue.set(state, payload.type, [...payload.data]);
  },

  SET_UNSUBSCRIBE_COLLECTION(state, payload) {
    state[`${payload.type}Unsubscribe`] = payload.unsubscribe;
  },

  SET_HOME_ORGANIZATION(state, orgSlug) {
    if (!state.user.preferences) {
      state.user.preferences = defaultPreferences;
    }
    state.user.preferences.homeOrganization = orgSlug;
  },
};

export default new Vuex.Store({
  modules: {
    okrs: okrsModule,
    kpis: kpisModule,
  },
  state: {
    user: null,
    users: [],
    departments: [],
    organizations: [],
    products: [],
    activeItem: null,
    activeItemRef: null,
    activePeriod: null,
    periods: [],
    objectives: [],
    objectiveContributors: [],
    loginError: null,
    loading: false,
    providers: import.meta.env.VITE_LOGIN_PROVIDERS.split('-'),
    loginLoading: false,
    dataLoading: false,
    organizationsUnsubscribe: () => {},
    departmentsUnsubscribe: () => {},
    productsUnsubscribe: () => {},
  },
  getters: storeGetters,
  mutations,
  actions,
});
