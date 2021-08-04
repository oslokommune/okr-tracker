const router = require('express').Router();
const admin = require('firebase-admin');
const { query, matchedData } = require('express-validator');
const parse = require('date-fns/parseISO');

const db = admin.firestore();

const validate = [
  query('fromDate').trim().escape(),
  query('toDate').trim().escape(),
  query('documentType').trim().escape(),
  query('documentId').trim().escape(),
  query('eventType').trim().escape(),
];

router.get('/', ...validate, async (req, res) => {
  const sanitized = matchedData(req);
  const { fromDate, toDate, documentType, documentId, eventType } = sanitized;

  try {
    let q = db.collection('audit');

    const from = fromDate ? admin.firestore.Timestamp.fromDate(parse(fromDate)) : undefined;
    const to = toDate ? admin.firestore.Timestamp.fromDate(parse(toDate)) : undefined;

    if (from) {
      q = q.where('timestamp', '>=', from);
    }
    if (to) {
      q = q.where('timestamp', '<=', to);
    }
    if (documentType || documentId) {
      if (!documentType || !documentId) {
        res.status(404).send('DocumentType and documentId must be set');
        return;
      }
      const documentRef = await db.collection(documentType).doc(documentId).get();
      q = q.where('documentRef', '==', documentRef.ref);
    }
    if (eventType) {
      q = q.where('event', '==', eventType);
    }

    const snapshot = await q.get();

    if (snapshot.size === 0) {
      res.status(404).send('Audit log is empty');
      return;
    }

    const output = await Promise.all(
      snapshot.docs.map(async (d) => {
        const data = d.data();
        const doc = await data.documentRef.get().then((snap) => snap.data());
        let user = 'system';
        if (data.user !== 'system') {
          user = await data.user.get().then((snap) => snap.data());
        }
        return {
          ...data,
          document: doc,
          user: user.email ? user.email : 'system',
          timestamp: data.timestamp.toDate(),
        };
      })
    );

    res.json({
      data: output,
    });
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send('Cannot get audit log');
  }
});

module.exports = router;
