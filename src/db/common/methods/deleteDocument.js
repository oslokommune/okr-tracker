import { deleteDoc } from 'firebase/firestore';
import metadata from '../util/metadata';

/**
 * Deletes a document from Firestore. Adds edited data to document before deletion, to ensure
 * that Cloud Functions can extract information about the delete event.
 *
 * @param {Function} update
 * @param {import('firebase').firestore.DocumentReference} document - Firebase document reference
 * @returns {Promise} - Resolves `true` for success
 */
export default async function deleteDocument(update, document) {
  const { id, path } = document;
  try {
    await update(id, metadata.edited());
    await deleteDoc(document);
    return true;
  } catch ({ message }) {
    throw new Error(`Could not delete ${path}: ${message}`);
  }
}
