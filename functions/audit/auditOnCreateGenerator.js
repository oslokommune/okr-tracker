const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { WebClient } = require('@slack/web-api');

const config = require('../config');

const environment = functions.config();

const { token } = environment.slack;
const slack = new WebClient(token);

const db = admin.firestore();

const collection = db.collection('slack');

exports.auditOnCreateGenerator = function ({ docPath, collectionRef, documentType }) {
  return functions
    .runWith(config.runtimeOpts)
    .region(config.region)
    .firestore.document(docPath)
    .onCreate(async (snapshot, context) => {
      const { documentId } = context.params;

      const auditData = {
        event: `${documentType}Created`,
        timestamp: new Date(),
        documentRef: collectionRef.doc(documentId),
      };

      const documentData = snapshot.data();
      if (documentData.createdBy) {
        auditData.user = documentData.createdBy;
      }
      if (documentData.name) {
        auditData.name = documentData.name;
      }
      if (documentData.department) {
        auditData.department = documentData.department;
      }

      await pushToSlack(documentType, documentData);

      return db.collection('audit').add(auditData);
    });
};

const pushToSlack = async (documentType, document) => {
  if (documentType === 'Department') {
    const orgDocument = await document.organization.get();
    const orgData = orgDocument.data();
    const userDocument = await document.createdBy.get();

    const slackCollectionOrg = await collection.doc(orgData.slug).get();
    if (!slackCollectionOrg.exists) {
      return false;
    }

    const slackDataOrg = slackCollectionOrg.data();
    const userData = userDocument.data();

    const slackMessage = createSlackMessage({
      documentType,
      documentData: document,
      parent: 'organization',
      user: userData,
      organization: orgData,
    });

    let promises = [];
    if (slackDataOrg.channels?.length > 0) {
      promises = await fillPromisesArray(slackDataOrg, promises, slackMessage);
    }
    await Promise.all(promises);
  }

  if (documentType === 'Product') {
    const orgDocument = await document.organization.get();
    const depDocument = await document.department.get();
    const userDocument = await document.createdBy.get();

    const orgData = orgDocument.data();
    const depData = depDocument.data();
    const userData = userDocument.data();

    const slackCollectionOrg = await collection.doc(orgData.slug).get();
    const slackCollectionDep = await collection.doc(depData.slug).get();
    if (!slackCollectionOrg.exists && !slackCollectionDep.exists) {
      return false;
    }

    const slackDataOrg = slackCollectionOrg.data();
    const slackDataDep = slackCollectionDep.data();

    let promises = [];

    const slackMessage = createSlackMessage({
      documentType,
      documentData: document,
      parent: 'department',
      user: userData,
      department: depData,
      organization: orgData,
    });

    if (slackDataOrg.channels?.length > 0) {
      promises = await fillPromisesArray(slackDataOrg, promises, slackMessage);
    }
    if (slackDataDep.channels?.length > 0) {
      promises = await fillPromisesArray(slackDataDep, promises, slackMessage);
    }

    await Promise.all(promises);
  }

  return true;
};

const fillPromisesArray = async (docs, arr, slackMessage) => {
  docs.channels.forEach((channel) => {
    if (channel.deep) {
      arr.push(
        slack.chat.postMessage({
          channel: channel.channel,
          attachments: slackMessage,
          text: 'fallback',
        })
      );
    }
  });

  return arr;
};

const createSlackMessage = ({ documentType, documentData, user, parent, department, organization }) => {
  const fields = [];

  fields.push({
    type: 'plain_text',
    text: `Name: ${documentData.name}`,
  });
  if (organization) {
    fields.push({
      type: 'plain_text',
      text: `Organization: ${organization.name}`,
    });
  }
  if (department) {
    fields.push({
      type: 'plain_text',
      text: `Department: ${department.name}`,
    });
  }

  return [
    {
      color: '#292858',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Created',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `A new ${documentType.toLowerCase()} was created at the ${parent}-level`,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          fields,
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Created by: *${user.displayName || user.email}*`,
            },
          ],
        },
      ],
    },
  ];
};
