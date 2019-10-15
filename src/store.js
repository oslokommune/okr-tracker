import Vue from "vue";
import Vuex from "vuex";

import * as sheetOptions from "@/config/sheetOptions";
import * as helpers from "@/util/helpers";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gapi: null,
    data: null,
    nest: {}
  },

  getters: {
    teams(state) {
      return state.data && state.data.Teams ? state.data.Teams : [];
    },

    products(state) {
      return state.data && state.data.Products ? state.data.Products : [];
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
      return self.$getGapiClient().then(gapi => {
        commit("setGapi", gapi.client.sheets.spreadsheets);
        return true;
      });
    },

    getAllData({ commit, state }) {
      state.gapi.values
        .batchGet({
          spreadsheetId: sheetOptions.id,
          ranges: sheetOptions.allRanges
        })
        .then(response => response.result.valueRanges)
        .then(data => {
          commit("setData", data);
        });
    },

    addProduct({ state }, payload) {
      const options = {
        spreadsheetId: sheetOptions.id,
        valueInputOption: "RAW",
        insertDataOption: "OVERWRITE",
        range: "'Products'!A1"
      };

      const values = [
        [
          payload.id,
          payload.product,
          payload.team_id,
          payload.mission_statement
        ]
      ];

      return new Promise((res, rej) => {
        state.gapi.values.append(options, { values }).then(response => {
          if (response.status === 200) {
            res();
          } else {
            rej();
          }
        });
      });
    },

    addObjective({ state }, payload) {
      const options = {
        spreadsheetId: sheetOptions.id,
        valueInputOption: "RAW",
        insertDataOption: "OVERWRITE",
        range: "'Objectives'!A1"
      };

      const values = [[payload.id, payload.product_id, payload.objective]];

      return new Promise((res, rej) => {
        state.gapi.values.append(options, { values }).then(response => {
          if (response.status === 200) {
            res();
          } else {
            rej();
          }
        });
      });
    }
  }
});
