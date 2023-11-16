import Vue from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';
import { DEFAULT_OKR_PERIOD, getPeriods } from '@/config/periods';
import { PeriodSerializer } from '@/util/period';
import { isDepartment, isOrganization } from '@/util/getActiveItemType';

export default {
  namespaced: true,

  state: () => ({
    selectedPeriod: useLocalStorage('okr-period', getPeriods()[DEFAULT_OKR_PERIOD], {
      serializer: PeriodSerializer,
    }),
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
      async (
        { bindFirestoreRef, unbindFirestoreRef, rootState, getters },
        objectiveId
      ) => {
        if (!objectiveId || !rootState.activeItem) {
          return unbindFirestoreRef('activeObjective');
        }

        if (!getters.objectivesWithID.find((o) => o.id === objectiveId)) {
          // Allow setting any direct parent objective as an active objective
          const { activeItem } = rootState;

          if (!activeItem || isOrganization(activeItem)) {
            return unbindFirestoreRef('activeObjective');
          }

          const parentItemRef = isDepartment(activeItem)
            ? db.collection('organizations').doc(activeItem.organization.id)
            : db.collection('departments').doc(activeItem.department.id);

          const parentObjectives = await db
            .collection('objectives')
            .where('parent', '==', parentItemRef)
            .where('archived', '==', false)
            .get()
            .then((snapshot) => snapshot.docs.map((doc) => doc.id));

          if (!parentObjectives.includes(objectiveId)) {
            return unbindFirestoreRef('activeObjective');
          }
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
     * Return `rootState.objectives` and external objectives from
     * `rootState.objectiveContributors` enriched with ID.
     */
    objectivesWithID: (state, getters, rootState) => {
      const objectiveIDs = rootState.objectives.map((o) => o.id);
      const externalObjectives = rootState.objectiveContributors
        .filter((oc) => {
          return (
            typeof oc.objective !== 'string' &&
            // Filter out archived objectives ...
            !oc.objective.archived &&
            // ... and those that aren't external.
            !objectiveIDs.includes(oc.objective.id)
          );
        })
        .map((oc) => oc.objective);

      return rootState.objectives.concat(externalObjectives).map((o) => ({
        ...o,
        id: o.id,
      }));
    },

    /**
     * Return objectives to be displayed in the objective timeline.
     */
    timelineObjectives: (state, getters) => {
      const objectives = [...getters.objectivesWithID];

      // Include any currently active objective as a "ghost" until dismissed.
      if (
        state.activeObjective &&
        !objectives.find((o) => o.id === state.activeObjective.id)
      ) {
        objectives.push(state.activeObjective);
      }

      // Return only objectives with a known (resolved) period, either dynamic
      // or old-style.
      return objectives.filter(
        (o) => (o.startDate && o.endDate) || (o.period && typeof o.period !== 'string')
      );
    },

    /**
     * Return objectives currently in the workbench for `rootState.activeItem`.
     */
    workbenchObjectives: (state, getters, rootState) => {
      if (!rootState.activeItem || !state.workbenchObjectives) {
        return [];
      }
      const objectiveIds = state.workbenchObjectives[rootState.activeItem.id] || [];
      if (!objectiveIds.length) {
        return [];
      }
      return getters.objectivesWithID.filter((o) => objectiveIds.includes(o.id));
    },
  },
};
