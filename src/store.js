import Vue from 'vue';
import Vuex from 'vuex';

import { addMonths, startOfQuarter, getQuarter } from 'date-fns';
import { usersCollection } from './config/firebaseConfig';
import getNestedData from './util/getNestedData';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    userslist: {},
    nest: [],
    quarters: [],
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

    set_quarters(state, payload) {
      state.quarters = payload;
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
    async initializeApp({ commit }) {
      usersCollection.onSnapshot(snapshot => {
        commit('set_userslist', snapshot);
      });

      commit('set_nested_data', await getNestedData());

      commit('set_quarters', generateQuarters());
    },
  },
});

export function generateQuarters() {
  const fromDate = new Date('2019-01-01');
  const today = new Date();
  const toDate = startOfQuarter(addMonths(today, 6));
  const quarters = [];

  let dateLoop = fromDate;
  while (dateLoop < toDate) {
    const year = dateLoop.getFullYear();
    const quarter = getQuarter(dateLoop);
    const isCurrent = dateLoop < today && dateLoop > startOfQuarter(today);
    quarters.push({ name: `Q${quarter} ${year}`, isCurrent });
    dateLoop = addMonths(dateLoop, 3);
  }

  return quarters.reverse();
}
