const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const validateFirebaseIdToken = require('./middlewares');
const config = require('../config');

// Routes
const accessRoutes = require('./requestAccessRoute');
const userRoutes = require('./user');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/hello', validateFirebaseIdToken, (req, res) => {
  console.log('hello');
  res.send(`Hello ${req.user.name}`);
});

app.get('/token', validateFirebaseIdToken, (req, res) => {
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

app.use('/access', accessRoutes);

app.use('/user', userRoutes);

exports.app = functions.runWith(config.runtimeOpts).region(config.region).https.onRequest(app);
