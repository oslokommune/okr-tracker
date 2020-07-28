import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const actions = {};

export const getters = {};

export const mutations = {
  SET_USER(state, payload) {
    state.user = payload;
  },
};

export default new Vuex.Store({
  state: {
    user: null,
  },
  getters,
  mutations,
  actions,
});
