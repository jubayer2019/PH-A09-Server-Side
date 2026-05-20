const dotenv = require('dotenv');

dotenv.config();

const required = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'CLIENT_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'COOKIE_NAME',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  mongodbUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  cookieName: process.env.COOKIE_NAME,
};
