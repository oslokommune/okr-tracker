import { createStore } from 'vuex';
import { vuexfireMutations } from 'vuexfire';

import { isDepartment, isProduct } from '@/util/getActiveItemType';
import moduleActions from './actions';
import okrsModule from './modules/okrs';
import kpisModule from './modules/kpis';

export const storeGetters = {
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
};

export const actions = {
  ...moduleActions,

  setDataLoading: async ({ commit }, payload) => {
    commit('SET_DATA_LOADING', payload);
    return true;
  },

  setLoading: async ({ commit }, payload) => {
    commit('SET_LOADING', payload);

    return true;
  },
};

export const mutations = {
  ...vuexfireMutations,

  SET_ACTIVE_ITEM_REF(state, payload) {
    state.activeItemRef = payload;
  },

  SET_LOADING(state, payload) {
    state.loading = payload;
  },

  SET_DATA_LOADING(state, payload) {
    state.dataLoading = payload;
  },
};

const store = createStore({
  modules: {
    okrs: okrsModule,
    kpis: kpisModule,
  },
  state: {
    user: null,
    users: [],
    activeItem: null,
    activeItemRef: null,
    activePeriod: null,
    periods: [],
    objectives: [],
    objectiveContributors: [],
    loading: false,
    dataLoading: false,
  },
  getters: storeGetters,
  mutations,
  actions,
});

export default store;
