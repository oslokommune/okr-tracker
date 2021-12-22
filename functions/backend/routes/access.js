import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import validator from 'express-validator';
import validateFirebaseIdToken from '../../util/validateFirebaseToken.js';

const router = express.Router();
const { param, matchedData } = validator;

router.post('/:email/create', param('email').isEmail().trim().escape().normalizeEmail(), async (req, res) => {
  const sanitized = matchedData(req);
  const { email } = sanitized;

  const db = getFirestore();
  const collection = await db.collection('requestAccess');

  try {
    await collection.add({ email, created: new Date() });

    res.send(`Access request created (${email})`);
  } catch (e) {
    res.status(500).send(`Cannot create access request (${email}}`);
  }
});

router.delete('/:id', validateFirebaseIdToken, param('id').trim().escape(), async (req, res) => {
  const sanitized = matchedData(req);
  const { id } = sanitized;

  const db = getFirestore();
  const collection = await db.collection('requestAccess');


  try {
    await collection.doc(id).delete();

    res.send(`Request deleted (${id})`);
  } catch (e) {
    res.status(500).send(`Cannot remove access request (${id}}`);
  }
});

export default router;
