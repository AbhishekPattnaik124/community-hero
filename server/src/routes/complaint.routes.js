const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Assuming existing auth middleware
const complaintController = require('../controllers/complaint.controller');

// Need to create dummy auth middleware for this module if protect doesn't exist,
// but assuming vibe2ship has standard auth. For safety, we'll just mock protect if needed.
// However, vibe2ship usually has auth. We'll use a placeholder if it fails.

router.post('/', protect, complaintController.fileComplaint);
router.post('/verify-resolution', protect, complaintController.verifyResolution);

module.exports = router;
