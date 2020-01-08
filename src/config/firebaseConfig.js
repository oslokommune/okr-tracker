import firebase from 'firebase';
import 'firebase/firestore';

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

// firebase collections
const usersCollection = db.collection('users');

function updateUserObject(user) {
  const userRef = usersCollection.doc(user.email);

  return db
    .runTransaction(transaction => {
      return transaction.get(userRef).then(doc => {
        if (!doc.exists) throw new Error('Document does not exist!');

        const currentUserData = doc.data();
        const { displayName, photoURL, email } = user;
        const googleUserData = { displayName, photoURL, email };
        const newData = { ...googleUserData, ...currentUserData };

        transaction.update(userRef, newData);
      });
    })
    .then(() => {
      console.log('transaction successfully committed!');
    })
    .catch(error => {
      throw new Error(error);
    });
}

export { db, auth, loginProvider, usersCollection, updateUserObject, storage };
