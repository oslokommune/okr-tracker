import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useCollection } from 'vuefire';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuthStore } from '@/store/auth';
import { useTrackerStore } from '@/store/tracker';

export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore();
  const trackerStore = useTrackerStore();

  // Users
  const users = useCollection(
    computed(
      () =>
        authStore.isLoggedIn &&
        query(collection(db, 'users'), orderBy('displayName', 'asc'))
    ),
    { ssrKey: 'users' }
  );

  // Items
  const organizations = computed(() => trackerStore.organizations);

  const departments = useCollection(
    computed(
      () =>
        authStore.isLoggedIn &&
        query(
          collection(db, 'departments'),
          where('archived', '==', false),
          orderBy('name', 'asc')
        )
    ),
    { ssrKey: 'departments' }
  );

  return {
    users,
    organizations,
    departments,
  };
});

export default useAdminStore;
