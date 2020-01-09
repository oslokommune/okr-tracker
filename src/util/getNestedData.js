import { db } from '../config/firebaseConfig';

export default async function() {
  return getChildren(db, 'orgs', getOrgData);
}

async function getOrgData(organisation) {
  const { ref } = organisation;
  const departments = await getChildren(ref, 'departments', getDeptData);
  return { departments, ...organisation.data() };
}

async function getDeptData(department) {
  const { ref } = department;
  const products = await getChildren(ref, 'products', getProductData);
  return { products, ...department.data() };
}

async function getProductData(product) {
  return { id: product.id, ...product.data() };
}

async function getChildren(ref, collectionName, callback) {
  const snapshot = await ref.collection(collectionName).get();
  const promises = snapshot.docs.map(callback);
  return Promise.all(promises);
}
