import store from '@/store';
import { DEFAULT_KPI_PERIOD, getPeriods } from '@/config/periods';
import { periodDates } from '@/util';

const { state } = store;

export default async function itemMeasurements(to, from, next) {
  const { activeItem } = state;

  if (!activeItem) {
    return next();
  }

  try {
    const periods = getPeriods();
    const { selectedPeriod } = state.kpis;

    if (!selectedPeriod) {
      const { resultIndicatorPeriod } = to.query;
      const period =
        resultIndicatorPeriod && Object.keys(periods).includes(resultIndicatorPeriod)
          ? periods[resultIndicatorPeriod]
          : periods[DEFAULT_KPI_PERIOD];
      await store.dispatch('kpis/setSelectedPeriod', period);
    } else if (selectedPeriod.key && !periods[selectedPeriod.key]) {
      const { startDate, endDate } = selectedPeriod;
      await store.dispatch('kpis/setSelectedPeriod', {
        startDate,
        endDate,
        label: periodDates({ startDate, endDate }),
      });
    }
    return next();
  } catch (error) {
    console.error(error);
    return next(false);
  }
}
