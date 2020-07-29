import { db } from '@/config/firebaseConfig';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';
import Objective from '../Objective';

export default class Period extends CommonDatabaseFunctions {
  static collectionRef = db.collection('periods');

  static props = {
    name: {
      type: 'string',
      required: true,
    },
    parent: {
      type: 'object',
      required: true,
    },
    startDate: {
      type: 'date',
      required: true,
    },
    endDate: {
      type: 'date',
      required: true,
    },
  };

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
