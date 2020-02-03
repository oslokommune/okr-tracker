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

  async toggleAdmin(user, value) {
    if (value === true) {
      return write({ event: 'promoted-admin', user });
    }
    if (value === false) {
      return write({ event: 'demoted-admin', user });
    }
  },

  async addUsers(list) {
    return write({ event: 'added-users', list: JSON.stringify(list) });
  },

  async deleteUser(affectedUser) {
    return write({ event: 'deleted-user', affectedUser });
  },

  async createObjective(objectiveRef, productRef) {
    return write({ event: 'create-objective', objectiveRef, productRef });
  },

  async updateObjective(objectiveRef, productRef) {
    return write({ event: 'update-objective', objectiveRef, productRef });
  },

  async archiveObjective(objectiveRef, productRef) {
    return write({ event: 'archive-objective', objectiveRef, productRef });
  },

  async createProduct(productRef, departmentRef) {
    return write({ event: 'create-product', productRef, departmentRef });
  },

  async archiveProduct(productRef) {
    return write({ event: 'archive-product', productRef });
  },

  async updateProduct(productRef) {
    return write({ event: 'update-product', productRef });
  },

  updateProductImage(productRef) {
    return write({ event: 'update-product-image', productRef });
  },

  async keyResUpdateProgress(keyresRef, productRef, fromValue, toValue) {
    return write({ event: 'keyRes-update-progress', keyresRef, productRef, fromValue, toValue });
  },

  async uploadProfilePhoto(user) {
    return write({ event: 'upload-profile-photo', user });
  },

  async createKeyResult(keyresRef, productRef, objectiveRef) {
    return write({ event: 'create-key-result', keyresRef, productRef, objectiveRef });
  },
};
