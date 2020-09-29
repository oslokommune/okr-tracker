import { db } from '@/config/firebaseConfig';
import props from './props';
import User from '../User';
import { validateCreateProps } from '../common';

const collection = db.collection('requestAccess');

export const create = async data => {
  try {
    await validateCreateProps(props, data);

    return collection.add({ ...data, created: new Date() });
  } catch (error) {
    throw new Error(error);
  }
};

export const reject = async id => {
  try {
    return collection.doc(id).delete();
  } catch {
    throw new Error(`Cannot remove access request (${id})`);
  }
};

export const accept = async id => {
  try {
    const { email } = await collection
      .doc(id)
      .get()
      .then(snapshot => snapshot.data());

    return User.create({ email }).then(reject.bind(null, id));
  } catch {
    throw new Error(`Cannot accept access request (${id})`);
  }
};
