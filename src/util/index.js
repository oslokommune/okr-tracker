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

export const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export const progressText = (progress, unit) =>
  vueI18n.t('progress.remaining', { progress: format('.1~f')(progress), unit });

export const remainingKeyResultProgress = (keyResult) => {
  if (keyResult.currentValue >= keyResult.targetValue) {
    const maxMessages = Object.keys(vueI18n.t('progress.completedMessages')).length;
    return vueI18n.t(`progress.completedMessages.${randomIntFromInterval(1, maxMessages)}`);
  }

  if (keyResult.targetValue < keyResult.startValue) {
    if (!keyResult.currentValue) {
      return progressText(keyResult.startValue, keyResult.unit);
    }
    return progressText(keyResult.startValue - keyResult.currentValue, keyResult.unit);
  }
  if (!keyResult.currentValue) {
    return progressText(keyResult.targetValue, keyResult.unit);
  }
  return progressText(keyResult.targetValue - keyResult.currentValue, keyResult.unit);
};
