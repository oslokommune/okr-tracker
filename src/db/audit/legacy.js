import Vue from 'vue';
import { db, auth } from '@/config/firebaseConfig';

const write = async (obj = {}) => {
  const user = obj.user || auth.currentUser.email || null;
  return db
    .collection('audit')
    .add({ ...obj, user, timestamp: new Date() })
    .catch(err => {
      Vue.$errorHandler('db_write_error', err);
    });
};

export const eventTypes = [
  'keyRes-update-progress',
  'upload-profile-photo',
  'update-department',
  'create-key-result',
  'update-key-result',
  'archive-key-result',
  'create-objective',
  'update-objective',
  'archive-objective',
  'promoted-admin',
  'demoted-admin',
  'added-users',
  'deleted-user',
  'create-product',
  'archive-product',
  'update-product',
  'update-product-image',
];

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

  async updateDepartment(departmentRef) {
    return write({ event: 'update-department', departmentRef });
  },

  async updateOrganization(organizationRef) {
    return write({ event: 'update-organization', organizationRef });
  },

  async updateProductImage(productRef) {
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

  async updateKeyResult(keyresRef, productRef, objectiveRef) {
    return write({ event: 'update-key-result', keyresRef, productRef, objectiveRef });
  },

  async archiveKeyResult(keyresRef, productRef, objectiveRef) {
    return write({ event: 'archive-key-result', keyresRef, productRef, objectiveRef });
  },
};
