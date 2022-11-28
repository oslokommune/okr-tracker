import { formatLocale } from 'd3-format';
import { format, parseISO, formatISO } from 'date-fns';
import { nb as locale } from 'date-fns/locale';

const o = { locale };

export const dateLong = (d) => format(d, 'PPP', o);
export const dateShort = (d) => format(d, 'P', o);
export const dateTimeShort = (d) => format(d, 'Pp', o);
export const dateTimeLong = (d) => format(d, 'PPPp', o);

export function periodDates({ startDate, endDate }, strategy = dateLong) {
  if (!startDate || !endDate) {
    throw new Error('Invalid period object');
  }
  return [
    startDate instanceof Date ? startDate : startDate.toDate(),
    endDate instanceof Date ? endDate : endDate.toDate(),
  ]
    .map(strategy)
    .join(' – ');
}

export const parseDate = (d) => parseISO(d);
export const formatISOShort = (d) => formatISO(d, { representation: 'date' });

export const numberLocale = formatLocale({
  decimal: ',',
  thousands: ' ',
  grouping: [3],
});

export const formatLargeNumber = (value) => numberLocale.format(',')(value);
