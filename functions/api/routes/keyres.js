import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import validator from 'express-validator';

const { param, matchedData, body } = validator;
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
  const collection = await db.collection('keyResults');
  let keyRes;

  try {
    if (!progress || Number.isNaN(progress)) {
      res.status(400).send('Invalid number');
      return;
    }

    if (!id) {
      res.status(400).send('Invalid ID');
      return;
    }

    keyRes = await collection.doc(id).get();

    const { exists, ref } = keyRes;

    if (!exists) {
      res.status(404).send(`Could not find KPI with ID: ${id}`);
      return;
    }

    const { parent } = keyRes.data();

    const parentData = await parent.get().then((snapshot) => snapshot.data());

    if (!parentData.secret) {
      res.status(401).send(
        `'${parentData.name}' is not set up for API usage. Please set ` +
          'a secret using the OKR Tracker admin interface.'
      );
      return;
    }
    if (parentData.secret !== teamSecret) {
      res.status(401).send('Wrong okr-team-secret');
      return;
    }

    await ref.collection('progress').add({
      created: new Date(),
      archived: false,
      createdBy: 'API',
      value: Number.parseFloat(progress),
      timestamp: new Date(),
    });
    await ref.update({ valid: true, error: false });

    res.send(`Updated Key result (${id}) with progress: ${progress}`);
  } catch (e) {
    console.error('ERROR: ', e.message);
    if (keyRes && keyRes.ref) {
      await keyRes.ref.update({ valid: false, error: e.message });
    }
    res.status(500).send(e.message);
  }
});

router.get('/:id', param('id').trim().escape(), async (req, res) => {
  const sanitized = matchedData(req);
  const { id } = sanitized;

  const db = getFirestore();
  const collection = await db.collection('keyResults');

  try {
    const keyRes = await collection.doc(id).get();

    const { exists, ref } = keyRes;

    if (!exists) {
      res.status(404).send(`Could not find Key Result with ID: ${id}`);
      return;
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
        const tmp = await progress.createdBy.get().then((snapshot) => snapshot.data());
        progressCreatedBy = tmp.displayName;
      } else {
        // eslint-disable-next-line prefer-destructuring
        progressCreatedBy = progress.createdBy;
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
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send(`Cannot get Key result (${id}}`);
  }
});

export default router;
