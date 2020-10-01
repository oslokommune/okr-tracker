import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, user) => {
  const rejectAccess = () => {
    unbindFirestoreRef('user');
    throw new Error('Invalid user');
  };

  // Check if user is valid Google account
  if (!user || !user.email) rejectAccess();

  // Check if user is whitelisted
  const userRef = db.collection('users').doc(user.email);
  const { exists } = await userRef.get();
  if (!exists) rejectAccess();

  // Bind the user object
  return bindFirestoreRef('user', userRef);
});
