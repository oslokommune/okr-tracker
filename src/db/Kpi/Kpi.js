import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';

export default class Kpi extends CommonDatabaseFunctions {
  constructor(id) {
    super(id);

    this.collectionRef = db.collection('kpis');
    this.ref = this.collectionRef.doc(id);
  }

  static create(data) {
    if (!data.name) throw new Error('Missing name');
    super.create(data);
  }

  async update(data) {
    if (!data) throw new TypeError('Missing data');

    super.update(data);
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
