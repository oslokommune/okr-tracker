import { db } from '@/config/firebaseConfig';
import slugify from '@/util/slugify';
import CommonDatabaseFunctions from '../CommonDatabaseFunctions';

export default class Organisation extends CommonDatabaseFunctions {
  static collectionRef = db.collection('organizations');

  static props = {
    name: {
      type: 'string',
      required: true,
    },
  };

  static create(data) {
    data.slug = slugify(data.name);
    super.create(data);
  }

  async update(data) {
    data.slug = slugify(data.name);
    super.update(data);
  }

  async delete() {
    throw new Error('Organizations can only be deleted from the Firestore console');
  }

  handleError(error) {
    // TODO: Show an error to the user
    console.error(error);

    return false;
  }
}
