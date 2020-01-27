import { addMonths, startOfQuarter, getQuarter, formatDistanceToNow, format } from 'date-fns';
import locale from 'date-fns/locale/nb';
import { startDate } from '../config/applicationConfig';
import * as Toast from './toasts';

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
    list.push({ name: `Q${quarter} ${year}`, fromDate, toDate });
    fromDate = addMonths(fromDate, 3);
  }

  return list.reverse();
})();

function getProductFromSlug(nest, slug) {
  return nest
    .map(org => {
      return org.departments
        .map(dept => {
          return dept.products.find(d => d.slug === slug);
        })
        .flat();
    })
    .flat()
    .filter(Boolean)[0];
}

function timeFromNow(date) {
  return formatDistanceToNow(date, { addSuffix: true, locale });
}

function datePretty(date) {
  return format(date, 'd. MMM HH:mm:ss', { locale });
}

function errorHandler(error = {}) {
  Toast.error();
  throw new Error(error);
}

export { quarters, getProductFromSlug, timeFromNow, errorHandler, datePretty };
