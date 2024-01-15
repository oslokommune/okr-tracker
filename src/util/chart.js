export const DEFAULT_SERIES_OPTIONS = {
  type: 'line',
  showSymbol: true,
  symbolSize: 6,
  emphasis: { disabled: true },
  lineStyle: { width: 3 },
};

export const LOCALE_NO = {
  time: {
    month: [
      'januar',
      'februar',
      'mars',
      'april',
      'mai',
      'juni',
      'juli',
      'august',
      'september',
      'oktober',
      'november',
      'desember',
    ],
    monthAbbr: [
      'jan.',
      'feb.',
      'mar.',
      'apr.',
      'mai',
      'jun.',
      'jul.',
      'aug.',
      'sep.',
      'okt.',
      'nov.',
      'des.',
    ],
  },
};

export function getComputedStyleVariable(cssVar) {
  return getComputedStyle(document.documentElement).getPropertyValue(cssVar);
}
