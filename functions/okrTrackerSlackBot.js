const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const { WebClient } = require('@slack/web-api');

const config = require('./config');

const environment = functions.config();

const db = firebaseAdmin.firestore();

const { token } = environment.slack;
const web = new WebClient(token);

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
        text: 'Subscribe to notifications for a department\n`/okr subscribe department department-slug`\nExample: `/okr subscribe department apen-by`',
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

const allowedCommands = ['product', 'department', 'organization'];

exports.okrTrackerSlackBot = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .https.onRequest(async (req, res) => {
    const slackCollection = db.collection('slack');

    console.log(req.body);

    if (!req.body.text) {
      return res.status(200).send(slackMessageHelp);
    }

    const subcommands = req.body.text.split(' ');

    if (req.body.text.includes('subscribe')) {
      if (allowedCommands.includes(subcommands[1])) {
        const collection = await db.collection(`${subcommands[1]}s`).where('slug', '==', subcommands[2]).get();
        if (collection.docs.length === 0 || !collection.docs[0].exists) {
          return res
            .status(200)
            .send(`Could not find the ${subcommands[1]}, are you sure you have typed in the correct name?`);
        }

        const slackDoc = await slackCollection.doc(subcommands[2]).get();

        if (!slackDoc.exists) {
          await slackCollection.doc(subcommands[2]).set({
            type: `${subcommands[1]}s`,
            name: subcommands[2],
            channels: [{ channel: req.body.channel_id, deep: subcommands[4] === 'deep' }],
          });
          const result = await web.chat.postMessage({
            text: `You have successfully subscribed to ${subcommands[2]}`,
            channel: req.body.channel_id,
          });

          console.log(`Successfully send message ${result.ts} in conversation ${req.body.channel_id}`);
        } else {
          const doc = slackDoc.data();
          if (doc.channels.includes(req.body.channel_id)) {
            return res.status(200).send(`You have already subscribed to ${subcommands[2]} in this channel`);
          }

          doc.channels.push({ channel: req.body.channel_id, deep: subcommands[4] === 'deep' });
          await slackCollection.doc(subcommands[2]).update({
            channels: doc.channels,
          });

          const result = await web.chat.postMessage({
            text: `You have successfully subscribed to ${subcommands[2]}`,
            channel: req.body.channel_id,
          });

          console.log(`Successfully send message ${result.ts} in conversation ${req.body.channel_name}`);
        }
      } else {
        return res.status(200).send(slackMessageHelp);
      }
    } else if (req.body.text.includes('unsubscribe')) {
      return res.status(200).send('Unubscribe not fully implemented yet');
    } else {
      return res.status(200).send(slackMessageHelp);
    }

    return res.status(200).send({ ok: true });
  });

const inChannels = (channelId, arr) => {
  const inArr = false;
  arr.forEach(item => {
    if (item.channel === channelId) {

    }
  })
};
