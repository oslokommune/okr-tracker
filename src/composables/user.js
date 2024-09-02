import { computed, toRef } from 'vue';
import { useDocument } from 'vuefire';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { db } from '@/config/firebaseConfig';
import User from '@/db/User';
import metadata from '@/db/common/util/metadata';
import { doc, updateDoc } from 'firebase/firestore';

export function useTrackerUser(userId) {
  const toast = useToast();
  const i18n = useI18n();

  // User
  const _userId = toRef(userId);
  const userRef = computed(() => _userId.value && doc(db, 'users', _userId.value));

  const { data: user, pending: isLoading, promise: userPromise } = useDocument(userRef);

  // Privileges
  const isSuperAdmin = computed(() => Boolean(user.value && user.value.superAdmin));
  const isAdmin = computed(() =>
    Boolean(user.value && (user.value.superAdmin || user.value.admin?.length > 0))
  );

  // Actions
  async function update(data, options) {
    if (userRef.value) {
      try {
        data = { ...data, ...metadata.edited() };
        await updateDoc(userRef.value, data);
        if (!options?.toast === false) {
          toast.success(i18n.t('toaster.savedChanges'));
        }
        return true;
      } catch (error) {
        console.error(error);
        if (!options?.toast === false) {
          toast.error(i18n.t('toaster.error.save'));
        }
      }
    }
    return false;
  }

  async function remove() {
    if (user.value) {
      const { displayName } = user.value;
      try {
        // TODO: Move this logic here (and away from namespaced API)?
        await User.remove(user.value);
        toast.success(i18n.t('toaster.delete.user', { user: displayName }));
        return true;
      } catch {
        toast.error(i18n.t('toaster.error.user', { user: displayName }));
      }
    }
    return false;
  }

  return {
    user,
    userRef,
    userPromise,
    isLoading,
    isSuperAdmin,
    isAdmin,
    update,
    remove,
  };
}

export default useTrackerUser;
