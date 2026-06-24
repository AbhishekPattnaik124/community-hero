/**
 * Transparency Scorecard Service
 * Generates analytics for SLA compliance, ward rankings, and official performance.
 */

const Issue = require('../models/Issue.model');
const logger = require('../config/logger');

class AnalyticsService {
  async getScorecard() {
    logger.info('[Transparency] Generating Scorecard...');
    
    // Aggregate Wards by average resolution time and SLA compliance
    const pipeline = [
      { $match: { isArchived: false, isFake: false } },
      {
        $group: {
          _id: "$location.ward",
          totalIssues: { $sum: 1 },
          resolvedIssues: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          slaBreaches: {
            $sum: { $cond: [{ $gt: ["$escalationLevel", 0] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          ward: "$_id",
          totalIssues: 1,
          resolvedIssues: 1,
          resolutionRate: {
            $multiply: [
              { $divide: ["$resolvedIssues", { $max: ["$totalIssues", 1] }] },
              100
            ]
          },
          slaCompliance: {
            $multiply: [
              { $divide: [
                { $subtract: ["$totalIssues", "$slaBreaches"] }, 
                { $max: ["$totalIssues", 1] }
              ]},
              100
            ]
          }
        }
      },
      { $sort: { slaCompliance: -1, resolutionRate: -1 } }
    ];

    const wardRankings = await Issue.aggregate(pipeline);
    
    return {
      success: true,
      data: {
        wardRankings,
        generatedAt: new Date()
      }
    };
  }
}

module.exports = new AnalyticsService();
