const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signJwt = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

const verifyJwt = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

const normalizedClientUrl = typeof env.clientUrl === 'string' ? env.clientUrl.replace(/\/$/, '') : '';
const isLocalClient = normalizedClientUrl
  ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedClientUrl)
  : process.env.NODE_ENV !== 'production';

const cookieOptions = {
  httpOnly: true,
  secure: !isLocalClient,
  sameSite: isLocalClient ? 'lax' : 'none',
  path: '/',
};

module.exports = {
  signJwt,
  verifyJwt,
  cookieOptions,
};
