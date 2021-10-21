import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    token = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    token = req.cookies.__session;
  }

  res.status(200).send(`Bearer ${token}`);
});

module.exports = router;
