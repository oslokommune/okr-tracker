import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';

export default class Product extends CommonDatabaseFunctions {
  constructor(id) {
    super(id, db.collection('products'));

    this.collectionRef = db.collection('products');

    if (typeof id === 'string') {
      this.ref = db.collection('products').doc(id);
    }
  }

  async update(data) {
    if (!data) throw new TypeError('Missing data');

    delete data.organization; // Do not update organization reference
    delete data.department; // Do not update department reference
    delete data.team; // TODO: Update team - make sure to preserve references in array

    this.setUpdatedMetadata(data);

    try {
      await this.ref.update(data);
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
