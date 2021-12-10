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

export const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)


export const remainingKeyResultProgress = (keyResult) => {
  if (keyResult.currentValue >= keyResult.targetValue) {
    const maxMessages = Object.keys(vueI18n.t('progress.completedMessages')).length;
    return vueI18n.t(`progress.completedMessages.${randomIntFromInterval(1, maxMessages)}`);
  }

  if (keyResult.targetValue < keyResult.startValue) {
    if (!keyResult.currentValue) {
      return vueI18n.t('progress.remaining', { progress: format('.1~f')(keyResult.startValue) });
    }
    return vueI18n.t('progress.remaining', { progress: format('.1~f')(keyResult.startValue - keyResult.currentValue) });
  }
  if (!keyResult.currentValue) {
    return vueI18n.t('progress.remaining', { progress: format('.1~f')(keyResult.targetValue) });
  }
  return vueI18n.t('progress.remaining', { progress: format('.1~f')(keyResult.targetValue - keyResult.currentValue) });
};
