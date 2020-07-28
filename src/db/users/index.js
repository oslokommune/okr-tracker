import { db } from '@/config/firebaseConfig';

const collectionReference = db.collection('users');

export const getAllUserIds = () => collectionReference.get().then(({ docs }) => docs.map(({ id }) => id));
export const getUserFromId = id => collectionReference.doc(id).get();
