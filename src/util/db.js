// eslint-disable-next-line import/no-cycle
import store from '@/store';
import { db, auth, dashboardUser } from '../config/firebaseConfig';
import router from '../router';

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
    .catch(error => {
      throw new Error(error);
    });
}

/**
 * Finds the product with the provided slug and
 * adds a listener for changes on the object.
 * Binds the changes to `this.product` on the caller.
 * @param {String} slug - product slug
 * @returns {void}
 */
export function productListener(slug) {
  db.collectionGroup('products')
    .where('slug', '==', slug)
    .onSnapshot(async d => {
      if (!d.docs.length) return;
      const productData = await d.docs[0].ref.get();
      this.product = serializeDocument(productData);
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
  const isDashboardUser = doc.id === dashboardUser;
  return { id: doc.id, ref: doc.ref, isDashboardUser, ...doc.data() };
}

/**
 * Checks whether the signed in user is a team member of a product.
 * @param {String or FirebaseRef} slugOrRef - May be either a slug (string) or a Firestore reference
 * @return {boolean}
 */
export async function isTeamMemberOfProduct(slugOrRef) {
  const { email } = auth.currentUser;
  let teamMembers;

  if (await isAdmin()) return true;

  if (typeof slugOrRef === 'string') {
    teamMembers = await db
      .collectionGroup('products')
      .where('slug', '==', slugOrRef)
      .get()
      .then(snapshot => snapshot.docs[0])
      .then(serializeDocument)
      .then(d => (d && d.team ? d.team.map(doc => doc.id) : []))
      .catch(err => {
        throw new Error(err);
      });
  } else {
    // 'ref'  be a
    console.log(slugOrRef);
  }

  return teamMembers.includes(email);
}

/**
 * Runs whenever the Firebase auth user state changes.
 * - Sets the user object to vuex
 * - Handle automatic route change
 * @param {UserObject} user
 * @return {void}
 */
export async function handleUserAuthStateChange(user) {
  if (!user) {
    store.commit('set_user', null);
  } else if (await isWhiteListed(user)) {
    store.dispatch('initializeApp');

    updateUserObject(user);
    db.collection('users')
      .doc(user.email)
      .onSnapshot(snapshot => {
        store.commit('set_user', serializeDocument(snapshot));
      });
  } else {
    auth.signOut().then(() => {
      store.commit('set_user', null);
      router.push({ name: 'login', params: { error: 1 } });
    });
  }
}

/**
 * Checks if the provided user is whitelisted
 * @param {Object} user -
 * @returns {Boolean} true/false
 */
async function isWhiteListed(user) {
  return db
    .collection('users')
    .doc(user.email)
    .get()
    .then(doc => doc.exists);
}

/**
 * Binds all organisations to `this.orgs` at caller
 * returns {void}
 */
export async function getOrgs() {
  const ref = await db.collection('orgs');

  ref.onSnapshot(snapshot => {
    this.orgs = snapshot.docs.map(doc => ({ ...{ id: doc.id }, ...doc.data() }));
    this.selectedOrgId = this.orgs[0].id;

    getDepartments.call(this, this.selectedOrgId);
  });
}

/**
 * Binds all departments to `this.depts` at caller
 * @param {String} orgId - Organisation id
 * @returns {void}
 */
export async function getDepartments(orgId) {
  const ref = db.collection(`orgs/${orgId}/departments`);

  ref.onSnapshot(snapshot => {
    this.depts = snapshot.docs.map(doc => ({ ...{ id: doc.id }, ...doc.data() }));
  });
}

/**
 * Binds all matching products to `this.products` at caller
 * @param {String} org - Organisation id
 * @param {String} dept - Department id
 * @returns {void}
 */
export async function getProducts(org, dept) {
  const collectionRef = db.collection(`orgs/${org}/departments/${dept}/products`).where('archived', '==', false);

  collectionRef.onSnapshot(snapshot => {
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
    .then(d => d.data().admin);
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
  return Promise.all(promises);
};
