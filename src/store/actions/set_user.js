import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';
import User from '@/db/User';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, user) => {
  const rejectAccess = () => {
    unbindFirestoreRef('user');
    throw new Error('Invalid user');
  };

  // Check if user is valid Google account
  if (!user || !user.email) rejectAccess();

  // Check if user is whitelisted
  const userRef = db.collection('users').doc(user.email);
  const documentSnapshot = await userRef.get();
  if (!documentSnapshot.exists) rejectAccess();

  const { email, displayName } = await documentSnapshot.data();

  if (!displayName) {
    await User.update({ id: email, displayName: user.displayName });
  }

  // Bind the user object
  const options = {
    serialize,
  };
  return bindFirestoreRef('user', userRef, options);
});

/**
 * Custom serializer for the firestore action. Includes the document's Firestore path
 * and the its progression in the current period
 */
function serialize(snapshot) {
  const document = snapshot.data();
  Object.defineProperty(document, 'ref', { value: snapshot.ref });

  return document;
}
