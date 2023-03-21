/**
 * Return true if `objective` is in `period`.
 *
 * "In" doesn't mean that the objective have to be fully within the period,
 * just that it overlaps the period with at least one day.
 */
export default function objectiveInPeriod(period, objective) {
  const { startDate, endDate } = period;

  if (objective.startDate && objective.endDate) {
    return objective.endDate >= startDate && objective.startDate <= endDate;
  }

  /*
   * Fall back to checking the old-style `period` reference to retain backwards
   * compatibility.
   */
  return objective.period.id === period.id;
}
