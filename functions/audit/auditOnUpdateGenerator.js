const admin = require('firebase-admin');
const functions = require('firebase-functions');
const config = require('../config');

const db = admin.firestore();

exports.auditOnUpdateGenerator = function ({ docPath, fields, collectionRef, documentType }) {
  return functions
    .region(config.region)
    .firestore.document(docPath)
    .onUpdate(async ({ before, after }, context) => {
      let event;
      const diff = getDiff({ before, after }, fields);

      if (!Object.keys(diff).length) return;

      if (diff.archived && diff.archived.after === true) {
        event = `${documentType}Archived`;
      } else if (diff.archived && diff.archived.after === false) {
        event = `${documentType}Restored`;
      } else if (diff) {
        event = `${documentType}Updated`;
      } else {
        return;
      }

      const { documentId } = context.params;
      const { editedBy: user } = after.data();

      db.collection('audit').add({
        event,
        timestamp: new Date(),
        documentRef: collectionRef.doc(documentId),
        user,
        diff,
      });
    });
};

function getDiff({ before, after }, keys) {
  const diff = {};
  before = before.data();
  after = after.data();

  keys.forEach(key => {
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
