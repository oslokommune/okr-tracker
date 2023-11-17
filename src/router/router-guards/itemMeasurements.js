import store from '@/store';
import { DEFAULT_KPI_PERIOD, getPeriods } from '@/config/periods';

const { state } = store;

export default async function itemMeasurements(to, from, next) {
  const { activeItem } = state;

  if (!activeItem) {
    return next();
  }

  try {
    const periods = getPeriods();
    const { resultIndicatorPeriod } = to.query;
    const { selectedPeriod } = state.kpis;

    if (resultIndicatorPeriod && Object.keys(periods).includes(resultIndicatorPeriod)) {
      await store.dispatch('kpis/setSelectedPeriod', periods[resultIndicatorPeriod]);
    } else if (!selectedPeriod) {
      await store.dispatch('kpis/setSelectedPeriod', periods[DEFAULT_KPI_PERIOD]);
    }

    return next();
  } catch (error) {
    console.error(error);
    return next(false);
  }
}
