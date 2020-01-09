import Vue from 'vue';
import Vuex from 'vuex';

import { usersCollection } from './config/firebaseConfig';
import getNestedData from './util/getNestedData';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    userslist: {},
    nest: [],
  },

  getters: {
    get_user_emails(state) {
      return Object.keys(state.userslist);
    },
  },

  mutations: {
    set_user(state, payload) {
      state.user = payload;
    },

    set_userslist(state, payload) {
      const [key, value] = Object.entries(payload)[0];
      state.userslist[key] = value;
    },

    set_nested_data(state, payload) {
      state.nest = payload;
    },
  },

  actions: {
    getUsersList({ commit }) {
      usersCollection.onSnapshot(snapshot => {
        commit('set_userslist', snapshot);
      });
    },

    async getNestedProducts({ commit }) {
      const list = await getNestedData();
      commit('set_nested_data', list);
    },
  },
});
