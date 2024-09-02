import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useCollection, useDocument } from 'vuefire';
import { collection, doc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuthStore } from '@/store/auth';
import { useTrackerStore } from '@/store/tracker';

export const useOrganizationStore = defineStore('organization', () => {
  const trackerStore = useTrackerStore();
  const authStore = useAuthStore();

  // Active organization
  const organizationRef = computed(() => {
    const orgId =
      (
        authStore.homeOrganization &&
        trackerStore.organizations.find((o) => o.slug === authStore.homeOrganization)
      )?.id || null;
    return orgId && doc(db, 'organizations', orgId);
  });

  const organization = useDocument(organizationRef);

  const departments = useCollection(
    computed(
      () =>
        organizationRef.value &&
        query(
          collection(db, 'departments'),
          where('organization', '==', organizationRef.value),
          where('archived', '==', false)
        )
    )
  );

  const products = useCollection(
    computed(
      () =>
        organizationRef.value &&
        query(
          collection(db, 'products'),
          where('organization', '==', organizationRef.value),
          where('archived', '==', false)
        )
    )
  );

  const organizationTree = computed(() =>
    /**
     * Return the organization tree of the currently active organization,
     * as determined by the logged-in user’s selected home organization.
     */
    organization.value
      ? {
          slug: organization.value.slug,
          name: organization.value.name,
          team: organization.value.team,
          children: departments.value.map((d) => ({
            slug: d.slug,
            name: d.name,
            team: d.team,
            children: products.value
              .filter(({ department }) => department && department.id === d.id)
              .map((p) => ({
                slug: p.slug,
                name: p.name,
                team: p.team,
              })),
          })),
        }
      : null
  );

  function checkUserMembership(user) {
    /**
     * Return `true` if the current user is a member of the current
     * organization or its children.
     */

    if (!user?.id || !organization.value) {
      return false;
    }

    if (organization.value.team.map(({ id }) => id).includes(user.id)) {
      return true;
    }

    for (const department of departments.value) {
      if (department.team.map(({ id }) => id).includes(user.id)) {
        return true;
      }
    }

    for (const product of products.value) {
      if (product.team.map(({ id }) => id).includes(user.id)) {
        return true;
      }
    }

    return false;
  }

  return {
    organization,
    departments,
    products,
    organizationTree,
    checkUserMembership,
  };
});

export default useOrganizationStore;
