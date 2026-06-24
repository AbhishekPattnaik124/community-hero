const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const Notification = require('../models/Notification.model');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notifications for current user
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sender', 'name avatar')
        .populate('relatedIssue', 'title status')
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    return ApiResponse.paginated(
      res,
      notifications,
      { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit), unreadCount }
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/notifications/mark-read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notifications as read
 */
router.patch('/mark-read', authenticate, async (req, res, next) => {
  try {
    const { ids } = req.body; // array of IDs or empty for all
    const query = { recipient: req.user._id, isRead: false };
    if (ids?.length) query._id = { $in: ids };

    await Notification.updateMany(query, { isRead: true, readAt: new Date() });
    return ApiResponse.success(res, null, 'Notifications marked as read');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
