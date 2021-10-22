import { getFirestore } from 'firebase-admin/firestore';
import functions from 'firebase-functions';
import config from '../config.js';

const auditOnDeleteGenerator = ({ docPath, collectionRef, documentType }) =>
  functions
    .runWith(config.runtimeOpts)
    .region(config.region)
    .firestore.document(docPath)
    .onDelete(async (snapshot, context) => {
      const db = getFirestore();

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

      return db.collection('audit').add(auditData);
    });

export default auditOnDeleteGenerator;
