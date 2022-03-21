import express from 'express';
import validator from 'express-validator';
import { getFirestore } from 'firebase-admin/firestore';

import validateFirebaseIdToken from '../../util/validateFirebaseToken.js';

import {
  createAccessRequest,
  acceptAccessRequest,
  rejectAccessRequest,
} from '../utils/handleAccessRequests.js';

const router = express.Router();
const { param, body, matchedData } = validator;

router.post(
  '/create',
  body('email').isEmail().trim().escape().normalizeEmail(),
  async (req, res) => {
    const db = getFirestore();
    const sanitized = matchedData(req);
    const { email } = sanitized;

    const { code, message } = await createAccessRequest(db, {
      email,
      created: Date.now(),
    });

    return res.status(code).send(message);
  }
);

router.post(
  '/:id/accept',
  validateFirebaseIdToken,
  param('id').trim().escape(),
  async (req, res) => {
    const db = getFirestore();
    const sanitized = matchedData(req);
    const { id } = sanitized;

    const { code, message } = await acceptAccessRequest(db, id);

    return res.status(code).send(message);
  }
);

router.delete(
  '/:id',
  validateFirebaseIdToken,
  param('id').trim().escape(),
  async (req, res) => {
    const db = getFirestore();
    const sanitized = matchedData(req);
    const { id } = sanitized;

    const { code, message } = await rejectAccessRequest(db, id);

    return res.status(code).send(message);
  }
);

export default router;
