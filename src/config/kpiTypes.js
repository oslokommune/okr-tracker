import { format } from 'd3';
import i18n from '@/locale/i18n';

export default {
  users: {
    label: i18n.t('kpi.types.users'),
    icon: 'fa-user',
    formatValue: format('.2s'),
    type: 'users',
  },
  satisfaction: {
    label: i18n.t('kpi.types.satisfaction'),
    icon: 'fa-smile',
    formatValue: format('.2p'),
    type: 'satisfaction',
  },
  conversion: {
    label: i18n.t('kpi.types.conversion'),
    icon: 'fa-check-square',
    formatValue: format('.2p'),
    type: 'conversion',
  },
};
