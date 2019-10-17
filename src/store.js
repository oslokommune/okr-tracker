import Vue from "vue";
import Vuex from "vuex";

import * as sheetOptions from "@/config/sheetOptions";
import * as helpers from "@/util/helpers";
import { findFirst } from "obj-traverse/lib/obj-traverse";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gapi: null,
    data: null,
    nest: []
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
      return id => findFirst({ children: state.nest }, "children", { id });
    }
  },

  mutations: {
    setGapi(state, payload) {
      state.gapi = payload;
    },
    setData(state, payload) {
      let res = {};

      // splits the groups into key/value pairs
      payload.forEach(g => {
        const groupName = g.range.split("!")[0];
        res[groupName] = helpers.arraysToObjects(g.values);
      });

      state.data = res;
      state.nest = helpers.nest(res);
    }
  },
  actions: {
    // Store the gapi object so that every component can access it
    initGapi({ commit }, self) {
      let localData = localStorage.getItem("okr-data");
      if (localData) {
        commit("setData", JSON.parse(localData));
      }

      return self.$getGapiClient().then(gapi => {
        commit("setGapi", gapi.client.sheets.spreadsheets);
        return true;
      });
    },

    getAllData({ commit, state }) {
      state.gapi.values
        .batchGet({
          spreadsheetId: sheetOptions.sheetid,
          ranges: sheetOptions.allRanges
        })
        .then(response => response.result.valueRanges)
        .then(data => {
          commit("setData", data);

          localStorage.setItem("okr-data", JSON.stringify(data));
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
      const options = helpers.generateAppendDataOptions("Products");

      const values = [
        [
          payload.id,
          payload.product,
          payload.department_id,
          payload.mission_statement
        ]
      ];

      return dispatch("appendData", { options, values });
    },

    addObjective({ dispatch }, payload) {
      const options = helpers.generateAppendDataOptions("Objectives");

      const values = [
        [
          payload.id,
          payload.product_id,
          payload.objective_title,
          payload.objective_body
        ]
      ];

      return dispatch("appendData", { options, values });
    },

    addKeyResult({ dispatch }, payload) {
      const options = helpers.generateAppendDataOptions("KeyRes");

      const values = [
        [
          payload.id,
          payload.objective_id,
          payload.key_result,
          payload.start_value,
          payload.target_value,
          payload.target_type,
          payload.quarter,
          payload.unit
        ]
      ];

      return dispatch("appendData", { options, values });
    },

    updateProductDetails({ state, dispatch }, payload) {
      const index = state.data.Products.findIndex(d => d.id === payload.id);

      const options = helpers.generateUpdateDataOptions("Products", index + 2);

      const values = [
        [
          payload.id,
          payload.product,
          payload.department_id,
          payload.mission_statement
        ]
      ];

      return dispatch("updateData", { options, values });
    },

    updateObjective({ state, dispatch }, payload) {
      const index = state.data.Objectives.findIndex(d => d.id === payload.id);

      const options = helpers.generateUpdateDataOptions(
        "Objectives",
        index + 2
      );

      const values = [
        [
          payload.id,
          payload.product_id,
          payload.objective_title,
          payload.objective_body
        ]
      ];

      return dispatch("updateData", { options, values });
    },

    deleteObjective({ state, dispatch }, payload) {
      const index = state.data.Objectives.findIndex(d => d.id === payload.id);

      const options = helpers.generateUpdateDataOptions(
        "Objectives",
        index + 2
      );

      const values = [["", "", "", ""]];

      return dispatch("updateData", { options, values });
    }
  }
});
