const asyncHandler = require('../utils/asyncHandler');
const { registerUser, loginUser, createRefreshToken, verifyRefreshToken, rotateRefreshToken } = require('../services/authService');
const { signJwt, cookieOptions } = require('../utils/jwt');
const env = require('../config/env');

const attachAuthCookie = (res, userId) => {
  const token = signJwt({ sub: userId });
  res.cookie(env.cookieName, token, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  return token;
};

const attachRefreshCookie = (res, refreshToken) => {
  res.cookie(`${env.cookieName}_refresh`, refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, photo } = req.body;
  const user = await registerUser({ name, email, password, photo });

  const refreshToken = await createRefreshToken(user._id.toString());
  const authToken = attachAuthCookie(res, user._id.toString());
  attachRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: user,
    token: authToken,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUser({ email, password });

  const refreshToken = await createRefreshToken(user._id.toString());
  const authToken = attachAuthCookie(res, user._id.toString());
  attachRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: user,
    token: authToken,
  });
});

const me = asyncHandler(async (req, res) => {
  const authToken = attachAuthCookie(res, req.user.id);

  res.status(200).json({
    success: true,
    data: req.user,
    token: authToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.cookieName, cookieOptions);
  res.clearCookie(`${env.cookieName}_refresh`, cookieOptions);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[`${env.cookieName}_refresh`];
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  const user = await verifyRefreshToken(refreshToken);

  // rotate
  const newRefresh = await rotateRefreshToken(refreshToken, user._id.toString());

  const authToken = attachAuthCookie(res, user._id.toString());
  attachRefreshCookie(res, newRefresh);

  res.status(200).json({ success: true, data: user, token: authToken });
});

module.exports = {
  register,
  login,
  me,
  logout,
  refresh,
};
