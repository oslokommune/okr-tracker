import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import validator from 'express-validator';
import { format, endOfDay } from 'date-fns';
import {
  buildKpiResponse,
  getUserDisplayName,
  refreshKPILatestValue,
  updateKPIProgressionValue,
} from '../helpers.js';
import {
  dateValidator,
  idValidator,
  progressValidator,
  teamSecretValidator,
  valueValidator,
} from '../validators.js';

const { matchedData, validationResult } = validator;
const router = express.Router();

router.post(
  '/:id',
  teamSecretValidator,
  idValidator,
  progressValidator,
  async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).json({
        message: 'Invalid request data',
        errors: result.mapped(),
      });
      return;
    }

    const { 'okr-team-secret': teamSecret, id, progress } = matchedData(req);

    const db = getFirestore();

    try {
      const kpi = await db.collection('kpis').doc(id).get();

      const { exists, ref } = kpi;

      if (!exists) {
        res.status(404).send(`Could not find KPI with ID: ${id}`);
        return;
      }

      const { parent } = kpi.data();

      const parentData = await parent.get().then((snapshot) => snapshot.data());

      if (!parentData.secret) {
        res
          .status(401)
          .send(
            `'${parentData.name}' is not set up for API usage. Please set ` +
              'a secret using the OKR Tracker admin interface.'
          );
        return;
      }
      if (parentData.secret !== teamSecret) {
        res.status(401).send('Wrong okr-team-secret');
        return;
      }

      const date = new Date();
      await updateKPIProgressionValue(ref, date, progress);

      res.send(`Updated KPI (${id}) with progress: ${progress}`);
    } catch (e) {
      console.error('ERROR: ', e.message);
      res.status(500).send(e.message);
    }
  }
);

router.get('/', async (req, res) => {
  const db = getFirestore();

  try {
    const kpiQuerySnapshot = await db
      .collection('kpis')
      .where('archived', '==', false)
      .get();

    const kpis = [];

    for await (const kpiSnapshot of kpiQuerySnapshot.docs) {
      const kpiData = await buildKpiResponse(kpiSnapshot);
      kpis.push(kpiData);
    }

    res.json(kpis);
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send('Could not get list of KPIs');
  }
});

router.get('/:id', idValidator, async (req, res) => {
  const sanitized = matchedData(req);
  const { id } = sanitized;

  const db = getFirestore();
  const collection = db.collection('kpis');

  try {
    const kpi = await collection.doc(id).get();

    if (!kpi.exists) {
      res.status(404).send(`Could not find KPI with ID: ${id}`);
      return;
    }

    const kpiData = await buildKpiResponse(kpi);
    res.json(kpiData);
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send(`Cannot get KPI by ID: (${id})`);
  }
});

router.get('/:id/values', idValidator, async (req, res) => {
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
        .send(`Could not get progression data for KPI with ID: (${id}}`);
    }
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send(`Cannot get KPI by ID: (${id}}`);
  }
});

router.put(
  '/:id/values/:date',
  teamSecretValidator,
  idValidator,
  dateValidator,
  valueValidator,
  async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).json({
        message: 'Invalid request data',
        errors: result.mapped(),
      });
      return;
    }

    const { 'okr-team-secret': teamSecret, id, date, value } = matchedData(req);
    const formattedDate = format(date, 'yyyy-MM-dd');

    const db = getFirestore();

    try {
      const kpi = await db.collection('kpis').doc(id).get();

      const { exists, ref } = kpi;

      if (!exists) {
        res.status(404).json({ message: `Could not find KPI with ID: ${id}` });
        return;
      }

      const { parent } = kpi.data();
      const parentData = await parent.get().then((snapshot) => snapshot.data());

      if (!parentData.secret) {
        res.status(401).json({
          message:
            `'${parentData.name}' is not set up for API usage. Please set ` +
            'a secret using the OKR Tracker admin interface.',
        });
        return;
      }
      if (parentData.secret !== teamSecret) {
        res.status(401).json({ message: 'Wrong okr-team-secret' });
        return;
      }

      await updateKPIProgressionValue(ref, date, value);

      res.json({
        message: `KPI progression value for ${formattedDate} updated to ${value}`,
      });
    } catch (e) {
      console.error('ERROR: ', e.message);
      res
        .status(500)
        .json({ message: 'Could not update KPI progression value' });
    }
  }
);

router.delete(
  '/:id/values/:date',
  teamSecretValidator,
  idValidator,
  dateValidator,
  async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).json({
        message: 'Invalid request data',
        errors: result.mapped(),
      });
      return;
    }

    const { 'okr-team-secret': teamSecret, id, date } = matchedData(req);
    const formattedDate = format(date, 'yyyy-MM-dd');

    const db = getFirestore();

    try {
      const kpi = await db.collection('kpis').doc(id).get();

      const { exists, ref } = kpi;

      if (!exists) {
        res.status(404).json({ message: `Could not find KPI with ID: ${id}` });
        return;
      }

      const { parent } = kpi.data();
      const parentData = await parent.get().then((snapshot) => snapshot.data());

      if (!parentData.secret) {
        res.status(401).json({
          message:
            `'${parentData.name}' is not set up for API usage. Please set ` +
            'a secret using the OKR Tracker admin interface.',
        });
        return;
      }
      if (parentData.secret !== teamSecret) {
        res.status(401).json({ message: 'Wrong okr-team-secret' });
        return;
      }

      // Batch delete all values registered on specified date.
      const valuesSnapshot = await ref
        .collection('progress')
        .orderBy('timestamp', 'desc')
        .where('timestamp', '>=', date)
        .where('timestamp', '<=', endOfDay(date))
        .get();

      if (valuesSnapshot.empty) {
        res.status(404).json({
          message: `No KPI progression value found for ${formattedDate}`,
        });
        return;
      }

      const batch = db.batch();

      valuesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      await refreshKPILatestValue(ref);

      res.json({
        message: `KPI progression value for ${formattedDate} deleted`,
      });
    } catch (e) {
      console.error('ERROR: ', e.message);
      res
        .status(500)
        .json({ message: 'Could not delete KPI progression value' });
    }
  }
);

export default router;
