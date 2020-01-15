import Vue from 'vue';
import Vuex from 'vuex';

import { db, dashboardUser } from './config/firebaseConfig';
import generateQuarters from './util/utils';
import { serializeDocument, getNestedData } from '@/util/db';
import icons from '@/config/icons';

export const actions = {
  async initializeApp({ dispatch }) {
    dispatch('watchUsers');
    dispatch('watchProducts');
  },

  watchProducts({ commit }) {
    db.collectionGroup('products').onSnapshot(async () => {
      commit('set_nested_data', await getNestedData());
    });
  },

  watchUsers({ commit }) {
    db.collection('users').onSnapshot(snapshot => {
      const userList = snapshot.docs
        .filter(d => d.id !== dashboardUser)
        .map(serializeDocument)
        .map(user => {
          user.displayName = user.displayName || user.id;
          return user;
        });

      commit('set_users', userList);
    });
  },
};

Vue.use(Vuex);

export const getters = {
  get_user_emails(state) {
    return state.users.map(d => d.id);
  },
};

export const mutations = {
  set_user(state, payload) {
    state.user = payload;
  },

  set_quarters(state, payload) {
    state.quarters = payload;
  },

  set_users(state, payload) {
    state.users = payload;
  },

  set_nested_data(state, payload) {
    state.nest = payload;
  },
};

export default new Vuex.Store({
  state: {
    user: null,
    users: [],
    nest: [],
    quarters: generateQuarters(),
    icons,
  },
  getters,
  mutations,
  actions,
});
