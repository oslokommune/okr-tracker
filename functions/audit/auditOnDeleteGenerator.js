const admin = require('firebase-admin');
const functions = require('firebase-functions');
const config = require('../config');

const db = admin.firestore();

exports.auditOnDeleteGenerator = function ({ docPath, collectionRef, documentType }) {
  return functions
    .runWith(config.runtimeOpts)
    .region(config.region)
    .firestore.document(docPath)
    .onDelete(async (snapshot, context) => {
      const { documentId } = context.params;

      const auditData = {
        event: `${documentType}Deleted`,
        timestamp: new Date(),
        documentRef: collectionRef.doc(documentId),
      };

      const documentData = snapshot.data();
      if (documentData.editedBy) {
        auditData.user = documentData.editedBy;
      }

      if (documentData.name) {
        auditData.name = documentData.name;
      }

      if (documentData.organization) {
        auditData.organization = documentData.organization;
      }

      if (documentData.department) {
        auditData.department = documentData.department;
      }

      if (documentData.product) {
        auditData.product = documentData.product;
      }

      if (documentData.objective) {
        auditData.objective = documentData.objective;
      }

      if (documentData.parent) {
        auditData.parent = documentData.parent;
      }

      db.collection('audit').add(auditData);
    });
};
