import functions from 'firebase-functions';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import validateFirebaseIdToken from '../util/validateFirebaseToken.js';
import config from '../config.js';

// Routes
import tokenRoutes from './routes/token.js';
import accessRequestsRoutes from './routes/accessRequests.js';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('combined'));

app.use('/accessRequests', accessRequestsRoutes);
app.use('/token', validateFirebaseIdToken, tokenRoutes);

const internal = functions.runWith(config.runtimeOpts).region(config.region).https.onRequest(app);

export default internal;
