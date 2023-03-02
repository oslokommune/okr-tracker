import {
  endOfDay,
  getQuarter,
  subQuarters,
  startOfQuarter,
  endOfQuarter,
} from 'date-fns';
import i18n from '@/locale/i18n';

export default function getPeriods() {
  const currentDate = new Date();
  const endDate = endOfDay(currentDate);
  const currentYear = currentDate.getFullYear();
  const currentQuarter = getQuarter(currentDate);
  const prevQuarterDate = subQuarters(currentDate, 1);
  const sixMonthsBack = new Date();
  sixMonthsBack.setMonth(sixMonthsBack.getMonth() - 6);

  return {
    all: {
      label: i18n.t('period.all'),
      key: 'all',
      startDate: false,
      endDate,
    },
    year: {
      label: i18n.t('period.year'),
      key: 'year',
      startDate: new Date(currentYear, 0, 1),
      endDate,
    },
    sixmonths: {
      label: i18n.t('period.sixmonths'),
      key: 'sixmonths',
      startDate: sixMonthsBack,
      endDate,
    },
    quarter: {
      label: `Q${currentQuarter} ${currentYear}`,
      key: 'quarter',
      startDate: startOfQuarter(currentDate),
      endDate: endOfQuarter(currentDate),
    },
    prevquarter: {
      label: `Q${getQuarter(prevQuarterDate)} ${prevQuarterDate.getFullYear()}`,
      key: 'prevquarter',
      startDate: startOfQuarter(prevQuarterDate),
      endDate: endOfQuarter(prevQuarterDate),
    },
  };
}
