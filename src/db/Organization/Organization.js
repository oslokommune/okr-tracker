import { db } from '@/config/firebaseConfig';
import props from './props';
import { validateCreateProps, createDocument, validateUpdateProps, slugify, updateDocument } from '../common';

const collection = db.collection('organizations');

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

const deleteDeep = () => {
  throw new Error('Organizations can only be deleted from the Firestore console');
};

export default { create, update, archive, restore, deleteDeep };
