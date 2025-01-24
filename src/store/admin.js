import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useCollection } from 'vuefire';
import { collection, orderBy, query } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';
import { db } from '@/config/firebaseConfig';
import { useAuthStore } from '@/store/auth';

export const useAdminStore = defineStore('admin', () => {
  const i18n = useI18n();
  const authStore = useAuthStore();

  // Users
  const _users = useCollection(
    computed(() => authStore.isAdmin && query(collection(db, 'users'))),
    { ssrKey: 'users' }
  );
  const users = computed(() =>
    _users.value.slice().sort((a, b) => {
      return (a.displayName || a.email).localeCompare(
        b.displayName || b.email,
        i18n.locale.value
      );
    })
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

  const filterItems = (items) =>
    items
      .filter((i) => isItemAdmin(i))
      .sort((a, b) => a.name.localeCompare(b.name, i18n.locale.value));

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
