import metadata from './metadata';

/**
 * Deletes a document from Firestore. Adds edited data to document before deletion, to ensure
 * that Cloud Functions can extract information about the delete event.
 *
 * @param {Function} update
 * @param {DocumentReference} document
 * @returns {Promise} - Resolves `true` for success
 */
export default async function deleteDocument(update, document) {
  const { id, path } = document;
  try {
    await update(id, metadata.edited());
    await document.delete();
    return true;
  } catch ({ message }) {
    throw new Error(`Could not delete ${path}: ${message}`);
  }
}
