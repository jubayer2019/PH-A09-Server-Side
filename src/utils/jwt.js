const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signJwt = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

const verifyJwt = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  path: '/',
};

module.exports = {
  signJwt,
  verifyJwt,
  cookieOptions,
};
