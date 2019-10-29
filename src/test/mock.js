import mockObjectives from './mock-objectives';
import mockKeyresults from './mock-keyresults';
import trackerData from './mock-tracker-data';

import * as helpers from '../util/helpers';

export default function({ dispatch }) {
  injectObjectives(dispatch);
  injectKeyresults(dispatch);
  injectTrackerData(dispatch);
}

function injectObjectives(dispatch) {
  const options = helpers.generateAppendDataOptions('Objectives');
  const values = mockObjectives.map(objective => {
    return [objective.id, objective.product_id, objective.objective_title, objective.objective_body, objective.quarter];
  });

  dispatch('appendData', { options, values });
}

function injectKeyresults(dispatch) {
  const options = helpers.generateAppendDataOptions('KeyRes');
  const values = mockKeyresults.map(keyres => {
    return [
      keyres.id,
      keyres.objective_id,
      keyres.key_result,
      keyres.start_value,
      keyres.target_value,
      keyres.target_type,
      keyres.unit,
    ];
  });

  dispatch('appendData', { options, values });
}

function injectTrackerData(dispatch) {
  const options = helpers.generateAppendDataOptions('KeyResTracker');
  const values = trackerData.map(obj => {
    return [obj.id, obj.timestamp, obj.key_result_id, obj.value];
  });

  dispatch('appendData', { options, values });
}
