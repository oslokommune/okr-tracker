import { format } from 'd3-format';
import vueI18n from '@/locale/i18n';

export { default as api } from './axios';
export { dateLong } from './format';
export { dateShort } from './format';
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

export const getRandomInt = (max) => Math.floor(Math.random() * max);
