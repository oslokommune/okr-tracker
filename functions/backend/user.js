const router = require('express').Router();
const admin = require('firebase-admin');
const { body, matchedData } = require('express-validator');

const db = admin.firestore();

const validateFirebaseIdToken = require('./middlewares');
const preferences = require('./defaultPreferences');

const collection = db.collection('users');

const validateUser = [body('email').isEmail().trim().escape().normalizeEmail(), body('id').trim().escape()];

router.post('/create', validateFirebaseIdToken, ...validateUser, async (req, res) => {
  const sanitized = matchedData(req);
  const { email, id } = sanitized;
  try {
    if (!email) {
      res.status(400).send('User object is not present, or at least some properties are not present');
      return;
    }

    const { exists } = await collection.doc(id).get();

    if (exists) {
      res.status(409).send('User already exists');
      return;
    }

    await collection.doc(id).set({
      ...sanitized,
      preferences,
    });

    res.send('User added successfully');
  } catch (e) {
    res.status(500).send('Cannot create user');
  }
});

module.exports = router;
