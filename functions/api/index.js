const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const config = require('../config');

// Routes
const kpiRoutes = require('./routes/kpi');
const keyresRoutes = require('./routes/keyres');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('combined'));

app.use('/kpi', kpiRoutes);

app.use('/keyres', keyresRoutes);

exports.app = functions.runWith(config.runtimeOpts).region(config.region).https.onRequest(app);
