import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { useCurrentUser } from 'vuefire';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import defaultPreferences from '@/db/User/defaultPreferences';
import { useTrackerUser } from '@/composables/user';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const route = useRoute();
  const i18n = useI18n();
  const toast = useToast();

  // User
  const currentUser = useCurrentUser();
  const userId = computed(() => currentUser.value?.email);

  const trackerUser = useTrackerUser(userId);
  const isLoggedIn = computed(() => Boolean(currentUser.value && trackerUser.user.value));

  const authenticationProviders = computed(() =>
    import.meta.env.VITE_LOGIN_PROVIDERS.split('-')
  );
  const authenticationError = ref(null);
  const isAuthenticating = ref(false);

  watch(trackerUser.user, async () => {
    if (!trackerUser.user.value) {
      if (currentUser.value) {
        await rejectAccess();
      }

      if (route.name !== 'Login') {
        await router.push({ name: 'Login', query: { redirectFrom: route.fullPath } });
      }
    } else {
      // Update display name if not set
      if (!trackerUser.user.value?.displayName && currentUser.value?.displayName) {
        await trackerUser.update({ displayName: currentUser.value.displayName });
      }

      // Redirect user
      if (route.name === 'Login') {
        const { redirectFrom } = route.query;
        await router.push(redirectFrom ? { path: redirectFrom } : { name: 'Home' });
      }
    }
  });

  // Preferences
  const preferences = computed(
    () => trackerUser.user.value && trackerUser.user.value.preferences
  );

  const homeOrganization = computed({
    get: () => preferences.value?.homeOrganization,
    set: async (slug) => {
      const prefs = preferences.value ? preferences.value : defaultPreferences;
      prefs.homeOrganization = slug;
      await trackerUser.update({ preferences: prefs }, { toast: false });
    },
  });

  const language = computed(() => preferences.value && preferences.value.lang);

  // Actions
  async function signIn(method) {
    isAuthenticating.value = true;
    authenticationError.value = null;

    try {
      const { user } = await method;
      await trackerUser.userPromise.value;

      if (!trackerUser.user.value) {
        await rejectAccess();
      } else {
        toast.success(
          i18n.t('toaster.welcome', { user: user.displayName ? user.displayName : '' })
        );
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        authenticationError.value = 3;
      } else if (error.code === 'auth/user-not-found') {
        authenticationError.value = 4;
      } else if (error.code === 'auth/popup-closed-by-user') {
        authenticationError.value = 5;
      } else {
        authenticationError.value = 2;
      }
    }

    isAuthenticating.value = false;
  }

  async function signInWithProvider(provider) {
    await signIn(signInWithPopup(auth, provider));
  }

  async function signInWithEmail(email, password) {
    await signIn(signInWithEmailAndPassword(auth, email, password));
  }

  async function signOut() {
    if (route.name !== 'Login') {
      await router.push({ name: 'Login' });
    }
    await auth.signOut();
  }

  async function rejectAccess() {
    // User is not an registered tracker user
    authenticationError.value = 1;
    await auth.signOut();
  }

  return {
    ...trackerUser,
    authenticationProviders,
    authenticationError,
    isAuthenticating,
    isLoggedIn,
    preferences,
    language,
    homeOrganization,
    signInWithProvider,
    signInWithEmail,
    signOut,
  };
});

export default useAuthStore;
