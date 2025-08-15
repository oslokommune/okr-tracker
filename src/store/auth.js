import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { useCurrentUser } from 'vuefire';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import User from '@/db/User';
import defaultPreferences from '@/db/User/defaultPreferences';
import { useActiveOrganizationStore } from '@/store/activeOrganization';
import { useActiveItemStore } from '@/store/activeItem';
import { useTrackerUser } from '@/composables/user';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const route = useRoute();
  const i18n = useI18n();
  const toast = useToast();

  const organizationStore = useActiveOrganizationStore();

  // User
  const firbaseUser = useCurrentUser();
  const userId = computed(() => firbaseUser.value?.email);

  const trackerUser = useTrackerUser(userId);
  const user = computed(() => trackerUser.user.value);
  const isLoggedIn = computed(() => Boolean(firbaseUser.value && trackerUser.user.value));

  const authenticationProviders = computed(() =>
    import.meta.env.VITE_LOGIN_PROVIDERS.split('-')
  );
  const authenticationError = ref(null);
  const isAuthenticating = ref(false);

  const preferences = computed(
    () => user.value && (user.value.preferences || defaultPreferences)
  );
  const home = computed({
    get() {
      return preferences.value && preferences.value.homeOrganization;
    },
    async set(slug) {
      const prefs = preferences.value;
      prefs.homeOrganization = slug || null;
      await User.update(user.value, { preferences: prefs });
    },
  });
  const language = computed(() => preferences.value && preferences.value.lang);

  watch(trackerUser.user, async () => {
    if (!trackerUser.user.value) {
      if (firbaseUser.value) {
        await rejectAccess();
      }

      if (route.name !== 'Login') {
        await router.push({ name: 'Login', query: { redirectFrom: route.fullPath } });
      }

      // Unset active organization
      organizationStore.setOrganization(null);
    } else {
      // Update display name if not set
      if (!trackerUser.user.value?.displayName && firbaseUser.value?.displayName) {
        await User.update(user.value, { displayName: firbaseUser.value.displayName });
      }

      // Redirect user
      if (route.name === 'Login') {
        const { redirectFrom } = route.query;
        await router.push(redirectFrom ? { path: redirectFrom } : { name: 'Home' });
      }
    }
  });

  // Privileges
  const isSuperAdmin = computed(() => Boolean(user.value && user.value.superAdmin));
  const isAdmin = computed(() =>
    Boolean(user.value && (user.value.superAdmin || user.value.admin?.length > 0))
  );

  const isMemberOfCurrentItemOrganization = computed(() => {
    /**
     * Return `true` if the current user is a member of the current
     * organization or its children.
     */

    const { organization, departments, products } = organizationStore;

    if (!user.value?.id || !organization) {
      return false;
    }

    if (organization.team.map(({ id }) => id).includes(user.value.id)) {
      return true;
    }

    for (const department of departments) {
      if (department.team.map(({ id }) => id).includes(user.value.id)) {
        return true;
      }
    }

    for (const product of products) {
      if (product.team.map(({ id }) => id).includes(user.value.id)) {
        return true;
      }
    }

    return false;
  });

  const isAdminOfCurrentItemOrganization = computed(() => {
    /**
     * Returns `true` if the current user is an admin of the currently active
     * item's organization, whether the item is the organization itself or
     * its parent.
     */
    const { item } = useActiveItemStore();

    if (!user.value || !item) {
      return false;
    }

    return (
      user.value.admin?.includes(item.organization ? item.organization.id : item.id) ||
      false
    );
  });

  const hasEditRights = computed(() => {
    /**
     * Returns `true` if the current user has admin rights or is member of
     * the currently active item.
     */
    const { item } = useActiveItemStore();

    if (!user.value || !item) {
      return false;
    }

    if (isSuperAdmin.value || isAdminOfCurrentItemOrganization.value) {
      return true;
    }

    if (!item.team) {
      return false;
    }

    return item.team.map(({ id }) => id).includes(user.value.id);
  });

  const hasParentEditRights = computed(() => {
    /**
     * Return `true` if the current user is an admin of the active item or a
     * member of its parent item.
     */
    const { item, isProduct, isDepartment } = useActiveItemStore();

    if (!user.value || !item) {
      return false;
    }

    if (isSuperAdmin.value || isAdminOfCurrentItemOrganization.value) {
      return true;
    }

    if (isProduct && item.department.team) {
      return item.department.team
        .map((userDoc) => userDoc.split('/')[1])
        .includes(user.value.id);
    }

    if (isDepartment && item.organization.team) {
      return item.organization.team
        .map((userDoc) => userDoc.split('/')[1])
        .includes(user.value.id);
    }

    return false;
  });

  // Actions
  async function signIn(method) {
    isAuthenticating.value = true;
    authenticationError.value = null;

    try {
      const { user: firebaseUser } = await method;
      await trackerUser.userPromise.value;

      if (!trackerUser.user.value) {
        await rejectAccess();
      } else {
        toast.success(
          i18n.t('toaster.welcome', {
            user: firebaseUser.displayName ? firebaseUser.displayName : '',
          })
        );
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        authenticationError.value = 3;
      } else if (error.code === 'auth/user-not-found') {
        authenticationError.value = 4;
      } else if (error.code === 'auth/popup-closed-by-user') {
        authenticationError.value = 5;
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        authenticationError.value = 6;
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

    isAdmin,
    isSuperAdmin,
    isAdminOfCurrentItemOrganization,
    hasEditRights,
    hasParentEditRights,
    isMemberOfCurrentItemOrganization,

    preferences,
    home,
    language,
    signInWithProvider,
    signInWithEmail,
    signOut,
  };
});

export default useAuthStore;
