import functions from 'firebase-functions';
import config from '../config';

import runSlackBot from './okrTrackerSlackBot';

const okrTrackerSlackBot = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .https.onRequest(async (req, res) => runSlackBot(req, res));

export default okrTrackerSlackBot;
