import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';
import KeyResult from '../KeyResult';

export default class Objective extends CommonDatabaseFunctions {
  static collectionRef = db.collection('objectives');

  static props = {
    name: {
      type: 'string',
      required: true,
    },
    parent: {
      type: 'object',
      required: true,
    },
    period: {
      type: 'object',
      required: true,
    },
  };

  async delete() {
    // Delete affected key results
    db.collection('keyResults')
      .where('objective', '==', this.ref)
      .get()
      .then(({ docs }) => docs.forEach(({ ref }) => new KeyResult(ref.id).delete()));

    super.delete();
  }

  handleError(error) {
    // TODO: Show an error to the user
    console.error(error);

    return false;
  }
}
