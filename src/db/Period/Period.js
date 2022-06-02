import { db } from '@/config/firebaseConfig';
import props from './props';
import { validateCreateProps, validateUpdateProps, createDocument, updateDocument } from '../common';
import Objective from '../Objective';

const collection = db.collection('periods');

const create = (data) => {
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }
  data.progression = 0;
  return createDocument(collection, data);
};

const update = (id, data) => {
  validateUpdateProps(props, data);
  return updateDocument(collection.doc(id), data);
};

const archive = (id) => {
  db.collection('objectives')
    .where('period', '==', collection.doc(id))
    .get()
    .then(({ docs }) =>
      docs.forEach(({ ref }) => {
        Objective.archive(ref.id);
      })
    );

  update(id, { archived: true });
};
const restore = (id) => update(id, { archived: false });

export default { create, update, archive, restore };
