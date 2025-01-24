import { addDoc } from 'firebase/firestore';
import metadata from '../util/metadata';

/**
 * Creates a document into the provided collection. Appends metadata (timestamp and user)
 * to the data payload
 *
 * @param {import('firebase').firebase.firestore.CollectionReference} collection - Firebase collection reference
 * @param {Object} data
 * @returns {Promise}
 */
export default async function createDocument(collection, data) {
  data = { ...data, ...metadata.created() };

  try {
    return addDoc(collection, data);
  } catch (error) {
    throw new Error('Could not create document', error);
  }
}
