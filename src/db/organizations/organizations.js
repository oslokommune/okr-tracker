import { db } from '@/config/firebaseConfig';
import slugify from '@/util/slugify';

import logEvent from '../audit';
import { ARCHIVE_ORGANIZATION, RESTORE_ORGANIZATION, UPDATE_ORGANIZATION } from '../audit/eventTypes';

export default class Organisation {
  constructor(id) {
    if (!id) throw new Error('Invalid data');
    this.ref = db.collection('orgs').doc(id);
  }

  async archive(data) {
    if (!data) throw new TypeError('Missing data');

    data.slug = slugify(data.name);

    try {
      await this.ref.update(data);
      logEvent(UPDATE_ORGANIZATION, data);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async update() {
    try {
      await this.ref.update({ archived: true });
      logEvent(ARCHIVE_ORGANIZATION, this);
    } catch (error) {
      this.handleError(error);
      return false;
    }

    return this;
  }

  async restore() {
    try {
      await this.ref.update({ archived: false });
      logEvent(RESTORE_ORGANIZATION, this);
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
