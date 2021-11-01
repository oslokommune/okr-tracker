/* eslint-disable camelcase */
import functions from 'firebase-functions';
import { IncomingWebhook } from '@slack/webhook';
import { getFirestore } from 'firebase-admin/firestore';

import { createFirstMessage, acceptMessage, rejectMessage } from './createSlackMessage.js';
import preferences from '../util/defaultPreferences.js';

const environment = functions.config();

export const handleSlackRequest = async (document) => {
  // Make a webhook connection for channel
  const webhook = new IncomingWebhook(environment.slack.webhook);

  const { id } = document;
  const { email } = document.data();

  // Compose a message for slack
  const message = createFirstMessage(email, id);

  try {
    // send given message to slack
    await webhook.send(message);
    return Promise.resolve({ ok: true });
  } catch (e) {
    throw new Error(e.message);
  }
};

export const handleSlackInteractive = async (req) => {
  const db = getFirestore();

  // Parse the payload
  const payload = JSON.parse(req.body.payload);

  // Make a new webhook for response to the slack app
  const webhookReturn = new IncomingWebhook(payload.response_url);

  const { user } = payload;

  // Action id = type of action
  // Value = document id
  const { action_id, value } = payload.actions[0];

  // Check which type of action the user sends from slack
  if (action_id === 'accept') {
    await handleAcceptRequest(webhookReturn, value, user.username, db);
  } else if (action_id === 'reject') {
    await handleRejectRequest(webhookReturn, value, user.username, db);
  } else if (action_id === 'ignore') {
    // Delete a message from slack channel
    await webhookReturn.send({
      response_type: 'ephemeral',
      replace_original: true,
      delete_original: true,
      text: '',
    });
  }

  return true;
};

const handleAcceptRequest = async (webhook, value, user, db) => {
  try {
    const usersCollection = await db.collection('users');
    const requestAccessCollection = await db.collection('requestAccess');

    // Get the email from the id
    const { email } = await requestAccessCollection
      .doc(value)
      .get()
      .then((snapshot) => snapshot.data());

    // Check if user already exists
    const { exists } = await usersCollection.doc(email).get();

    if (exists) throw new Error(`User ${email} already exists!`);

    // Add user if it does not exist
    await usersCollection.doc(email).set({
      id: email,
      email,
      preferences,
    });

    // Remove from requestAccessCollection
    await requestAccessCollection.doc(value).delete();

    // Send a message to slack
    await webhook.send(acceptMessage(email, user));
  } catch (e) {
    throw new Error(e.message);
  }
  return true;
};

const handleRejectRequest = async (webhook, value, user, db) => {
  try {
    const requestAccessCollection = await db.collection('requestAccess');

    // Find email from the user id
    const { email } = await requestAccessCollection
      .doc(value)
      .get()
      .then((snapshot) => snapshot.data());

    // Remove from requestAccessCollection
    await requestAccessCollection.doc(value).delete();

    // Send a message to slack
    await webhook.send(rejectMessage(email, user));
  } catch (e) {
    throw new Error(e.message);
  }
};
