import admin from 'firebase-admin';
import functions from 'firebase-functions';
import config from '../config';

import fetchKpiData from './fetchKpiData';

const db = admin.firestore();

export const fetchKpiDataOnCreate = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`kpis/{documentId}`)
  .onCreate(fetchKpiData);

export const fetchKpiDataOnUpdate = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`kpis/{documentId}`)
  .onUpdate(({ after }) => fetchKpiData(after));

export const fetchKpiDataOnSchedule = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .pubsub.schedule(config.autoKpiFetchFrequency)
  .timeZone(config.timeZone)
  .onRun(() => {
    return db
      .collection('kpis')
      .get()
      .then((list) => list.docs.map(fetchKpiData))
      .catch((e) => {
        throw new Error(e);
      });
  });
