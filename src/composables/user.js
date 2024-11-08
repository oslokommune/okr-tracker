import { computed, toRef } from 'vue';
import { useCollection, useDocument } from 'vuefire';
import { collection, query, where, doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export function useTrackerUser(userId) {
  // User
  const _userId = toRef(userId);
  const userRef = computed(() => _userId.value && doc(db, 'users', _userId.value));

  const { data: user, pending: isLoading, promise: userPromise } = useDocument(userRef);

  // Memberships
  const membershipQuery = (collectionName, _userRef) =>
    query(
      collection(db, collectionName),
      where('team', 'array-contains', _userRef),
      where('archived', '==', false)
    );

  const organizations = useCollection(
    computed(() => userRef.value && membershipQuery('organizations', userRef.value)),
    { maxRefDepth: 0, ssrKey: `user_${userId}_organizations` }
  );

  const departments = useCollection(
    computed(() => userRef.value && membershipQuery('departments', userRef.value)),
    { maxRefDepth: 0, ssrKey: `user_${userId}_departments` }
  );

  const products = useCollection(
    computed(() => userRef.value && membershipQuery('products', userRef.value)),
    { maxRefDepth: 0, ssrKey: `user_${userId}_products` }
  );

  return {
    user,
    userRef,
    userPromise,
    isLoading,
    organizations,
    departments,
    products,
  };
}

export default useTrackerUser;
