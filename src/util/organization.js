import { collection, query, where } from 'firebase/firestore';
import i18n from '@/locale/i18n';

export function buildOrganizationTree(organization, departments, products) {
  if (!organization) {
    return null;
  }

  return {
    id: organization.id,
    path: organization.path,
    ...organization,
    children: departments
      .map((department) => ({
        id: department.id,
        path: department.path,
        ...department,
        children: products
          .filter((d) => d.department?.id === department.id)
          .map((product) => ({
            id: product.id,
            path: product.path,
            ...product,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, i18n.locale)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, i18n.locale)),
  };
}

export function buildChildSourceQuery(db, organizationRef, collectionPath) {
  return (
    organizationRef &&
    query(
      collection(db, collectionPath),
      where('organization', '==', organizationRef),
      where('archived', '==', false)
    )
  );
}
