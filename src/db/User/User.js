import { db } from '@/config/firebaseConfig';

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
