import { db, auth } from '@/config/firebaseConfig';

export default class {
  constructor(id) {
    if (!id) throw new Error('Missing document ID');
    if (typeof id !== 'string') throw new TypeError('Invalid document ID');
  }

  static async create(data) {
    data = {
      ...data,
      archived: false,
      created: new Date(),
      createdBy: db.collection('users').doc(auth.currentUser.email),
    };

    const { collectionRef } = new this('dummy-id');

    try {
      await collectionRef.add(data);
    } catch (error) {
      throw new Error('Cannot create document', error);
    }

    return this;
  }

  async update(data) {
    // Preserve Firestore references when updating
    if (data.parent) data.parent = db.doc(data.parent);
    if (data.organization) data.organization = db.doc(data.organization);
    if (data.period) data.period = db.doc(data.period);
    if (data.department) data.department = db.doc(data.department);
    if (data.objective) data.objective = db.doc(data.objective);

    data.edited = new Date();
    data.editedBy = db.collection('users').doc(auth.currentUser.email);

    try {
      await this.ref.update(data);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async archive() {
    try {
      await this.ref.update({
        archived: true,
        edited: new Date(),
        editedBy: db.collection('users').doc(auth.currentUser.email),
      });
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async restore() {
    try {
      await this.ref.update({
        archived: false,
        edited: new Date(),
        editedBy: db.collection('users').doc(auth.currentUser.email),
      });
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async delete() {
    try {
      await this.ref.update({
        edited: new Date(),
        editedBy: db.collection('users').doc(auth.currentUser.email),
      });

      await this.ref.delete();
    } catch (error) {
      this.handleError('Could not delete document');
      console.error(error);
      return false;
    }

    return true;
  }
}
