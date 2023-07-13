import i18n from '@/locale/i18n';
import { db } from '@/config/firebaseConfig';

/**
 * Gets the active period for an item. If there's no active period for the current date,
 * it returns the latest period for the item.
 */
export default async function getActivePeriod(slugRef) {
  const periodsRef = db
    .collection('periods')
    .where('archived', '==', false)
    .where('parent', '==', slugRef)
    .orderBy('startDate', 'desc');

  const filterPeriodsIncludeToday = (doc) => {
    const now = new Date();
    const { startDate, endDate } = doc.data();
    if (startDate.toDate() > now) {
      return false;
    }
    if (endDate.toDate() < now) {
      return false;
    }
    return true;
  };

  let activePeriodRef = await periodsRef
    .get()
    .then((snapshot) => snapshot.docs.filter(filterPeriodsIncludeToday))
    .then((list) => (list[0] && list[0].ref ? list[0].ref : null));

  if (!activePeriodRef) {
    activePeriodRef = await periodsRef.get().then((snapshot) => snapshot.docs[0]);
  }

  return { activePeriodRef, periodsRef };
}

export const sortByLocale = (arr) =>
  arr.sort((a, b) =>
    a.name.trim().toUpperCase().localeCompare(b.name.trim().toUpperCase(), i18n.locale)
  );
