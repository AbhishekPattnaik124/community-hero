const mongoose = require('mongoose');

const councillorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    wardId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Mock Contact Details (Do not use real PII)
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    // Transparency metrics
    totalIssuesReported: { type: Number, default: 0 },
    issuesResolved: { type: Number, default: 0 },
    issuesEscalated: { type: Number, default: 0 },
    averageResponseTimeHours: { type: Number, default: 0 },
    transparencyScore: { type: Number, default: 100 }, // 0 to 100
  },
  {
    timestamps: true,
  }
);

// Virtual for Resolution Rate
councillorSchema.virtual('resolutionRate').get(function () {
  if (this.totalIssuesReported === 0) return 100;
  return ((this.issuesResolved / this.totalIssuesReported) * 100).toFixed(2);
});

module.exports = mongoose.model('Councillor', councillorSchema);
