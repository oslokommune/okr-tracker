/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // eslint-disable-line
const dataDir = require('data-dir'); // eslint-disable-line

const { emulators } = require('../../firebase.json');
const { region } = require('../../functions/config');

const PROJECT_ID = (() => {
  try {
    if (fs.existsSync('./.firebaserc')) {
      const { projects } = JSON.parse(fs.readFileSync(path.join(__dirname, '../../.firebaserc'), 'utf8'));
      return projects.development;
    }
    return process.env.VUE_APP_PROJECT_ID;
  } catch {
    console.log('error is in projectID');
    return process.env.VUE_APP_PROJECT_ID;
  }
})();

// Emulator settings for functions
const PORT = emulators.functions.port;
const REGION = region;
const FUNCTION_ID = 'transformDataModel';
const SECRET = 'UZPmJ9gOXHmb6RRttAyURi4JdkvDq8'; // todo: read from environment variable
const url = `http://localhost:${PORT}/${PROJECT_ID}/${REGION}/${FUNCTION_ID}?secret=${SECRET}`;

console.log(url);

axios({
  method: 'post',
  url,
}).catch(err => {
  console.log(err);
  throw new Error(err);
});
