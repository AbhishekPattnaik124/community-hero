const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    // The start of the hour this snapshot represents
    timestamp: {
      type: Date,
      required: true,
    },
    totalOpen: { type: Number, default: 0 },
    totalResolved: { type: Number, default: 0 },
    totalEscalated: { type: Number, default: 0 },
    totalCritical: { type: Number, default: 0 },
    
    avgResolutionTimeHrs: { type: Number, default: 0 },
    
    // Key-value mapping of category string to counts
    categoryDistribution: {
      type: Map,
      of: Number,
      default: {},
    },

    // A summarized array of heatmap intensity points (lat, lng, weight)
    heatmapData: [
      {
        lat: Number,
        lng: Number,
        weight: Number,
      }
    ],

    // Derived health score for the city (0-100) based on resolution rates and open criticals
    cityHealthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    }
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a city's historical analytics
analyticsSnapshotSchema.index({ city: 1, timestamp: -1 }, { unique: true });

// Static method to generate an hourly snapshot via an Aggregation Pipeline
analyticsSnapshotSchema.statics.generateHourlySnapshot = async function (city, timestampStr) {
  const Issue = mongoose.model('Issue');
  const targetDate = new Date(timestampStr);
  
  // Aggregate stats up to this point in time for the specified city
  const stats = await Issue.aggregate([
    {
      $match: {
        'location.city': city,
        createdAt: { $lte: targetDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOpen: { 
          $sum: { $cond: [{ $in: ['$status', ['open', 'in_progress']] }, 1, 0] } 
        },
        totalResolved: { 
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } 
        },
        totalEscalated: { 
          $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] } 
        },
        totalCritical: { 
          $sum: { $cond: [{ $gte: ['$severityScore', 80] }, 1, 0] } 
        },
        avgResolutionTimeDays: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              { $divide: [ { $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60 * 24 ] },
              null
            ]
          }
        }
      }
    }
  ]);

  const categoryAgg = await Issue.aggregate([
    { $match: { 'location.city': city, createdAt: { $lte: targetDate } } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const categoryDistribution = {};
  categoryAgg.forEach(cat => {
    categoryDistribution[cat._id] = cat.count;
  });

  const baseStats = stats[0] || {
    totalOpen: 0, totalResolved: 0, totalEscalated: 0, totalCritical: 0, avgResolutionTimeDays: 0
  };

  // Calculate generic health score logic
  const healthScore = Math.max(0, 100 - (baseStats.totalCritical * 5) - (baseStats.totalEscalated * 2));

  // Upsert the snapshot
  return this.findOneAndUpdate(
    { city, timestamp: targetDate },
    {
      city,
      timestamp: targetDate,
      totalOpen: baseStats.totalOpen,
      totalResolved: baseStats.totalResolved,
      totalEscalated: baseStats.totalEscalated,
      totalCritical: baseStats.totalCritical,
      avgResolutionTimeHrs: (baseStats.avgResolutionTimeDays || 0) * 24,
      categoryDistribution,
      cityHealthScore: healthScore
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
module.exports = AnalyticsSnapshot;
