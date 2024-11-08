import { computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useCollection } from 'vuefire';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { setLanguage } from '@/locale/i18n';
import { useAuthStore } from '@/store/auth';

export const useTrackerStore = defineStore('tracker', () => {
  const i18n = useI18n();

  const authStore = useAuthStore();

  // App
  const owner = computed(() => import.meta.env.VITE_ORGANIZATION);
  const version = computed(() => __APP_VERSION__); // eslint-disable-line no-undef

  // Language
  const language = computed(() => {
    if (
      authStore.language &&
      Object.keys(i18n.messages.value).includes(authStore.language)
    ) {
      return authStore.language;
    }
    return i18n.locale.value;
  });

  watch(
    language,
    () => {
      if (language.value !== i18n.locale.value) {
        setLanguage(language.value);
      }
    },
    { immediate: true }
  );

  // Organizations
  const organizations = useCollection(
    computed(
      () =>
        authStore.isLoggedIn &&
        query(collection(db, 'organizations'), where('archived', '==', false))
    ),
    { ssrKey: 'organizations', wait: true, maxRefDepth: 1 }
  );

  // Home organization
  const homeOrganization = computed({
    get() {
      return organizations.value.find((o) => o.slug === authStore.home);
    },
    set(slug) {
      authStore.home = organizations.value.find((o) => o.slug === slug)?.slug;
    },
  });

  return {
    owner,
    version,
    language,
    organizations,
    homeOrganization,
  };
});

export default useTrackerStore;
