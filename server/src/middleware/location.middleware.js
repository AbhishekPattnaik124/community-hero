const geoUtils = require('../utils/geoUtils'); // Assuming geoUtils.getDistance exists
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const geoip = require('geoip-lite');

/**
 * Validates that the user's reported location is within 500m of their physical device location.
 */
const verifyProximity = (req, res, next) => {
  try {
    const { location, clientCoordinates } = req.body;
    req.fraudFlags = req.fraudFlags || [];

    // IP Geolocation Check (Free Local Check)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (clientIp) {
      const geo = geoip.lookup(clientIp);
      if (geo && location && location.city) {
        if (geo.city && geo.city.toLowerCase() !== location.city.toLowerCase()) {
          logger.warn(`IP mismatch: User IP in ${geo.city}, reporting issue in ${location.city}`);
          req.fraudFlags.push('IP_CITY_MISMATCH');
        }
      }
    }

    // Skip if no physical coordinates provided (for testing/mocking)
    if (!clientCoordinates || !clientCoordinates.lat || !clientCoordinates.lng) {
      logger.warn(`User ${req.user?._id} submitted an issue without physical GPS proof.`);
      req.fraudFlags.push('MISSING_PHYSICAL_GPS');
      return next();
    }

    if (!location || !location.coordinates) {
      return next();
    }

    const reportLat = location.coordinates[1];
    const reportLng = location.coordinates[0];
    const clientLat = clientCoordinates.lat;
    const clientLng = clientCoordinates.lng;

    const distanceKm = geoUtils.getDistance(clientLat, clientLng, reportLat, reportLng);
    const distanceMeters = distanceKm * 1000;

    if (distanceMeters > 500) {
      logger.warn(`User ${req.user?._id} submitted issue ${Math.round(distanceMeters)}m away.`);
      req.fraudFlags = req.fraudFlags || [];
      req.fraudFlags.push('DISTANCE_>_500M');
    }

    // Time-of-day plausibility check (e.g. reporting pothole at 3 AM)
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 5) {
      req.fraudFlags.push('SUSPICIOUS_TIME');
    }

    next();
  } catch (error) {
    next(new ApiError(400, 'Invalid location format for proximity verification'));
  }
};

module.exports = { verifyProximity };
