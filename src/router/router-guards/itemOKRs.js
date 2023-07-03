import store from '@/store';
import { DEFAULT_PERIOD, getPeriods } from '@/config/periods';
import { periodDates } from '@/util';

const { state } = store;

export default async function itemMeasurements(to, from, next) {
  try {
    const periods = getPeriods();

    if (!state.selectedPeriod) {
      const { resultIndicatorPeriod } = to.query;
      const selectedPeriod =
        resultIndicatorPeriod && Object.keys(periods).includes(resultIndicatorPeriod)
          ? periods[resultIndicatorPeriod]
          : periods[DEFAULT_PERIOD];
      await store.dispatch('setSelectedPeriod', selectedPeriod);
    } else if (state.selectedPeriod.key && !periods[state.selectedPeriod.key]) {
      const { startDate, endDate } = state.selectedPeriod;
      await store.dispatch('setSelectedPeriod', {
        startDate,
        endDate,
        label: periodDates({ startDate, endDate }),
      });
    }
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
