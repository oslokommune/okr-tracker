import { getFirestore } from 'firebase-admin/firestore';
import validator from 'express-validator';

/**
 * Return a user's display name. If the referenced Firestore reference
 * does not exist, attempt to extract reference suffix (email).
 *
 * `userRef` is the Firestore reference to resolve.
 */
async function getUserDisplayName(userRef) {
  if (typeof userRef.get === 'function') {
    return userRef.get().then((snapshot) => {
      if (!snapshot.exists) {
        return userRef.path.split('users/')[1];
      }
      const userData = snapshot.data();
      return userData.displayName;
    });
  }
  return userRef.split('users/')[1];
}

export default getUserDisplayName;
