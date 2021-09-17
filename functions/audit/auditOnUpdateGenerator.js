const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { format } = require('date-fns');
const { nb } = require('date-fns/locale');

const { WebClient } = require('@slack/web-api');

const config = require('../config');

const HOST_URL = functions.config().host_url;
const environment = functions.config();

const { token } = environment.slack;

const slack = new WebClient(token);

const db = admin.firestore();

const slackCollection = db.collection('slack');

const options = { locale: nb };

const dateShort = (d) => format(d, 'do MMM', options);

exports.auditOnUpdateGenerator = function ({ docPath, fields, collectionRef, documentType }) {
  return functions
    .runWith(config.runtimeOpts)
    .region(config.region)
    .firestore.document(docPath)
    .onUpdate(async ({ before, after }, context) => {
      let event;
      const diff = getDiff({ before, after }, fields);

      if (!Object.keys(diff).length) return false;

      if (diff.archived && diff.archived.after === true) {
        event = `${documentType}Archived`;
      } else if (diff.archived && diff.archived.after === false) {
        event = `${documentType}Restored`;
      } else if (diff) {
        event = `${documentType}Updated`;
      } else {
        return false;
      }

      const { documentId } = context.params;

      const user = await (async () => {
        try {
          if ('progression' in diff) {
            return getProgressionCreator(collectionRef.doc(documentId));
          }
          return after.data().editedBy;
        } catch {
          return 'system';
        }
      })();

      const auditData = {
        event,
        timestamp: new Date(),
        documentRef: collectionRef.doc(documentId),
        user: user || 'system',
        diff,
      };

      if (auditData.event.includes('Updated')) {
        await pushToSlack(documentType, auditData);
      }

      return db.collection('audit').add(auditData);
    });
};

function getProgressionCreator(document) {
  try {
    return document
      .collection('progress')
      .orderBy('timestamp', 'asc')
      .limit(1)
      .get()
      .then((snap) => snap.docs[0].data().createdBy);
  } catch {
    throw new Error('Could not find progression creator');
  }
}

function getDiff({ before, after }, keys) {
  const diff = {};
  before = before.data();
  after = after.data();

  keys.forEach((key) => {
    if (before[key] && before[key].seconds) {
      before[key] = before[key].seconds;
    }

    if (after[key] && after[key].seconds) {
      after[key] = after[key].seconds;
    }

    if (before[key] !== after[key]) {
      diff[key] = {
        before: before[key] === undefined ? null : before[key],
        after: after[key] === undefined ? null : after[key],
      };
    }
  });

  return diff;
}

const pushToSlack = async (documentType, auditData) => {
  const colors = {
    created: '#43f8b6',
    updated: '#f8c66b',
    archived: '#ff8174',
  };

  const created = {
    header: '',
    owner: '',
    context: '',
    info: '',
  };

  if (documentType === 'Organization') {
  }
  if (documentType === 'Department') {
  }
  if (documentType === 'Product') {
  }
  if (documentType === 'Objective') {
    const promises = [];

    if (auditData.diff?.name?.before === 'placeholder') {
      const doc = await auditData.documentRef.get();
      const data = doc.data();

      const parent = await data.parent.get();
      const parentData = parent.data();
      const period = await data.period.get();
      const periodData = period.data();

      const slackParentDoc = await slackCollection.doc(parentData.slug).get();

      created.header = `:tada: ${documentType}`;
      created.owner = `${parentData.name} has created a new ${documentType}`;
      created.context = `[${periodData.name}] ${dateShort(periodData.startDate.toDate())} - ${dateShort(
        periodData.endDate.toDate()
      )}`;
      created.info = `<${HOST_URL}/${parentData.slug}/o/${doc.id} | ${data.name}>`;

      const slackMsg = await msg(colors.created, created);

      if (slackParentDoc.exists) {
        const slackParentData = slackParentDoc.data();

        if (slackParentData.channels?.length > 0) {
          slackParentData.channels.forEach((channel) => {
            promises.push(
              slack.chat.postMessage({
                channel: channel.channel,
                attachments: slackMsg.attachments,
              })
            );
          });
        }
      }

      await Promise.all(promises);
    }
  }
  if (documentType === 'KeyResult') {
    const promises = [];

    if (auditData.diff?.name?.before === 'placeholder') {
      const doc = await auditData.documentRef.get();
      const data = doc.data();
      const objective = await data.objective.get();
      const parent = await data.parent.get();
      const objData = objective.data();
      const parentData = parent.data();

      const slackParentDoc = await slackCollection.doc(parentData.slug).get();

      created.header = `:tada: ${documentType}`;
      created.owner = `${parentData.name} has created a new ${documentType}`;
      created.context = `${objData.name}`;
      created.info = `<${HOST_URL}/${parentData.slug}/k/${doc.id} | ${data.name}>`;

      const slackMsg = await msg(colors.created, created);

      if (slackParentDoc.exists) {
        const slackParentData = slackParentDoc.data();

        if (slackParentData.channels?.length > 0) {
          slackParentData.channels.forEach((channel) => {
            promises.push(
              slack.chat.postMessage({
                channel: channel.channel,
                attachments: slackMsg.attachments,
              })
            );
          });
        }
      }

      await Promise.all(promises);
    }
  }

  return true;
};

const msg = async (color, created) => ({
  attachments: [
    {
      color,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: created.header,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: created.owner,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            {
              type: 'plain_text',
              text: created.context,
              emoji: true,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: created.info,
          },
        },
      ],
    },
  ],
});
