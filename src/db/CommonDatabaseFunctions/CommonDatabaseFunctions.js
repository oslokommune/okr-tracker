import { db, auth } from '@/config/firebaseConfig';
import slugify from '@/util/slugify';

export default class {
  constructor(idOrObject, collectionRef) {
    if (!idOrObject) throw new Error('Missing ID or payload for creating new instance');
    if (!collectionRef) throw new Error('Missing collection reference');

    this.collectionRef = collectionRef;

    if (typeof idOrObject !== 'string' && typeof idOrObject !== 'object') {
      throw new Error('Invalid data');
    }

    if (typeof idOrObject === 'object') {
      this.create(idOrObject);
    }
  }

  setUpdatedMetadata(data) {
    if (data.name) {
      data.slug = slugify(data.name);
    }

    data.edited = new Date();
    data.editedBy = db.collection('users').doc(auth.currentUser.email);
  }

  setCreatedMetadata(data) {
    if (data.name) {
      data.slug = slugify(data.name);
    }

    data.archived = false;
    data.created = new Date();
    data.createdBy = db.collection('users').doc(auth.currentUser.email);
  }

  async create(data) {
    this.setCreatedMetadata(data);

    try {
      await this.collectionRef.add(data);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async archive() {
    try {
      const data = { archived: true };
      this.setUpdatedMetadata(data);
      await this.ref.update(data);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async restore() {
    try {
      const data = { archived: false };
      this.setUpdatedMetadata(data);
      await this.ref.update(data);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async delete() {
    try {
      const data = {};
      this.setUpdatedMetadata(data);
      await this.ref.update(data);

      await this.ref.delete();
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return true;
  }
}
