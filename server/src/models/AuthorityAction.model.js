const mongoose = require('mongoose');

const authorityActionSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['verification', 'status_change', 'escalation', 'resolution_proof', 'rejection'],
      required: true,
    },
    // Context or reasoning for the action
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    // Supporting media
    evidenceImages: [{ type: String }],
    
    // SLA tracking metadata for this specific action
    slaStatus: {
      type: String,
      enum: ['met', 'breached', 'not_applicable'],
      default: 'not_applicable',
    },
    timeTakenMinutes: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Indexes
authorityActionSchema.index({ issue: 1, createdAt: -1 });
authorityActionSchema.index({ officer: 1, actionType: 1 });

const AuthorityAction = mongoose.model('AuthorityAction', authorityActionSchema);
module.exports = AuthorityAction;
