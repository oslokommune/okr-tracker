import { getFirestore } from 'firebase-admin/firestore';
import functions from 'firebase-functions';
import config from '../config.js';

const auditOnCreateGenerator = ({ docPath, collectionRef, documentType }) =>
  functions
    .runWith(config.runtimeOpts)
    .region(config.region)
    .firestore.document(docPath)
    .onCreate(async (snapshot, context) => {
      const db = getFirestore();

      const collection = await db.collection(collectionRef);

      const { documentId } = context.params;

      const auditData = {
        event: `${documentType}Created`,
        timestamp: new Date(),
        documentRef: collection.doc(documentId),
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

      return db.collection('audit').add(auditData);
    });

export default auditOnCreateGenerator;
