import functions from 'firebase-functions';
import firebaseAdmin from 'firebase-admin';
import { WebClient } from '@slack/web-api';

const environment = functions.config();
const db = firebaseAdmin.firestore();
const { token } = environment.slack;
const web = new WebClient(token);

export const slackMessageHelp = {
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Invalid command! :wave: Need some help with `/okr`?',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Slug is the lowercase name your organization/department/product gets and is used in the url. I.E: https://okr.oslo.systems/oslo-origo. The slug here is `oslo-origo`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Subscribe to notifications for an organization\n`/okr subscribe organization organization-slug`\nExample: `/okr subscribe organization oslo-origo`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Unsubscribe to notifications for an organization\n`/okr unsubscribe organization organization-slug`\nExample: `/okr unsubscribe organization oslo-origo`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Subscribe to notifications for all products and departments in an organization\n`/okr subscribe/all organization organization-slug`\nExample: `/okr subscribe/all organization oslo-origo`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Unsubscribe to notifications for all products and departments in an organization\n`/okr unsubscribe/all organization organization-slug`\nExample: `/okr unsubscribe/all organization oslo-origo`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Subscribe to notifications for a department\n`/okr subscribe department department-slug`\nExample: `/okr subscribe department apen-by`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Subscribe to notifications for all products in a department\n`/okr subscribe/all department department-slug`\nExample: `/okr subscribe/all department apen-by`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Unsubscribe to notifications for all products in a department\n`/okr unsubscribe/all department department-slug`\nExample: `/okr unsubscribe/all department apen-by`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Unsubscribe to notifications for a department\n`/okr subscribe dep department-slug`\nExample: `/okr unsubscribe dep apen-by`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Subscribe to notifications for a product\n`/okr subscribe product product-slug`\nExample: `/okr subscribe product oslonokkelen`',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Unsubscribe to notifications for a product\n`/okr subscribe product product-slug`\nExample: `/okr unsubscribe product oslonokkelen`',
      },
    },
  ],
};

/**
 * Post message to slack
 * @param document document that the user subscribed to
 * @param channelId channelID of the slack channel
 * @param channelName Slack channelname
 * @param subscribed true/false if it was a subscribe or unsubscribe
 * @param deep subscribe/all or not
 * @returns {Promise<boolean>} dont return anything
 */
export const postToSlack = async (document, channelId, channelName, subscribed, deep) => {
  const result = await web.chat.postMessage({
    text: `You have successfully ${subscribed ? 'subscribed' : 'unsubscribed'} to ${document}${
      deep ? ', and all its children' : ''
    }`,
    channel: channelId,
  });
  console.log(`Successfully send message ${result.ts} in conversation ${channelName}`);

  return true;
};

/**
 * Add channel to slack array of document
 * @param collectionRef the reference to the document
 * @param collectionData the document data
 * @param channelId channelID of the slack channel
 * @returns {Promise<Boolean>} return true/false
 */
export const addChannelToSlackArray = async (collectionRef, collectionData, channelId) => {
  if (!collectionData.slack) {
    await collectionRef.update({
      slack: [channelId],
    });

    return true;
  }
  if (!collectionData.slack.includes(channelId)) {
    collectionData.slack.push(channelId);
    await collectionRef.update({
      slack: collectionData.slack,
    });
    return true;
  }
  return false;
};

/**
 * Remove channel from slack array in document
 * @param collectionRef the reference to the document
 * @param collectionData the document data
 * @param channelId channelID of the slack channel
 * @returns {Promise<Boolean>} return true/false
 */
export const removeChannelFromSlackArray = async (collectionRef, collectionData, channelId) => {
  if (!collectionData.slack || !collectionData.slack?.includes(channelId)) {
    return false;
  }
  const slackArr = collectionData.slack.filter((channel) => channel !== channelId);
  await collectionRef.update({
    slack: slackArr,
  });

  return true;
};

/**
 * Remove channels from slack array of multiple documents
 * @param documents All documents to loop through
 * @param channelId channelID of the slack channel
 * @returns {Promise<Object>} Return the batch-object so that the information can be committed to firestore
 */
export const removeChannelsFromMultipleSlackArrays = async (documents, channelId) => {
  const batch = db.batch();

  documents.forEach((item) => {
    const docRef = item.ref;
    const data = item.data();

    if (data.slack && data.slack.includes(channelId)) {
      const filteredArr = data.slack.filter((channel) => channel !== channelId);
      batch.update(docRef, { slack: filteredArr });
    } else {
      const slack = data.slack ? data.slack : [];
      batch.update(docRef, { slack });
    }
  });

  return batch;
};

/**
 * Add new channels to the slack array of multiple documents
 * @param documents All documents to loop through
 * @param channelId channelID of the slack channel
 * @returns {Promise<Object>} Return the batch-object so that the information can be committed to firestore
 */
export const addChannelsToMultipleSlackArrays = async (documents, channelId) => {
  const batch = db.batch();

  documents.forEach((prod) => {
    const docRef = prod.ref;
    const data = prod.data();

    if (!data.slack) {
      batch.update(docRef, {
        slack: [channelId],
      });
    } else if (!data.slack.includes(channelId)) {
      data.slack.push(channelId);
      batch.update(docRef, {
        slack: data.slack,
      });
    }
  });

  return batch;
};

/**
 * Get departments and products from firestore
 * @param type document that the user subscribed to
 * @param documentId channelID of the slack channel
 * @returns {Promise<Object>} return array of departments and products
 */
export const getDepsAndProds = async (type, documentId) => {
  const deps = await db
    .collection('departments')
    .where('archived', '==', false)
    .where(`${type}`, '==', db.collection(`${type}s`).doc(documentId))
    .get();
  const prods = await db
    .collection('products')
    .where('archived', '==', false)
    .where(`${type}`, '==', db.collection(`${type}s`).doc(documentId))
    .get();

  return { deps, prods };
};
