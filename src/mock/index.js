/* eslint-disable-next-line */
const axios = require('axios');

// Import mock data
const users = require('./mockUsers.json');
const orgs = require('./mockOrgs.json');

const data = { users, orgs };

// Emulator settings for functions
const PORT = 5001;
const PROJECT_ID = 'origo-okr-tracker'; // todo: read from environment variable
const REGION = 'europe-west2';
const FUNCTION_ID = 'populateFirestoreEmulator';
const SECRET = 'UZPmJ9gOXHmb6RRttAyURi4JdkvDq8'; // todo: read from environment variable
const url = `http://localhost:${PORT}/${PROJECT_ID}/${REGION}/${FUNCTION_ID}?secret=${SECRET}`;

// Call the emulated cloud function
axios({
  method: 'post',
  url,
  data,
}).catch(err => {
  throw new Error(err);
});
