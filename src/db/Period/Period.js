import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';
import Objective from '../Objective';

export default class Period extends CommonDatabaseFunctions {
  constructor(id) {
    super(id);

    this.collectionRef = db.collection('periods');
    this.ref = this.collectionRef.doc(id);
  }

  static create(data) {
    if (!data.name) throw new Error('Missing name');
    if (!data.startDate) throw new Error('Missing start date');
    if (!data.endDate) throw new Error('Missing end date');

    if (typeof data.name !== 'string') throw new TypeError('Invalid period name');
    if (typeof data.startDate.getMonth !== 'function') throw new TypeError('Invalid start date');
    if (typeof data.endDate.getMonth !== 'function') throw new TypeError('Invalid end date');

    super.create(data);
  }

  async update(data) {
    if (!data) throw new TypeError('Missing data');

    super.update(data);
  }

  async delete() {
    // Delete affected key results
    db.collection('objectives')
      .where('period', '==', this.ref)
      .get()
      .then(({ docs }) =>
        docs.forEach(({ ref }) => {
          new Objective(ref.id).delete();
        })
      );

    super.delete();
  }

  handleError(error) {
    // TODO: Show an error to the user
    console.error(error);

    return false;
  }
}
