import { addMonths, startOfQuarter, getQuarter } from 'date-fns';
import { startDate } from '@/config/applicationConfig';

/**
 * Generates a list of named quarters
 * @returns {Array} - List of quarters as objects
 */
const quarters = (() => {
  let fromDate = new Date(startDate);
  const today = new Date();
  const toDate = startOfQuarter(addMonths(today, 3));
  const list = [];

  while (fromDate < toDate) {
    const year = fromDate.getFullYear();
    const quarter = getQuarter(fromDate);
    const isActive = fromDate < today && fromDate > startOfQuarter(today);
    list.push({ name: `Q${quarter} ${year}`, isActive });
    fromDate = addMonths(fromDate, 3);
  }

  return list.reverse();
})();

export default quarters;
