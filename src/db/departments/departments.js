import { db } from '@/config/firebaseConfig';
import slugify from '@/util/slugify';

import logEvent from '../audit';
import { ARCHIVE_DEPARTMENT, RESTORE_DEPARTMENT, UPDATE_DEPARTMENT } from '../audit/eventTypes';

export default class Organisation {
  constructor(id) {
    if (!id) throw new Error('Invalid data');
    this.ref = db.collection('departments').doc(id);
  }

  async update(data) {
    if (!data) throw new TypeError('Missing data');

    delete data.organization; // Do not update organization reference
    data.slug = slugify(data.name);

    try {
      await this.ref.update(data);
      logEvent(UPDATE_DEPARTMENT, data);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async archive() {
    try {
      await this.ref.update({ archived: true });
      logEvent(ARCHIVE_DEPARTMENT, this);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async restore() {
    try {
      await this.ref.update({ archived: false });
      logEvent(RESTORE_DEPARTMENT, this);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  handleError(error) {
    // TODO: Show an error to the user
    console.error(error);

    return false;
  }
}
