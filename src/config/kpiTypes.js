import i18n from '@/locale/i18n';
import { numberLocale } from '@/util';

export default {
  users: {
    label: i18n.t('kpi.types.users'),
    icon: 'fa-user',
    formatValue: numberLocale.format('.2s'),
    type: 'users',
  },
  satisfaction: {
    label: i18n.t('kpi.types.satisfaction'),
    icon: 'fa-smile',
    formatValue: numberLocale.format('.2p'),
    type: 'satisfaction',
  },
  conversion: {
    label: i18n.t('kpi.types.conversion'),
    icon: 'fa-check-square',
    formatValue: numberLocale.format('.2p'),
    type: 'conversion',
  },
};
