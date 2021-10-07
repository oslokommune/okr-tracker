const firebaseAdmin = require('firebase-admin');

const { postToSlack } = require('./helper-methods');

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

    if (!collectionData.slack) {
      await collectionRef.update({
        slack: [req.body.channel_id],
      });
    } else if (!collectionData.slack.includes(req.body.channel_id)) {
      collectionData.slack.push(req.body.channel_id);
      await collectionRef.update({
        slack: collectionData.slack,
      });
    } else {
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

    if (!collectionData.slack || !collectionData.slack?.includes(req.body.channel_id)) {
      return res.status(200).send(`You are not subscribed to ${subcommands[1]}`);
    }
    const slackArr = collectionData.slack.filter((channel) => channel !== req.body.channel_id);
    await collectionRef.update({
      slack: slackArr,
    });

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
    const collectionData = collection.docs[0].data();
    const collectionRef = collection.docs[0].ref;

    if (!collectionData.slack) {
      await collectionRef.update({
        slack: [req.body.channel_id],
      });
    } else if (!collectionData.slack.includes(req.body.channel_id)) {
      collectionData.slack.push(req.body.channel_id);
      await collectionRef.update({
        slack: collectionData.slack,
      });
    }

    if (subcommands[1] === 'organization') {
      const deps = await db
        .collection('departments')
        .where('archived', '==', false)
        .where('organization', '==', db.collection('organizations').doc(documentId))
        .get();
      const prods = await db
        .collection('products')
        .where('archived', '==', false)
        .where('organization', '==', db.collection('organizations').doc(documentId))
        .get();

      const batch = db.batch();

      deps.docs.forEach((dep) => {
        const docRef = dep.ref;
        console.log(docRef);
        const data = dep.data();

        if (!data.slack) {
          batch.update(docRef, {
            slack: [req.body.channel_id],
          });
        } else if (!data.slack.includes(req.body.channel_id)) {
          data.slack.push(req.body.channel_id);
          batch.update(docRef, {
            slack: data.slack,
          });
        }
      });

      prods.docs.forEach((prod) => {
        const docRef = prod.ref;
        console.log(docRef);
        const data = prod.data();

        if (!data.slack) {
          batch.update(docRef, {
            slack: [req.body.channel_id],
          });
        } else if (!data.slack.includes(req.body.channel_id)) {
          data.slack.push(req.body.channel_id);
          batch.update(docRef, {
            slack: data.slack,
          });
        }
      });

      await batch.commit();
    } else if (subcommands[1] === 'department') {
      const prods = await db
        .collection('products')
        .where('archived', '==', false)
        .where('department', '==', db.collection('departments').doc(documentId))
        .get();

      const batch = db.batch();

      prods.docs.forEach((prod) => {
        const docRef = prod.ref;
        console.log(docRef);
        const data = prod.data();

        if (!data.slack) {
          batch.update(docRef, {
            slack: [req.body.channel_id],
          });
        } else if (!data.slack.includes(req.body.channel_id)) {
          data.slack.push(req.body.channel_id);
          batch.update(docRef, {
            slack: data.slack.push(req.body.channel_id),
          });
        }
      });

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
    const collectionData = collection.docs[0].data();
    const collectionRef = collection.docs[0].ref;

    if (!collectionData.slack || !collectionData.slack.includes(req.body.channel_id)) {
      return res.status(200).send(`You are not subscribed to ${subcommands[1]}`);
    }
    const slackArr = collectionData.slack.filter((channel) => channel !== req.body.channel_id);
    await collectionRef.update({
      slack: slackArr,
    });

    if (subcommands[1] === 'organization') {
      const deps = await db
        .collection('departments')
        .where('archived', '==', false)
        .where('organization', '==', db.collection('organizations').doc(documentId))
        .get();
      const prods = await db
        .collection('products')
        .where('archived', '==', false)
        .where('organization', '==', db.collection('organizations').doc(documentId))
        .get();

      const batch = db.batch();

      deps.docs.forEach((dep) => {
        const docRef = dep.ref;
        const data = dep.data();

        if (data.slack && data.slack.includes(req.body.channel_id)) {
          const filteredArr = collectionData.slack.filter((channel) => channel !== req.body.channel_id);
          batch.update(docRef, {
            slack: filteredArr,
          });
        }
      });

      prods.docs.forEach((prod) => {
        const docRef = prod.ref;
        const data = prod.data();

        if (data.slack && data.slack.includes(req.body.channel_id)) {
          const filteredArr = collectionData.slack.filter((channel) => channel !== req.body.channel_id);
          batch.update(docRef, {
            slack: filteredArr,
          });
        }
      });

      console.log(batch.length);

      await batch.commit();
    } else if (subcommands[1] === 'department') {
      const prods = await db
        .collection('products')
        .where('archived', '==', false)
        .where('organization', '==', db.collection('organizations').doc(documentId))
        .get();

      const batch = db.batch();

      prods.docs.forEach((prod) => {
        const docRef = prod.ref;
        const data = prod.data();

        if (data.slack && data.slack.includes(req.body.channel_id)) {
          const filteredArr = collectionData.slack.filter((channel) => channel !== req.body.channel_id);
          batch.update(docRef, {
            slack: filteredArr,
          });
        }
      });

      await batch.commit();
    } else {
      return res.status(200).send('You can only run subscribe/all on a department or organization');
    }

    await postToSlack(subcommands[2], req.body.channel_id, req.body.channel_name, false, true);

    return res.status(200).send();
  }

  return res.status(200).send(slackMessageHelp);
};
