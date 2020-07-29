import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';
import logEvent from '../audit';
import { ARCHIVE_ORGANIZATION, RESTORE_ORGANIZATION, UPDATE_ORGANIZATION } from '../audit/eventTypes';

export default class Organisation extends CommonDatabaseFunctions {
  constructor(id) {
    super(id, db.collection('organizations'));

    this.ref = db.collection('organizations').doc(id);

    this.updateEventSymbol = UPDATE_ORGANIZATION;
    this.archiveEventSymbol = ARCHIVE_ORGANIZATION;
    this.restoreEventSymbol = RESTORE_ORGANIZATION;
  }

  async update(data) {
    if (!data) throw new TypeError('Missing data');

    this.setUpdatedMetadata(data);

    try {
      await this.ref.update(data);
      logEvent(this.updateEventSymbol, data);
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
