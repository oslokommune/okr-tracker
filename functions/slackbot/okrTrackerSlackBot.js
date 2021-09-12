const firebaseAdmin = require('firebase-admin');

const {
  addChannelToDoc,
  updateChannelsToDoc,
  postToSlack,
  filterOutChannelsFromDoc,
  getAllDepsAndProds,
  getAllProducts,
  inChannels,
  updateChannelsFromDoc,
} = require('./helper-methods');

const db = firebaseAdmin.firestore();

const slackMessageHelp = {
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

const allowedSub = ['product', 'department', 'organization'];
const allowedDeepSub = ['organization', 'department'];

exports.runSlackBot = async (req, res) => {
  const slackCollection = db.collection('slack');

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

    // Get the slack document
    const slackDoc = await slackCollection.doc(subcommands[2]).get();

    // If it doesnt exist, then add a new document with the information
    if (!slackDoc.exists) {
      await addChannelToDoc(slackCollection, subcommands[1], subcommands[2], req.body.channel_id, false);
    } else {
      const result = await updateChannelsToDoc(
        slackDoc,
        slackCollection,
        req.body.channel_id,
        subcommands[2],
        false,
        res
      );
      if (!result) {
        return res
          .status(200)
          .send(`You have already subscribed to the ${subcommands[1]} '${subcommands[2]}', in this channel`);
      }
    }

    await postToSlack(subcommands[2], req.body.channel_id, req.body.channel_name, true);

    return res.status(200).send();
  }
  if (subcommands[0] === 'unsubscribe' && allowedSub.includes(subcommands[1])) {
    const collection = await db.collection(`${subcommands[1]}s`).where('slug', '==', subcommands[2]).get();
    if (collection.docs.length === 0 || !collection.docs[0].exists) {
      return res
        .status(200)
        .send(`Could not find the ${subcommands[1]}, are you sure you've typed in the correct name?`);
    }

    // Get the slack document
    const slackDoc = await slackCollection.doc(subcommands[2]).get();

    // If it doesnt exist, then add a new document with the information
    if (!slackDoc.exists) {
      return res.status(200).send(`No subscription found for the ${subcommands[2]} '${subcommands[2]}'`);
    }

    const doc = slackDoc.data();

    const channelExists = inChannels(req.body.channel_id, doc.channels);
    if (!channelExists) {
      return res.status(200).send(`You do not have a subscription for ${subcommands[2]} '${subcommands[2]}'`);
    }

    doc.channels = doc.channels.filter((channel) => channel.channel !== req.body.channel_id);

    await slackCollection.doc(subcommands[2]).update({
      channels: doc.channels,
    });

    await postToSlack(subcommands[2], req.body.channel_id, req.body.channel_name, false);

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

    // Get the slack document
    const slackDoc = await slackCollection.doc(subcommands[2]).get();

    // If it doesnt exist, then add a new document with the information
    if (!slackDoc.exists) {
      await addChannelToDoc(slackCollection, subcommands[1], subcommands[2], req.body.channel_id, true);
    } else {
      const result = await updateChannelsToDoc(
        slackDoc,
        slackCollection,
        req.body.channel_id,
        subcommands[2],
        true,
        res
      );
      if (!result) {
        return res.status(200).send(`You have already subscribed to ${subcommands[2]} in this channel`);
      }
    }

    if (subcommands[1] === 'organization') {
      const { slackPromises, depsAndProds } = await getAllDepsAndProds(documentId, slackCollection);

      const slackResult = await Promise.all(slackPromises);

      const promises = await updateChannelsFromDoc(slackResult, depsAndProds, slackCollection, req.body.channel_id);

      await Promise.all(promises);
    } else if (subcommands[1] === 'department') {
      const { slackPromises, allProducts } = await getAllProducts(documentId, slackCollection);

      const slackResult = await Promise.all(slackPromises);

      const promises = await updateChannelsFromDoc(slackResult, allProducts, slackCollection, req.body.channel_id);

      await Promise.all(promises);
    } else {
      return res.status(200).send('You can only run subscribe/all on a department or organization');
    }

    await postToSlack(subcommands[2], req.body.channel_id, req.body.channel_name, true);

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

    // Get the slack document
    const slackDoc = await slackCollection.doc(subcommands[2]).get();

    // If it doesnt exist, then add a new document with the information
    if (!slackDoc.exists) {
      return res.status(200).send(`No subscription found for the ${subcommands[2]} '${subcommands[2]}'`);
    }

    const doc = slackDoc.data();
    let hasDeep = false;

    for (let i = 0; i < doc.channels.length; i += 1) {
      if (doc.channels[i].channel === req.body.channel_id && doc.channels[i].deep === true) {
        hasDeep = true;
        break;
      }
    }

    if (!hasDeep) {
      return res.status(200).send(`You do not have a subscription for ${subcommands[2]} '${subcommands[2]}'`);
    }

    if (subcommands[1] === 'organization') {
      const { slackPromises, depsAndProds } = await getAllDepsAndProds(documentId, slackCollection);

      const slackResult = await Promise.all(slackPromises);

      const promises = await filterOutChannelsFromDoc(slackResult, depsAndProds, slackCollection, req.body.channel_id);

      await Promise.all(promises);
    } else if (subcommands[1] === 'department') {
      const { slackPromises, allProducts } = await getAllProducts(documentId, slackCollection);

      const slackResult = await Promise.all(slackPromises);

      const promises = await filterOutChannelsFromDoc(slackResult, allProducts, slackCollection, req.body.channel_id);

      await Promise.all(promises);
    } else {
      return res.status(200).send('You can only run subscribe/all on a department or organization');
    }

    doc.channels = doc.channels.filter((channel) => channel.channel !== req.body.channel_id);

    await slackCollection.doc(subcommands[2]).update({
      channels: doc.channels,
    });

    await postToSlack(subcommands[2], req.body.channel_id, req.body.channel_name, false);

    return res.status(200).send();
  }

  return res.status(200).send(slackMessageHelp);
};
