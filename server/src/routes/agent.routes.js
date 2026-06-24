const express = require('express');
const router = express.Router();
const { dispatchAgent } = require('../agents/orchestrator');
const AgentAction = require('../models/AgentAction.model');

// Trigger an agent manually
router.post('/invoke', async (req, res) => {
  try {
    const { agentType, payload } = req.body;
    const result = await dispatchAgent(agentType, payload);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pending actions requiring human approval
router.get('/pending-actions', async (req, res) => {
  try {
    const actions = await AgentAction.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, data: actions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve an action
router.post('/actions/:id/approve', async (req, res) => {
  try {
    const action = await AgentAction.findById(req.params.id);
    if (!action) return res.status(404).json({ success: false, message: 'Action not found' });
    
    // In a real app, actually execute the payload here (e.g. save issue, send email)
    // For the hackathon, we simulate execution
    console.log(`[HumanInTheLoop] Action ${action._id} of type ${action.actionType} APPROVED.`);
    
    action.status = 'approved';
    action.reviewedAt = new Date();
    await action.save();
    
    res.json({ success: true, message: 'Action approved successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
