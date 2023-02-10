import store from '@/store';
import getPeriods from '@/config/periods';

const { state } = store;

export default async function dashboard(to, from, next) {
  const { activeItem } = state;

  try {
    if (!state.selectedPeriod) {
      const periods = getPeriods();
      const { resultIndicatorPeriod } = to.query;
      const selectedPeriod =
        resultIndicatorPeriod && Object.keys(periods).includes(resultIndicatorPeriod)
          ? periods[resultIndicatorPeriod]
          : periods.all;
      await store.dispatch('setSelectedPeriod', selectedPeriod);
    }
    await store.dispatch('set_sub_kpis', activeItem.id);
    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
