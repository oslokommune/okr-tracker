import { startOfMonth, endOfMonth } from 'date-fns';
import { db } from '@/config/firebaseConfig';
import { serializeDocument } from '@/db/db';

/**
 * This function prepares the database for changing static 'quarters'
 * to dynamic 'periods' by finding all the quarters in use for each
 * department + product and creates a new subcollection `/periods`.
 * It automatically sets the `startDate` and `endDate` for these
 * (legacy) quarters.
 *
 * Finally it updates all the objectives by adding a reference to
 * the corresponding period.
 */
export default async function() {
  // Get all the documents from the database
  const departments = await getDepartments();
  const products = await getProducts();
  const documents = [...departments, ...products];

  // Find all the quarters currently in use
  console.info('Finding all quarters from objectives');
  await Promise.all(documents.map(getCurrentQuarters));

  // Clear existing periods to prevent clutter
  console.info('Deleting existing periods');
  await Promise.all(documents.map(clearPeriods));

  // Convert quarters to periods and move progressions into the object
  console.info('Create new periods from quarters');
  await Promise.all(documents.map(createPeriodsFromQuarters));

  // Link existing objectives to newly created periods
  console.info('Link existing objectives to new periods');
  await Promise.all(documents.map(linkObjectivesToPeriods));

  console.info('Finished updating', documents.length, 'documents');
  return true;
}

/**
 * Get all departments in the Firestore
 * @returns {Promise} - Serialized departments
 */
function getDepartments() {
  return db
    .collectionGroup('departments')
    .get()
    .then(d => d.docs)
    .then(d => d.map(serializeDocument));
}

/**
 * Get all products in the Firestore
 * @returns {Promise} - Serialized products
 */
function getProducts() {
  return db
    .collectionGroup('products')
    .get()
    .then(d => d.docs)
    .then(d => d.map(serializeDocument));
}

/**
 * Saves all the unique quarters onto the document
 * @param {Object} document - Department or Product
 * @returns {Object} - Department or Product
 */
async function getCurrentQuarters(document) {
  const objectiveQuarters = await document.ref
    .collection('objectives')
    .get()
    .then(d => d.docs)
    .then(docs => docs.map(doc => doc.get('quarter')));

  if (!objectiveQuarters.length) return;

  document.quarters = [...new Set(objectiveQuarters)];

  return document;
}

/**
 * Finds the quarters temporarily stored on the document
 * object then extracts the start and end dates for each
 * quarter and adds a new `period` document into the `/periods`
 * subcollection. Finally copies the correct progression from
 * the 'progression' field into the new period document.
 * @param {Object} document - Department or Product
 */
async function createPeriodsFromQuarters(document) {
  const { progressions } = document;
  if (!document.quarters) return;
  const periods = document.quarters.map(name => {
    const quarter = name[1];
    const year = name.split(' ')[1];
    const startMonth = quarter * 3 - 2;
    const endMonth = startMonth + 2;

    const startDate = startOfMonth(new Date(`${year}-${startMonth}-01`));
    const endDate = endOfMonth(new Date(`${year}-${endMonth}-01`));

    return { name, startDate, endDate };
  });

  return Promise.all(
    periods.map(period => {
      const created = new Date();
      const progression = progressions[period.name] || 0;
      return document.ref.collection('periods').add({ ...period, created, progression });
    })
  );
}

/**
 * Removes 'Period' documents if any exists
 * @param {Object} document - Department or Product
 */
async function clearPeriods(document) {
  return document.ref
    .collection('periods')
    .get()
    .then(snapshot => Promise.all(snapshot.docs.map(doc => doc.ref.delete())));
}

/**
 * Creates a reference to the corresponding period on all
 * child objectives for the document.
 *
 * @param {Object} document - Department or Product
 */
async function linkObjectivesToPeriods(document) {
  const objectives = await getObjectives(document);
  const periods = await getPeriods(document);

  if (!objectives.length) return;

  const promises = objectives.map(objective => {
    const { quarter } = objective;
    const period = periods.find(p => p.name === quarter).ref;
    return objective.ref.update({ period });
  });

  return Promise.all(promises);
}

/**
 * Finds all the objectives
 * @param {Object} document - Department or Product
 * @returns {Promise} - Serialized objectives
 */
async function getObjectives(document) {
  return document.ref
    .collection('objectives')
    .get()
    .then(snapshot => snapshot.docs.map(serializeDocument));
}

/**
 * Finds all the periods
 * @param {FirebaseDocument} document - Department or Product
 * @returns {Promise} - Serialized periods
 */
async function getPeriods(document) {
  return document.ref
    .collection('periods')
    .get()
    .then(snapshot => snapshot.docs.map(serializeDocument));
}
