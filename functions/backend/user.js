const router = require('express').Router();
const admin = require('firebase-admin');

const db = admin.firestore();

const validateFirebaseIdToken = require('./middlewares');
const preferences = require('./defaultPreferences');

const collection = db.collection('users');

router.post('/create', validateFirebaseIdToken, async (req, res) => {
  const { body } = req;
  try {
    if (!body.email) {
      res.status(500).send('User object is not present');
      return;
    }

    const { exists } = await collection.doc(body.id).get();

    if (exists) {
      res.status(500).send('User already exists');
      return;
    }

    await collection.doc(body.id).set({
      ...body,
      preferences,
    });

    res.send('User added successfully');
  } catch (e) {
    res.status(500).send('Cannot create user');
  }
});

module.exports = router;
