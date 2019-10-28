import Vue from 'vue';
import Vuex from 'vuex';

import { findFirst } from 'obj-traverse/lib/obj-traverse';
import { getYear, getQuarter } from 'date-fns';
import * as sheetOptions from '@/config/sheetOptions';
import * as helpers from '@/util/helpers';

Vue.use(Vuex);

const initialState = () => ({
  chosenQuarter: `${getYear(new Date())} Q${getQuarter(new Date())}`,
});

export default new Vuex.Store({
  state: {
    gapi: null,
    data: null,
    nest: [],
    chosenQuarter: `${getYear(new Date())} Q${getQuarter(new Date())}`,
  },

  getters: {
    departments(state) {
      return state.data && state.data.Depts ? state.data.Depts : [];
    },

    products(state) {
      return state.data && state.data.Products ? state.data.Products : [];
    },

    objectives(state) {
      return state.data && state.data.Objectives ? state.data.Objectives : [];
    },

    getObjectById(state) {
      return id => findFirst({ children: state.nest }, 'children', { id });
    },

    getDistinctQuarters(state, getters) {
      return id => {
        const product = getters.getObjectById(id);

        if (product === false) return {};

        return [...new Set(product.children.map(i => i.quarter))].filter(Boolean).sort((a, b) => (a > b ? -1 : 1));
      };
    },

    getProductWithDistinctObjectives(state, getters) {
      return (id, quarter) => {
        const product = getters.getObjectById(id);

        if (product === false) return {};

        return {
          ...product,
          children: product.children.filter(x => x.quarter === quarter),
        };
      };
    },
  },

  mutations: {
    SET_GAPI(state, payload) {
      state.gapi = payload;
    },
    SET_DATA(state, payload) {
      let res = {};

      // splits the groups into key/value pairs
      payload.forEach(g => {
        const groupName = g.range.split('!')[0];
        res[groupName] = helpers.arraysToObjects(g.values);
      });

      state.data = res;
      state.nest = helpers.nest(res);

      helpers.storeObjectInLocalStorage(res);
    },
    LOAD_DATA(state, payload) {
      state.data = payload;
      state.nest = helpers.nest(payload);
    },
    SET_CHOSEN_QUARTER(state, payload) {
      state.chosenQuarter = payload;
    },
    RESET_STATE(state) {
      Object.assign(state, initialState());
    },
    ADD_OBJECT(state, payload) {
      state.data[payload.key].push(payload.data);
      state.nest = helpers.nest(state.data);
      helpers.storeObjectInLocalStorage(state.data);
    },
    UPDATE_OBJECT(state, payload) {
      const objIndex = state.data[payload.key].findIndex(obj => obj.id === payload.data.id);
      state.data[payload.key][objIndex] = payload.data;
      state.nest = helpers.nest(state.data);
      helpers.storeObjectInLocalStorage(state.data);
    },
    DELETE_OBJECT(state, payload) {
      const objIndex = state.data[payload.key].findIndex(obj => obj.id === payload.data.id);
      state.data[payload.key].splice(objIndex, 1);
      state.nest = helpers.nest(state.data);
      helpers.storeObjectInLocalStorage(state.data);
    },
  },
  actions: {
    setChosenQuarter({ commit }, payload) {
      commit('SET_CHOSEN_QUARTER', payload);
    },
    resetState({ commit }) {
      commit('RESET_STATE');
    },
    addObject({ commit }, payload) {
      commit('ADD_OBJECT', payload);
    },
    updateObject({ commit }, payload) {
      commit('UPDATE_OBJECT', payload);
    },
    deleteObject({ commit }, payload) {
      commit('DELETE_OBJECT', payload);
    },
    // Store the gapi object so that every component can access it
    initGapi({ commit }) {
      let localData = localStorage.getItem('okr-data');
      if (localData) {
        commit('LOAD_DATA', JSON.parse(localData));
      }

      return this._vm.$getGapiClient().then(gapi => {
        commit('SET_GAPI', gapi.client.sheets.spreadsheets);
        return true;
      });
    },

    getAllData({ commit, state }) {
      state.gapi.values
        .batchGet({
          spreadsheetId: sheetOptions.sheetid,
          ranges: sheetOptions.allRanges,
        })
        .then(response => response.result.valueRanges)
        .then(data => {
          commit('SET_DATA', data);
        });
    },

    // Appends the provided data to the spreadsheet based on the provided options
    appendData({ state }, { options, values }) {
      return new Promise((resolve, reject) => {
        state.gapi.values.append(options, { values }).then(response => {
          if (response.status === 200) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },

    // Appends the provided data to the spreadsheet based on the provided options
    updateData({ state }, { options, values }) {
      return new Promise((resolve, reject) => {
        state.gapi.values.update(options, { values }).then(response => {
          if (response.status === 200) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },

    addProduct({ dispatch }, payload) {
      const options = helpers.generateAppendDataOptions('Products');

      const values = [[payload.id, payload.product, payload.department_id, payload.mission_statement]];

      return dispatch('appendData', { options, values });
    },

    addObjective({ dispatch }, payload) {
      const options = helpers.generateAppendDataOptions('Objectives');

      const values = [
        [payload.id, payload.product_id, payload.objective_title, payload.objective_body, payload.quarter],
      ];

      return dispatch('appendData', { options, values });
    },

    addKeyResult({ dispatch }, payload) {
      const options = helpers.generateAppendDataOptions('KeyRes');

      const values = [
        [
          payload.id,
          payload.objective_id,
          payload.key_result,
          payload.start_value,
          payload.target_value,
          payload.target_type,
          payload.unit,
        ],
      ];

      return dispatch('appendData', { options, values });
    },

    updateProductDetails({ state, dispatch }, payload) {
      const index = state.data.Products.findIndex(d => d.id === payload.id);

      const options = helpers.generateUpdateDataOptions('Products', index + 2);

      const values = [
        [payload.id, payload.product, payload.department_id, payload.mission_statement, payload.product_image],
      ];

      return dispatch('updateData', { options, values });
    },

    updateObjective({ state, dispatch }, payload) {
      const index = state.data.Objectives.findIndex(d => d.id === payload.id);

      const options = helpers.generateUpdateDataOptions('Objectives', index + 2);

      const values = [
        [payload.id, payload.product_id, payload.objective_title, payload.objective_body, payload.quarter],
      ];

      return dispatch('updateData', { options, values });
    },

    deleteObjective({ state, dispatch }, payload) {
      const index = state.data.Objectives.findIndex(d => d.id === payload.id);

      const options = helpers.generateUpdateDataOptions('Objectives', index + 2);

      const values = [Array.from(Array(10)).map(() => '')];

      return dispatch('updateData', { options, values });
    },
  },
});
