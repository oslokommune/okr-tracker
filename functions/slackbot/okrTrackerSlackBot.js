const firebaseAdmin = require('firebase-admin');

const {
  postToSlack,
  addChannelToSlackArray,
  removeChannelFromSlackArray,
  removeChannelsFromMultipleSlackArrays,
  addChannelsToMultipleSlackArrays,
  getDepsAndProds,
  slackMessageHelp,
} = require('./helper-methods');

const db = firebaseAdmin.firestore();

const allowedSub = ['product', 'department', 'organization'];
const allowedDeepSub = ['organization', 'department'];
const allowedCmd = ['subscribe', 'unsubscribe', 'subscribe/all', 'unsubscribe/all'];

exports.runSlackBot = async (req, res) => {
  if (!req.body.text) {
    return res.status(200).send(slackMessageHelp);
  }

  let isSubscribed = false;
  let isDeep = false;

  const cmd = req.body.text.split(' ');

  if (!allowedCmd.includes(cmd[0]) || !allowedSub.includes(cmd[1])) {
    console.log(cmd);
    return res.status(200).send(slackMessageHelp);
  }

  // Get the document and check if it exists
  const parentDocument = await db.collection(`${cmd[1]}s`).where('slug', '==', cmd[2]).get();
  if (parentDocument.docs.length === 0 || !parentDocument.docs[0].exists) {
    return res
      .status(200)
      .send(`Could not find the ${cmd[1]} ${cmd[2]}, are you sure you've typed in the correct name?`);
  }

  // Get the document data and reference
  const parentDocumentData = parentDocument.docs[0].data();
  const parentDocumentRef = parentDocument.docs[0].ref;

  let documents = [...parentDocument.docs];
  // If user sends subscribe
  if (cmd[0] === 'subscribe' && allowedSub.includes(cmd[1])) {
    isSubscribed = true;
    // Add the channelId to the document slack-property
    const result = addChannelToSlackArray(parentDocumentRef, parentDocumentData, req.body.channel_id);

    if (!result) {
      return res.status(200).send(`You are already subscribed to the ${cmd[1]} ${cmd[2]}`);
    }
    // If user sends unsubscribe
  } else if (cmd[0] === 'unsubscribe' && allowedSub.includes(cmd[1])) {
    // remove channelId from the document slack-property
    const result = await removeChannelFromSlackArray(parentDocumentRef, parentDocumentData, req.body.channel_id);
    if (!result) {
      return res.status(200).send(`You are not subscribed to the ${cmd[1]}: ${cmd[2]}`);
    }
    // subscribe/all command to subscribe to everything within an organization or department
  } else if (cmd[0] === 'subscribe/all' && allowedDeepSub.includes(cmd[1])) {
    isSubscribed = true;
    isDeep = true;

    const documentId = parentDocument.docs[0].id;
    const { deps, prods } = await getDepsAndProds(cmd[1], documentId);

    if (cmd[1] === 'organization') {
      documents = [...parentDocument.docs, ...deps.docs, ...prods.docs];
    } else if (cmd[1] === 'department') {
      documents = [...parentDocument.docs, ...prods.docs];
    } else {
      return res.status(200).send('You can only run subscribe/all on a department or organization');
    }
    const batch = await addChannelsToMultipleSlackArrays(documents, req.body.channel_id);
    await batch.commit();
  }
  if (cmd[0] === 'unsubscribe/all' && allowedDeepSub.includes(cmd[1])) {
    isDeep = true;
    const documentId = parentDocument.docs[0].id;
    const { deps, prods } = await getDepsAndProds(cmd[1], documentId);

    if (cmd[1] === 'organization') {
      documents = [...parentDocument.docs, ...deps.docs, ...prods.docs];
    } else if (cmd[1] === 'department') {
      documents = [...parentDocument.docs, ...prods.docs];
    } else {
      return res.status(200).send('You can only run unsubscribe/all on a department or organization');
    }

    const batch = await removeChannelsFromMultipleSlackArrays(documents, req.body.channel_id);

    await batch.commit();
  }

  // Push to slack
  try {
    await postToSlack(cmd[2], req.body.channel_id, req.body.channel_name, isSubscribed, isDeep);
  } catch (e) {
    // If the bot is not allowed to push to a slack channel, then delete everything that has been updated and tell the user that the bot needs access to a private channel
    const batch = await removeChannelsFromMultipleSlackArrays(documents, req.body.channel_id);
    await batch.commit();
    return res
      .status(200)
      .send(
        `Could not subscribe to ${cmd[1]}. If this is a private channel, you must add the slackbot to the private channel. Settings -> Integrations -> Add app -> Search for OKR-tracker, and then try again. Or click on my icon -> add this app to a channel -> choose this channel`
      );
  }

  return res.status(200).send();
};
