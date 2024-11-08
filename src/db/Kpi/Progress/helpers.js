import {
  doc,
  collection,
  deleteField,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { endOfDay, startOfDay } from 'date-fns';
import { db } from '@/config/firebaseConfig';

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

  const kpiRef = doc(db, 'kpis', kpiId);

  if (!(await getDoc(kpiRef)).exists()) {
    throw new Error(`Cannot find KPI with ID ${kpiId}`);
  }

  return kpiRef;
}

/**
 * Query all progression values registered within specified date.
 *
 * `kpiRef` is the parent KPI to get progression values for.
 * `date` is the date to filter values for.
 * `lim` is the number of documents retrieved (optional).
 */
export function queryValuesByDate(kpiRef, date, lim) {
  const filters = [
    orderBy('timestamp', 'desc'),
    where('timestamp', '>=', startOfDay(date)),
    where('timestamp', '<=', endOfDay(date)),
  ];

  if (lim) {
    filters.push(limit(lim));
  }

  return query(collection(kpiRef, 'progress'), ...filters);
}

/**
 * Use batched writes to delete all documents in given query snapshot.
 *
 * `querySnapshot` is the query snapshot that determines which documents to delete.
 */
export async function batchDeleteSnapshot(querySnapshot) {
  if (!querySnapshot.empty) {
    const batch = writeBatch(db);
    querySnapshot.forEach((docRef) => {
      batch.delete(docRef.ref);
    });
    await batch.commit();
  }
}

/**
 * Fetch latest progression measurement and update the KPI object
 * accordingly. If no value is found, delete relevant fields.
 *
 * `kpiRef` is the Firestore reference to update.
 */
export async function refreshKPILatestValue(kpiRef) {
  const latestValueData = await getDocs(
    query(collection(kpiRef, 'progress'), orderBy('timestamp', 'desc'), limit(1))
  ).then((snapshot) => (!snapshot.empty ? snapshot.docs[0].data() : null));

  if (latestValueData) {
    await updateDoc(kpiRef, {
      error: deleteField(),
      currentValue: latestValueData.value,
      valid: true,
    });
  } else {
    await updateDoc(kpiRef, {
      error: deleteField(),
      currentValue: deleteField(),
      valid: true,
    });
  }
}
