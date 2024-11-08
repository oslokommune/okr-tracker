import { isSameDay, startOfDay, setHours, isFuture } from 'date-fns';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import props from './props';
import { validateCreateProps } from '../../common';
import {
  batchDeleteSnapshot,
  getKpiDocumentRef,
  queryValuesByDate,
  refreshKPILatestValue,
} from './helpers.js';

const get = async (kpiId, date) => {
  try {
    const kpiRef = await getKpiDocumentRef(kpiId);
    return await getDocs(queryValuesByDate(kpiRef, date, 1)).then((snapshot) =>
      !snapshot.empty ? snapshot.docs[0] : null
    );
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (kpiId, data, progressValueId) => {
  validateCreateProps(props, data);

  if (isFuture(startOfDay(data.timestamp))) {
    throw new Error('Timestamp cannot be set in the future');
  }

  const kpiRef = await getKpiDocumentRef(kpiId);
  const progressCollectionRef = collection(kpiRef, 'progress');
  const progressValueRef = progressValueId
    ? doc(progressCollectionRef, progressValueId)
    : null;

  if (progressValueRef && !(await getDoc(progressValueRef)).exists()) {
    throw new Error(`Cannot find progress value with ID ${progressValueId}`);
  }

  data = {
    ...data,
    timestamp: setHours(startOfDay(data.timestamp), 12),
    created: serverTimestamp(),
    createdBy: doc(db, 'users', auth.currentUser.email),
  };

  try {
    // Clean existing progress values for both original (if provided) and
    // the chosen target date. If any values exists, keep `created`/`createdBy`
    // for the new entry from latest document found for target date.
    if (progressValueRef) {
      getDoc(progressValueRef).then((snapshot) => {
        const measurementDate = snapshot.data().timestamp.toDate();
        if (!isSameDay(data.timestamp, measurementDate)) {
          getDocs(queryValuesByDate(kpiRef, measurementDate)).then(batchDeleteSnapshot);
        }
      });
    }

    const valuesSnapshot = await getDocs(queryValuesByDate(kpiRef, data.timestamp));

    if (!valuesSnapshot.empty) {
      const { created, createdBy } = valuesSnapshot.docs[0].data();
      data = {
        ...data,
        created: created || null,
        createdBy: createdBy || null,
        edited: serverTimestamp(),
        editedBy: doc(db, 'users', auth.currentUser.email),
      };

      await batchDeleteSnapshot(valuesSnapshot);
    }

    const ref = await addDoc(progressCollectionRef, data);
    await refreshKPILatestValue(kpiRef);
    return ref;
  } catch (error) {
    throw new Error(error);
  }
};

const remove = async (kpiId, progressValueId) => {
  const kpiRef = await getKpiDocumentRef(kpiId);
  const progressValueRef = doc(kpiRef, 'progress', progressValueId);

  try {
    // Delete all progression values registered for date
    const valueSnapshot = await getDoc(progressValueRef);

    if (!valueSnapshot.exists) {
      throw new Error(`Cannot find progress value with ID ${progressValueId}`);
    }

    const querySnapshot = await getDocs(
      queryValuesByDate(kpiRef, valueSnapshot.data().timestamp.toDate())
    );

    await batchDeleteSnapshot(querySnapshot);
    await refreshKPILatestValue(kpiRef);
  } catch {
    throw new Error(`Cannot remove progress value ${progressValueId} from KPI ${kpiId}`);
  }
};

export default { get, update, remove };
