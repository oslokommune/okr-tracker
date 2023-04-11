import store from '@/store';
import getPeriods from '@/config/periods';

const { state } = store;

export default async function itemMeasurements(to, from, next) {
  const { activeItem } = state;

  try {
    const periods = getPeriods();

    /*
     * TODO: The second test here is only temporary and can be removed once the
     * period selectors on the OKR and KPI pages have been reconciled.
     */
    if (!state.selectedPeriod || !periods[state.selectedPeriod]) {
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
