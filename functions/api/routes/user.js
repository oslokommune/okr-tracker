import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import validator from 'express-validator';
import {
  adminSecretValidator,
  displayNameValidator,
  idValidator,
  positionValidator,
} from '../validators.js';

const { matchedData, validationResult } = validator;
const router = express.Router();

router.patch(
  '/:id',
  adminSecretValidator,
  displayNameValidator,
  idValidator,
  positionValidator,
  async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).json({
        message: 'Invalid request data',
        errors: result.mapped(),
      });
      return;
    }

    const {
      'okr-admin-secret': adminSecret,
      id,
      displayName,
      position,
    } = matchedData(req);

    const db = getFirestore();

    try {
      const secret = await db.collection('config').doc('adminSecret').get();

      if (secret.data()?.value !== adminSecret) {
        res.status(401).send('Wrong okr-admin-secret');
        return;
      }

      const user = await db.collection('users').doc(id).get();

      const { exists, ref } = user;

      if (!exists) {
        res.status(404).send(`Could not find user with ID: ${id}`);
        return;
      }

      const data = {
        ...(displayName ? { displayName } : {}),
        ...(position ? { position } : {}),
      };

      if (data) {
        await ref.update({
          ...data,
          edited: new Date(),
          editedBy: 'API',
        });
        res.send('User updated');
      } else {
        res.send('Nothing to update');
      }
    } catch (e) {
      console.error('ERROR: ', e.message);
      res.status(500).send(e.message);
    }
  }
);

export default router;
