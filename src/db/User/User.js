import { arrayRemove, db, storage } from '@/config/firebaseConfig';
import preferences from './defaultPreferences';
import UploadImage from '../common/uploadImage';

const collectionReference = db.collection('users');

export const getAllUserIds = () => collectionReference.get().then(({ docs }) => docs.map(({ id }) => id));
export const getUserFromId = (id) => collectionReference.doc(id).get();

export const create = async ({ email }) => {
  try {
    if (!email) throw new Error('Invalid email');

    const { exists } = await collectionReference.doc(email).get();
    if (exists) throw new Error(`User ${email} already exists!`);

    await collectionReference.doc(email).set({
      id: email,
      email,
      preferences,
    });

    return true;
  } catch (error) {
    throw new Error(`Could not add user ${email}`);
  }
};

export const remove = async (user) => {
  if (!user) throw new Error('Missing user');

  try {
    const docRef = collectionReference.doc(user.id);
    return Promise.all([removeFromTeams(docRef), docRef.delete()]);
  } catch (error) {
    throw new Error(`Could not delete user ${user.id}`);
  }
};

export const update = async (user) => {
  if (!user) throw new Error('Missing user');

  try {
    return collectionReference.doc(user.id).update(user);
  } catch (error) {
    throw new Error(`Could not update user ${user.id}`);
  }
};

export const addUsers = async (userList) => {
  if (!userList || !userList.length) throw new Error('Invalid data');
  const promises = userList.map((email) => ({ email })).map(create);

  try {
    return Promise.all(promises);
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadImage = (id, image) => {
  return UploadImage(id, image, 'photos');
};

export const deleteImage = async (id) => {
  try {
    const { photoURL } = await collectionReference
      .doc(id)
      .get()
      .then((snap) => snap.data());

    await storage.refFromURL(photoURL).delete();
    await update({ id, photoURL: null });

    return true;
  } catch (error) {
    throw new Error(error);
  }
};

async function removeFromTeams(docRef) {
  try {
    const products = await db.collection('products').where('team', 'array-contains', docRef).get();

    return Promise.all(
      products.docs.map(({ ref }) => {
        return ref.update({
          team: arrayRemove(docRef),
        });
      })
    );
  } catch (error) {
    throw new Error(error.message);
  }
}
