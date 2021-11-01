import functions from 'firebase-functions';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import validateFirebaseIdToken from '../util/validateFirebaseToken.js';
import config from '../config.js';

// Routes
import accessRoutes from './routes/access.js';
import userRoutes from './routes/user.js';
import tokenRoutes from './routes/token.js';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('combined'));

app.use('/token', validateFirebaseIdToken, tokenRoutes);

app.use('/access', accessRoutes);

app.use('/user', validateFirebaseIdToken, userRoutes);

const internal = functions.runWith(config.runtimeOpts).region(config.region).https.onRequest(app);

export default internal;
