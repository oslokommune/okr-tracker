import functions from 'firebase-functions';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import config from '../config.js';

// Routes
import kpiRoutes from './routes/kpi.js';
import keyResRoutes from './routes/keyres.js';
import statusRoutes from './routes/status.js';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('combined'));

app.use('/kpi', kpiRoutes);
app.use('/keyres', keyResRoutes);
app.use('/status', statusRoutes);

const api = functions.runWith(config.runtimeOpts).region(config.region).https.onRequest(app);

export default api;