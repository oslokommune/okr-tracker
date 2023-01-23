export { dateLong } from './format';
export { dateLongCompact } from './format';
export { dateShort } from './format';
export { dateMonthYear } from './format';
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

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
export const getRandomInt = (max) => Math.floor(Math.random() * max);
