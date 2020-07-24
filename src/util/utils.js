import { formatDistanceToNow, format } from 'date-fns';
import locale from 'date-fns/locale/nb';
import * as Toast from '@/util/toasts';
import { analytics, auth } from '@/config/firebaseConfig';
import router from '@/router';

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

// eslint-disable-next-line no-console
async function errorHandler(errorType, error = console.trace(), payload = {}) {
  const user = auth.currentUser ? auth.currentUser.email : null;
  const view = router.currentRoute.path;

  analytics.logEvent(`${errorType}`, { user, view, error, ...payload });

  Toast.error();
  throw new Error(errorType);
}

async function logHandler(eventName) {
  const user = auth.currentUser ? auth.currentUser.email : null;
  const view = router.currentRoute.path;

  analytics.logEvent(`${eventName}`, { user, view });
}

export { getProductFromSlug, timeFromNow, errorHandler, logHandler, datePretty };
