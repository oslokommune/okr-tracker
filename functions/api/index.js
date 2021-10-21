import functions from 'firebase-functions';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import config from '../config';

// Routes
import kpiRoutes from './routes/kpi';
import keyResRoutes from './routes/keyres';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('combined'));

app.use('/kpi', kpiRoutes);

app.use('/keyres', keyResRoutes);

exports.app = functions.runWith(config.runtimeOpts).region(config.region).https.onRequest(app);
