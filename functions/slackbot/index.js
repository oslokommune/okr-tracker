import functions from 'firebase-functions';
import config from '../config.js';

import runSlackBot from './okrTrackerSlackBot.js';

const okrTrackerSlackBot = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .https.onRequest(async (req, res) => runSlackBot(req, res));

export default okrTrackerSlackBot;
