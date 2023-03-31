import { arrayRemove, arrayUnion, db } from '@/config/firebaseConfig';
import preferences from './defaultPreferences';
import { updateDocument } from '../common';

const collectionReference = db.collection('users');

export const getAllUserIds = () =>
  collectionReference.get().then(({ docs }) => docs.map(({ id }) => id));
export const getUserFromId = (id) => collectionReference.doc(id).get();

export const create = async (user) => {
  try {
    if (!user.email) {
      throw new Error('Invalid email');
    }

    const { exists } = await collectionReference.doc(user.id).get();
    if (exists) {
      throw new Error(`User ${user.id} already exists!`);
    }

    await collectionReference.doc(user.id).set({
      ...user,
      superAdmin: false,
      admin: [],
      preferences,
    });

    return true;
  } catch (error) {
    throw new Error(`Could not add user ${user.id}`);
  }
};

export const remove = async (user) => {
  if (!user) {
    throw new Error('Missing user');
  }

  try {
    const docRef = collectionReference.doc(user.id);
    return Promise.all([
      removeFromTeams(db.collection('organizations'), docRef),
      removeFromTeams(db.collection('departments'), docRef),
      removeFromTeams(db.collection('products'), docRef),
      docRef.delete(),
    ]);
  } catch (error) {
    throw new Error(`Could not delete user ${user.id}`);
  }
};

export const update = async (user) => {
  if (!user) {
    throw new Error('Missing user');
  }

  try {
    return updateDocument(collectionReference.doc(user.id), user);
  } catch (error) {
    throw new Error(`Could not update user ${user.id}`);
  }
};

export const addUsers = async (userList) => {
  if (!userList || !userList.length) {
    throw new Error('Invalid data');
  }
  const promises = userList
    .map((email) => ({ id: email, email, superAdmin: false, admin: [] }))
    .map(create);

  try {
    return Promise.all(promises);
  } catch (error) {
    throw new Error(error);
  }
};

async function removeFromTeams(collectionRef, docRef) {
  try {
    const items = await collectionRef.where('team', 'array-contains', docRef).get();

    return Promise.all(
      items.docs.map(({ ref }) =>
        ref.update({
          team: arrayRemove(docRef),
        })
      )
    );
  } catch (error) {
    throw new Error(error.message);
  }
}

export const replaceFromTeams = async (oldDocId, newDocId) => {
  try {
    const oldDocRef = collectionReference.doc(oldDocId);
    const newDocRef = collectionReference.doc(newDocId);
    const products = await db
      .collection('products')
      .where('team', 'array-contains', oldDocRef)
      .get();

    await Promise.all(
      products.docs.map(({ ref }) =>
        ref.update({
          team: arrayRemove(oldDocRef),
        })
      )
    );

    return Promise.all(
      products.docs.map(({ ref }) =>
        ref.update({
          team: arrayUnion(newDocRef),
        })
      )
    );
  } catch (error) {
    throw new Error(error.message);
  }
};
