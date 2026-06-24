const express = require('express');
const router = express.Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { issueLimiter } = require('../middleware/rateLimit.middleware');
const { upload, processImages } = require('../middleware/upload.middleware');
const { verifyProximity } = require('../middleware/location.middleware');
const issueService = require('../services/issue.service');
const Issue = require('../models/Issue.model');
const Comment = require('../models/Comment.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { emit } = require('../services/socket.service');

/**
 * @swagger
 * /api/issues:
 *   get:
 *     tags: [Issues]
 *     summary: Get issues with filters and pagination
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [open, in_progress, resolved, closed, escalated] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: lat
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         schema: { type: number }
 *       - in: query
 *         name: radius
 *         schema: { type: number, default: 5 }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const result = await issueService.getIssues(req.query);
    return ApiResponse.paginated(res, result.issues, result.pagination);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues:
 *   post:
 *     tags: [Issues]
 *     summary: Create a new community issue
 */
router.post('/', authenticate, issueLimiter, verifyProximity, upload.array('images', 5), processImages, async (req, res, next) => {
  try {
    const { title, description, category, severity, lat, lng, address, ward, city, pincode, tags } = req.body;

    if (!lat || !lng) throw ApiError.badRequest('Location coordinates (lat, lng) are required');

    // Build image URLs (in production, upload to Cloudinary/S3)
    const images = req.files ? req.files.map((f) => `data:image/webp;base64,${f.buffer.toString('base64')}`) : [];

    const issueData = {
      title,
      description,
      category,
      severity: severity || 'medium',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address,
        ward,
        city: city || 'Unknown',
        pincode,
      },
      images,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    };

    // Attach fraud flags
    if (req.fraudFlags) {
      issueData.fraudFlags = req.fraudFlags;
    }

    const issue = await issueService.createIssue(issueData, req.user);
    return ApiResponse.created(res, { issue }, 'Issue reported successfully');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/analytics:
 *   get:
 *     tags: [Issues]
 *     summary: Get analytics data for a city
 */
router.get('/analytics', optionalAuth, async (req, res, next) => {
  try {
    const { city, days } = req.query;
    const analytics = await issueService.getAnalytics(city, parseInt(days) || 30);
    return ApiResponse.success(res, analytics, 'Analytics fetched');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/{id}:
 *   get:
 *     tags: [Issues]
 *     summary: Get a single issue by ID
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const issue = await issueService.getIssueById(req.params.id, req.user?._id);
    return ApiResponse.success(res, { issue });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/{id}:
 *   patch:
 *     tags: [Issues]
 *     summary: Update an issue (reporter or authority)
 */
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw ApiError.notFound('Issue not found');

    const isReporter = issue.reporter.toString() === req.user._id.toString();
    const isAuthority = ['authority', 'admin'].includes(req.user.role);

    if (!isReporter && !isAuthority) throw ApiError.forbidden('Not authorized to update this issue');

    // Status change (authority only)
    if (req.body.status && !isAuthority) throw ApiError.forbidden('Only authority can change issue status');

    if (req.body.status) {
      return ApiResponse.success(
        res,
        { issue: await issueService.updateStatus(req.params.id, req.body.status, req.body.note, req.user) },
        'Status updated'
      );
    }

    // Field updates for reporter
    const allowed = ['title', 'description', 'severity', 'tags'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) issue[field] = req.body[field];
    });
    await issue.save();

    return ApiResponse.success(res, { issue }, 'Issue updated');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/{id}/mark-fake:
 *   patch:
 *     tags: [Issues, Fraud]
 *     summary: Authority marks an issue as fake
 */
router.patch('/:id/mark-fake', authenticate, authorize('authority', 'admin'), async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw ApiError.notFound('Issue not found');

    issue.isFake = true;
    issue.status = 'closed';
    issue.timeline.push({ status: 'closed', note: 'Marked as fake by authority', changedBy: req.user._id });
    await issue.save();

    // Deduct Karma points from reporter
    const reporter = await require('../models/User.model').findById(issue.reporter);
    if (reporter) {
      reporter.points -= 50;
      reporter.fakeReports += 1;
      
      // Auto-suspend if > 3 fakes
      if (reporter.fakeReports >= 3) {
        reporter.isActive = false;
        require('../config/logger').warn(`User ${reporter._id} auto-suspended due to 3 fake reports.`);
      }
      
      await reporter.save();
    }

    return ApiResponse.success(res, { issue }, 'Issue marked as fake and reporter penalized.');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/{id}/upvote:
 *   post:
 *     tags: [Issues]
 *     summary: Toggle upvote on an issue
 */
router.post('/:id/upvote', authenticate, async (req, res, next) => {
  try {
    const result = await issueService.toggleUpvote(req.params.id, req.user);
    return ApiResponse.success(res, result, result.hasUpvoted ? 'Upvoted' : 'Upvote removed');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/{id}/resolve:
 *   post:
 *     tags: [Issues, Digital Bridge]
 *     summary: Authority marks an issue as resolved (requires proof image)
 */
router.post('/:id/resolve', authenticate, authorize('authority', 'admin'), upload.single('resolutionProof'), async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw ApiError.notFound('Issue not found');
    
    if (!req.file) throw ApiError.badRequest('Resolution proof image is required.');

    // Run SSIM validation
    const resolutionService = require('../services/resolution.service');
    const proofResult = await resolutionService.verifyResolution(issue.images, req.file.buffer);

    if (!proofResult.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: proofResult.reason,
        ssimScore: proofResult.ssimScore
      });
    }

    issue.status = 'resolved';
    issue.resolvedAt = new Date();
    issue.timeline.push({ 
      status: 'resolved', 
      note: 'Resolved by authority with visual proof.', 
      changedBy: req.user._id,
      proofImage: `data:image/webp;base64,${req.file.buffer.toString('base64')}`
    });

    await issue.save();
    return ApiResponse.success(res, { issue, ssimScore: proofResult.ssimScore }, 'Issue resolved successfully.');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/{id}/severity:
 *   post:
 *     tags: [Issues]
 *     summary: Vote on issue severity
 */
router.post('/:id/severity', authenticate, async (req, res, next) => {
  try {
    const { score } = req.body;
    if (score === undefined || score < 0 || score > 100) {
      throw ApiError.badRequest('Score must be between 0 and 100');
    }
    const result = await issueService.voteSeverity(req.params.id, req.user, Number(score));
    return ApiResponse.success(res, result, 'Severity vote recorded');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/{id}/comments:
 *   get:
 *     tags: [Issues]
 *     summary: Get comments for an issue
 */
router.get('/:id/comments', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ issue: req.params.id, isDeleted: false, parentComment: null })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'name avatar role level')
        .lean(),
      Comment.countDocuments({ issue: req.params.id, isDeleted: false, parentComment: null }),
    ]);

    return ApiResponse.paginated(res, comments, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/{id}/comments:
 *   post:
 *     tags: [Issues]
 *     summary: Add a comment to an issue
 */
router.post('/:id/comments', authenticate, async (req, res, next) => {
  try {
    const { text, parentComment } = req.body;
    if (!text?.trim()) throw ApiError.badRequest('Comment text is required');

    const issue = await Issue.findById(req.params.id);
    if (!issue) throw ApiError.notFound('Issue not found');

    const comment = await Comment.create({
      text,
      author: req.user._id,
      issue: req.params.id,
      parentComment: parentComment || null,
      isOfficial: ['authority', 'admin'].includes(req.user.role),
    });

    await comment.populate('author', 'name avatar role level');
    await Issue.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
    await req.user.addPoints(5);

    emit.commentAdded(req.params.id, comment.toObject());

    return ApiResponse.created(res, { comment }, 'Comment added');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/issues/{id}:
 *   delete:
 *     tags: [Issues]
 *     summary: Delete an issue (admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await Issue.findByIdAndUpdate(req.params.id, { isArchived: true });
    return ApiResponse.success(res, null, 'Issue archived');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
