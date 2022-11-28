import functions from 'firebase-functions';
import googleApis from 'googleapis';

const { google } = googleApis;
const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
const sheetsEmail =
  process.env.SHEETS_EMAIL || functions.config().service_account.client_email;
const sheetsKey =
  process.env.SHEETS_KEY || functions.config().service_account.private_key;
const sheetsImpersonator =
  process.env.SHEETS_IMPERSONATOR || functions.config().sheets?.impersonator || null;

const jwtClient = new google.auth.JWT(
  sheetsEmail,
  null,
  sheetsKey,
  scopes,
  sheetsImpersonator
);

jwtClient.authorize((err) => {
  if (err) {
    console.error(err);
  }
});

/**
 * Gets a value from a Google Sheet cell
 * @param {String} sheetId - ID of Sheets Document
 * @param {String} sheetName - Name of Sheet (tab)
 * @param {String} cell - Cell name of value
 * @returns {Number} - Value of the cell
 */
const getSheetsData = async ({ sheetId, sheetName, sheetCell }) => {
  const sheets = google.sheets('v4');
  if (!sheetId || !sheetName || !sheetCell) {
    return false;
  }

  const sheetRequest = {
    auth: jwtClient,
    spreadsheetId: sheetId,
    range: `${sheetName}!${sheetCell}`,
  };

  return sheets.spreadsheets.values
    .get(sheetRequest)
    .then((response) => {
      try {
        return +response.data.values[0][0];
      } catch {
        throw new Error(`Cannot find data in cell ${sheetCell} `);
      }
    })
    .catch((err) => {
      if (err.response) {
        throw new Error(err.response.status);
      }
      throw err;
    });
};

export default getSheetsData;
