const admin = require('firebase-admin');

const slugify = require('./slugify');

const db = admin.firestore();

module.exports = async function handleSlugs({ before, after }) {
  const created = before.data() === undefined;
  const deleted = after.data() === undefined;
  const updated = before.data() !== undefined && after.data() !== undefined;

  let slug;

  if (created) {
    slug = slugify(after.data().name);

    if (await slugExists(slug)) {
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

    if (await slugExists(slug)) {
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
 * @param {object} ref - document reference
 * @returns {Promise} - resolves true/false
 */
async function slugExists(slug) {
  return db
    .collection('slugs')
    .doc(slug)
    .get()
    .then(({ exists }) => exists);
}
