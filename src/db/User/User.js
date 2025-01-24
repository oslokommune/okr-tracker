import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import preferences from './defaultPreferences';
import { updateDocument } from '../common';

export const create = async (user) => {
  if (!user.email) {
    throw new Error('Invalid email');
  }

  const userRef = doc(db, 'users', user.id);

  if ((await getDoc(userRef)).exists()) {
    throw new Error(`User ${user.id} already exists!`);
  }

  await setDoc(userRef, {
    ...user,
    admin: [],
    preferences,
  });
};

export const remove = async (user) => {
  if (!user) {
    throw new Error('Missing user');
  }

  try {
    const userRef = doc(db, 'users', user.id);
    return Promise.all([
      removeFromTeams(collection(db, 'organizations'), userRef),
      removeFromTeams(collection(db, 'departments'), userRef),
      removeFromTeams(collection(db, 'products'), userRef),
      deleteDoc(userRef),
    ]);
  } catch (error) {
    throw new Error(`Could not delete user ${user.id}`);
  }
};

export const update = async (user, data) => {
  if (!user) {
    throw new Error('Missing user');
  }

  try {
    return updateDocument(doc(db, 'users', user.id), data);
  } catch (error) {
    throw new Error(`Could not update user ${user.id}`);
  }
};

export const addUsers = async (userList) => {
  if (!userList || !userList.length) {
    throw new Error('Invalid data');
  }
  const promises = userList.map((email) => ({ id: email, email })).map(create);

  try {
    return Promise.all(promises);
  } catch (error) {
    throw new Error(error);
  }
};

async function removeFromTeams(collectionRef, userRef) {
  try {
    const items = await getDocs(
      query(collectionRef, where('team', 'array-contains', userRef))
    );

    return Promise.all(
      items.docs.map(({ ref }) =>
        updateDoc(ref, {
          team: arrayRemove(userRef),
        })
      )
    );
  } catch (error) {
    throw new Error(error.message);
  }
}
