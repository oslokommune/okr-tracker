import endOfDay from 'date-fns/endOfDay';
import i18n from '@/locale/i18n';

export default function getPeriods() {
  const currentDate = new Date();
  const endDate = endOfDay(currentDate);
  const currentYear = currentDate.getFullYear();
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
  };
}
