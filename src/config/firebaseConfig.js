import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import 'firebase/functions';

import { emulators } from '../../firebase.json';

const firestoreEmulator = {
  host: `localhost:${emulators.firestore.port}`,
  ssl: false,
  experimentalForceLongPolling: true,
};

export const dashboardUser = process.env.VUE_APP_DASHBOARD_USER;

const config = {
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_APP_ID,
  measurementId: process.env.VUE_APP_MEASUREMENT_ID,
};

firebase.initializeApp(config);

// firebase utils
const db = firebase.firestore();
const loginProvider = new firebase.auth.GoogleAuthProvider();
const storage = firebase.storage();
const auth = firebase.auth();
const analytics = firebase.analytics();
const functions = firebase.functions();
const { serverTimestamp, arrayRemove } = firebase.firestore.FieldValue;

if (process.env.NODE_ENV === 'development' || window.Cypress) {
  db.settings(firestoreEmulator);
  functions.useEmulator('http://localhost', emulators.functions.port);
  console.log('Established connection to Firestore emulators');
} else {
  console.log('Established connection to Firestore server');
}

export { db, auth, loginProvider, storage, analytics, functions, serverTimestamp, arrayRemove };
