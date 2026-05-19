const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyJwt } = require('../utils/jwt');
const env = require('../config/env');

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    throw new AppError('Unauthorized access', 401);
  }

  const decoded = verifyJwt(token);
  const user = await User.findById(decoded.sub).lean();

  if (!user) {
    throw new AppError('User not found', 401);
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    photo: user.photo,
  };

  next();
});

module.exports = {
  requireAuth,
};
