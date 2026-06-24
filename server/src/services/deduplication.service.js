/**
 * Location Proof System & Deduplication Service
 */

const Issue = require('../models/Issue.model');
const geoUtils = require('../utils/geoUtils'); // Already exists for getDistance

class DeduplicationService {
  /**
   * Check if a similar issue exists within 50m in the last 24 hours.
   * If so, auto-merge it by returning the parent issue ID.
   */
  async findDuplicate(category, lat, lng) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const duplicate = await Issue.findOne({
      category: category,
      createdAt: { $gte: yesterday },
      isArchived: { $ne: true },
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], 0.05 / 6378.1], // 50m radius (50 / 1000 / 6378.1)
        },
      },
    }).sort({ createdAt: 1 });

    return duplicate;
  }
}

module.exports = new DeduplicationService();
