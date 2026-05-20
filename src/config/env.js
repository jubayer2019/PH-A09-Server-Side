const dotenv = require('dotenv');

dotenv.config();

const required = [
  'NODE_ENV',
  'MONGODB_URI',
  'CLIENT_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'COOKIE_NAME',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0 && !process.env.VERCEL) {
  throw new Error(`Missing required env variable(s): ${missing.join(', ')}`);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT || 5000),
  mongodbUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  cookieName: process.env.COOKIE_NAME,
};
