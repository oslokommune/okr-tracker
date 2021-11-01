import { getFirestore } from 'firebase-admin/firestore';

import slugify from './slugify.js';

const handleSlugs = async ({ before, after }) => {
  const db = getFirestore();

  const created = before.data() === undefined;
  const deleted = after.data() === undefined;
  const updated = before.data() !== undefined && after.data() !== undefined;

  let slug;

  if (created) {
    slug = slugify(after.data().name);

    if (await slugExists(slug, db)) {
      slug += '-';
      slug += after.id;
    }

    after.ref.update({ slug });
    db.collection('slugs').doc(slug).set({ reference: after.ref });
  }

  if (deleted) {
    slug = await before.data().slug;
    db.collection('slugs').doc(slug).delete();
  }

  if (updated) {
    const oldName = before.data().name;
    const newName = after.data().name;

    // No change
    if (oldName === newName) {
      return true;
    }

    slug = slugify(newName);

    // remove old slug
    await db
      .collection('slugs')
      .where('reference', '==', after.ref)
      .get()
      .then((snapshot) => snapshot.docs.forEach((doc) => doc.ref.delete()));

    if (await slugExists(slug, db)) {
      slug += `-${after.id}`;
    }

    db.collection('slugs').doc(slug).set({ reference: after.ref });
    after.ref.update({ slug });
  }

  return true;
};

/**
 * Checks whether a slug already exists
 * @param {string} slug - slug
 * @param {object} db - database reference
 * @returns {Promise} - resolves true/false
 */
async function slugExists(slug, db) {
  return db
    .collection('slugs')
    .doc(slug)
    .get()
    .then(({ exists }) => exists);
}

export default handleSlugs;
