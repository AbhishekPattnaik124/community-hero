const express = require('express');
const router = express.Router();
const SocialReport = require('../models/SocialReport.model');

// Fetch trending issues for the admin dashboard
router.get('/reports', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const reports = await SocialReport.find(filter)
      .sort({ viralityScore: -1, createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching social reports', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Update status (approve/reject) from human review queue
router.patch('/reports/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const report = await SocialReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Error updating social report', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Mount WhatsApp webhook
const whatsappInt = require('../integrations/social/whatsapp.integration');
const { producer } = require('../config/kafka');
router.post('/webhook/whatsapp', (req, res) => whatsappInt.handleWebhook(req, res, producer));
// Webhook verification (standard Meta requirement)
router.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
