import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';
import KeyResult from '../KeyResult';

export default class Objective extends CommonDatabaseFunctions {
  constructor(id) {
    super(id);

    this.collectionRef = db.collection('objectives');
    this.ref = this.collectionRef.doc(id);
  }

  static create(data) {
    if (!data.name) throw new Error('Missing name');
    if (!data.icon) throw new Error('Missing icon');
    super.create(data);
  }

  async update(data) {
    if (!data) throw new TypeError('Missing data');

    super.update(data);
  }

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
