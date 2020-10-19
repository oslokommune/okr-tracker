const admin = require('firebase-admin');
const d3 = require('d3');

const db = admin.firestore();

/**
 * Listens for changes in progress for a key result. Updates the 'progression' Field for
 * the key result accordingly
 */
async function handleKeyResultProgress(change, { params }) {
  const { keyResultId } = params;
  const keyResultRef = db.doc(`keyResults/${keyResultId}`);

  const { startValue, targetValue, objective } = await keyResultRef.get().then(snapshot => snapshot.data());

  const currentValue = await keyResultRef
    .collection('progress')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get()
    .then(snapshot => snapshot.docs)
    .then(docs => (docs.length ? docs[0].data().value : startValue));

  const scale = d3.scaleLinear().domain([startValue, targetValue]).clamp(true);
  const progression = scale(currentValue);

  try {
    await keyResultRef.update({ currentValue, progression });
  } catch (error) {
    console.log('Could not update key result', keyResultId);
  }

  await updateObjectiveProgression(objective);

  return true;
}

/**
 * Updates the progression for the related Objective once
 * the key result progression has been updated
 */
async function updateObjectiveProgression(objectiveRef) {
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
    const { period } = await objectiveRef.get().then(doc => doc.data());
    if (period.id) {
      await updatePeriodProgression(period);
    }
  } catch {
    console.log('could not update period');
  }
}

async function updatePeriodProgression(periodRef) {
  // Finds all progressions for related objectives and updates the period's progression

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
    if (progression) {
      await periodRef.update({ progression });
    }
  } catch (error) {
    console.log('Could not update period', periodRef.id);
  }
}

function getWeightedProgression({ docs }) {
  if (!docs.length) return 0;

  const totalWeight = d3.sum(docs.map(doc => doc.data().weight));

  const weightedProgressions = docs.map(doc => {
    const { weight, progression } = doc.data();
    const normalizedWeight = weight / totalWeight;
    return progression * normalizedWeight;
  });

  return d3.sum(weightedProgressions);
}

exports.handleKeyResultProgress = handleKeyResultProgress;
exports.updatePeriodProgression = updatePeriodProgression;
