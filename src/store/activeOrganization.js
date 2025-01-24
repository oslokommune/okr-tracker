import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useCollection } from 'vuefire';
import { doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useActiveItemStore } from '@/store/activeItem';
import { useTrackerItem } from '@/composables/item';
import { firestoreEncode } from '@/util/firebaseUtil';
import { buildOrganizationTree, buildChildSourceQuery } from '@/util/organization';

export const useActiveOrganizationStore = defineStore('activeOrganization', () => {
  const activeItemStore = useActiveItemStore();

  // Active organization
  const organizationId = ref(null);
  const organizationRef = computed(
    () =>
      organizationId.value &&
      doc(db, 'organizations', firestoreEncode(organizationId.value))
  );

  const organizationPath = computed(
    () => organizationRef.value && organizationRef.value.path
  );
  const { item: organization, isLoading } = useTrackerItem(organizationPath);
  const organizationSlug = computed(() => organization.value && organization.value.slug);

  function setOrganization(id) {
    if (id !== organizationId.value) {
      organizationId.value = id;
    }
  }

  watch(
    () => activeItemStore.item,
    async () => {
      // Keep active organization in sync with active item
      await activeItemStore.itemPromise;
      if (activeItemStore.item) {
        setOrganization(
          activeItemStore.item?.organization
            ? activeItemStore.item.organization.id
            : activeItemStore.item.id
        );
      }
    },
    { immediate: true }
  );

  // Children
  const departments = useCollection(
    computed(() => buildChildSourceQuery(db, organizationRef.value, 'departments'))
  );
  const products = useCollection(
    computed(() => buildChildSourceQuery(db, organizationRef.value, 'products'))
  );

  // Organization tree
  const organizationTree = computed(() =>
    buildOrganizationTree(organization.value, departments.value, products.value)
  );

  return {
    organizationSlug,
    organizationRef,
    isLoading,
    setOrganization,
    organization,
    departments,
    products,
    organizationTree,
  };
});

export default useActiveOrganizationStore;
