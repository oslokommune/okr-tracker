import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { FALLBACK_PERIOD, getPeriods } from '@/config/periods';
import { periodDates } from '@/util/format';

function _validatedPeriodDates(period) {
  let { startDate, endDate } = period;

  startDate = startDate === false || startDate?.getTime ? startDate : new Date(startDate);
  endDate = endDate?.getTime ? endDate : new Date(endDate);

  if ((startDate !== false && !isValid(startDate)) || !isValid(endDate)) {
    return null;
  }

  return { startDate, endDate };
}

export default function periodObjectFromDates(startDate, endDate) {
  const period = _validatedPeriodDates({ startDate, endDate });

  if (!period) {
    return getPeriods()[FALLBACK_PERIOD];
  }

  period.startDate = startOfDay(period.startDate);
  period.endDate = endOfDay(period.endDate);

  return {
    startDate,
    endDate,
    label: periodDates(period),
  };
}

export const PeriodSerializer = {
  read: (v) => {
    const periods = getPeriods();
    if (Object.keys(periods).includes(v)) {
      return periods[v];
    }
    try {
      const [startDate, endDate] = v.split('|');
      return periodObjectFromDates(parseISO(startDate), parseISO(endDate));
    } catch {
      return periods[FALLBACK_PERIOD];
    }
  },
  write: (v) => {
    if (v.key) {
      return v.key;
    }
    if (_validatedPeriodDates(v)) {
      return `${v.startDate.toISOString()}|${v.endDate.toISOString()}`;
    }
    return FALLBACK_PERIOD;
  },
};
