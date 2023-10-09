import { formatLocale } from 'd3-format';
import { format, parseISO, formatISO } from 'date-fns';

export const dateLong = (d) => format(d, 'PPP');
export const dateLongCompact = (d) => format(d, 'PP');
export const dateShort = (d) => format(d, 'P');
export const dateExtraShort = (d) => format(d, 'dd.MM.yy');
export const dateTimeShort = (d) => format(d, 'Pp');
export const dateTimeLong = (d) => format(d, 'PPPp');

export function periodDates({ startDate, endDate }, strategy = dateLong) {
  if (!startDate || !endDate) {
    throw new Error('Invalid period object');
  }
  return [
    startDate instanceof Date ? startDate : startDate.toDate(),
    endDate instanceof Date ? endDate : endDate.toDate(),
  ]
    .map(strategy)
    .join('​–​');
}

export const parseDate = (d) => parseISO(d);
export const formatISOShort = (d) => formatISO(d, { representation: 'date' });

export const numberLocale = formatLocale({
  decimal: ',',
  thousands: ' ',
  grouping: [3],
});

export const formatLargeNumber = (value) => numberLocale.format(',')(value);
