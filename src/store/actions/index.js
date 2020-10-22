/* eslint-disable camelcase */
import set_sidebar_items from './set_sidebar_items';
import set_active_item from './set_active_item';
import init_state from './init_state';
import set_active_key_result from './set_active_key_result';
import set_active_kpi from './set_active_kpi';
import set_active_objective from './set_active_objective';
import set_active_period_and_data from './set_active_period_and_data';
import reset_state from './reset_state';
import set_user from './set_user';
import update_preferences from './update_preferences';

const setLoading = ({ commit }, payload) => {
  commit('SET_LOADING', payload);
};

export default {
  set_sidebar_items,
  set_active_item,
  set_active_key_result,
  set_active_objective,
  set_active_period_and_data,
  init_state,
  reset_state,
  set_user,
  set_active_kpi,
  update_preferences,
  setLoading,
};
