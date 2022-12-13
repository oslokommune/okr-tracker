import { getFirestore } from 'firebase-admin/firestore';
import functions from 'firebase-functions';
import config from '../config.js';

import fetchKpiData from './fetchKpiData.js';

export const fetchKpiDataOnCreate = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`kpis/{documentId}`)
  .onCreate(fetchKpiData);

export const fetchKpiDataOnSchedule = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .pubsub.schedule(config.autoKpiFetchFrequency)
  .timeZone(config.timeZone)
  .onRun(() => {
    const db = getFirestore();

    return db
      .collection('kpis')
      .get()
      .then((list) => list.docs.map(fetchKpiData))
      .catch((e) => {
        throw new Error(e);
      });
  });
