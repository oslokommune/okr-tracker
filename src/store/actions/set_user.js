import { firestoreAction } from 'vuexfire';
import { db } from '@/config/firebaseConfig';
import User from '@/db/User';
import defaultPreferences from '@/db/User/defaultPreferences';
import { setLanguage } from '@/locale/i18n';

export default firestoreAction(async ({ bindFirestoreRef, unbindFirestoreRef }, user) => {
  const rejectAccess = () => {
    unbindFirestoreRef('user');
    throw new Error('Invalid user');
  };

  // Check if user is valid Google account and within the knowit.no-domain
  if (!user || !user.email) rejectAccess();

  // Check if user is whitelisted
  const userRef = db.collection('users').doc(user.email);
  let documentSnapshot = await userRef.get();

  if (!documentSnapshot.exists) {
    // Add user if it does not exist
    await userRef.set({
      id: user.email,
      email: user.email,
      preferences: defaultPreferences,
    });
    documentSnapshot = await userRef.get();
  }

  const { id, email, displayName, preferences, uid } = await documentSnapshot.data();

  if (!preferences) {
    await User.update({ id, email, preferences: defaultPreferences });
  }

  if (preferences.lang) {
    setLanguage(preferences.lang);
  }

  if (!displayName) {
    await User.update({ id, email, displayName: user.displayName });
  }

  if (user.uuid && user.uuid !== uid) {
    await User.update({ id, email, uid: user.uid });
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
