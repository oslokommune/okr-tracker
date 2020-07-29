import { db } from '@/config/firebaseConfig';
import slugify from '@/util/slugify';
import CommonDatabaseFunctions from '../CommonDatabaseFunctions';
import Period from '../Period';
import Kpi from '../Kpi';

export default class Product extends CommonDatabaseFunctions {
  constructor(id) {
    super(id);

    this.collectionRef = db.collection('products');
    this.ref = this.collectionRef.doc(id);
  }

  static create(data) {
    if (!data.name) throw new Error('Name must be provided');

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

    // Delete affected KPIs
    db.collection('kpis')
      .where('parent', '==', this.ref)
      .get()
      .then(({ docs }) => docs.forEach(({ ref }) => new Kpi(ref.id).delete()));

    super.delete();
  }

  handleError(error) {
    // TODO: Show an error to the user
    console.error(error);

    return false;
  }
}
