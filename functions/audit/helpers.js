const functions = require('firebase-functions');
const { WebClient } = require('@slack/web-api');
const { format } = require('date-fns');
const { nb } = require('date-fns/locale');

const environment = functions.config();
const { token, host_url: HOST_URL } = environment.slack;
const web = new WebClient(token);

const options = { locale: nb };
const dateShort = (d) => format(d, 'do MMM', options);

const colors = {
  created: '#43f8b6',
  updated: '#f8c66b',
  archived: '#ff8174',
};

const createNameDiffSlackMsg = async (documentType, diff, slug) => ({
  header: `:eyes: Updated ${documentType}`,
  owner: `${diff.before} has a new name`,
  context: `~${diff.before}~`,
  info: `<${HOST_URL}${slug} | ${diff.after}>`,
});

const createMissionStatementDiffSlackMsg = async (documentType, diff, data) => ({
  header: `:eyes: Updated ${documentType}`,
  owner: `${data.name} has a new mission statement`,
  context: `~${diff.before}~`,
  info: `<${HOST_URL}/${data.slug} | ${diff.after}>`,
});

const createDescriptionDiffSlackMsg = async (documentType, parentData, diff, url) => ({
  header: `:eyes: Updated ${documentType}`,
  owner: `'${parentData.name}' has a new description`,
  context: `~${diff.before}~`,
  info: `<${HOST_URL}/${url} | ${diff.after}>`,
});

const createObjOrKeyResUpdatedSlackMsg = async (documentType, parentData, diff, url) => ({
  header: `:eyes: Updated ${documentType}`,
  owner: `${parentData.name} has updated a ${documentType}`,
  context: `~${diff.before}~`,
  info: `<${HOST_URL}/${url} | ${diff.after}>`,
});

const pushToSlack = async (data, slackMsg, user) => {
  const promises = [];

  data.slack.forEach((channel) => {
    promises.push(
      web.chat.postMessage({
        channel,
        attachments: slackMsg.attachments,
        text: `New changes by ${user.displayName || user}`,
      })
    );
  });

  await Promise.all(promises);

  return true;
};

const slackMessageCreated = async (color, created) => ({
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

const slackMessageUpdated = async (color, updated) => ({
  attachments: [
    {
      color: '#f2c744',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${updated.header}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${updated.owner}`,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${updated.context}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${updated.info}`,
          },
        },
      ],
    },
  ],
});

const checkIfRelevantToPushToSlack = async (documentType, auditData) => {
  let hasChanges = false;

  const doc = await auditData.documentRef.get();
  const data = doc.data();

  let userData = auditData.user;
  if (auditData.user !== 'system' || auditData.user === 'API') {
    const user = await auditData.user.get();
    userData = user.data();
  }

  let slackMsg = {};
  let attachmentObject = {};

  if (documentType === 'Objective') {
    const parent = await data.parent.get();
    const parentData = parent.data();

    if (auditData.diff?.name?.before === 'placeholder') {
      hasChanges = true;

      const period = await data.period.get();
      const periodData = period.data();

      attachmentObject = {
        header: `:tada: ${documentType}`,
        owner: `${parentData.name} has created a new ${documentType}`,
        context: `[${periodData.name}] ${dateShort(periodData.startDate.toDate())} - ${dateShort(
          periodData.endDate.toDate()
        )}`,
        info: `<${HOST_URL}/${parentData.slug}/o/${doc.id} | ${data.name}>`,
      };

      slackMsg = await slackMessageCreated(colors.created, attachmentObject);
    } else if (auditData.diff?.name) {
      hasChanges = true;

      attachmentObject = await createObjOrKeyResUpdatedSlackMsg(
        documentType,
        parentData,
        auditData.diff.name,
        `${parentData.slug}/k/${doc.id}`
      );

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    }

    if (parentData.slack && parentData.slack.length > 0 && hasChanges) {
      await pushToSlack(parentData, slackMsg, userData);
    }

    return true;
  }

  if (documentType === 'KeyResult') {
    const objective = await data.objective.get();
    const parent = await data.parent.get();
    const objData = objective.data();
    const parentData = parent.data();

    // If key result is created
    if (auditData.diff?.name?.before === 'placeholder') {
      hasChanges = true;

      attachmentObject = {
        header: `:tada: ${documentType}`,
        owner: `${parentData.name} has created a new ${documentType}`,
        context: `${objData.name}`,
        info: `<${HOST_URL}/${parentData.slug}/k/${doc.id} | ${data.name}>`,
      };

      slackMsg = await slackMessageCreated(colors.created, attachmentObject);
    } else if (auditData.diff?.name) {
      hasChanges = true;

      attachmentObject = await createObjOrKeyResUpdatedSlackMsg(
        documentType,
        parentData,
        auditData.diff.name,
        `${parentData.slug}/k/${doc.id}`
      );

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    }

    if (parentData.slack && parentData.slack.length > 0 && hasChanges) {
      await pushToSlack(parentData, slackMsg, userData);
    }

    return true;
  }

  if (documentType === 'KPI') {
    const parent = await data.parent.get();
    const parentData = parent.data();

    if (auditData.diff?.name) {
      hasChanges = true;
      attachmentObject = await createNameDiffSlackMsg(
        `${documentType} (${data.type})`,
        auditData.diff.name,
        `${parentData.slug}/kpi/${doc.id}`
      );
    } else if (auditData.diff?.description) {
      hasChanges = true;
      attachmentObject = await createDescriptionDiffSlackMsg(
        `${documentType} (${data.type})`,
        data,
        auditData.diff.description,
        `${parentData.slug}/kpi/${doc.id}`
      );
    }

    if (parentData.slack && parentData.slack.length > 0 && hasChanges) {
      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);

      await pushToSlack(parentData, slackMsg, userData);
    }

    return true;
  }

  if (documentType === 'Organization') {
    if (auditData.diff?.name) {
      hasChanges = true;
      attachmentObject = await createNameDiffSlackMsg(documentType, auditData.diff.name, data.slug);

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    } else if (auditData.diff?.missionStatement) {
      hasChanges = true;

      attachmentObject = await createMissionStatementDiffSlackMsg(documentType, auditData.diff.missionStatement, data);

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    }
  } else if (documentType === 'Department') {
    if (auditData.diff?.name) {
      hasChanges = true;

      attachmentObject = await createNameDiffSlackMsg(documentType, auditData.diff.name, data.slug);

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    } else if (auditData.diff?.missionStatement) {
      hasChanges = true;

      attachmentObject = await createMissionStatementDiffSlackMsg(documentType, auditData.diff.missionStatement, data);

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    }
  } else if (documentType === 'Product') {
    if (auditData.diff?.name) {
      hasChanges = true;

      attachmentObject = await createNameDiffSlackMsg(documentType, auditData.diff.name, data.slug);

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    } else if (auditData.diff?.missionStatement) {
      hasChanges = true;

      attachmentObject = await createMissionStatementDiffSlackMsg(documentType, auditData.diff.missionStatement, data);

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    }
  }

  if (data.slack && hasChanges) {
    await pushToSlack(data, slackMsg, userData);
  }

  return true;
};

exports.checkIfRelevantToPushToSlack = checkIfRelevantToPushToSlack;
exports.colors = colors;
exports.pushToSlack = pushToSlack;
exports.slackMessageCreated = slackMessageCreated;
