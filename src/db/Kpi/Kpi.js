import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';

export default class Kpi extends CommonDatabaseFunctions {
  static collectionRef = db.collection('kpis');

  static props = {
    name: {
      type: 'string',
      required: true,
    },
    parent: {
      type: 'object',
      required: true,
    },
  };

  async addProgress(/* payload */) {
    // TODO:
  }

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
