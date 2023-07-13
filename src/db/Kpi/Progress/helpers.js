import firebase from 'firebase/compat/app';
import { endOfDay, startOfDay } from 'date-fns';
import { db } from '@/config/firebaseConfig';

const { FieldValue } = firebase.firestore;

/**
 * Get KPI document reference from ID.
 *
 * `kpiId` is the ID of the KPI document.
 */
export async function getKpiDocumentRef(kpiId) {
  if (!kpiId) {
    throw new Error('Missing KPI ID');
  }
  if (typeof kpiId !== 'string') {
    throw new Error('KPI ID must be a string');
  }

  const kpiRef = await db.collection('kpis').doc(kpiId);

  if (await kpiRef.get().then(({ exists }) => !exists)) {
    throw new Error(`Cannot find KPI with ID ${kpiId}`);
  }

  return kpiRef;
}

/**
 * Query all progression values registered within specified date.
 *
 * `kpiRef` is the parent KPI to get progression values for.
 * `date` is the date to filter values for.
 */
export function queryValuesByDate(kpiRef, date) {
  return kpiRef
    .collection('progress')
    .orderBy('timestamp', 'desc')
    .where('timestamp', '>=', startOfDay(date))
    .where('timestamp', '<=', endOfDay(date));
}

export async function batchDeleteSnapshot(snapshot) {
  if (snapshot.empty) {
    return;
  }
  const batch = db.batch();
  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

/**
 * Fetch latest progression measurement and update the KPI object
 * accordingly. If no value is found, delete relevant fields.
 *
 * `kpiRef` is the Firestore reference to update.
 */
export async function refreshKPILatestValue(kpiRef) {
  const latestValueData = await kpiRef
    .collection('progress')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get()
    .then((snapshot) => (!snapshot.empty ? snapshot.docs[0].data() : null));

  if (latestValueData) {
    await kpiRef.update({
      error: FieldValue.delete(),
      currentValue: latestValueData.value,
      valid: true,
    });
  } else {
    await kpiRef.update({
      error: FieldValue.delete(),
      currentValue: FieldValue.delete(),
      valid: true,
    });
  }
}
