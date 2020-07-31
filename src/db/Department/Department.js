import { db } from '@/config/firebaseConfig';
import props from './props';
import {
  validateCreateProps,
  slugify,
  createDocument,
  validateUpdateProps,
  updateDocument,
  deleteDocument,
} from '../common';
import Period from '../Period';
import Product from '../Product';

const collection = db.collection('departments');

const create = async data => {
  if (!(await validateCreateProps(props, data))) {
    throw new Error('Invalid data');
  }

  data.slug = slugify(data.name);
  return createDocument(collection, data);
};

const update = async (id, data) => {
  validateUpdateProps(props, data);

  if (data.name) {
    data.slug = slugify(data.name);
  }

  return updateDocument(collection.doc(id), data);
};

const archive = id => update(id, { archived: true });
const restore = id => update(id, { archived: false });

const deleteDeep = async id => {
  // Delete affected periods
  db.collection('periods')
    .where('parent', '==', collection.doc(id))
    .get()
    .then(({ docs }) => docs.forEach(({ ref }) => Period.deleteDeep(ref.id)));

  // Delete affected products
  db.collection('products')
    .where('department', '==', collection.doc(id))
    .get()
    .then(({ docs }) => docs.forEach(({ ref }) => Product.deleteDeep(ref.id)));

  return deleteDocument(update, collection.doc(id));
};

export default { create, update, archive, restore, deleteDeep };
