const router = require('express').Router();
const admin = require('firebase-admin');
const { param, matchedData } = require('express-validator');

const db = admin.firestore();

const collection = db.collection('keyResults');

router.get('/:id', param('id').trim().escape(), async (req, res) => {
  const sanitized = matchedData(req);
  const { id } = sanitized;

  try {
    const keyRes = await collection.doc(id).get();

    const { exists, ref } = keyRes;

    if (!exists) {
      res.status(404).send(`Could not find Key Result with ID: ${id}`);
    }

    const data = keyRes.data();
    const { currentValue, description, editedBy, createdBy, objective, edited, created, notes, progression } = data;

    const editedByData = await editedBy.get().then((snapshot) => snapshot.data());
    const createdByData = await createdBy.get().then((snapshot) => snapshot.data());
    const objectiveData = await objective.get().then((snapshot) => snapshot.data());

    const progress = await ref
      .collection('progress')
      .where('archived', '==', false)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
      .then((list) => (list.docs[0] ? list.docs[0].data() : null));

    const returnData = {
      currentValue,
      description,
      edited: edited.toDate(),
      created: created.toDate(),
      id: data.id,
      notes,
      progression,
      editedBy: editedByData.displayName,
      createdBy: createdByData.displayName,
      objective: objectiveData.name,
    };

    if (progress) {
      let progressCreatedBy;
      if (typeof progress.createdBy.get === 'function') {
        progressCreatedBy = await createdBy
          .get()
          .then((snapshot) => snapshot.data())
          .then((d) => d.displayName);
      } else {
        // eslint-disable-next-line prefer-destructuring
        progressCreatedBy = createdBy;
      }

      res.json({
        ...returnData,
        lastUpdated: {
          value: progress.value,
          timestamp: progress.timestamp.toDate(),
          comment: progress.comment ? progress.comment : '',
          createdBy: progressCreatedBy,
        },
      });
    } else {
      res.json({
        ...returnData,
        lastUpdated: null,
      });
    }

    res.json({
      ...returnData,
    });
  } catch (e) {
    res.status(500).send(`Cannot remove access request (${id}}`);
  }
});

module.exports = router;
