const router = require('express').Router();
const admin = require('firebase-admin');
const { body, param, matchedData } = require('express-validator');

const db = admin.firestore();

const collection = db.collection('kpis');

router.post('/:id', body('progress').escape(), async (req, res) => {
  const sanitized = matchedData(req);
  const { progress } = sanitized;

  try {
    await collection.add({ email, created: new Date() });

    res.send(`Access request created (${email})`);
  } catch (e) {
    res.status(500).send(`Cannot create access request (${email}}`);
  }
});

router.get('/:id', param('id').trim().escape(), async (req, res) => {
  const sanitized = matchedData(req);
  const { id } = sanitized;

  try {
    const kpi = await collection.doc(id).get();

    const { exists, ref } = kpi;

    if (!exists) {
      res.status(404).send(`Could not find KPI with ID: ${id}`);
    }

    const data = kpi.data();
    const { created, createdBy, currentValue, edited, editedBy, name, type } = data;

    // Some objects are not correct - createdBy is not a reference but only a normal String - check for both
    let createdByData;
    if (typeof createdBy.get === 'function') {
      createdByData = await createdBy
        .get()
        .then((snapshot) => snapshot.data())
        .then((d) => d.displayName);
    } else {
      // eslint-disable-next-line prefer-destructuring
      createdByData = createdBy.split('users/')[1];
    }

    const editedByData = await editedBy.get().then((snapshot) => snapshot.data());

    const progress = await ref
      .collection('progress')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
      .then((list) => (list.docs[0] ? list.docs[0].data() : null));

    const returnData = {
      currentValue,
      edited: edited.toDate(),
      name,
      type,
      created: created.toDate(),
      createdBy: createdByData,
      editedBy: editedByData.displayName,
    };

    if (!progress) {
      res.json({
        ...returnData,
        lastUpdated: null,
      });
    } else {
      res.json({
        ...returnData,
        lastUpdated: {
          value: progress.value,
          timestamp: progress.timestamp.toDate(),
        },
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(`Cannot get KPI by ID: (${id}}`);
  }
});

module.exports = router;
