import { getFirestore } from 'firebase-admin/firestore';
import functions from 'firebase-functions';
import config from '../config.js';

const auditOnUpdateGenerator = ({ docPath, fields, collectionRef, documentType }) =>
  functions
    .runWith(config.runtimeOpts)
    .region(config.region)
    .firestore.document(docPath)
    .onUpdate(async ({ before, after }, context) => {
      const db = getFirestore();

      const collection = await db.collection(collectionRef);

      let event;
      const diff = getDiff({ before, after }, fields);

      if (!Object.keys(diff).length) {
        return false;
      }

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
            return getProgressionCreator(collection.doc(documentId));
          }
          return after.data().editedBy;
        } catch {
          return 'system';
        }
      })();

      const auditData = {
        event,
        timestamp: new Date(),
        documentRef: collection.doc(documentId),
        user: user || 'system',
        diff,
      };

      return db.collection('audit').add(auditData);
    });

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

export default auditOnUpdateGenerator;
