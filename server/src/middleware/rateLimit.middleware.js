const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded: ${req.ip} on ${req.originalUrl}`);
      res.status(options.statusCode).json(options.message);
    },
  });

// General API limiter
const apiLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX) || 100,
  'Too many requests, please try again later.'
);

// Strict auth limiter
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  10,
  'Too many authentication attempts, please try again after 15 minutes.'
);

// Upload limiter
const uploadLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  20,
  'Upload limit reached, please try again after an hour.'
);

// Issue creation limiter
const issueLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  30,
  'Issue creation limit reached, please try again later.'
);

module.exports = { apiLimiter, authLimiter, uploadLimiter, issueLimiter };
