const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const ApiError = require('../utils/ApiError');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Memory storage – process with sharp before saving
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 5 },
});

/**
 * Sharp image processing pipeline
 * Compresses and converts images to WebP
 */
const processImages = async (req, res, next) => {
  if (!req.files && !req.file) return next();

  try {
    const files = req.files || (req.file ? [req.file] : []);
    const processed = await Promise.all(
      files.map(async (file) => {
        const processedBuffer = await sharp(file.buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();

        return {
          ...file,
          buffer: processedBuffer,
          mimetype: 'image/webp',
          originalname: path.parse(file.originalname).name + '.webp',
          size: processedBuffer.length,
        };
      })
    );

    if (req.file) {
      req.file = processed[0];
    } else {
      req.files = processed;
    }
    next();
  } catch (err) {
    next(new ApiError(500, 'Image processing failed'));
  }
};

module.exports = { upload, processImages };
