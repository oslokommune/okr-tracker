const functions = require('firebase-functions');
const config = require('../config');
const handleKeyResultProgress = require('./handleKeyResultProgress');

exports.handleKeyResultProgress = functions
  .region(config.region)
  .firestore.document(`keyResults/{keyResultId}/progress/{documentId}`)
  .onWrite(handleKeyResultProgress);

exports.handleKeyResultProgressOnKeyResultUpdate = functions
  .region(config.region)
  .firestore.document(`keyResults/{keyResultId}`)
  .onUpdate(({ before, after }, context) => {
    if (before.data().progression !== after.data().progression) return;

    return handleKeyResultProgress(null, context);
  });
