const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Badge description is required'],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, 'Badge icon (emoji or URL) is required'],
    },
    rarityLevel: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    // The metric the criteria evaluates (e.g., 'issues_reported', 'streak_days', 'points')
    metric: {
      type: String,
      enum: ['issues_reported', 'issues_resolved', 'upvotes_received', 'streak_days', 'points', 'manual'],
      required: true,
    },
    // The threshold required to unlock the badge
    threshold: {
      type: Number,
      required: true,
      min: 1,
    },
    // Number of users who have earned this badge
    earnedByCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

badgeSchema.index({ metric: 1, threshold: 1 });
badgeSchema.index({ rarityLevel: 1 });

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;
