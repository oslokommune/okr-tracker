import express from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { body, param, matchedData } from 'express-validator';

const router = express.Router();

const validate = [body('progress').isFloat().escape(), param('id').trim().escape()];

router.post('/:id', ...validate, async (req, res) => {
  const sanitized = matchedData(req);
  const { progress, id } = sanitized;
  const teamSecret = req.header('okr-team-secret');

  if (!teamSecret || teamSecret.length === 0) {
    res.status(400).send('Missing okr-team-secret in header');
    return;
  }

  const db = getFirestore();
  const collection = await db.collection('kpis');

  try {
    if (!progress || Number.isNaN(progress)) {
      res.status(400).send('Invalid number');
      return;
    }

    if (!id) {
      res.status(400).send('Invalid ID');
      return;
    }

    const kpi = await collection.doc(id).get();

    const { exists, ref } = kpi;

    if (!exists) {
      res.status(404).send(`Could not find KPI with ID: ${id}`);
      return;
    }

    const { parent } = kpi.data();

    const parentData = await parent.get().then((snapshot) => snapshot.data());

    if (parentData.secret && parentData.secret !== teamSecret) {
      res.status(401).send('The okr-team-secret and the secret which the keyRes has are not the same');
      return;
    }

    await ref.collection('progress').add({ value: Number.parseFloat(progress), timestamp: new Date() });
    await ref.update({ error: FieldValue.delete(), currentValue: progress, valid: true });

    res.send(`Updated KPI (${id}) with progress: ${progress}`);
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send(e.message);
  }
});

router.get('/:id', param('id').trim().escape(), async (req, res) => {
  const sanitized = matchedData(req);
  const { id } = sanitized;

  const db = getFirestore();
  const collection = await db.collection('kpis');

  try {
    const kpi = await collection.doc(id).get();

    const { exists, ref } = kpi;

    if (!exists) {
      res.status(404).send(`Could not find KPI with ID: ${id}`);
      return;
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
    console.error('ERROR: ', e.message);
    res.status(500).send(`Cannot get KPI by ID: (${id}}`);
  }
});

export default router;
