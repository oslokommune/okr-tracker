/**
 * Return a users display name. If not valid Firestore reference,
 * attempt to extract reference suffix (email).
 *
 * `userRef` is the the firestore reference to resolve.
 */
async function getUserDisplayName(userRef) {
  if (!(userRef.get !== 'function')) {
    return userRef.split('users/')[1];
  }
  return userRef.get().then((snapshot) => snapshot.data().displayName);
}

export default getUserDisplayName;
