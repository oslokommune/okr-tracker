import store from '@/store';
import { DEFAULT_OKR_PERIOD, getPeriods } from '@/config/periods';
import { periodDates } from '@/util';

const { state } = store;

export default async function itemMeasurements(to, from, next) {
  try {
    const periods = getPeriods();
    const { selectedPeriod } = state.okrs;

    if (!selectedPeriod) {
      const { resultIndicatorPeriod } = to.query;
      const period =
        resultIndicatorPeriod && Object.keys(periods).includes(resultIndicatorPeriod)
          ? periods[resultIndicatorPeriod]
          : periods[DEFAULT_OKR_PERIOD];
      await store.dispatch('okrs/setSelectedPeriod', period);
    } else if (selectedPeriod.key && !periods[selectedPeriod.key]) {
      const { startDate, endDate } = selectedPeriod;
      await store.dispatch('okrs/setSelectedPeriod', {
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
