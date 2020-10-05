import { db, storage } from '@/config/firebaseConfig';
import { compressImage } from '../common';

const collectionReference = db.collection('users');

export const getAllUserIds = () => collectionReference.get().then(({ docs }) => docs.map(({ id }) => id));
export const getUserFromId = id => collectionReference.doc(id).get();

export const create = async ({ email }) => {
  try {
    if (!email) throw new Error('Invalid email');

    const { exists } = await collectionReference.doc(email).get();
    if (exists) throw new Error(`User ${email} already exists!`);

    return collectionReference.doc(email).set({
      id: email,
      email,
    });
  } catch (error) {
    throw new Error(`Could not add user ${email}`);
  }
};

export const remove = async user => {
  if (!user) throw new Error('Missing user');

  try {
    return collectionReference.doc(user.id).delete();
  } catch (error) {
    throw new Error(`Could not delete user ${user.id}`);
  }
};

export const update = async user => {
  if (!user) throw new Error('Missing user');

  try {
    return collectionReference.doc(user.id).update(user);
  } catch (error) {
    throw new Error(`Could not update user ${user.id}`);
  }
};

export const addUsers = async userList => {
  if (!userList || !userList.length) throw new Error('Invalid data');
  const promises = userList.map(email => ({ email })).map(create);

  try {
    return Promise.all(promises);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Uploads a file to storage bucket
 * @param {string} id - User id
 * @param {File} image
 * @returns {String} - File URL
 */
export const uploadImage = async (id, image) => {
  if (!id) throw new Error('UserId must be provided');
  if (!image) throw new Error('Image must be provided');
  if (image.type.split('/')[0] !== 'image') throw new Error('Invalid file');

  const storageRef = storage.ref(`photos/${id}-${image.name}`);

  try {
    const compressed = await compressImage(image, 400);

    const { state, ref } = await storageRef.put(compressed);
    if (state !== 'success') throw new Error(state);

    return ref.getDownloadURL();
  } catch (error) {
    throw new Error(error);
  }
};
