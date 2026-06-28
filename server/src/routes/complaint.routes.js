const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const complaintController = require('../controllers/complaint.controller');

router.post('/', authenticate, complaintController.fileComplaint);
router.post('/verify-resolution', authenticate, complaintController.verifyResolution);

module.exports = router;
