import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { buildKpiResponse, isArchived } from '../helpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const db = getFirestore();
  const kpis = [];

  try {
    const kpiQuerySnapshot = await db
      .collection('kpis')
      .where('archived', '==', false)
      .get();

    for await (const kpiSnapshot of kpiQuerySnapshot.docs) {
      const parentRef = kpiSnapshot.data().parent;

      if (parentRef && !(await isArchived(parentRef))) {
        const kpiData = await buildKpiResponse(kpiSnapshot);
        kpis.push(kpiData);
      }
    }
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send('Could not get list of KPIs');
    return;
  }

  res.json({
    kpis: {
      total: kpis.length,
      state: {
        stale: kpis.filter((kpi) => kpi.isStale).length,
        unknown: kpis.filter((kpi) => kpi.isStale === null).length,
      },
    },
  });
});

export default router;
