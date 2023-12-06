import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import validator from 'express-validator';
import { format, endOfDay } from 'date-fns';
import {
  buildKpiResponse,
  getUserDisplayName,
  isArchived,
  refreshKPILatestValue,
  updateKPIProgressionValue,
  checkApiAuth,
} from '../helpers.js';
import {
  commentValidator,
  dateValidator,
  idValidator,
  progressValidator,
  clientSecretValidator,
  valueValidator,
  limitValidator,
  cursorValidator,
  orderValidator,
} from '../validators.js';
import validateRules from '../validateRules.js';

const { matchedData } = validator;
const router = express.Router();

router.post(
  '/:id',
  clientSecretValidator,
  idValidator,
  progressValidator,
  commentValidator,
  validateRules,
  async (req, res) => {
    const { id, progress, comment } = req.matchedData;
    const db = getFirestore();

    try {
      const kpi = await db.collection('kpis').doc(id).get();

      const { exists, ref } = kpi;

      if (!exists) {
        res.status(404).send(`Could not find KPI with ID: ${id}`);
        return;
      }

      const { parent } = kpi.data();

      if (!(await checkApiAuth(parent, req, res))) {
        return;
      }

      const date = new Date();
      const formattedDate = format(date, 'yyyy-MM-dd');
      const data = { value: progress, ...(comment ? { comment } : {}) };
      await updateKPIProgressionValue(ref, date, data);

      res.send(`Updated progression on ${formattedDate} with: ${JSON.stringify(data)}`);
    } catch (e) {
      console.error('ERROR: ', e.message);
      res.status(500).send(e.message);
    }
  }
);

router.get(
  '/',
  limitValidator,
  cursorValidator,
  orderValidator,
  validateRules,
  async (req, res) => {
    const { limit, cursor, order } = req.matchedData;
    const documentLimit = limit || 50;
    const documentOrder = order || 'asc';
    const db = getFirestore();

    try {
      let kpiQuery = db
        .collection('kpis')
        .where('archived', '==', false)
        .orderBy('created', documentOrder)
        .limit(documentLimit);

      if (cursor) {
        const startAfterDoc = await db.doc(`kpis/${cursor}`).get();
        if (!startAfterDoc.exists) {
          res.status(400).json({
            message: `Could not find document with ID: ${cursor}`,
          });
          return;
        }
        kpiQuery = kpiQuery.startAfter(startAfterDoc);
      }

      const querySnapshot = await kpiQuery.get();
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      const kpis = [];

      for await (const kpiSnapshot of querySnapshot.docs) {
        const parentRef = kpiSnapshot.data().parent;

        if (parentRef && !(await isArchived(parentRef))) {
          const kpiData = await buildKpiResponse(kpiSnapshot);
          kpis.push(kpiData);
        }
      }

      res.json({
        pagination: {
          limit: documentLimit,
          order: documentOrder,
          results_count: querySnapshot.size,
          cursor: cursor || null,
          next_cursor:
            querySnapshot.size >= documentLimit ? lastVisible?.id || null : null,
        },
        results: kpis,
      });
    } catch (e) {
      console.error('ERROR: ', e.message);
      res.status(500).json({ message: 'Could not get list of KPIs' });
    }
  }
);

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
        const { value, timestamp, comment, created, createdBy, edited, editedBy } =
          record.data();

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
      res.status(500).send(`Could not get progression data for KPI with ID: (${id}}`);
    }
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send(`Cannot get KPI by ID: (${id}}`);
  }
});

router.put(
  '/:id/values/:date',
  clientSecretValidator,
  idValidator,
  dateValidator,
  valueValidator,
  commentValidator,
  validateRules,
  async (req, res) => {
    const { id, date, value, comment } = req.matchedData;
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

      if (!(await checkApiAuth(parent, req, res))) {
        return;
      }

      const data = { value, ...(comment ? { comment } : {}) };
      await updateKPIProgressionValue(ref, date, data);

      res.json({
        message: `Updated progression on ${formattedDate} with: ${JSON.stringify(data)}`,
      });
    } catch (e) {
      console.error('ERROR: ', e.message);
      res.status(500).json({ message: 'Could not update KPI progression value' });
    }
  }
);

router.delete(
  '/:id/values/:date',
  clientSecretValidator,
  idValidator,
  dateValidator,
  validateRules,
  async (req, res) => {
    const { id, date } = req.matchedData;
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

      if (!(await checkApiAuth(parent, req, res))) {
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
      res.status(500).json({ message: 'Could not delete KPI progression value' });
    }
  }
);

export default router;
