import { db, auth } from '@/config/firebaseConfig';

const created = () => ({
  archived: false,
  created: new Date(),
  createdBy: db.collection('users').doc(auth.currentUser.email),
});

const edited = () => ({
  edited: new Date(),
  editedBy: db.collection('users').doc(auth.currentUser.email),
});

export default { created, edited };
