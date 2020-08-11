import { firestoreAction } from 'vuexfire';

export default firestoreAction(async ({ unbindFirestoreRef, state, commit }) => {
  commit('SET_SIDEBAR_GROUPS', null);
  commit('SET_ACTIVE_ITEM_REF', null);

  return Promise.all(Object.keys(state).map(unbindFirestoreRef));
});
