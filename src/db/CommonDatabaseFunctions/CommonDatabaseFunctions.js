import { db, auth } from '@/config/firebaseConfig';
import slugify from '@/util/slugify';
import logEvent from '../audit';

export default class {
  constructor(id) {
    if (!id) throw new Error('Missing document id');
  }

  setUpdatedMetadata(data) {
    if (data.name) {
      data.slug = slugify(data.name);
    }

    data.updated = new Date();
    data.updatedBy = db.collection('users').doc(auth.currentUser.email);
  }

  setCreatedMetadata(data) {
    if (data.name) {
      data.slug = slugify(data.name);
    }

    data.created = new Date();
    data.createdBy = db.collection('users').doc(auth.currentUser.email);
  }

  async archive() {
    try {
      const data = { archived: true };
      this.setUpdatedMetadata(data);
      await this.ref.update(data);
      logEvent(this.archiveEventSymbol, this);
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
      logEvent(this.restoreEventSymbol, this);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async delete() {
    try {
      await this.ref.delete();
      logEvent(this.deleteEventSymbol, this);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return true;
  }
}
