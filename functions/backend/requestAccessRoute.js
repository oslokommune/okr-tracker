const router = require('express').Router();
const admin = require('firebase-admin');

const db = admin.firestore();

const validateFirebaseIdToken = require('./middlewares');

const collection = db.collection('requestAccess');

router.post('/:id/create', async (req, res) => {
  const { id } = req.params;
  try {
    await collection.add({ email: id, created: new Date() });

    res.send(`Access request created (${id})`);
  } catch (e) {
    res.status(500).send(`Cannot create access request (${id}}`);
  }
});

router.delete('/:id', validateFirebaseIdToken, async (req, res) => {
  const { id } = req.params;

  try {
    await collection.doc(id).delete();

    res.send(`Request deleted (${id})`);
  } catch (e) {
    res.status(500).send(`Cannot remove access request (${id}}`);
  }
});

module.exports = router;
