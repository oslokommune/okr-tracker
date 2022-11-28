import { getFirestore } from 'firebase-admin/firestore';

/**
 * Cache the KPI progression as a JSON blob on the KPI document.
 */
export default async function updateKpiProgress(change, { params }) {
  const db = getFirestore();
  const { kpiId } = params;

  const kpiRef = db.doc(`kpis/${kpiId}`);
  const kpi = await kpiRef.get();

  if (!kpi.exists) {
    return false;
  }

  const progressCollection = await kpiRef
    .collection('progress')
    .orderBy('timestamp', 'desc')
    .get()
    .then((snapshot) => snapshot.docs)
    .then((docs) => docs.map((d) => d.data()));

  /*
   * Compress the progress into a JSON string. We consider a four digits decimal
   * precision to be a reasonable trade off between space and necessary
   * accuracy.
   */
  const progress = JSON.stringify(
    progressCollection.map((p) => [
      p.timestamp.toDate().toISOString().slice(0, 10),
      parseFloat(p.value.toFixed(4)),
      p.comment || '',
    ])
  );

  try {
    await kpiRef.update({ progress });
  } catch (error) {
    console.log('Could not update KPI', kpiId);
  }

  return true;
}
