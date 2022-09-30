import i18n from '@/locale/i18n';
import { numberLocale } from '@/util';

/**
 * Return a list of available KPI data display formats.
 */
export function kpiFormats () {
  return [
    {
      id: 'integer',
      label: i18n.t('kpi.formats.integer'),
    },
    {
      id: 'percentage',
      label: i18n.t('kpi.formats.percentage'),
    },
  ];
};

/**
 * Return a list of available KPI types.
 */
export function kpiTypes () {
  return [
    {
      id: 'plain',
      label: i18n.t('kpi.types.plain.label'),
      description: i18n.t('kpi.types.plain.description'),
    },
    {
      id: 'keyfig',
      label: i18n.t('kpi.types.keyFigure.label'),
      description: i18n.t('kpi.types.keyFigure.description'),
    },
    {
      id: 'ri',
      label: i18n.t('kpi.types.resultIndicator.label'),
      description: i18n.t('kpi.types.resultIndicator.description'),
    },
  ];
};

/**
 * Return a value formatter function.
 *
 * `defaultSpecifier` is the format specifier to use in normal cases, while
 * `compactSpecifier` is used when a `compact` option is passed.
 */
function valueFormatter (defaultSpecifier, compactSpecifier) {
  return (value, options) => {
    const specifier =
      options?.compact && compactSpecifier
        ? compactSpecifier
        : defaultSpecifier;
    return numberLocale.format(specifier)(value);
  };
}

/**
 * Return the appropriate formatting function for `formatId`.
 */
function kpiFormatFunction (formatId) {
  return {
    integer: valueFormatter(',', '.2s'),
    percentage: valueFormatter('.2p'),
  }[formatId];
}

/**
 * Return a KPI value neatly formatted in a string.
 *
 * The optional `value` parameter overrides the current value of `kpi` when
 * passed. The `options` object currently only supports a `compact` specifier.
 */
export function formatKPIValue (kpi, value = null, options = {}) {
  let formatFun = v => v;

  if (kpi.format) {
    formatFun = kpiFormatFunction(kpi.format);
  }
  else if (kpi.type === 'users') {
    formatFun = kpiFormatFunction('integer');
  }
  else if (['satisfaction', 'conversion'].includes(kpi.type)) {
    formatFun = kpiFormatFunction('percentage');
  }

  const val = value === null ? kpi.currentValue : value;
  if (val !== undefined) {
    return formatFun(val, options);
  }

  return '–––';
};
