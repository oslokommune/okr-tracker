import firebase from 'firebase';
import 'firebase/firestore';

export const dashboardUser = process.env.VUE_APP_DASHBOARD_USER;

const config = {
  apiKey: 'AIzaSyBrkEo57f6k4iAGOboYw9rWUOWQXPX_NxE',
  authDomain: 'origo-okr-tracker.firebaseapp.com',
  databaseURL: 'https://origo-okr-tracker.firebaseio.com',
  projectId: 'origo-okr-tracker',
  storageBucket: 'origo-okr-tracker.appspot.com',
  messagingSenderId: '619405151224',
  appId: '1:619405151224:web:f1fee6bd890741b484e40d',
  measurementId: 'G-9006P282T2',
};

firebase.initializeApp(config);

// firebase utils
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
const loginProvider = new firebase.auth.GoogleAuthProvider();

export { db, auth, loginProvider, storage };
