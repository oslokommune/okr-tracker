import metadata from './metadata';

/**
 * Updates the provided fields on a document. Appends metadata (timestamp and user)
 * to the data payload
 *
 * @param {DocumentReference} documentReference
 * @param {Object} data
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
