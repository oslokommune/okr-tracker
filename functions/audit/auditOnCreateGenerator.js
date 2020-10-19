const admin = require('firebase-admin');
const functions = require('firebase-functions');
const config = require('../config');

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

      await db.collection('audit').add(auditData);
    });
};
