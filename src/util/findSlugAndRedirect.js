import { db } from '@/config/firebaseConfig';
import router from '@/router';

/**
 * Finds the slug for the provided document and redirects to it.
 * Waits a delay in order for the Cloud function to insert an entry in
 * the Slugs collection.
 * @param {FirestoreDocumentReference} reference
 */
export default function findSlugAndRedirect(reference) {
  const delay = 100;

  setTimeout(async () => {
    const slug = await db
      .collection('slugs')
      .where('reference', '==', reference)
      .get()
      .then(snapshot => snapshot.docs[0].id);

    router.push({ name: 'ItemHome', params: { slug } });
  }, delay);
}
