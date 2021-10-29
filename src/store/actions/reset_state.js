import { firestoreAction } from 'vuexfire';

export default firestoreAction(async ({ unbindFirestoreRef, state, commit }) => {
  commit('SET_ACTIVE_ITEM_REF', null);

  state.organizationsUnsubscribe();
  state.departmentsUnsubscribe();
  state.productsUnsubscribe();

  commit('SET_COLLECTION', { type: 'organizations', data: [] });
  commit('SET_COLLECTION', { type: 'departments', data: [] });
  commit('SET_COLLECTION', { type: 'products', data: [] });

  return Promise.all(Object.keys(state).map(unbindFirestoreRef));
});
