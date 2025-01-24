import { doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';

const created = () => ({
  archived: false,
  created: serverTimestamp(),
  createdBy: doc(db, 'users', auth.currentUser.email),
});

const edited = () => ({
  edited: serverTimestamp(),
  editedBy: doc(db, 'users', auth.currentUser.email),
});

export default { created, edited };
