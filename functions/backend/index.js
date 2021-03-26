const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const validateFirebaseIdToken = require('../util/validateFirebaseToken');
const config = require('../config');

// Routes
const accessRoutes = require('./routes/access');
const userRoutes = require('./routes/user');
const tokenRoutes = require('./routes/token');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('combined'));

app.use('/token', validateFirebaseIdToken, tokenRoutes);

app.use('/access', accessRoutes);

app.use('/user', validateFirebaseIdToken, userRoutes);

exports.app = functions.runWith(config.runtimeOpts).region(config.region).https.onRequest(app);
