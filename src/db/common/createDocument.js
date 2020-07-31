import metadata from './metadata';

/**
 * Creates a document into the provided collection. Appends metadata (timestamp and user)
 * to the data payload
 *
 * @param {CollectionReference} collection
 * @param {Object} data
 * @returns {Promise}
 */
export default async function createDocument(collection, data) {
  data = { ...data, ...metadata.created() };

  try {
    return collection.add(data).catch(reason => {
      throw new Error(reason);
    });
  } catch (error) {
    throw new Error('Could not create department');
  }
}
