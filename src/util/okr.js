import { dateShort, periodDates } from '@/util';

/**
 * Return true if `objective` is in `period`.
 *
 * "In" doesn't mean that the objective have to be fully within the period,
 * just that it overlaps the period with at least one day.
 */
export function objectiveInPeriod(period, objective) {
  const { startDate, endDate } = period;

  if (objective.startDate && objective.endDate) {
    return (
      objective.endDate.toDate() >= startDate && objective.startDate.toDate() <= endDate
    );
  }

  /*
   * Fall back to checking the old-style `period` reference to retain backwards
   * compatibility.
   */
  if (objective.period.endDate && objective.period.startDate) {
    return (
      objective.period.endDate.toDate() >= startDate &&
      objective.period.startDate.toDate() <= endDate
    );
  }

  return false;
}

/**
 * Return a nicely formatted period range for `objective`'s period.
 */
export function formattedPeriod(objective) {
  const { period, startDate, endDate } = objective;

  if (startDate && endDate) {
    return periodDates({ startDate, endDate }, dateShort);
  }
  if (period) {
    return `${period.name} (${periodDates(period, dateShort)})`;
  }

  return null;
}
