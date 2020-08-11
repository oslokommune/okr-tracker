import { db, auth, serverTimestamp } from '@/config/firebaseConfig';

const created = () => ({
  archived: false,
  created: serverTimestamp(),
  createdBy: db.collection('users').doc(auth.currentUser.email),
});

const edited = () => ({
  edited: serverTimestamp(),
  editedBy: db.collection('users').doc(auth.currentUser.email),
});

export default { created, edited };
