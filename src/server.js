const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const carController = require('./controllers/carController');
const { requireAuth } = require('./middleware/authMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = new Set(
  [
    env.clientUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ''))
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, '');
      const isVercelOrigin = /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(normalizedOrigin);

      if (allowedOrigins.has(normalizedOrigin) || isVercelOrigin) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  })
);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'DriveFleet API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.get('/api/my-cars', requireAuth, carController.getMyCars);
app.use('/api/bookings', bookingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    if (process.env.VERCEL !== '1') {
      app.listen(env.port, () => {
        // eslint-disable-next-line no-console
        console.log(`DriveFleet server running on port ${env.port}`);
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

if (process.env.VERCEL === '1') {
  connectDB().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to database in Vercel runtime', error);
  });
}

if (process.env.VERCEL !== '1') {
  start();
}

module.exports = app;
