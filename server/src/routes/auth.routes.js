const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../config/logger');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 */
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw ApiError.badRequest('Name, email and password are required');

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const user = await User.create({ name, email, password, authProvider: 'local' });
    const { accessToken, refreshToken } = await generateTokenPair(user);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    logger.info(`New user registered: ${email}`);
    return ApiResponse.created(res, { user: userObj, accessToken, refreshToken }, 'Account created successfully');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw ApiError.badRequest('Email and password are required');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    if (!user.isActive) throw ApiError.forbidden('Your account has been deactivated');

    const { accessToken, refreshToken } = await generateTokenPair(user);
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    return ApiResponse.success(res, { user: userObj, accessToken, refreshToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw ApiError.badRequest('Refresh token required');

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair(user);
    return ApiResponse.success(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    return ApiResponse.success(res, { user: req.user }, 'User fetched');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout – invalidate refresh token
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      const { accessToken, refreshToken } = await generateTokenPair(req.user);
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }
  }
);

module.exports = router;
