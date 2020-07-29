import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';

export default class KeyResult extends CommonDatabaseFunctions {
  static collectionRef = db.collection('keyResults');

  static props = {
    name: {
      type: 'string',
      required: true,
    },
    objective: {
      type: 'object',
      required: true,
    },
    parent: {
      type: 'object',
      required: true,
    },
    startValue: {
      type: 'number',
      required: true,
    },
    targetValue: {
      type: 'number',
      required: true,
    },
    unit: {
      type: 'string',
      required: true,
    },
  };

  async delete() {
    // Delete affected progress
    this.ref
      .collection('progress')
      .get()
      .then(({ docs }) => docs.forEach(({ ref }) => ref.delete()));

    super.delete();
  }

  handleError(error) {
    // TODO: Show an error to the user
    console.error(error);

    return false;
  }
}
