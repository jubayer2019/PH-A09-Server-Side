const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signJwt = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

const verifyJwt = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

const isLocalClient = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(env.clientUrl.replace(/\/$/, ''));

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
