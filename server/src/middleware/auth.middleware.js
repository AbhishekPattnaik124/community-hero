const passport = require('passport');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Authenticate via JWT Bearer token
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const message = info?.message || 'Authentication required';
      return next(new ApiError(401, message));
    }
    if (!user.isActive) {
      return next(new ApiError(403, 'Your account has been deactivated'));
    }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Authorize specific roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email} (${req.user.role}) to ${req.originalUrl}`);
      return next(new ApiError(403, `Role '${req.user.role}' is not authorized to access this resource`));
    }
    next();
  };
};

/**
 * Optional auth – attaches user if token present, does not fail if missing
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (!err && user && user.isActive) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

module.exports = { authenticate, authorize, optionalAuth };
