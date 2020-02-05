import { db, auth, dashboardUser } from '../config/firebaseConfig';
import * as Toast from '../util/toasts';
import { errorHandler } from '../util/utils';

// firebase collections
const usersCollection = db.collection('users');

/**
 * Updates the provided user with the data on its object
 * @param {Object} user - user to be updated
 * @return {Promise}
 */
export function updateUserObject(user) {
  const userRef = usersCollection.doc(user.email);

  return db
    .runTransaction(transaction => {
      return transaction.get(userRef).then(doc => {
        if (!doc.exists) throw new Error('Document does not exist!');

        const currentUserData = doc.data();
        const { displayName, photoURL, email } = user;
        const googleUserData = { displayName, photoURL, email };
        const newData = { ...googleUserData, ...currentUserData };

        transaction.update(userRef, newData);
      });
    })
    .catch(errorHandler);
}

/**
 * Finds the product with the provided slug and
 * adds a listener for changes on the object.
 * Binds the changes to `this.product` on the caller.
 * @param {String} slug - product slug
 * @returns {Function} - Unsubscribe
 */
export function productListener(slug) {
  return db
    .collectionGroup('products')
    .where('slug', '==', slug)
    .onSnapshot(async d => {
      if (!d.docs.length) return;
      const productData = await d.docs[0].ref.get().catch(errorHandler);
      this.product = serializeDocument(productData);
    });
}

/**
 * Finds the product with the provided slug and
 * adds a listener for changes on the object.
 * Binds the changes to `this.product` on the caller.
 * @param {String} slug - product slug
 * @returns {Function} - Unsubscribe
 */
export function departmentListener(slug) {
  return db
    .collectionGroup('departments')
    .where('slug', '==', slug)
    .onSnapshot(async d => {
      if (!d.docs.length) return;
      const departmentData = await d.docs[0].ref.get().catch(errorHandler);
      this.department = serializeDocument(departmentData);
    });
}

/**
 * Converts a Firebase document to a serialized object with the id and
 * Firebase reference injected as properties
 * @param {FirebaseDoc} doc
 * @returns {Object}
 */
export function serializeDocument(doc) {
  if (!doc) return;
  return {
    id: doc.id,
    ref: doc.ref,
    isDashboardUser: isDashboardUser(),
    ...doc.data(),
  };
}

/**
 * Checks whether the signed in user is a team member of a product.
 * @param {String or FirebaseRef} slugOrRef - May be either a slug (string) or a Firestore reference
 * @return {boolean}
 */
export async function isTeamMemberOfProduct(slugOrRef) {
  const admin = await isAdmin();
  if (admin) return true;

  const { email } = auth.currentUser;
  let teamMembers;

  if (typeof slugOrRef === 'string') {
    teamMembers = await db
      .collectionGroup('products')
      .where('slug', '==', slugOrRef)
      .get()
      .then(snapshot => snapshot.docs[0])
      .then(serializeDocument)
      .then(d => (d && d.team ? d.team.map(doc => doc.id) : []))
      .catch(errorHandler);
  } else {
    // 'ref'  be a
    console.log({ slugOrRef });
    return;
  }

  return teamMembers.includes(email);
}

/**
 * Binds all organisations to `this.orgs` at caller
 * @returns {Function} - Unsubscribe
 */
export async function getOrgs(includeArchived = false) {
  const ref = await db.collection('orgs');

  return ref.onSnapshot(snapshot => {
    this.orgs = snapshot.docs.map(doc => ({ ...{ id: doc.id }, ...doc.data() }));
    this.selectedOrgId = this.orgs[0].id;

    getDepartments.call(this, this.selectedOrgId, includeArchived);
  });
}

/**
 * Binds all departments to `this.depts` at caller
 * @param {String} orgId - Organisation id
 * @returns {Function} - Unsubscribe
 */
export async function getDepartments(orgId, includeArchived = false) {
  let ref = db.collection(`orgs/${orgId}/departments`);

  if (!includeArchived) {
    ref = ref.where('archived', '==', false);
  }

  return ref.onSnapshot(snapshot => {
    this.depts = snapshot.docs.map(doc => ({ ...{ id: doc.id }, ...doc.data() }));
  });
}

/**
 * Binds all matching products to `this.products` at caller
 * @param {String} org - Organisation id
 * @param {String} dept - Department id
 * @returns {Function} - Unsubscribe
 */
export async function getProducts(org, dept, includeArchived = false) {
  let collectionRef = db.collection(`orgs/${org}/departments/${dept}/products`);

  if (!includeArchived) {
    collectionRef = collectionRef.where('archived', '==', false);
  }

  return collectionRef.onSnapshot(snapshot => {
    this.products = snapshot.docs.map(doc => ({ ...{ id: doc.id }, ...doc.data() }));
  });
}

/**
 * @return {Boolean} - isAdmin?
 */
export async function isAdmin() {
  const { email } = auth.currentUser;
  return db
    .collection('users')
    .doc(email)
    .get()
    .then(d => d.data().admin)
    .catch(errorHandler);
}

/**
 * Initiates a chain reaction for finding Organisations, Departments and Products
 * and generates a nested structure
 * @returns {Array}
 */
export const getNestedData = () => {
  return getChildren(db, 'orgs', getOrgData);
};

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
  return { id: product.id, ref: product.ref, ...product.data() };
}

/**
 *
 * @param {FirebaseReference} ref - Document for which to find children
 * @param {String} collectionName - Name of the collection holding the children
 * @param {Function} callback - Callback function for each child
 * @return {Array}
 */
const getChildren = async (ref, collectionName, callback) => {
  const snapshot = await ref
    .collection(collectionName)
    .where('archived', '==', false)
    .get();
  const promises = snapshot.docs.map(callback);
  return Promise.all(promises)
    .then(list =>
      list.sort((a, b) => {
        if (a.name > b.name) return 1;
        if (b.name > a.name) return -1;
        return 0;
      })
    )
    .catch(errorHandler);
};

/**
 * Binds all products that the current user is
 * a member of to `this.products` on the caller
 * @returns {void}
 */
export async function myProductsListener() {
  const { email } = auth.currentUser;

  const userRef = await db.collection('users').doc(email);

  return db
    .collectionGroup('products')
    .where('team', 'array-contains', userRef)
    .get()
    .then(d => d.docs.map(serializeDocument))
    .catch(errorHandler);
}

export function isDashboardUser() {
  return auth.currentUser.email === dashboardUser;
}

export async function unDelete(ref) {
  return ref
    .update({ archived: false })
    .then(Toast.revertedDeletion)
    .catch(errorHandler);
}
