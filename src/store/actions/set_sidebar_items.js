export default async ({ state, commit }) => {
  const { organizations, departments, products, activeItem } = state;

  const filterDepartments = ({ organization }) => {
    // No active item is set, show no departments
    if (!activeItem) return false;
    // Active item is organization, show all its departments
    if (activeItem.id === organization.id) return true;
    // Active item is a child of organization, show its all departments
    if (activeItem.organization && activeItem.organization.id === organization.id) return true;
    return false;
  };
  const filterProducts = ({ department }) => {
    // No active item is set, show no products
    if (!activeItem) return false;
    // Active item is a department, show all its products
    if (activeItem.id === department.id) return true;
    // Active item is a product, show all its siblings
    if (activeItem.department && activeItem.department.id === department.id) return true;
    return false;
  };

  const groups = [
    { name: 'Organizations', items: organizations, icon: 'industry' },
    { name: 'Departments', items: departments.filter(filterDepartments), icon: 'cubes' },
    { name: 'Products', items: products.filter(filterProducts), icon: 'cube' },
  ];

  commit('SET_SIDEBAR_GROUPS', groups);
};
