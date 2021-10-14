const functions = require('firebase-functions');
const config = require('../config');

const { runSlackBot } = require('./okrTrackerSlackBot');

exports.okrTrackerSlackBot = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .https.onRequest(async (req, res) => runSlackBot(req, res));
