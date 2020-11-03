import { db } from '@/config/firebaseConfig';
import props from './props';
import {
  validateCreateProps,
  createDocument,
  validateUpdateProps,
  updateDocument,
  deleteDocument,
  UploadImage,
} from '../common';
import Period from '../Period';
import Product from '../Product';

const collection = db.collection('departments');

const create = data => {
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }

  return createDocument(collection, data);
};

const update = async (id, data) => {
  validateUpdateProps(props, data);
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

const uploadImage = (id, image) => {
  return UploadImage(id, image, 'departments');
};

export default { create, update, archive, restore, deleteDeep, uploadImage };
