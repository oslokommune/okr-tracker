import Vue from 'vue';
import Vuex from 'vuex';

import { db, dashboardUser } from './config/firebaseConfig';
import quarters from './util/utils';
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

  watchKeyResult({ commit }, id) {
    if (!id) throw new Error('Missing key result id');

    const getKeyRes = db
      .collectionGroup('key_results')
      .get()
      .then(snapshot => snapshot.docs.filter(d => d.id === id)[0].ref)
      .catch(err => {
        throw new Error(err);
      });

    getKeyRes.then(keyResult => {
      if (!keyResult) return;

      keyResult.onSnapshot(snapshot => {
        commit('set_key_result', serializeDocument(snapshot));
      });
    });

    return getKeyRes;
  },

  watchProduct({ commit }, slug) {
    if (!slug) throw new Error('Missing slug');

    const getProduct = db
      .collectionGroup('products')
      .where('slug', '==', slug)
      .get()
      .then(d => d.docs[0].ref);

    // TODO: Unsubscribe from this when not longer needed
    getProduct.then(product => {
      product.onSnapshot(snapshot => {
        commit('set_product', serializeDocument(snapshot));
      });
    });

    return getProduct;
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

  set_product(state, payload) {
    state.product = payload;
  },

  set_key_result(state, payload) {
    state.key_result = payload;
  },

  set_quarter(state, payload) {
    payload = payload || state.quarters[0];
    state.activeQuarter = payload;
  },
};

export default new Vuex.Store({
  state: {
    user: null,
    users: [],
    nest: [],
    quarters,
    activeQuarter: quarters[0],
    icons,
    key_result: null,
    product: null,
  },
  getters,
  mutations,
  actions,
});
