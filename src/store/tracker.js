import { computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useCollection } from 'vuefire';
import { useI18n } from 'vue-i18n';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { setLanguage } from '@/locale/i18n';
import { useAuthStore } from '@/store/auth';

export const useTrackerStore = defineStore('tracker', () => {
  const i18n = useI18n();

  const authStore = useAuthStore();

  // App
  const appOwner = computed(() => import.meta.env.VITE_ORGANIZATION);
  const appVersion = computed(() => __APP_VERSION__); // eslint-disable-line no-undef

  const language = computed(() => authStore.language || i18n.locale.value);

  watch(
    language,
    () => {
      if (language.value !== i18n.locale.value) {
        setLanguage(language.value);
      }
    },
    { immediate: true }
  );

  // Items (organizations, departments and products)
  const itemQuery = (collectionName) =>
    query(collection(db, collectionName), where('archived', '==', false));

  const organizations = useCollection(
    computed(() => authStore.isLoggedIn && itemQuery('organizations'))
  );

  const departments = useCollection(
    computed(() => authStore.isLoggedIn && itemQuery('departments'))
  );

  const products = useCollection(
    computed(() => authStore.isLoggedIn && itemQuery('products'))
  );

  // Users
  const users = useCollection(
    computed(() => authStore.isLoggedIn && collection(db, 'users'))
  );

  return {
    appOwner,
    appVersion,
    language,
    organizations,
    departments,
    products,
    users,
  };
});

export default useTrackerStore;
