import functions from 'firebase-functions';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import validateFirebaseIdToken from '../util/validateFirebaseToken';
import config from '../config';

// Routes
import accessRoutes from './routes/access';
import userRoutes from './routes/user';
import tokenRoutes from './routes/token';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('combined'));

app.use('/token', validateFirebaseIdToken, tokenRoutes);

app.use('/access', accessRoutes);

app.use('/user', validateFirebaseIdToken, userRoutes);

exports.app = functions.runWith(config.runtimeOpts).region(config.region).https.onRequest(app);
