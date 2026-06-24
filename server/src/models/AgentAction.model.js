const mongoose = require('mongoose');

const agentActionSchema = new mongoose.Schema({
  agentName: { type: String, required: true },
  actionType: { 
    type: String, 
    required: true, 
    enum: ['draft_email', 'create_issue_from_social', 'escalate_issue', 'post_social_media'] 
  },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String, required: true }, // Why the agent wants to do this
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('AgentAction', agentActionSchema);
