const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');

const secret = 'UZPmJ9gOXHmb6RRttAyURi4JdkvDq8';
const db = firebaseAdmin.firestore();

module.exports = functions.https.onRequest(async (req, res) => {
  if (!req.query.secret) {
    res.status(401).send('401: Unauthorized');
  }
  if (req.query.secret !== secret) {
    res.status(401).send('401: Unauthorized');
  }

  if (!req.body || !req.body.users || !req.body.users.length) {
    res.status(422).send('422: Unprocessable entity');
  }

  const empty = await db
    .collection('users')
    .get()
    .then(snapshot => snapshot.empty);

  if (empty === false) {
    res.status(500).send('Users collection must be empty');
    return;
  }

  const promises = [];

  req.body.users.forEach(element => {
    const { id, displayName, admin } = element;
    promises.push(db.collection('users').doc(id).set({ admin, displayName, email: id }));
  });

  req.body.orgs.forEach(element => {
    const { name } = element;
    promises.push(db.collection('orgs').add({ name, archived: false }));
  });

  await Promise.all(promises)
    .then(() => {
      console.log('Successfully added test data');
      res.status(201).send('Successfully added test data');
    })
    .catch(() => {
      res.status(500).send('500: Internal server error');
    });
});
