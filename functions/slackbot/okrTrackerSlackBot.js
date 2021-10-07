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

exports.runSlackBot = async (req, res) => {
  if (!req.body.text) {
    return res.status(200).send(slackMessageHelp);
  }

  const subcommands = req.body.text.split(' ');

  // If user sends subscribe
  if (subcommands[0] === 'subscribe' && allowedSub.includes(subcommands[1])) {
    // Check if user wants to subscribe to everything from top to bottom of org/dep
    // Get the document and check if it exists
    const collection = await db.collection(`${subcommands[1]}s`).where('slug', '==', subcommands[2]).get();
    if (collection.docs.length === 0 || !collection.docs[0].exists) {
      return res
        .status(200)
        .send(`Could not find the ${subcommands[1]}, are you sure you've typed in the correct name?`);
    }

    const collectionData = collection.docs[0].data();
    const collectionRef = collection.docs[0].ref;

    const result = addChannelToSlackArray(collectionRef, collectionData, req.body.channel_id);

    if (!result) {
      return res.status(200).send(`You are already subscribed to ${subcommands[1]}`);
    }

    await postToSlack(subcommands[2], req.body.channel_id, req.body.channel_name, true, false);

    return res.status(200).send();
  }
  if (subcommands[0] === 'unsubscribe' && allowedSub.includes(subcommands[1])) {
    const collection = await db.collection(`${subcommands[1]}s`).where('slug', '==', subcommands[2]).get();
    if (collection.docs.length === 0 || !collection.docs[0].exists) {
      return res
        .status(200)
        .send(`Could not find the ${subcommands[1]}, are you sure you've typed in the correct name?`);
    }

    const collectionData = collection.docs[0].data();
    const collectionRef = collection.docs[0].ref;

    const result = await removeChannelFromSlackArray(collectionRef, collectionData, req.body.channel_id);
    if (!result) {
      return res.status(200).send(`You are not subscribed to ${subcommands[1]}`);
    }

    await postToSlack(subcommands[2], req.body.channel_id, req.body.channel_name, false, false);

    return res.status(200).send();
  }

  if (subcommands[0] === 'subscribe/all' && allowedDeepSub.includes(subcommands[1])) {
    const collection = await db.collection(`${subcommands[1]}s`).where('slug', '==', subcommands[2]).get();

    if (collection.docs.length === 0 || !collection.docs[0].exists) {
      return res
        .status(200)
        .send(`Could not find the ${subcommands[1]}, are you sure you've typed in the correct name?`);
    }
    const documentId = collection.docs[0].id;

    const { deps, prods } = await getDepsAndProds(subcommands[1], documentId);

    const collectionData = collection.docs[0].data();
    const collectionRef = collection.docs[0].ref;

    const result = addChannelToSlackArray(collectionRef, collectionData, req.body.channel_id);

    if (!result) {
      return res.status(200).send(`You are already subscribed to ${subcommands[1]}`);
    }

    if (subcommands[1] === 'organization') {
      const depsAndProds = [...deps.docs, ...prods.docs];
      const batch = await addChannelsToMultipleSlackArrays(depsAndProds, req.body.channel_id);

      await batch.commit();
    } else if (subcommands[1] === 'department') {
      const batch = await addChannelsToMultipleSlackArrays(prods.docs, req.body.channel_id);

      await batch.commit();
    } else {
      return res.status(200).send('You can only run subscribe/all on a department or organization');
    }

    await postToSlack(subcommands[2], req.body.channel_id, req.body.channel_name, true, true);

    return res.status(200).send();
  }

  if (subcommands[0] === 'unsubscribe/all' && allowedDeepSub.includes(subcommands[1])) {
    const collection = await db.collection(`${subcommands[1]}s`).where('slug', '==', subcommands[2]).get();
    if (collection.docs.length === 0 || !collection.docs[0].exists) {
      return res
        .status(200)
        .send(`Could not find the ${subcommands[1]}, are you sure you've typed in the correct name?`);
    }
    const documentId = collection.docs[0].id;

    const { deps, prods } = await getDepsAndProds(subcommands[1], documentId);

    const collectionData = collection.docs[0].data();
    const collectionRef = collection.docs[0].ref;

    const result = await removeChannelFromSlackArray(collectionRef, collectionData, req.body.channel_id);
    if (!result) {
      return res.status(200).send(`You are not subscribed to ${subcommands[1]}`);
    }

    if (subcommands[1] === 'organization') {
      const depsAndProds = [...deps.docs, ...prods.docs];
      const batch = await removeChannelsFromMultipleSlackArrays(depsAndProds, req.body.channel_id);

      await batch.commit();
    } else if (subcommands[1] === 'department') {
      const batch = await removeChannelsFromMultipleSlackArrays(prods.docs, req.body.channel_id);

      await batch.commit();
    } else {
      return res.status(200).send('You can only run subscribe/all on a department or organization');
    }

    await postToSlack(subcommands[2], req.body.channel_id, req.body.channel_name, false, true);

    return res.status(200).send();
  }

  return res.status(200).send(slackMessageHelp);
};
