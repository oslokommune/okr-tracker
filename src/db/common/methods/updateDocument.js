import metadata from '../util/metadata';

/**
 * Updates the provided fields on a document. Appends metadata (timestamp and user)
 * to the data payload
 *
 * @param {import('firebase').firestore.DocumentReference} document - Firebase document reference
 * @param {{}} data
 * @returns {Promise}
 */
export default async function updateDocument(document, data) {
  data = { ...data, ...metadata.edited() };

  try {
    return document.update(data);
  } catch (error) {
    console.log(error, document);
    throw new Error('Could not save changes', error);
  }
}
