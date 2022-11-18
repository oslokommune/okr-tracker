import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import {
  endOfDay,
  startOfDay,
  setHours,
  isWithinInterval,
  sub,
  set,
} from 'date-fns';

/**
 * Return a user's display name. If the referenced Firestore reference
 * does not exist, attempt to extract reference suffix (email).
 *
 * `userRef` is the Firestore reference to resolve.
 */
export async function getUserDisplayName(userRef) {
  if (typeof userRef.get === 'function') {
    return userRef.get().then((snapshot) => {
      if (!snapshot.exists) {
        return userRef.path.split('users/')[1];
      }
      const userData = snapshot.data();
      return userData.displayName;
    });
  }
  return userRef.split('users/')[1];
}

/**
 * Update the KPI progression collection with at most one value each
 * day. Delete any pre-existing values for specified `date`.
 *
 * `kpiRef` is the reference to the parent KPI to update.
 * `date` specifies which date the measurement is made.
 * `value` is the progression value to set.
 */
export async function updateKPIProgressionValue(kpiRef, date, value) {
  date = startOfDay(date);

  const progressCollectionRef = kpiRef.collection('progress');

  const valuesSnapshot = await progressCollectionRef
    .orderBy('timestamp', 'desc')
    .where('timestamp', '>=', date)
    .where('timestamp', '<=', endOfDay(date))
    .get();

  // TODO: Also populate `createdBy`/`editedBy` when using the API. This
  // might be possible by checking the `X-Apigateway-Api-Userinfo` header.
  let data = {
    value,
    timestamp: setHours(date, 12),
    created: new Date(),
    createdBy: null,
  };

  if (!valuesSnapshot.empty) {
    const { comment, created, createdBy } = valuesSnapshot.docs[0].data();

    data = {
      ...data,
      comment: comment || null,
      created: created || null,
      createdBy: createdBy || null,
      edited: new Date(),
      editedBy: null,
    };

    // Clean out existing values registered for this date
    const batch = getFirestore().batch();
    valuesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  await progressCollectionRef.add(data);
  await refreshKPILatestValue(kpiRef);
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

/**
 * Build and return KPI response object.
 *
 * `kpiSnapshot` is the Firestore KPI document snapshot.
 */
export async function buildKpiResponse(kpiSnapshot) {
  const {
    created,
    createdBy,
    currentValue,
    edited,
    editedBy,
    name,
    type,
    updateFrequency,
  } = kpiSnapshot.data();

  const latestMeasurement = await kpiSnapshot.ref
    .collection('progress')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get()
    .then((snapshot) => {
      if (!snapshot.docs[0]) return null;
      const { value, timestamp } = snapshot.docs[0].data();
      return { value, timestamp: timestamp.toDate() };
    });

  const isStale = isKPIStale(updateFrequency, latestMeasurement);

  return {
    currentValue,
    name,
    type,
    lastUpdated: latestMeasurement || null,
    updateFrequency: updateFrequency || null,
    isStale,
    created: created ? created.toDate() : null,
    createdBy: createdBy ? await getUserDisplayName(createdBy) : null,
    edited: edited ? edited.toDate() : null,
    editedBy: editedBy ? await getUserDisplayName(editedBy) : null,
  };
}

/**
 * Return true if a KPI is considered "stale", i.e. no progress measurement
 * registered within declared update frequency. Return `null` in cases where
 * it is not possible to determine staleness.
 *
 * `updateFrequency` is the expected update interval for the KPI.
 * `progressRecord` is the progress record to check against.
 */
function isKPIStale(updateFrequency, progressRecord) {
  if (!updateFrequency) return null;
  if (!progressRecord) return true;
  if (updateFrequency === 'irregular') return false;

  const duration = (frequency) => {
    switch (frequency) {
      case 'daily':
        return { days: 1 };
      case 'weekly':
        return { weeks: 1 };
      case 'monthly':
        return { months: 1 };
      case 'quarterly':
        return { months: 3 };
      case 'annual':
        return { years: 1 };
      default:
        throw new Error('Unsupported frequency option');
    }
  };

  try {
    const now = new Date();
    const intervalEnd = set(progressRecord.timestamp, {
      year: now.getFullYear(),
      month: now.getMonth(),
      date: now.getDate(),
    });
    return !isWithinInterval(progressRecord.timestamp, {
      start: sub(intervalEnd, duration(updateFrequency)),
      end: intervalEnd,
    });
  } catch (e) {
    console.error('ERROR: ', e.message);
    return null;
  }
}
