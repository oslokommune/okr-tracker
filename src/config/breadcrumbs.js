import store from '@/store';

const { state } = store;

/**
 * List of all levels in breadcrumbs
 */

export const home = () => ({
  icon: 'home',
  label: 'Home',
  route: { name: 'Home' },
});

export const help = () => ({
  icon: 'question-circle',
  label: 'Help',
  route: { name: 'Help' },
});

export const organization = () => {
  const { activeItem } = state;
  const label = activeItem.organization ? activeItem.organization.name : activeItem.name;
  const slug = activeItem.organization ? activeItem.organization.slug : activeItem.slug;

  return {
    icon: 'industry',
    label,
    route: { name: 'ItemHome', params: { slug } },
  };
};

export const department = () => {
  const { activeItem } = state;
  const label = activeItem.department ? activeItem.department.name : activeItem.name;
  const slug = activeItem.department ? activeItem.department.slug : activeItem.slug;

  return {
    icon: 'cubes',
    label,
    route: { name: 'ItemHome', params: { slug } },
  };
};

export const product = () => {
  const { activeItem } = state;
  const { name, slug } = activeItem;

  return {
    icon: 'cube',
    label: name,
    route: { name: 'ItemHome', params: { slug } },
  };
};

export const objective = () => {
  const { activeObjective, activeKeyResult } = state;

  const label = activeObjective ? activeObjective.name : activeKeyResult.objective.name;
  const objectiveId = activeObjective ? activeObjective.id : activeKeyResult.objective.id;

  return {
    icon: 'trophy',
    label,
    route: { name: 'ObjectiveHome', params: { objectiveId } },
  };
};

export const keyResult = () => {
  const { activeKeyResult } = state;

  return {
    icon: 'chart-line',
    label: activeKeyResult.name,
    route: { name: 'KeyResultHome', params: { keyResultId: activeKeyResult.id } },
  };
};

export const admin = () => {
  return {
    icon: 'user-cog',
    label: 'Admin',
    route: { name: 'Admin' },
  };
};

export const login = () => {
  return {
    icon: 'sign-in-alt',
    label: 'Login',
    route: { name: 'Login' },
  };
};

export const requestAccess = () => {
  return {
    icon: 'pray',
    label: 'Request Access',
  };
};

export const users = () => {
  return {
    icon: 'users',
    label: 'Users',
  };
};

export const user = () => {
  return {
    icon: 'user',
    label: state.user.id,
  };
};

export const itemAdmin = () => {
  return {
    icon: 'user-cog',
    label: 'Edit',
    route: { name: 'ItemAdmin' },
  };
};

export const itemAdminGeneral = () => {
  return {
    icon: 'cogs',
    label: 'General',
  };
};

export const itemAdminOKR = () => {
  return {
    icon: 'chart-pie',
    label: 'OKRs',
  };
};

export const itemAdminKPI = () => {
  return {
    icon: 'chart-line',
    label: 'KPIs',
  };
};

export const createOrganization = () => {
  return {
    icon: 'plus-square',
    label: 'Create Organization',
  };
};

export const createDepartment = () => {
  return {
    icon: 'plus-square',
    label: 'Create Department',
  };
};

export const createProduct = () => {
  return {
    icon: 'plus-square',
    label: 'Create Product',
  };
};
