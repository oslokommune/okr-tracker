export { dateLong } from './format';
export { dateLongCompact } from './format';
export { dateShort } from './format';
export { dateExtraShort } from './format';
export { dateTimeShort } from './format';
export { dateTimeLong } from './format';
export { periodDates } from './format';
export { parseDate } from './format';
export { formatISOShort } from './format';
export { numberLocale } from './format';
export { default as findSlugAndRedirect } from './findSlugAndRedirect';
export { default as tableOfContent } from './tableOfContent';
export { default as toastArchiveAndRevert } from './toastUtils';
export { default as validateEmail } from './validateEmail';
export { default as periodObjectFromDates } from './period';

/**
 * Return an array of all members of `arr` that are unique with respect to the
 * attribute `key`.
 */
export function uniqueBy(arr, key) {
  const res = {};

  arr.forEach((x) => {
    if (!(x[key] in res)) {
      res[x[key]] = x;
    }
  });

  return Object.values(res);
}
