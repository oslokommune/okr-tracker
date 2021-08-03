const router = require('express').Router();
const admin = require('firebase-admin');
const { param, query, matchedData } = require('express-validator');
const parse = require('date-fns/parseISO');

const db = admin.firestore();

const collection = db.collection('audit');

const validate = [query('fromDate').trim().escape(), query('toDate').trim().escape()];
const validateEvent = [param('type').trim().escape()];
const validateDoc = [param('documentType').trim().escape(), param('id').trim().escape()];

router.get('/', ...validate, async (req, res) => {
  const sanitized = matchedData(req);
  const { fromDate, toDate } = sanitized;

  let from;
  let to;
  if (fromDate) {
    from = admin.firestore.Timestamp.fromDate(parse(fromDate));
  }
  if (toDate) {
    to = admin.firestore.Timestamp.fromDate(parse(toDate));
  }

  try {
    let snapshot;
    if (fromDate && !toDate) {
      snapshot = await collection.where('timestamp', '>=', from).get();
    } else if (!fromDate && toDate) {
      snapshot = await collection.where('timestamp', '<=', to).get();
    } else if (fromDate && toDate) {
      snapshot = await collection.where('timestamp', '>=', from).where('timestamp', '<=', to).get();
    } else {
      snapshot = await collection.get();
    }

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

router.get('/event/:type', ...validateEvent, async (req, res) => {
  const sanitized = matchedData(req);
  const { type } = sanitized;

  try {
    const snapshot = await collection.where('event', '==', type).get();

    console.log(snapshot.size);
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

router.get('/document/:documentType/:id', ...validateDoc, async (req, res) => {
  const sanitized = matchedData(req);
  const { documentType, id } = sanitized;

  try {
    console.log(documentType, id);
    const documentRef = await db.collection(documentType).doc(id).get();

    const snapshot = await collection.where('documentRef', '==', documentRef.ref).get();

    console.log(snapshot);
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
          documentRef: doc,
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
