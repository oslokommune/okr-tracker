import store from '@/store';
import i18n from '@/locale/i18n';
import router from '@/router';

const { state } = store;

/**
 * List of all levels in breadcrumbs
 */

export const home = () => ({
  icon: 'home',
  label: i18n.t('general.home'),
  route: { name: 'Home' },
});

export const help = () => ({
  icon: 'question-circle',
  label: i18n.t('general.help'),
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
  const icon = activeObjective ? activeObjective.icon : activeKeyResult.objective.icon;

  return {
    icon,
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
    label: i18n.t('general.admin'),
    route: { name: 'Admin' },
  };
};

export const login = () => {
  return {
    icon: 'sign-in-alt',
    label: i18n.t('login.login'),
    route: { name: 'Login' },
  };
};

export const requestAccess = () => {
  return {
    icon: 'pray',
    label: i18n.t('login.requestAccess'),
  };
};

export const users = () => {
  return {
    icon: 'users',
    label: i18n.t('general.users'),
  };
};

export const user = () => {
  return {
    icon: 'user',
    label: router.currentRoute.params.id,
  };
};

export const itemAdmin = () => {
  return {
    icon: 'user-cog',
    label: i18n.t('general.edit'),
    route: { name: 'ItemAdmin' },
  };
};

export const itemAdminGeneral = () => {
  return {
    icon: 'cogs',
    label: i18n.t('general.general'),
  };
};

export const itemAdminOKR = () => {
  return {
    icon: 'chart-pie',
    label: i18n.t('general.OKRs'),
  };
};

export const itemAdminTeam = () => {
  return {
    icon: 'users',
    label: 'Team',
  };
};

export const itemAdminKPI = () => {
  return {
    icon: 'chart-line',
    label: i18n.t('general.KPIs'),
  };
};

export const createOrganization = () => {
  return {
    icon: 'plus-square',
    label: i18n.t('admin.organization.create'),
  };
};

export const createDepartment = () => {
  return {
    icon: 'plus-square',
    label: i18n.t('admin.department.create'),
  };
};

export const createProduct = () => {
  return {
    icon: 'plus-square',
    label: i18n.t('admin.product.create'),
  };
};

export const kpi = () => {
  const { activeKpi } = state;
  return {
    icon: 'chart-line',
    label: activeKpi.name,
  };
};
