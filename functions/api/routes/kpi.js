import express from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import validator from 'express-validator';
import getUserDisplayName from '../helpers.js';

const { body, param, matchedData } = validator;
const router = express.Router();
const validate = [
  body('progress').isFloat().escape(),
  param('id').trim().escape(),
];

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

    await ref
      .collection('progress')
      .add({ value: Number.parseFloat(progress), timestamp: new Date() });
    await ref.update({
      error: FieldValue.delete(),
      currentValue: progress,
      valid: true,
    });

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

    const { created, createdBy, currentValue, edited, editedBy, name, type } =
      kpi.data();

    const progress = await ref
      .collection('progress')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
      .then((list) => (list.docs[0] ? list.docs[0].data() : null));

    const returnData = {
      currentValue,
      name,
      type,
      created: created ? created.toDate() : null,
      createdBy: createdBy ? await getUserDisplayName(createdBy) : null,
      edited: edited ? edited.toDate() : null,
      editedBy: editedBy ? await getUserDisplayName(editedBy) : null,
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
    res.status(500).send(`Cannot get KPI by ID: (${id})`);
  }
});

router.get('/:id/progress', param('id').trim().escape(), async (req, res) => {
  const { id } = matchedData(req);

  const db = getFirestore();

  try {
    const kpi = await db.collection('kpis').doc(id).get();

    const { exists, ref } = kpi;

    if (!exists) {
      res.status(404).send(`Could not find KPI with ID: ${id}`);
      return;
    }

    try {
      const progressSnapshot = await ref
        .collection('progress')
        .orderBy('timestamp', 'desc')
        .get();

      const progressValues = {};

      for await (const record of progressSnapshot.docs) {
        const {
          value,
          timestamp,
          comment,
          created,
          createdBy,
          edited,
          editedBy,
        } = record.data();

        // Keep only the last registered record for each day.
        const date = timestamp.toDate().toISOString().slice(0, 10);

        if (!(date in progressValues)) {
          progressValues[date] = {
            value,
            date,
            comment: comment || null,
            created: created ? created.toDate() : null,
            createdBy: createdBy ? await getUserDisplayName(createdBy) : null,
            edited: edited ? edited.toDate() : null,
            editedBy: editedBy ? await getUserDisplayName(editedBy) : null,
          };
        }
      }

      res.json(Object.values(progressValues));
    } catch (e) {
      res
        .status(500)
        .send(`Could not get progress data for KPI with ID: (${id}}`);
    }
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send(`Cannot get KPI by ID: (${id}}`);
  }
});

export default router;
