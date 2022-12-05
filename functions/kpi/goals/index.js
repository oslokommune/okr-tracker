import functions from 'firebase-functions';
import config from '../../config.js';
import updateKpiGoals from './handleKpiGoals.js';

const handleKpiGoals = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`kpis/{kpiId}/goals/{goalId}`)
  .onWrite(updateKpiGoals);

export default handleKpiGoals;
