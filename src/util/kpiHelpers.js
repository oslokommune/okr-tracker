import i18n from '@/locale/i18n';
import { numberLocale } from '@/util';
import { db } from '@/config/firebaseConfig';

/**
 * Return a list of available KPI data display formats.
 */
export function kpiFormats() {
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
}

/**
 * Return a list of available KPI start value display options.
 */
export function kpiStartValues() {
  return [
    {
      id: 'zero',
      label: i18n.t('kpi.startValues.zero'),
    },
    {
      id: 'min',
      label: i18n.t('kpi.startValues.min'),
    },
  ];
}

/**
 * Return a list of available KPI expected trend options.
 */
export function kpiTrendOptions() {
  return [
    {
      id: 'increase',
      label: i18n.t('kpi.trendOptions.increase'),
    },
    {
      id: 'decrease',
      label: i18n.t('kpi.trendOptions.decrease'),
    },
    {
      id: 'neutral',
      label: i18n.t('kpi.trendOptions.neutral'),
    },
  ];
}

/**
 * Return a list of available KPI types.
 */
export function kpiTypes() {
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
}

/**
 * Return a list of available update frequency options. Based on the
 * Dublin Core™ Collection Description Frequency Vocabulary. Used to
 * provide options for setting the `updateFrequency` on KPI objects.
 * https://www.dublincore.org/specifications/dublin-core/collection-description/frequency/
 */
export function kpiUpdateFrequencies() {
  return ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'irregular'].map(
    (frequency) => ({
      id: frequency,
      label: i18n.t(`kpi.updateFrequency.frequencies.${frequency}`),
    })
  );
}

/**
 * Return a value formatter function.
 *
 * `defaultSpecifier` is the format specifier to use in normal cases, while
 * `compactSpecifier` is used when a `compact` option is passed.
 */
function valueFormatter(defaultSpecifier, compactSpecifier) {
  return (value, options) => {
    let specifier = defaultSpecifier;

    if (
      compactSpecifier &&
      (options.compact === true || (options.compact === 'semi' && value >= 10_000_000))
    ) {
      specifier = compactSpecifier;
    }

    return numberLocale.format(specifier)(value);
  };
}

/**
 * Return the appropriate formatting function for `formatId`.
 */
function kpiFormatFunction(formatId) {
  return {
    integer: valueFormatter(',.2~f', '.2s'),
    percentage: valueFormatter('.2p'),
  }[formatId];
}

/**
 * Return a KPI value neatly formatted in a string.
 *
 * The optional `value` parameter overrides the current value of `kpi` when
 * passed. The `options` object currently only supports a `compact` specifier.
 */
export function formatKPIValue(kpi, value = null, options = {}) {
  let formatFun = (v) => v;

  if (kpi.format) {
    formatFun = kpiFormatFunction(kpi.format);
  } else if (kpi.type === 'users') {
    formatFun = kpiFormatFunction('integer');
  } else if (['satisfaction', 'conversion'].includes(kpi.type)) {
    formatFun = kpiFormatFunction('percentage');
  }

  const val = value === null ? kpi.currentValue : value;
  if (val !== undefined) {
    return formatFun(val, options);
  }

  return '–––';
}

/**
 * Return progress data cached on the KPI object.
 *
 * `kpi` is the KPI document to return cached progress data for.
 * `startDate` is the start date to filter by (inclusive).
 * `endDate` is the end date to filter by (inclusive).
 */
export function getCachedKPIProgress(kpi, startDate, endDate) {
  if (!kpi?.progress) {
    return [];
  }

  const data = JSON.parse(kpi.progress);

  return data
    .filter((d) => {
      const date = new Date(d[0]);
      return (!startDate || date >= startDate) && (!endDate || date <= endDate);
    })
    .map((m) => {
      return {
        timestamp: {
          toDate: () => new Date(m[0]),
        },
        value: m[1],
        comment: m[2],
      };
    })
    .sort((a, b) => (a.timestamp.toDate() > b.timestamp.toDate() ? -1 : 1));
}

/**
 * Return KPI progress collection query.
 *
 * `kpi` is the KPI document to build a collection query for.
 * `startDate` is the start date to filter by (inclusive).
 * `endDate` is the end date to filter by (inclusive).
 */
export function getKPIProgressQuery(kpi, startDate, endDate) {
  let query = db.collection(`kpis/${kpi.id}/progress`);

  if (startDate) {
    query = query.where('timestamp', '>=', startDate);
  }

  if (endDate) {
    query = query.where('timestamp', '<=', endDate);
  }

  return query.orderBy('timestamp', 'desc');
}

/**
 * Return a filtered list of measurement values where duplicated values for each
 * date are removed.
 *
 * `progressCollection` is the list of progress records to filter.
 */
export function filterDuplicatedProgressValues(progressCollection) {
  const seenDates = [];

  return progressCollection.filter((a) => {
    const date = a.timestamp.toDate().toISOString().slice(0, 10);
    if (!seenDates.includes(date)) {
      seenDates.push(date);
      return true;
    }
    return false;
  });
}

const _kpiOrder = ['ri', 'keyfig', 'plain'];

/**
 * Return a function for comparing two KPIs for sorting.
 *
 * The `itemId` defines which "item" they are to be sorted within, as KPIs can
 * have different orders within different items.
 *
 * The returned function returns a negative number if `a` should come before
 * `b`, otherwise it returns a positive number.
 *
 * KPIs are ordered on two levels, first by KPI type, then by their set order
 * within that type. To retain backwards compatibility for KPIs that haven't
 * gotten any order set yet, they're ordered by their name in that case.
 */
export function compareKPIs(itemId) {
  return (a, b) => {
    // First sort by KPI type.
    if (a.kpiType !== b.kpiType) {
      return _kpiOrder.indexOf(a.kpiType) - _kpiOrder.indexOf(b.kpiType);
    }
    // Then sort by order only if both have one.
    if ('order' in a && itemId in a.order && 'order' in b && itemId in b.order) {
      return a.order[itemId] - b.order[itemId];
    }
    // When only one of them has an order, sort that one first.
    if ('order' in a && itemId in a.order) {
      return -1;
    }
    if ('order' in b && itemId in b.order) {
      return 1;
    }
    // Otherwise fall back to ordering by name.
    return a.name.localeCompare(b.name);
  };
}
