import { db, auth, serverTimestamp } from '@/config/firebaseConfig';

const created = () => ({
  archived: false,
  created: serverTimestamp(),
  createdBy: db.collection('users').doc(auth.currentUser.uid),
});

const edited = () => ({
  edited: serverTimestamp(),
  editedBy: db.collection('users').doc(auth.currentUser.uid),
});

export default { created, edited };
