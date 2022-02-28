import preferences from '../../../util/defaultPreferences.js';

const DEFAULT_PERMISSIONS = { admin: [], superAdmin: false };
export const DEFAULT_USER_OPTIONS = {
  ...DEFAULT_PERMISSIONS,
  preferences,
};

class UsersCollection {
  constructor(firestore) {
    this.collectionRef = firestore.collection('users');
  }

  async addDocument(document) {
    const docRef = this.collectionRef.doc(document.id);

    if ((await docRef.get()).exists) {
      throw new Error('toaster.request.userExists');
    }

    return docRef.set({
      ...DEFAULT_USER_OPTIONS,
      ...document,
    });
  }
}

export default UsersCollection;
