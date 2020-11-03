const admin = require('firebase-admin');
const functions = require('firebase-functions');
const config = require('../config');

const db = admin.firestore();

const FetchKpiData = require('./FetchKpiData');

exports.FetchKpiDataOnCreate = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`kpis/{documentId}`)
  .onCreate(FetchKpiData);

exports.FetchKpiDataOnUpdate = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`kpis/{documentId}`)
  .onUpdate(({ after }) => FetchKpiData(after));

exports.FetchKpiDataOnSchedule = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .pubsub.schedule(config.autoKpiFetchFrequency)
  .onRun(() => {
    return db
      .collection('kpis')
      .get()
      .then(list => list.docs.map(FetchKpiData))
      .catch(e => {
        throw new Error(e);
      });
  });
