import { isSameDay, startOfDay, setHours, isFuture } from 'date-fns';
import { db, auth, serverTimestamp } from '@/config/firebaseConfig';
import props from './props';
import { validateCreateProps } from '../../common';
import {
  batchDeleteSnapshot,
  getKpiDocumentRef,
  queryValuesByDate,
  refreshKPILatestValue,
} from './helpers.js';

const get = async (kpiId, date) => {
  const kpiRef = await getKpiDocumentRef(kpiId);

  try {
    return queryValuesByDate(kpiRef, date)
      .limit(1)
      .get()
      .then((snapshot) => (!snapshot.empty ? snapshot.docs[0] : null));
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
  const progressCollectionRef = kpiRef.collection('progress');
  const progressValueRef =
    progressValueId !== undefined ? progressCollectionRef.doc(progressValueId) : null;

  if (progressValueRef && (await progressValueRef.get().then(({ exists }) => !exists))) {
    throw new Error(`Cannot find progress value with ID ${progressValueId}`);
  }

  data = {
    ...data,
    timestamp: setHours(startOfDay(data.timestamp), 12),
    created: serverTimestamp(),
    createdBy: db.collection('users').doc(auth.currentUser.email),
  };

  try {
    // Clean existing progress values for both original (if provided) and
    // the chosen target date. If any values exists, keep `created`/`createdBy`
    // for the new entry from latest document found for target date.

    if (progressValueRef) {
      progressValueRef.get().then((doc) => {
        const measurementDate = doc.data().timestamp.toDate();
        if (!isSameDay(data.timestamp, measurementDate)) {
          queryValuesByDate(kpiRef, measurementDate)
            .get()
            .then((snapshot) => batchDeleteSnapshot(snapshot));
        }
      });
    }

    const valuesSnapshot = await queryValuesByDate(kpiRef, data.timestamp).get();

    if (!valuesSnapshot.empty) {
      const { created, createdBy } = valuesSnapshot.docs[0].data();

      data = {
        ...data,
        created: created || null,
        createdBy: createdBy || null,
        edited: serverTimestamp(),
        editedBy: db.collection('users').doc(auth.currentUser.email),
      };

      await batchDeleteSnapshot(valuesSnapshot);
    }

    const ref = await progressCollectionRef.add(data);
    await refreshKPILatestValue(kpiRef);
    return ref;
  } catch (error) {
    throw new Error(error);
  }
};

const remove = async (kpiId, progressValueId) => {
  const kpiRef = await getKpiDocumentRef(kpiId);
  const progressCollectionRef = kpiRef.collection('progress');
  const progressValueRef = progressCollectionRef.doc(progressValueId);

  try {
    // Delete all progression values registered for date
    await progressValueRef.get().then((doc) => {
      if (!doc.exists) {
        throw new Error(`Cannot find progress value with ID ${progressValueId}`);
      }

      queryValuesByDate(kpiRef, doc.data().timestamp.toDate())
        .get()
        .then((snapshot) => {
          batchDeleteSnapshot(snapshot);
          refreshKPILatestValue(kpiRef);
        });
    });
  } catch {
    throw new Error(
      `Cannot remove progress (${progressValueId}) from ${progressCollectionRef.id} for ${kpiId}`
    );
  }
};

export default { get, update, remove };
