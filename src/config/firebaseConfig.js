import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

import { emulators } from '../../firebase.json';

// Create and initialize the FirebaseApp instance
// https://firebase.google.com/docs/web/learn-more#config-object
const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
});

const auth = getAuth(firebaseApp);
const loginProviderGoogle = new GoogleAuthProvider();
const loginProviderMS = new OAuthProvider('microsoft.com');
loginProviderMS.setCustomParameters({
  // Optional "tenant" parameter in case you are using an Azure AD tenant.
  // The default value is "common".
  tenant: import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common',
});

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const functions = getFunctions(firebaseApp, import.meta.env.VITE_REGION);

if (import.meta.env.MODE === 'development') {
  connectFirestoreEmulator(db, 'localhost', emulators.firestore.port);
  connectAuthEmulator(auth, `http://localhost:${emulators.auth.port}`);
  connectFunctionsEmulator(functions, 'localhost', emulators.functions.port);
  connectStorageEmulator(storage, 'localhost', emulators.storage.port);
  console.log('Established dev connection to Firestore emulators');
} else {
  console.log('Established connection to Firestore server');
}

export {
  auth,
  db,
  firebaseApp,
  functions,
  loginProviderGoogle,
  loginProviderMS,
  storage,
};
