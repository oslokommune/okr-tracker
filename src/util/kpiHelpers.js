import i18n from '@/locale/i18n';

export const KPI_TYPES = ['users', 'satisfaction', 'conversion'];

export const kpiName = (kpiType, kpi) => {
  if (!kpi || !kpi.name) return i18n.t(`kpi.types.${kpiType}`);

  return kpi.name;
};
