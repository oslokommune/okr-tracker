import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useCollection } from 'vuefire';
import { collection, orderBy, query } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuthStore } from '@/store/auth';

export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore();

  // Users
  const users = useCollection(
    computed(
      () =>
        authStore.isAdmin && query(collection(db, 'users'), orderBy('displayName', 'asc'))
    ),
    { ssrKey: 'users' }
  );

  // Items
  const itemQuery = (collectionPath) =>
    authStore.isAdmin &&
    query(
      collection(db, collectionPath),
      orderBy('archived', 'asc'),
      orderBy('name', 'asc')
    );

  const isItemAdmin = (item) => {
    if (authStore.isSuperAdmin) {
      return true;
    }
    if (item.organization) {
      return authStore.user.admin.includes(item.organization.split('/')[1]);
    }
    return authStore.user.admin.includes(item.id);
  };

  const filterItems = (items) => items.filter((i) => isItemAdmin(i));

  const _organizations = useCollection(
    computed(() => itemQuery('organizations')),
    { maxRefDepth: 0, ssrKey: 'organizations' }
  );
  const organizations = computed(() => filterItems(_organizations.value));

  const _departments = useCollection(
    computed(() => itemQuery('departments')),
    { maxRefDepth: 0, ssrKey: 'departments' }
  );
  const departments = computed(() => filterItems(_departments.value));

  const _products = useCollection(
    computed(() => itemQuery('products')),
    { maxRefDepth: 0, ssrKey: 'products' }
  );
  const products = computed(() => filterItems(_products.value));

  return {
    users,
    organizations,
    departments,
    products,
  };
});

export default useAdminStore;
