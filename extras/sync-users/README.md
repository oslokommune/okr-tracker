# sync-users

Google Apps Script for syncing user details from a Google Sheets spreadsheet to
the OKR-tracker.

Some assumptions are built into the script:

- That the data lives in a sheet named "Ansatte i Origo idag".
- That there are columns named "Epost" and "Navn". "Navn" is synced to users'
  `displayName` in the OKR-tracker, based on the email address found in "Epost".

The strings marked `<base-url>`, `<okr-admin-secret>` and `<api-key>` in the
script must be replaced with their real values before deploying to Apps Script.
