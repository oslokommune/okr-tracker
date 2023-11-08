import functions from 'firebase-functions';

import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import morgan from 'morgan';

import config from '../config.js';

// Routes
import keyResRoutes from './routes/keyres.js';
import kpiRoutes from './routes/kpi.js';
import statusRoutes from './routes/status.js';
import userRoutes from './routes/user.js';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  message: 'Too many requests, please try again later.',
});

const app = express();

app.use(cors());
app.use(apiLimiter);
app.use(express.json());
app.use(morgan('combined'));

app.use('/keyres', keyResRoutes);
app.use('/kpi', kpiRoutes);
app.use('/status', statusRoutes);
app.use('/user', userRoutes);

const api = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .https.onRequest(app);

export default api;
