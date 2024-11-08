import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useCollection, useDocument } from 'vuefire';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, collection, query, where } from 'firebase/firestore';
import { firestoreEncode } from '@/util/firebaseUtil';
import { db } from '@/config/firebaseConfig';
import { useTrackerItem } from '@/composables/item';

export const useActiveItemStore = defineStore('activeItem', () => {
  const router = useRouter();
  const route = useRoute();

  // Active item
  const slugIsLoading = ref(true);
  const itemSlug = computed(() => route.params?.slug);
  const itemPath = ref(null);

  const { data: slugDocument, promise: slugPromise } = useDocument(
    computed(() => itemSlug.value && doc(db, 'slugs', firestoreEncode(itemSlug.value))),
    { maxRefDepth: 0 }
  );

  watch(
    itemSlug,
    async () => {
      // Only trigger active item update on actual path change
      await slugPromise.value;

      itemPath.value = slugDocument.value?.reference;

      // Ensure item exist and is not archived
      if (itemPath.value) {
        const itemDocument = await getDoc(doc(db, itemPath.value));

        if (!itemDocument.exists() || itemDocument.data()?.archived === true) {
          await reject();
          return;
        }
      }

      if (itemSlug.value && !itemPath.value) {
        await reject();
      }

      slugIsLoading.value = false;
    },
    { immediate: true }
  );

  async function reject() {
    await router.replace({
      name: 'NotFound',
      // Preserve current path and remove the first char to avoid the target URL starting with `//`
      params: { pathMatch: route.path.substring(1).split('/') },
      // Preserve existing query and hash if any
      query: route.query,
      hash: route.hash,
    });
  }

  // Active item
  const activeItem = useTrackerItem(itemPath);
  const isLoading = computed(() => slugIsLoading.value || activeItem.isLoading.value);

  const children = useCollection(
    computed(() => {
      const { itemRef, isOrganization, isDepartment } = activeItem;

      return (
        itemRef.value &&
        (isOrganization.value || isDepartment.value) &&
        query(
          collection(db, isOrganization.value ? 'departments' : 'products'),
          where(
            isOrganization.value ? 'organization' : 'department',
            '==',
            itemRef.value
          ),
          where('archived', '==', false)
        )
      );
    }),
    { maxRefDepth: 1 }
  );

  return { ...activeItem, isLoading, children };
});

export default useActiveItemStore;
