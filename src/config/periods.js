import {
  endOfDay,
  endOfQuarter,
  getQuarter,
  startOfDay,
  startOfQuarter,
  subQuarters,
} from 'date-fns';
import i18n from '@/locale/i18n';

export const DEFAULT_OKR_PERIOD = 'all';
export const DEFAULT_KPI_PERIOD = 'all';
export const FALLBACK_PERIOD = 'all';

export function getPeriods() {
  const currentDate = startOfDay(new Date());
  const endDate = endOfDay(currentDate);
  const currentYear = currentDate.getFullYear();
  const currentQuarter = getQuarter(currentDate);
  const prevQuarterDate = subQuarters(currentDate, 1);
  const sixMonthsBack = startOfDay(new Date());
  sixMonthsBack.setMonth(sixMonthsBack.getMonth() - 6);

  return {
    quarter: {
      label: `${i18n.t('period.thisQuarter')} (Q${currentQuarter} ${currentYear})`,
      key: 'quarter',
      startDate: startOfQuarter(currentDate),
      endDate: endOfQuarter(currentDate),
    },
    prevquarter: {
      label: `${i18n.t('period.previousQuarter')} (Q${getQuarter(
        prevQuarterDate
      )} ${prevQuarterDate.getFullYear()})`,
      key: 'prevquarter',
      startDate: startOfQuarter(prevQuarterDate),
      endDate: endOfQuarter(prevQuarterDate),
    },
    sixmonths: {
      label: i18n.t('period.sixmonths'),
      key: 'sixmonths',
      startDate: sixMonthsBack,
      endDate,
    },
    year: {
      label: i18n.t('period.year'),
      key: 'year',
      startDate: new Date(currentYear, 0, 1),
      endDate,
    },
    all: {
      label: i18n.t('period.all'),
      key: 'all',
      startDate: false,
      endDate,
    },
  };
}
