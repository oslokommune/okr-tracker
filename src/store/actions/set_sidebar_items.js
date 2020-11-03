import i18n from '@/locale/i18n';

export default async ({ state, commit }) => {
  const { organizations, departments, products, activeItem } = state;

  const filterDepartments = ({ organization }) => {
    // No active item is set, show no departments
    if (!activeItem) return false;
    if (!organization) return false;

    // Active item is organization, show all its departments
    if (activeItem.id === organization.id) return true;
    // Active item is a child of organization, show its all departments
    return !!(activeItem.organization && activeItem.organization.id === organization.id);
  };

  const filterProducts = ({ department }) => {
    // No active item is set, show no products
    if (!activeItem) return false;
    // Active item is a department, show all its products
    if (activeItem.id === department.id) return true;
    // Active item is a product, show all its siblings
    return !!(activeItem.department && activeItem.department.id === department.id);
  };

  const groups = [
    { name: i18n.t('general.organizations'), items: organizations, icon: 'industry' },
    { name: i18n.t('general.departments'), items: departments.filter(filterDepartments), icon: 'cubes' },
    { name: i18n.t('general.products'), items: products.filter(filterProducts), icon: 'cube' },
  ];

  if (state.sidebarGroups && JSON.stringify(groups) === JSON.stringify(state.sidebarGroups)) return true;

  commit('SET_SIDEBAR_GROUPS', groups);

  return true;
};
