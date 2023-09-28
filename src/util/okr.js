import { dateShort, periodDates } from '@/util';

/**
 * Return a nicely formatted period range for `objective`'s period.
 */
export function formattedPeriod(objective) {
  const { period, startDate, endDate } = objective;

  if (startDate && endDate) {
    return periodDates({ startDate, endDate }, dateShort);
  }
  if (period && typeof period !== 'string') {
    return `${period.name} (${periodDates(period, dateShort)})`;
  }

  return null;
}

/**
 * Compare two key results for sorting.
 *
 * The returned function returns a negative number if `a` should come before
 * `b`, otherwise it returns a positive number.
 *
 * Key results that haven't gotten any order set yet are ordered by their names
 * instead to retain backwards compatibility.
 */
export function compareKeyResults(a, b) {
  // Sort by order only if both have one.
  if ('order' in a && 'order' in b) {
    return a.order - b.order;
  }
  // When only one of them has an order, sort that one first.
  if ('order' in a) {
    return -1;
  }
  if ('order' in b) {
    return 1;
  }
  // Otherwise fall back to ordering by name.
  return a.name.localeCompare(b.name);
}
