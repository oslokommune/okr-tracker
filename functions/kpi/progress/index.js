import functions from 'firebase-functions';
import config from '../../config.js';
import updateKpiProgress from './handleKpiProgress.js';

const handleKpiProgress = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`kpis/{kpiId}/progress/{progressId}`)
  .onWrite(updateKpiProgress);

export default handleKpiProgress;
