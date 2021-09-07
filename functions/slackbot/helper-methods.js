const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const { WebClient } = require('@slack/web-api');

const environment = functions.config();
const db = firebaseAdmin.firestore();

const { token } = environment.slack;
const web = new WebClient(token);

const departmentCollection = db.collection('departments');
const organizationCollection = db.collection('organizations');

/**
 * Return true or false if channel exists in array
 * @param channelId channel to check with
 * @param arr array of channels to check
 * @returns {boolean}
 */
const inChannels = (channelId, arr) => {
  let channelExists = false;
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i].channel === channelId) {
      channelExists = true;
      break;
    }
  }
  return channelExists;
};

/**
 * Post message to slack
 * @param document document that the user subscribed to
 * @param channelId channelID of the slack channel
 * @param channelName Slack channelname
 * @param subscribed true/false if it was a subscribe or unsubscribe
 * @returns {Promise<void>} dont return anything
 */
 const postToSlack = async (document, channelId, channelName, subscribed) => {
  const result = await web.chat.postMessage({
    text: `You have successfully ${subscribed ? 'subscribed' : 'unsubscribed'} to ${document}`,
    channel: channelId,
  });

  console.log(`Successfully send message ${result.ts} in conversation ${channelName}`);
};

/**
 *
 * @param collection collection to add a document
 * @param type type of document
 * @param name name of the document
 * @param channelId slack channel ID
 * @param deep if you are subscribing to everything or not
 */
 const addChannelToDoc = (collection, type, name, channelId, deep) =>
  collection.doc(name).set({
    type: `${type}s`,
    name,
    channels: [{ channel: channelId, deep }],
  });

/**
 *
 * @param slackDoc slack document from the slack collection
 * @param slackCollection slack collection
 * @param channelId slack channel ID
 * @param name name of the document you want to add the channel ID to
 * @param deep true/false if the subscription is for everything or not
 * @returns {Promise<boolean>} return true or false that the document was updated with the channel
 */
 const updateChannelsToDoc = async (slackDoc, slackCollection, channelId, name, deep) => {
  const doc = slackDoc.data();
  // Run through array and check if the channel exists
  const channelExists = inChannels(channelId, doc.channels);
  if (channelExists) {
    return false;
  }

  // Push new channel to array and update the document
  doc.channels.push({ channel: channelId, deep });
  await slackCollection.doc(name).update({
    channels: doc.channels,
  });
  return true;
};

/**
 *
 * @param documentId document ID you want to find in the collections
 * @param slackCollection slack collection
 * @returns {Promise<{depsAndProds: *[], slackPromises: *[]}>} return one array of promises getting the documents and one array of all prods/deps
 */
 const getAllDepsAndProds = async (documentId, slackCollection) => {
  const deps = await db
    .collection('departments')
    .where('organization', '==', organizationCollection.doc(documentId))
    .get();
  const prods = await db
    .collection('products')
    .where('organization', '==', organizationCollection.doc(documentId))
    .get();

  const slackPromises = [];
  const depsAndProds = [];
  deps.docs.forEach((dep) => {
    const data = dep.data();
    depsAndProds.push(data);
    slackPromises.push(slackCollection.doc(data.slug).get());
  });
  prods.docs.forEach((prod) => {
    const data = prod.data();
    depsAndProds.push(data);
    slackPromises.push(slackCollection.doc(data.slug).get());
  });

  return { slackPromises, depsAndProds };
};

/**
 *
 * @param documentId document ID you want to find in the collections
 * @param slackCollection slack collection
 * @returns {Promise<{depsAndProds: *[], slackPromises: *[]}>} return one array of promises getting the documents and one array of all products
 */
 const getAllProducts = async (documentId, slackCollection) => {
  const prods = await db.collection('products').where('department', '==', departmentCollection.doc(documentId)).get();

  const slackPromises = [];
  const allProducts = [];
  prods.docs.forEach((prod) => {
    const data = prod.data();
    allProducts.push(data);
    slackPromises.push(slackCollection.doc(data.slug).get());
  });

  return { slackPromises, allProducts };
};

/**
 *
 * @param slackArr array of documents from the slack collection
 * @param docsArr array of documents with prods/deps
 * @param slackCollection slack collection
 * @param channelId slack channel id
 * @returns {Promise<*[]>} return array of promises to update the slack collection
 */
 const filterOutChannelsFromDoc = async (slackArr, docsArr, slackCollection, channelId) => {
  const promises = [];
  slackArr.forEach((result, index) => {
    const data = result.data();
    if (result.exists) {
      data.channels = data.channels.filter((channel) => channel.channel !== channelId);
      promises.push(
        slackCollection.doc(docsArr[index].slug).update({
          channels: data.channels,
        })
      );
    }
  });

  return promises;
};

/**
 *
 * @param slackArr array of documents from the slack collection
 * @param docsArr array of documents with prods/deps
 * @param slackCollection slack collection
 * @param channelId slack channel id
 * @returns {Promise<*[]>} return array of promises to update the slack collection
 */
 const updateChannelsFromDoc = async (slackArr, docsArr, slackCollection, channelId) => {
  const promises = [];
  slackArr.forEach((result, index) => {
    const doc = result.data();
    if (!result.exists) {
      const type = docsArr[index].department ? 'products' : 'departments';
      const name = docsArr[index].slug;
      promises.push(addChannelToDoc(slackCollection, type, name, channelId, false));
    } else {
      doc.channels.push({ channel: channelId, deep: false });
      promises.push(
        slackCollection.doc(docsArr[index].slug).update({
          channels: doc.channels,
        })
      );
    }
  });

  return promises;
};

 exports.updateChannelsFromDoc = updateChannelsFromDoc;
 exports.filterOutChannelsFromDoc = filterOutChannelsFromDoc;
 exports.getAllProducts = getAllProducts;
 exports.getAllDepsAndProds = getAllDepsAndProds;
 exports.updateChannelsToDoc = updateChannelsToDoc;
 exports.postToSlack = postToSlack;
 exports.inChannels = inChannels;
exports.addChannelToDoc = addChannelToDoc;
