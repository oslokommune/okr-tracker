import functions from 'firebase-functions';
import slack from '@slack/web-api';
import fns from 'date-fns';
import locale from 'date-fns/locale/index.js';

const { WebClient } = slack;
const { format } = fns;
const { nb } = locale;

const environment = functions.config();
const { token, host_url: HOST_URL } = environment.slack;
const web = new WebClient(token);

const options = { locale: nb };
const dateShort = (d) => format(d, 'do MMM', options);

export const colors = {
  created: '#43f8b6',
  updated: '#f8c66b',
  archived: '#ff8174',
};

/**
 *
 * @param documentType type of document
 * @param diffType type of diff
 * @param name name of the document or parent name
 * @param diff diff object
 * @param url url to the document
 * @return {Promise<{owner: string, context: string, header: string, info: string}>}
 */
const createUpdatedSlackMsg = async (documentType, diffType, name, diff, url) => {
  let owner = '';

  if (diffType === 'missionStatement') {
    owner = `'${name}' has a new mission statement,`;
  } else if (diffType === 'name') {
    owner = `${name} has a new name`;
  } else if (diffType === 'description') {
    owner = `'${name}' has a new description`;
  } else if (diffType === 'keyResOrObjective') {
    owner = `${name} has updated ${
      documentType === 'Objective' ? 'an' : 'a'
    } ${documentType}`;
  }

  return {
    header: `:eyes: Updated ${documentType}`,
    owner,
    context: `~${diff.before}~`,
    info: `<${HOST_URL}/${url} | ${diff.after}>`,
  };
};

/**
 *
 * @param data
 * @param slackMsg slack message to send
 * @param user who has done the update
 * @returns {Promise<boolean>}
 */
export const pushToSlack = async (data, slackMsg, user) => {
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

/**
 *
 * @param color
 * @param created
 * @returns {Promise<{attachments: [{color, blocks: [{text: {emoji: boolean, text, type: string}, type: string}, {text: {text, type: string}, type: string}, {type: string}, {elements: [{emoji: boolean, text, type: string}], type: string}, {text: {text, type: string}, type: string}]}]}>}
 */
export const slackMessageCreated = async (color, created) => ({
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

/**
 *
 * @param color
 * @param updated
 * @returns {Promise<{attachments: [{color: string, blocks: [{text: {emoji: boolean, text: string, type: string}, type: string}, {text: {text: string, type: string}, type: string}, {type: string}, {text: {text: string, type: string}, type: string}, {text: {text: string, type: string}, type: string}]}]}>}
 */
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

/**
 *
 * @param documentType
 * @param auditData
 * @returns {Promise<boolean>}
 */
export const checkIfRelevantToPushToSlack = async (documentType, auditData) => {
  const possibleDocuments = ['Organization', 'Department', 'Product'];

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
        context: `[${periodData.name}] ${dateShort(
          periodData.startDate.toDate()
        )} - ${dateShort(periodData.endDate.toDate())}`,
        info: `<${HOST_URL}/${parentData.slug}/o/${doc.id} | ${data.name}>`,
      };

      slackMsg = await slackMessageCreated(colors.created, attachmentObject);
    } else if (auditData.diff?.name) {
      hasChanges = true;

      attachmentObject = await createUpdatedSlackMsg(
        documentType,
        'keyResOrObjective',
        parentData.name,
        auditData.diff.name,
        `${parentData.slug}/o/${doc.id}`
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

      attachmentObject = await createUpdatedSlackMsg(
        documentType,
        'keyResOrObjective',
        parentData.name,
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
      attachmentObject = await createUpdatedSlackMsg(
        `${documentType} (${data.type})`,
        'name',
        auditData.diff.name.before,
        auditData.diff.name,
        `${parentData.slug}/kpi/${doc.id}`
      );
    } else if (auditData.diff?.description) {
      hasChanges = true;
      attachmentObject = await createUpdatedSlackMsg(
        `${documentType} (${data.type})`,
        'description',
        data.name,
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

  if (possibleDocuments.includes(documentType)) {
    if (auditData.diff?.name) {
      hasChanges = true;
      attachmentObject = await createUpdatedSlackMsg(
        documentType,
        'name',
        auditData.diff.name.before,
        auditData.diff.name,
        data.slug
      );

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    } else if (auditData.diff?.missionStatement) {
      hasChanges = true;

      attachmentObject = await createUpdatedSlackMsg(
        documentType,
        'missionStatement',
        data.name,
        auditData.diff.missionStatement,
        data.slug
      );

      slackMsg = await slackMessageUpdated(colors.updated, attachmentObject);
    }
  }

  if (data.slack && hasChanges) {
    await pushToSlack(data, slackMsg, userData);
  }

  return true;
};
