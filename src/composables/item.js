import { computed, toRef } from 'vue';
import { useDocument } from 'vuefire';
import { doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export function useTrackerItem(itemPath) {
  // Item
  const _itemPath = toRef(itemPath);
  const itemRef = computed(() => _itemPath.value && doc(db, _itemPath.value));
  const { data: item, promise: itemPromise, pending: isLoading } = useDocument(itemRef);

  // Item type
  const itemType = computed(() => {
    if (item.value) {
      if (item.value.organization && item.value.department) {
        return 'product';
      }
      if (item.value.organization) {
        return 'department';
      }
      return 'organization';
    }

    return null;
  });

  const isOrganization = computed(() => itemType.value === 'organization');
  const isDepartment = computed(() => itemType.value === 'department');
  const isProduct = computed(() => itemType.value === 'product');

  return {
    item,
    itemRef,
    itemPromise,
    isLoading,
    itemType,
    isOrganization,
    isDepartment,
    isProduct,
  };
}

export default useTrackerItem;
