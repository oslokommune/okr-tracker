import Vue from 'vue';
import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default {
  namespaced: true,

  state: () => ({
    selectedPeriod: null,
    activeObjective: null,
    activeKeyResult: null,
    workbenchObjectives: {},
  }),

  mutations: {
    SET_SELECTED_PERIOD(state, payload) {
      state.selectedPeriod = payload;
    },

    ADD_WORKBENCH_OBJECTIVE(state, { itemId, objectiveId }) {
      if (Object.hasOwnProperty.call(state.workbenchObjectives, itemId)) {
        const objectives = state.workbenchObjectives[itemId];

        if (objectiveId && !objectives.includes(objectiveId)) {
          objectives.push(objectiveId);
        }
      } else {
        Vue.set(state.workbenchObjectives, itemId, [objectiveId]);
      }
    },

    REMOVE_WORKBENCH_OBJECTIVE(state, { itemId, objectiveId }) {
      if (Object.hasOwnProperty.call(state.workbenchObjectives, itemId)) {
        const objectives = state.workbenchObjectives[itemId];

        if (objectiveId && objectives.includes(objectiveId)) {
          Vue.set(
            state.workbenchObjectives,
            itemId,
            objectives.filter((id) => id !== objectiveId)
          );
        }
      }
    },

    CLEAR_WORKBENCH_OBJECTIVES(state, { itemId }) {
      Vue.delete(state.workbenchObjectives, itemId);
    },
  },

  actions: {
    setSelectedPeriod: async ({ commit }, payload) => {
      commit('SET_SELECTED_PERIOD', payload);
      return true;
    },

    setActiveObjective: firestoreAction(
      ({ bindFirestoreRef, unbindFirestoreRef, rootGetters }, objectiveId) => {
        if (!objectiveId) {
          return unbindFirestoreRef('activeObjective');
        }

        if (!rootGetters.objectivesWithID.find((o) => o.id === objectiveId)) {
          return unbindFirestoreRef('activeObjective');
        }

        return bindFirestoreRef(
          'activeObjective',
          db.collection('objectives').doc(objectiveId),
          { maxRefDepth: 1, wait: true }
        );
      }
    ),

    setActiveKeyResult: firestoreAction(
      ({ bindFirestoreRef, unbindFirestoreRef }, keyResultId) => {
        if (!keyResultId) {
          return unbindFirestoreRef('activeKeyResult');
        }

        return bindFirestoreRef(
          'activeKeyResult',
          db.collection('keyResults').doc(keyResultId),
          { maxRefDepth: 1, wait: true }
        );
      }
    ),

    addWorkbenchObjective: async ({ commit, rootState }, objectiveId) => {
      commit('ADD_WORKBENCH_OBJECTIVE', {
        itemId: rootState.activeItem.id,
        objectiveId,
      });
    },

    removeWorkbenchObjective: async ({ commit, rootState }, objectiveId) => {
      commit('REMOVE_WORKBENCH_OBJECTIVE', {
        itemId: rootState.activeItem.id,
        objectiveId,
      });
    },

    clearWorkbenchObjectives: async ({ commit, rootState }) => {
      commit('CLEAR_WORKBENCH_OBJECTIVES', { itemId: rootState.activeItem.id });
    },
  },

  getters: {
    /**
     * Return objectives currently in the workbench for `rootState.activeItem`.
     */
    workbenchObjectives: (state, getters, rootState, rootGetters) => {
      if (!rootState.activeItem || !state.workbenchObjectives) {
        return [];
      }
      const objectiveIds = state.workbenchObjectives[rootState.activeItem.id] || [];
      if (!objectiveIds.length) {
        return [];
      }
      return rootGetters.objectivesWithID.filter((o) => objectiveIds.includes(o.id));
    },
  },
};
