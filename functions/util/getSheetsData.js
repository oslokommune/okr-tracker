import functions from 'firebase-functions';
import googleApis from 'googleapis';
import sheetIdFromUrl from './util.js';

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
 * Return a value from a Google Sheets cell.
 * @param {String} sheetId - ID of the Google Sheets document
 * @param {String} sheetUrl - URL of the Google Sheets document
 * @param {String} sheetName - Name of sheet (tab)
 * @param {String} sheetCell - Cell name to look up
 * @returns {Number} - Value of the cell
 */
const getSheetsData = async ({ sheetId, sheetUrl, sheetName, sheetCell }) => {
  const sheets = google.sheets('v4');
  if (!(sheetId || sheetUrl) || !sheetName || !sheetCell) {
    return false;
  }

  if (sheetUrl) {
    sheetId = sheetIdFromUrl(sheetUrl);
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
