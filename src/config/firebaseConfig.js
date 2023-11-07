import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/functions';

import { emulators } from '../../firebase.json';

const firestoreEmulator = {
  host: `localhost:${emulators.firestore.port}`,
  ssl: false,
  experimentalAutoDetectLongPolling: true,
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
};

firebase.initializeApp(config);

// firebase utils
const db = firebase.firestore();
const loginProviderGoogle = new firebase.auth.GoogleAuthProvider();
const loginProviderMS = new firebase.auth.OAuthProvider('microsoft.com');
loginProviderMS.setCustomParameters({
  // "tenant" parameter in case you are using an Azure AD tenant.
  // The default value is "common".
  tenant: import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common',
});
const storage = firebase.storage();
const auth = firebase.auth();
const functions = firebase.app().functions(import.meta.env.VITE_REGION);
const { serverTimestamp, arrayRemove, arrayUnion } = firebase.firestore.FieldValue;

if (import.meta.env.MODE === 'development') {
  db.settings(firestoreEmulator);
  functions.useEmulator('localhost', emulators.functions.port);
  auth.useEmulator(`http://localhost:${emulators.auth.port}`);
  storage.useEmulator('localhost', emulators.storage.port);
  console.log('Established dev connection to Firestore emulators');
} else {
  console.log('Established connection to Firestore server');
}

export {
  db,
  auth,
  loginProviderGoogle,
  storage,
  functions,
  serverTimestamp,
  arrayRemove,
  arrayUnion,
  loginProviderMS,
};
