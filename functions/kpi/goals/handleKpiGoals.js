import { getFirestore } from 'firebase-admin/firestore';

/**
 * Cache the goals as a JSON blob on the KPI document.
 */
export default async function updateKpiGoals(change, { params }) {
  const db = getFirestore();
  const { kpiId } = params;

  const kpiRef = db.doc(`kpis/${kpiId}`);
  const kpi = await kpiRef.get();

  if (!kpi.exists) {
    return false;
  }

  const goals = await kpiRef
    .collection('goals')
    .where('archived', '==', false)
    .orderBy('toDate')
    .get()
    .then((snapshot) => snapshot.docs)
    .then((docs) => docs.map((d) => d.data()));

  try {
    await kpiRef.update({
      goals: JSON.stringify(
        goals.map((g) => ({
          name: g.name,
          from: g.fromDate.toDate().toISOString(),
          to: g.toDate.toDate().toISOString(),
          value: g.value,
        }))
      ),
    });
  } catch (error) {
    console.log('Could not update KPI', kpiId);
  }

  return true;
}
