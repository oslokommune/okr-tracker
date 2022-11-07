import { FieldValue } from 'firebase-admin/firestore';
import getSheetsData from '../util/getSheetsData.js';

const fetchKpiDataOnUpdate = async (doc) => {
  if (!doc || !doc.ref || !doc.ref.update) {
    throw new Error('Invalid document');
  }

  const { ref } = doc;

  try {
    const { api, auto, sheetId, sheetName, sheetCell } = doc.data();
    // Some KPI objects might not include the `auto` property. The Google
    // Sheets integration was previously enabled in cases where the API was not
    // enabled. For backwards compatibility, check for this condition as well.
    const sheetsEnabled =
      auto || (auto === undefined && !api && sheetId && sheetName && sheetCell);

    if (!sheetsEnabled) {
      await ref.update({ error: FieldValue.delete(), valid: true });
      return true;
    }

    const value = await getSheetsData(doc.data());

    // eslint-disable-next-line no-restricted-globals
    if (!value || isNaN(value)) {
      return ref.update({ error: 'Invalid data returned' });
    }

    await ref.collection('progress').add({ value, timestamp: new Date() });
    await ref.update({ error: FieldValue.delete(), currentValue: value, valid: true });

    return true;
  } catch ({ message }) {
    return ref.update({ error: message, valid: false });
  }
};

export default fetchKpiDataOnUpdate;
