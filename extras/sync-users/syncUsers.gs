/* global SpreadsheetApp, UrlFetchApp */

/**
 * Return the index of column `col` in `values`.
 *
 * Raise an error if the column isn't found.
 */
function getIndex(values, col) {
  const index = values[0].indexOf(col);

  if (index === -1) {
    throw new Error(`Missing column '${col}'`);
  }

  return index;
}

/**
 * Update user with email `email` with `data`.
 */
function updateUser(email, data) {
  const id = encodeURIComponent(email);

  const res = UrlFetchApp.fetch(`<base-url>/user/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'okr-admin-secret': '<okr-admin-secret>',
      'x-api-key': '<api-key>',
    },
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
  });

  const text = res.getContentText();

  if (res.getResponseCode() === 200) {
    console.log(text);
  } else {
    console.log(`[${res.getResponseCode()}] Error updating user`);
  }
}

/**
 * Handle a user row.
 *
 * Update the user with the email `email` if `name` is given and makes sense.
 */
function handleUser(email, name) {
  const data = {};

  if (name && name.includes(',')) {
    const [lname, fname] = name.split(',').map((n) => n.trim());
    data.displayName = `${fname} ${lname}`;
  }

  if (data) {
    updateUser(email, data);
  }
}

/**
 * Entry point function. Sync all users found in the spreadsheet.
 */
// eslint-disable-next-line no-unused-vars
function syncUsers() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Ansatte i Origo idag');
  const values = sheet.getDataRange().getValues();

  const emailIndex = getIndex(values, 'Epost');
  const nameIndex = getIndex(values, 'Navn');

  values.slice(1).forEach((row) => {
    handleUser(row[emailIndex], row[nameIndex]);
  });
}
