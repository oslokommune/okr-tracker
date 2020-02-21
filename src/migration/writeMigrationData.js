import { db } from '@/config/firebaseConfig';

const defaultData = {
  archived: false,
  created: new Date(),
  createdBy: 'system',
};

export default async function writeMigrationData(org) {
  const clone = { ...org, ...defaultData };
  delete clone.children;

  return db
    .collection('orgs')
    .add(clone)
    .then(response => org.children.map(child => writeDepartments(response, child)));
}

async function writeDepartments(ref, obj) {
  const clone = { ...obj, ...defaultData };
  delete clone.children;
  delete clone.objectives;

  const response = await ref.collection('departments').add(clone);

  await obj.children.map(child => writeProducts(response, child));
  await obj.objectives.map(child => writeObjectives(response, child));

  return true;
}

function writeProducts(ref, obj) {
  const clone = { ...obj, ...defaultData };
  delete clone.children;

  return ref
    .collection('products')
    .add(clone)
    .then(response => obj.children.map(child => writeObjectives(response, child)));
}

function writeObjectives(ref, obj) {
  const clone = { ...obj, ...defaultData };
  delete clone.children;

  return ref
    .collection('objectives')
    .add(clone)
    .then(response => obj.children.map(child => writeKeyResults(response, child)));
}

function writeKeyResults(ref, obj) {
  const clone = { ...obj, ...defaultData };
  delete clone.children;

  return ref
    .collection('keyResults')
    .add(clone)
    .then(response => obj.children.map(child => writeProgress(response, child)));
}

function writeProgress(ref, obj) {
  const clone = { ...obj, ...defaultData };
  delete clone.children;

  return ref.collection('progress').add(clone);
}
