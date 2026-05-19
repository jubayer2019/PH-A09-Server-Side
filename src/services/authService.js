const argon2 = require('argon2');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

const registerUser = async ({ name, email, password, photo }) => {
  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  const hashedPassword = await argon2.hash(password);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    photo: photo || '',
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await argon2.verify(user.password, password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  return user;
};

const createRefreshToken = async (userId, expiresInDays = 7) => {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  await RefreshToken.create({ token, user: userId, expiresAt });
  return token;
};

const rotateRefreshToken = async (oldToken, userId) => {
  if (oldToken) await RefreshToken.deleteOne({ token: oldToken, user: userId });
  return createRefreshToken(userId);
};

const verifyRefreshToken = async (token) => {
  const rt = await RefreshToken.findOne({ token }).populate('user');
  if (!rt) throw new AppError('Invalid refresh token', 401);
  if (rt.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: rt._id });
    throw new AppError('Refresh token expired', 401);
  }
  return rt.user;
};

module.exports = {
  registerUser,
  loginUser,
};
