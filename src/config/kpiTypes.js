import { numberLocale } from '@/util';
import i18n from '@/locale/i18n';

function valueFormatter(defaultSpecifier, compactSpecifier) {
  return (value, options) => {
    const specifier =
      options?.compact && compactSpecifier
        ? compactSpecifier
        : defaultSpecifier;
    return numberLocale.format(specifier)(value);
  };
}

export default {
  users: {
    label: i18n.t('kpi.types.users'),
    icon: 'fa-user',
    formatValue: valueFormatter(',', '.2s'),
    type: 'users',
  },
  satisfaction: {
    label: i18n.t('kpi.types.satisfaction'),
    icon: 'fa-smile',
    formatValue: valueFormatter('.2p'),
    type: 'satisfaction',
  },
  conversion: {
    label: i18n.t('kpi.types.conversion'),
    icon: 'fa-check-square',
    formatValue: valueFormatter('.2p'),
    type: 'conversion',
  },
};
