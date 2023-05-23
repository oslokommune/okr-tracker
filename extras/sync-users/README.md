# sync-users

Google Apps Script for syncing user details from a Google Sheets spreadsheet to
the OKR-tracker.

Some assumptions are built into the script:

- That the data lives in a sheet named "Ansatte i Origo idag".
- That there are columns named "Epost" and "Navn". "Navn" is synced to users'
  `displayName` in the OKR-tracker, based on the email address found in "Epost".

To install the script, open the Google Sheets spreadsheet and select
"Extensions" in the top menu bar, then "Apps Script". Paste the source code
from `syncUsers.gs` into the source code editor pane in Google Apps Script. The
strings marked `<base-url>`, `<okr-admin-secret>` and `<api-key>` in the script
must then be replaced with their real values.

Save the file, and run it or set up triggers as desired. Select `syncUsers` as
the entry function.
