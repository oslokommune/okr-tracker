import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { endOfDay, startOfDay, setHours } from 'date-fns';

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
    const { created, createdBy } = valuesSnapshot.docs[0].data();

    data = {
      ...data,
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
