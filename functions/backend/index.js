import functions from 'firebase-functions';

import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import morgan from 'morgan';

import config from '../config.js';

// Routes
import accessRequestsRoutes from './routes/accessRequests.js';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests, please try again later.',
  keyGenerator: (request) => request.ip,
});

const app = express();

app.use(cors());
app.use(apiLimiter);
app.use(express.json());
app.use(morgan('combined'));

app.use('/accessRequests', accessRequestsRoutes);

const internal = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .https.onRequest(app);

export default internal;
