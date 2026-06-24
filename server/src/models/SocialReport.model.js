const mongoose = require('mongoose');

const socialSourceSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const socialReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  originalText: { type: String },
  category: { type: String, required: true },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    }
  },

  sentiment: { type: Number, default: 0 }, // -1 (angry) to +1 (happy)
  viralityScore: { type: Number, default: 1 },
  aiConfidence: { type: Number, required: true },
  
  sources: [socialSourceSchema],
  
  status: {
    type: String,
    enum: ['pending_review', 'verified_issue', 'rejected'],
    default: 'pending_review' // High virality or high confidence auto-verifies
  },

  // Link to actual Issue if it gets verified and converted
  linkedIssueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }

}, { timestamps: true });

// Geospatial index
socialReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SocialReport', socialReportSchema);
