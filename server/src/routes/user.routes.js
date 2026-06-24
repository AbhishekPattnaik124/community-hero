const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const Issue = require('../models/Issue.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * @swagger
 * /api/users/leaderboard:
 *   get:
 *     tags: [Users]
 *     summary: Get top contributors leaderboard
 *     security: []
 */
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const users = await User.find({ isActive: true, role: 'citizen' })
      .sort({ points: -1 })
      .limit(parseInt(limit))
      .select('name avatar points level badges issuesReported issuesResolved')
      .lean();

    return ApiResponse.success(res, { users }, 'Leaderboard fetched');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user's full profile
 */
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const recentIssues = await Issue.find({ reporter: req.user._id, isArchived: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status category createdAt upvoteCount')
      .lean();

    return ApiResponse.success(res, { user, recentIssues }, 'Profile fetched');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user's profile
 */
router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const allowed = ['name', 'bio', 'phone', 'notifications', 'defaultLocation'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).lean();
    return ApiResponse.success(res, { user }, 'Profile updated');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a public user profile
 *     security: []
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar role points level badges issuesReported issuesResolved createdAt')
      .lean();
    if (!user) throw ApiError.notFound('User not found');

    const issueCount = await Issue.countDocuments({ reporter: req.params.id, isArchived: false });
    return ApiResponse.success(res, { user: { ...user, issueCount } }, 'User fetched');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin only)
 */
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, users, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
