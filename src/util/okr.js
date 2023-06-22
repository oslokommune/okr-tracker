import { dateShort, periodDates } from '@/util';

/**
 * Return a nicely formatted period range for `objective`'s period.
 */
function formattedPeriod(objective) {
  const { period, startDate, endDate } = objective;

  if (startDate && endDate) {
    return periodDates({ startDate, endDate }, dateShort);
  }
  if (period) {
    return `${period.name} (${periodDates(period, dateShort)})`;
  }

  return null;
}

export default formattedPeriod;
