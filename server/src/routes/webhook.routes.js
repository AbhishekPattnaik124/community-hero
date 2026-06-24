const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

// Webhook for MyGov updates
router.post('/mygov/status-update', (req, res) => {
  try {
    const payload = req.body;
    logger.info(`[Webhook] Received MyGov update: ${JSON.stringify(payload)}`);
    // Logic to update local issue status based on MyGov mapping would go here
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    logger.error(`[Webhook] MyGov error: ${error.message}`);
    res.status(500).json({ success: false });
  }
});

// Webhook for NDMA emergency alerts
router.post('/ndma/alerts', (req, res) => {
  try {
    const payload = req.body;
    logger.warn(`[Webhook] NDMA Emergency Alert: ${JSON.stringify(payload)}`);
    // In a real app, this would broadcast via socket.io to all users in the affected zone
    res.status(200).json({ success: true, message: 'Alert received' });
  } catch (error) {
    logger.error(`[Webhook] NDMA error: ${error.message}`);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
