import store from '@/store';
import { DEFAULT_OKR_PERIOD, getPeriods } from '@/config/periods';

const { state } = store;

export default async function itemOKRs(to, from, next) {
  try {
    const periods = getPeriods();
    const { selectedPeriod } = state.okrs;

    if (!selectedPeriod) {
      await store.dispatch('kpis/setSelectedPeriod', periods[DEFAULT_OKR_PERIOD]);
    }

    next();
  } catch (error) {
    console.error(error);
    next(false);
  }
}
