import { db } from '@/config/firebaseConfig';

import logEvent from '../audit';
import { ARCHIVE_DEPARTMENT, RESTORE_DEPARTMENT, UPDATE_DEPARTMENT } from '../audit/eventTypes';
import CommonDatabaseFunctions from '../CommonDatabaseFunctions';

export default class Organisation extends CommonDatabaseFunctions {
  constructor(id) {
    super(id);

    this.ref = db.collection('departments').doc(id);

    this.updateEventSymbol = UPDATE_DEPARTMENT;
    this.archiveEventSymbol = ARCHIVE_DEPARTMENT;
    this.restoreEventSymbol = RESTORE_DEPARTMENT;
  }

  async update(data) {
    if (!data) throw new TypeError('Missing data');

    delete data.organization; // Do not update organization reference

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
