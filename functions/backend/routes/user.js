import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import validator from 'express-validator';

import preferences from '../../util/defaultPreferences.js';

const { body, matchedData } = validator;
const validateUser = [body('email').isEmail().trim().escape().normalizeEmail(), body('id').trim().escape()];
const router = express.Router();

router.post('/create', ...validateUser, async (req, res) => {
  const sanitized = matchedData(req);
  const { email, id } = sanitized;

  const db = getFirestore();
  const collection = await db.collection('users');

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
      admin: [],
      superAdmin: false,
      preferences,
    });

    res.send('User added successfully');
  } catch (e) {
    res.status(500).send('Cannot create user');
  }
});

export default router;
