import { db, auth } from '@/config/firebaseConfig';

export default class {
  constructor(id) {
    if (!id) throw new Error('Missing document ID');
    if (typeof id !== 'string') throw new TypeError('Invalid document ID');

    this.ref = this.constructor.collectionRef.doc(id);
  }

  static async create(data) {
    const { props, name } = this;

    Object.entries(props).forEach(([prop, { type, required }]) => {
      if (required && !Object.hasOwnProperty.call(data, prop)) {
        throw new Error(`Cannot create ${name}. Missing "${prop}" property.`);
      }
      // eslint-disable-next-line valid-typeof
      if (Object.hasOwnProperty.call(data, prop) && typeof data[prop] !== type) {
        throw new TypeError(`Invalid data: "${prop}" must be ${type}.`);
      }
    });

    data = {
      ...data,
      archived: false,
      created: new Date(),
      createdBy: db.collection('users').doc(auth.currentUser.email),
    };

    try {
      await this.collectionRef.add(data);
    } catch (error) {
      throw new Error(`Failed when saving new ${name} to database`, error);
    }

    return this;
  }

  async update(data) {
    if (!data) {
      throw new Error('Missing data');
    }

    // Preserve Firestore references when updating
    if (data.parent && typeof data.parent === 'string') {
      data.parent = db.doc(data.parent);
    }
    if (data.organization && typeof data.organization === 'string') {
      data.organization = db.doc(data.organization);
    }
    if (data.period && typeof data.period === 'string') {
      data.period = db.doc(data.period);
    }
    if (data.department && typeof data.department === 'string') {
      data.department = db.doc(data.department);
    }
    if (data.objective && typeof data.objective === 'string') {
      data.objective = db.doc(data.objective);
    }

    const { props } = this.constructor;

    Object.entries(props).forEach(([prop, { type }]) => {
      // eslint-disable-next-line valid-typeof
      if (Object.hasOwnProperty.call(data, prop) && typeof data[prop] !== type) {
        throw new TypeError(`Invalid data: "${prop}" must be ${type}.`);
      }
    });

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
