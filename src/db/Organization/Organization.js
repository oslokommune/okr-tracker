import { db } from '@/config/firebaseConfig';
import props from './props';
import { validateCreateProps, createDocument, validateUpdateProps, updateDocument, UploadImage } from '../common';

const collection = db.collection('organizations');

const create = (data) => {
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }

  return createDocument(collection, data);
};

const update = (id, data) => {
  validateUpdateProps(props, data);
  return updateDocument(collection.doc(id), data);
};

const archive = (id) => update(id, { archived: true });
const restore = (id) => update(id, { archived: false });

const deleteDeep = () => {
  throw new Error('Organizations can only be deleted from the Firestore console');
};

const uploadImage = (id, image) => UploadImage(id, image, 'organizations');

export default { create, update, archive, restore, deleteDeep, uploadImage };
