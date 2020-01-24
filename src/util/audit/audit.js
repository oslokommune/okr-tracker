import { db, auth } from '../../config/firebaseConfig';
import { errorHandler } from '../utils';

const write = async (obj = {}) => {
  const user = obj.user || auth.currentUser.email || null;
  db.collection('audit')
    .add({ ...obj, user, timestamp: new Date() })
    .catch(errorHandler);
};

export default {
  async login(user) {
    return write({ event: 'login', user });
  },
  async signOut(user) {
    return write({ event: 'sign-out', user });
  },

  async keyResUpdateProgress(keyres, product, fromValue, toValue) {
    return write({ event: 'keyRes-update-progress', keyres, product, fromValue, toValue });
  },

  async uploadProfilePhoto(user) {
    return write({ event: 'upload-profile-photo', user });
  },

  async createKeyResult(keyresRef, productRef, objectiveRef) {
    return write({ event: 'create-key-result', keyresRef, productRef, objectiveRef });
  },
};
