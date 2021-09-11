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
  merge: true,
};

export const dashboardUser = import.meta.env.VITE_DASHBOARD_USER;

const config = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

firebase.initializeApp(config);

// firebase utils
const db = firebase.firestore();
const loginProvider = new firebase.auth.GoogleAuthProvider();
const storage = firebase.storage();
const auth = firebase.auth();
const analytics = firebase.analytics();
const functions = firebase.app().functions(import.meta.env.VITE_REGION);
const { serverTimestamp, arrayRemove, arrayUnion } = firebase.firestore.FieldValue;

if (import.meta.env.MODE === 'development' || window.Cypress) {
  db.settings(firestoreEmulator);
  functions.useEmulator('localhost', emulators.functions.port);
  auth.useEmulator(`http://localhost:${emulators.auth.port}`);
  storage.useEmulator('localhost', emulators.storage.port);
  console.log('Established dev connection to Firestore emulators');
} else {
  console.log('Established connection to Firestore server');
}

export { db, auth, loginProvider, storage, analytics, functions, serverTimestamp, arrayRemove, arrayUnion };
