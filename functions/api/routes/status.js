import express from 'express';
import { getKPIs } from '../helpers.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const kpis = await getKPIs();
    res.json({
      kpis: {
        total: kpis.length,
        state: {
          stale: kpis.filter((kpi) => kpi.isStale).length,
          unknown: kpis.filter((kpi) => kpi.isStale === null).length,
        },
      },
    });
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send('Could not get list of KPIs');
  }
});

router.get('/kpis', async (req, res) => {
  try {
    const kpis = await getKPIs();
    res.json(kpis);
  } catch (e) {
    console.error('ERROR: ', e.message);
    res.status(500).send('Could not get list of KPIs');
  }
});

export default router;
