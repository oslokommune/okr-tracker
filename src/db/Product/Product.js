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
import Kpi from '../Kpi';

const collection = db.collection('products');

const create = async data => {
  if (!(await validateCreateProps(props, data))) {
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
  db.collection('periods')
    .where('parent', '==', collection.doc(id))
    .get()
    .then(({ docs }) => docs.forEach(({ ref }) => Period.deleteDeep(ref.id)));

  // Delete affected KPIs
  db.collection('kpis')
    .where('parent', '==', collection.doc(id))
    .get()
    .then(({ docs }) => docs.forEach(({ ref }) => Kpi.deleteDeep(ref.id)));

  return deleteDocument(update, collection.doc(id));
};

const uploadImage = (id, image) => {
  return UploadImage(id, image, 'products');
};

export default { create, update, archive, restore, deleteDeep, uploadImage };
