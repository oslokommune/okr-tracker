import { db } from '@/config/firebaseConfig';
import slugify from '@/util/slugify';

import CommonDatabaseFunctions from '../CommonDatabaseFunctions';
import Period from '../Period';
import Product from '../Product';

export default class Organisation extends CommonDatabaseFunctions {
  constructor(id) {
    super(id);

    this.collectionRef = db.collection('departments');
    this.ref = this.collectionRef.doc(id);
  }

  static create(data) {
    if (!data.name) throw new Error('Name must be set');
    if (!data.organization) throw new Error('Organization must be set');

    data.slug = slugify(data.name);

    super.create(data);
  }

  async update(data) {
    if (!data) throw new TypeError('Missing data');

    data.slug = slugify(data.name);

    super.update(data);
  }

  async delete() {
    // Delete affected periods
    db.collection('periods')
      .where('parent', '==', this.ref)
      .get()
      .then(({ docs }) => docs.forEach(({ ref }) => new Period(ref.id).delete()));

    // Delete affected products
    db.collection('products')
      .where('department', '==', this.ref)
      .get()
      .then(({ docs }) => docs.forEach(({ ref }) => new Product(ref.id).delete()));

    super.delete();
  }

  handleError(error) {
    // TODO: Show an error to the user
    console.error(error);

    return false;
  }
}
