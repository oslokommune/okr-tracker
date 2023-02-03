import express from 'express';
import validator from 'express-validator';
import { getFirestore } from 'firebase-admin/firestore';

import ensureSuperAdmin from '../../util/ensureSuperAdmin.js';
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
  body('email').isEmail().trim().escape().normalizeEmail({ gmail_remove_dots: false }),
  async (req, res) => {
    const db = getFirestore();
    const sanitized = matchedData(req);
    const { email } = sanitized;

    const result = await createAccessRequest(db, {
      email,
      created: Date.now(),
    });

    return res.status(result.code).json(result);
  }
);

router.post(
  '/:id/accept',
  validateFirebaseIdToken,
  ensureSuperAdmin,
  param('id').trim().escape(),
  async (req, res) => {
    const db = getFirestore();
    const sanitized = matchedData(req);
    const { id } = sanitized;

    const result = await acceptAccessRequest(db, id);

    return res.status(result.code).json(result);
  }
);

router.delete(
  '/:id',
  validateFirebaseIdToken,
  ensureSuperAdmin,
  param('id').trim().escape(),
  async (req, res) => {
    const db = getFirestore();
    const sanitized = matchedData(req);
    const { id } = sanitized;

    const result = await rejectAccessRequest(db, id);

    return res.status(result.code).json(result);
  }
);

export default router;
