const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'infrastructure',
        'sanitation',
        'safety',
        'noise',
        'traffic',
        'environment',
        'roads',
        'water',
        'electricity',
        'parks',
        'other',
      ],
    },
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
      },
      address: { type: String, required: true },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'escalated', 'closed'],
      default: 'open',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    
    // Cloudinary Image URLs
    images: [{ type: String }],
    
    // Resolution Proof Images
    resolutionProofImages: [{ type: String }],

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Assignment Fields
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAuthority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Engagement Metrics
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    
    // Verification
    verifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    verificationCount: { type: Number, default: 0 },

    // Collaborative Severity
    severityVotes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, min: 0, max: 100 },
        timestamp: { type: Date, default: Date.now },
      }
    ],
    severityScore: { type: Number, default: 50 },

    // AI Analysis Payload
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    tags: [{ type: String, trim: true, lowercase: true }],

    // Fraud Detection
    fraudFlags: [{ type: String }],
    fraudScore: { type: Number, default: 0 },
    isFake: { type: Boolean, default: false },

    // Digital Authority Bridge
    officialGovId: { type: String, default: null },
    officialPortal: { type: String, default: null },
    councillorNotified: { type: Boolean, default: false },
    councillorResponded: { type: Boolean, default: false },
    slaDeadline: { type: Date, default: null },
    escalationLevel: { type: Number, default: 0 },

    // Environmental Impact Tracker
    carbonImpactKg: { type: Number, default: 0 },
    healthRiskScore: { type: Number, default: 0 },
    aqiSpike: { type: Boolean, default: false },

    // Economic Impact Tracker
    estimatedCostInr: { type: Number, default: 0 },
    roiToFix: { type: Number, default: 0 },
    costBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        potholeDamage: 0,
        waterLoss: 0,
        crimeCost: 0,
        productivityLoss: 0,
        healthCost: 0,
      }
    },

    // Tracking
    timeline: [statusHistorySchema],
    resolvedAt: { type: Date, default: null },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// Standard compound index for quick map loads by bounds/city filtering
issueSchema.index({ 'location': '2dsphere', status: 1, category: 1 });
issueSchema.index({ reporter: 1, createdAt: -1 });
issueSchema.index({ assignedOfficer: 1, status: 1 });
issueSchema.index({ assignedAuthority: 1, status: 1 });
issueSchema.index({ 'location.city': 1, createdAt: -1 });
issueSchema.index({ category: 1, createdAt: -1 });
// Sort index for live feed
issueSchema.index({ createdAt: -1 });

// Middleware: Auto-update counts
issueSchema.pre('save', function (next) {
  if (this.isModified('upvotes')) {
    this.upvoteCount = this.upvotes.length;
  }
  if (this.isModified('verifications')) {
    this.verificationCount = this.verifications.length;
  }

  // Handle resolution timestamp
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    } else if (this.status !== 'resolved') {
      this.resolvedAt = null;
    }
  }

  // Calculate severity score if votes exist
  if (this.isModified('severityVotes') && this.severityVotes.length > 0) {
    const total = this.severityVotes.reduce((sum, vote) => sum + vote.score, 0);
    this.severityScore = Math.round(total / this.severityVotes.length);
    
    if (this.severityScore >= 80) {
      this.severity = 'critical';
    } else if (this.severityScore >= 60) {
      this.severity = 'high';
    } else if (this.severityScore >= 30) {
      this.severity = 'medium';
    } else {
      this.severity = 'low';
    }
  }

  next();
});

// Middleware to update analytics upon resolution
issueSchema.post('save', async function (doc) {
  if (doc.status === 'resolved') {
    const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot');
    const city = doc.location?.city;
    if (city) {
      // Trigger snapshot generation for current hour
      const currentHour = new Date();
      currentHour.setMinutes(0, 0, 0);
      try {
        await AnalyticsSnapshot.generateHourlySnapshot(city, currentHour.toISOString());
      } catch (e) {
        console.error('Failed to generate analytics snapshot:', e);
      }
    }
  }
});

const Issue = mongoose.model('Issue', issueSchema);
module.exports = Issue;
