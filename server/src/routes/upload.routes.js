const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticate } = require('../middleware/auth.middleware');
const { upload, processImages } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/rateLimit.middleware');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     tags: [Upload]
 *     summary: Upload and compress images (returns base64 or URL)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 */
router.post('/images', authenticate, uploadLimiter, upload.array('images', 5), processImages, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw ApiError.badRequest('No images provided');
    }

    // In production: upload to Cloudinary / AWS S3
    // For now: return base64 data URIs
    const urls = req.files.map((file) => ({
      url: `data:image/webp;base64,${file.buffer.toString('base64')}`,
      size: file.size,
      name: file.originalname,
    }));

    return ApiResponse.success(res, { images: urls, count: urls.length }, 'Images uploaded successfully');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     tags: [Upload]
 *     summary: Upload user avatar
 */
router.post('/avatar', authenticate, uploadLimiter, upload.single('avatar'), processImages, async (req, res, next) => {
  try {
    if (!req.file) throw ApiError.badRequest('No avatar image provided');

    const avatarUrl = `data:image/webp;base64,${req.file.buffer.toString('base64')}`;

    const User = require('../models/User.model');
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    return ApiResponse.success(res, { avatarUrl }, 'Avatar updated');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
