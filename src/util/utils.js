import { addMonths, startOfQuarter, getQuarter } from 'date-fns';

/**
 * Generates a list of named quarters
 * @returns {Array} - List of quarters as objects
 */
const generateQuarters = () => {
  let fromDate = new Date('2019-01-01');
  const today = new Date();
  const toDate = startOfQuarter(addMonths(today, 3));
  const quarters = [];

  while (fromDate < toDate) {
    const year = fromDate.getFullYear();
    const quarter = getQuarter(fromDate);
    const isActive = fromDate < today && fromDate > startOfQuarter(today);
    quarters.push({ name: `Q${quarter} ${year}`, isActive });
    fromDate = addMonths(fromDate, 3);
  }

  return quarters.reverse();
};

export default generateQuarters;
