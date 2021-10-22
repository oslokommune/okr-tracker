import functions from 'firebase-functions';
import config from '../config.js';

import { handleSlackRequest, handleSlackInteractive } from './handleSlackIntegrations.js';

export const slackNotificationOnUserRequest = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`requestAccess/{user}`)
  .onCreate(handleSlackRequest);

export const slackNotificationInteractiveOnRequest = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .https.onRequest(async (req, res) => {
    await handleSlackInteractive(req);

    res.status(200).send({ ok: true });
  });
