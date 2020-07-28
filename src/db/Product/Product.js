import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';
import logEvent from '../audit';
import { ARCHIVE_PRODUCT, RESTORE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT } from '../audit/eventTypes';

export default class Product extends CommonDatabaseFunctions {
  constructor(id) {
    super(id);

    this.ref = db.collection('products').doc(id);

    this.updateEventSymbol = UPDATE_PRODUCT;
    this.archiveEventSymbol = ARCHIVE_PRODUCT;
    this.restoreEventSymbol = RESTORE_PRODUCT;
    this.deleteEventSymbol = DELETE_PRODUCT;
  }

  async update(data) {
    if (!data) throw new TypeError('Missing data');

    delete data.organization; // Do not update organization reference
    delete data.department; // Do not update department reference
    delete data.team; // TODO: Update team - make sure to preserve references in array

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
