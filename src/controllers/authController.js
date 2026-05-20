const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');
const { registerUser, loginUser, findOrCreateGoogleUser, createRefreshToken, verifyRefreshToken, rotateRefreshToken } = require('../services/authService');
const { signJwt, cookieOptions } = require('../utils/jwt');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

const attachAuthCookie = (res, userId) => {
  const token = signJwt({ sub: userId });
  res.cookie(env.cookieName, token, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
};

const attachRefreshCookie = (res, refreshToken) => {
  res.cookie(`${env.cookieName}_refresh`, refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const attachOAuthStateCookie = (res, state) => {
  res.cookie(`${env.cookieName}_oauth_state`, state, {
    ...cookieOptions,
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
  });
};

const clearOAuthStateCookie = (res) => {
  res.clearCookie(`${env.cookieName}_oauth_state`, cookieOptions);
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, photo } = req.body;
  const user = await registerUser({ name, email, password, photo });

  const refreshToken = await createRefreshToken(user._id.toString());
  attachAuthCookie(res, user._id.toString());
  attachRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUser({ email, password });

  const refreshToken = await createRefreshToken(user._id.toString());
  attachAuthCookie(res, user._id.toString());
  attachRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: user,
  });
});

const me = asyncHandler(async (req, res) => {
  attachAuthCookie(res, req.user.id);

  res.status(200).json({
    success: true,
    data: req.user,
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

  attachAuthCookie(res, user._id.toString());
  attachRefreshCookie(res, newRefresh);

  res.status(200).json({ success: true, data: user });
});

const googleStart = asyncHandler(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new AppError('Google login is not configured on the server', 500);
  }

  const state = crypto.randomBytes(16).toString('hex');
  const requestOrigin = `${req.protocol}://${req.get('host')}`.replace(/\/$/, '');
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${requestOrigin}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    access_type: 'offline',
    state,
  });

  attachOAuthStateCookie(res, state);
  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const savedState = req.cookies[`${env.cookieName}_oauth_state`];

  if (!code) {
    throw new AppError('Missing Google authorization code', 400);
  }

  if (!state || !savedState || state !== savedState) {
    throw new AppError('Invalid Google sign-in state', 400);
  }

  const requestOrigin = `${req.protocol}://${req.get('host')}`.replace(/\/$/, '');
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${requestOrigin}/api/auth/google/callback`;

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    throw new AppError('Failed to exchange Google authorization code', 401);
  }

  const tokenData = await tokenResponse.json();
  const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new AppError('Failed to read Google profile', 401);
  }

  const googleProfile = await userInfoResponse.json();
  const user = await findOrCreateGoogleUser({
    googleId: googleProfile.sub,
    email: googleProfile.email,
    name: googleProfile.name,
    photo: googleProfile.picture,
  });

  const refreshToken = await createRefreshToken(user._id.toString());
  attachAuthCookie(res, user._id.toString());
  attachRefreshCookie(res, refreshToken);
  clearOAuthStateCookie(res);

  const clientUrl = (env.clientUrl || requestOrigin).replace(/\/$/, '');
  res.redirect(`${clientUrl}/login?google=success`);
});

module.exports = {
  register,
  login,
  me,
  logout,
  refresh,
  googleStart,
  googleCallback,
};
