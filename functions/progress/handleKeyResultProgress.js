import { getFirestore } from 'firebase-admin/firestore';
import { scaleLinear } from 'd3-scale';
import { sum } from 'd3-array';

/**
 * Listens for changes in progress for a key result. Updates the 'progression' Field for
 * the key result accordingly
 */
export const updateKeyResultProgress = async (change, { params }) => {
  const db = getFirestore();

  const { keyResultId } = params;
  const keyResultRef = db.doc(`keyResults/${keyResultId}`);

  const keyRes = await keyResultRef.get();
  if (!keyRes.exists) {
    return false;
  }

  const { startValue, targetValue, objective } = keyRes.data();

  const currentValue = await keyResultRef
    .collection('progress')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get()
    .then((snapshot) => snapshot.docs)
    .then((docs) => (docs.length ? docs[0].data().value : startValue));

  const scale = scaleLinear().domain([startValue, targetValue]).clamp(true);
  const progression = scale(currentValue);

  try {
    await keyResultRef.update({ currentValue, progression });
  } catch (error) {
    console.log('Could not update key result', keyResultId);
  }

  await updateObjectiveProgression(objective, db);

  return true;
};

/**
 * Updates the progression for the related Objective once
 * the key result progression has been updated
 */
export const updateObjectiveProgression = async (objectiveRef, db) => {
  // Finds all progression for related key results and updates the objective's progression
  const progression = await db
    .collection('keyResults')
    .where('archived', '==', false)
    .where('objective', '==', objectiveRef)
    .get()
    .then(getWeightedProgression);

  try {
    await objectiveRef.update({ progression });
  } catch (error) {
    console.log('Could not update objective', objectiveRef.id);
  }

  // Update progression for Items or Periods
  try {
    const { period } = await objectiveRef.get().then((doc) => doc.data());
    if (period.id) {
      await updatePeriodProgression(period);
    }
  } catch {
    console.log('could not update period');
  }
};

const updatePeriodProgression = async (periodRef) => {
  // Finds all progressions for related objectives and updates the period's progression

  const db = getFirestore();

  let progression = 0;

  try {
    progression = await db
      .collection('objectives')
      .where('archived', '==', false)
      .where('period', '==', periodRef)
      .get()
      .then(getWeightedProgression);
  } catch {
    console.log('could not get progressions for objectives');
  }

  try {
    if (typeof progression === 'number') {
      await periodRef.update({ progression });
    }
  } catch (error) {
    console.log('Could not update period', periodRef.id);
  }
};

const getWeightedProgression = ({ docs }) => {
  if (!docs.length) {
    return 0;
  }

  const totalWeight = sum(docs.map((doc) => doc.data().weight));

  const weightedProgressions = docs.map((doc) => {
    const { weight, progression } = doc.data();
    const normalizedWeight = weight / totalWeight;
    return progression * normalizedWeight;
  });

  return sum(weightedProgressions);
};
