/**
 * Return a Firestore query-safe encoded copy of `str`.
 *
 * Inspired by https://stackoverflow.com/a/19148116.
 */
export function firestoreEncode(str) {
  return encodeURIComponent(str).replace(/\./g, '%2E');
}

/**
 * The inverse of `firestoreEncode`.
 */
export function firestoreDecode(str) {
  return decodeURIComponent(str.replace(/\./g, '%2E'));
}

/**
 * Return id from unresolved Firestore reference.
 */
export function documentIdFromRef(ref) {
  if (typeof ref.get === 'function') {
    return ref.id;
  }
  return ref.split('/')[1];
}
