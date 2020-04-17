import Vue from 'vue';
import Vuex from 'vuex';

import { db, dashboardUser } from '@/config/firebaseConfig';
import { serializeDocument, serializeList, getNestedData } from '@/db/db';
import icons from '@/config/icons';

const errorHandler = Vue.$errorHandler;

Vue.use(Vuex);

export const actions = {
  async initializeApp({ dispatch }) {
    dispatch('watchUsers');
    dispatch('watchProducts');
  },

  watchProducts({ commit }) {
    db.collectionGroup('products').onSnapshot(async () => {
      commit('SET_NESTED_DATA', await getNestedData());
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

      commit('SET_USERS', userList);
    });
  },

  async watchKeyResult({ commit }, id) {
    if (!id) throw new Error('Missing key result id');
    let doc;

    const getKeyRes = db
      .collectionGroup('keyResults')
      .get()
      .then(snapshot => snapshot.docs.filter(d => d.id === id)[0].ref)
      .catch(err => {
        errorHandler('get_keyres_error', err);
      });

    const unsubscribe = await getKeyRes.then(keyResult => {
      if (!keyResult) return;
      doc = keyResult;

      return keyResult.onSnapshot(async snapshot => {
        if (!snapshot || !snapshot.ref) return;

        const data = serializeDocument(snapshot);
        const objective = await snapshot.ref.parent.parent.get().then(d => d.data());
        const { icon } = objective;

        data.icon = icon;
        commit('SET_KEY_RESULT', data);
      });
    });

    return { unsubscribe, doc };
  },

  watchProduct({ commit }, slug) {
    if (!slug) throw new Error('Missing slug');

    const getProduct = db
      .collectionGroup('products')
      .where('slug', '==', slug)
      .get()
      .then(d => d.docs[0].ref)
      .catch(err => {
        errorHandler('get_product_error', err);
      });

    // TODO: Unsubscribe from this when not longer needed
    getProduct
      .then(product => {
        product.onSnapshot(snapshot => {
          commit('SET_PRODUCT', serializeDocument(snapshot));
        });
      })
      .catch(err => {
        errorHandler('watch_product_error', err);
      });

    return getProduct;
  },

  async watchDepartment({ commit }, slug) {
    if (!slug) throw new Error('Missing slug');

    const getDepartment = db
      .collectionGroup('departments')
      .where('slug', '==', slug)
      .get()
      .then(d => d.docs[0])
      .then(d => serializeDocument(d))
      .catch(err => {
        errorHandler('get_department_error', err);
      });

    getDepartment.then(department => {
      department.ref
        .collection('products')
        .where('archived', '==', false)
        .onSnapshot(d => {
          commit('SET_DEPARTMENTPRODUCTS', serializeList(d));
        });

      department.ref.onSnapshot(d => {
        commit('SET_DEPARTMENT', serializeDocument(d));
      });
    });
  },

  async watchOrganization({ commit }, slug) {
    if (!slug) throw new Error('Missing slug');

    const getOrganization = db
      .collection('orgs')
      .where('slug', '==', slug)
      .get()
      .then(d => d.docs[0])
      .then(d => serializeDocument(d))
      .catch(err => {
        errorHandler('get_organization_error', err);
      });

    getOrganization.then(org => {
      org.ref
        .collection('departments')
        .where('archived', '==', false)
        .onSnapshot(d => {
          commit('SET_ORGANIZATION_DEPARTMENTS', serializeList(d));
        });

      org.ref.onSnapshot(d => {
        commit('SET_ORGANIZATION', serializeDocument(d));
      });
    });
  },
};

export const getters = {};

export const mutations = {
  CLEAN_STATE(state) {
    state.product = null;
  },

  SET_USER(state, payload) {
    state.user = payload;
  },

  SET_USERS(state, payload) {
    state.users = payload;
  },

  SET_SHOW_NEWSFEED(state, payload) {
    state.showNewsfeed = payload;
  },

  SET_NESTED_DATA(state, payload) {
    state.nest = payload;
  },

  SET_PRODUCT(state, payload) {
    state.product = payload;
  },

  SET_KEY_RESULT(state, payload) {
    state.key_result = payload;
  },

  SET_ACTIVE_PERIOD(state, payload) {
    state.activePeriod = payload;
  },

  SET_DEPARTMENTPRODUCTS(state, payload) {
    state.departmentProducts = payload;
  },

  SET_DEPARTMENT(state, payload) {
    state.department = payload;
  },

  SET_ORGANIZATION(state, payload) {
    state.organization = payload;
  },

  SET_ORGANIZATION_DEPARTMENTS(state, payload) {
    state.organizationDepartments = payload;
  },
};

export default new Vuex.Store({
  state: {
    user: null,
    users: [],
    nest: [],
    activePeriod: null,
    icons,
    showNewsfeed: false,
    key_result: null,
    product: null,
    department: null,
    departmentProducts: null,
    organization: null,
    organizationDepartments: null,
  },
  getters,
  mutations,
  actions,
});
