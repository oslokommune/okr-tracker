const admin = require('firebase-admin');
const functions = require('firebase-functions');
const config = require('../config');

const environment = functions.config();
const { host_url: HOST_URL } = environment.slack;

const { pushToSlack, colors, slackMessageCreated } = require('./helpers');

const db = admin.firestore();

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

      await checkIfRelevantToPushToSlack(auditData, documentType);

      return db.collection('audit').add(auditData);
    });
};


/**
 * Check if the audit log is relevant to push to slack channels
 * @param auditData audit data
 * @param documentType type of document
 * @return Promise<boolean> return true either way
 */
const checkIfRelevantToPushToSlack = async (auditData, documentType) => {
  const doc = await auditData.documentRef.get();
  const data = doc.data();

  // get user data on who created the new document
  let userData = auditData.user;
  if (auditData.user !== 'system' || auditData.user === 'API') {
    const user = await auditData.user.get();
    userData = user.data();
  }

  // If a new KPI has been created
  if (documentType === 'KPI') {
    const parent = await data.parent.get();
    const parentData = parent.data();

    const attachmentObject = {
      header: `:tada: ${documentType} (${data.type})`,
      owner: `${parentData.name} has created a new ${documentType}`,
      context: `${data.description}`,
      info: `<${HOST_URL}/${parentData.slug}/kpi/${doc.id} | ${data.name}>`,
    };

    // Get a slack attachments object
    const slackMsg = await slackMessageCreated(colors.created, attachmentObject);

    // If the parent has slack channels then push to those channels
    if (parentData.slack && parentData.slack.length > 0) {
      await pushToSlack(parentData, slackMsg, userData);
    }
  }

  return true;
};
