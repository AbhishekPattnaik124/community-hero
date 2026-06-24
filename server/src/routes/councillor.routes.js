const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middleware/auth.middleware');
const Issue = require('../models/Issue.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// Load Mock DB
const dbPath = path.join(__dirname, '../data/kmc_councillors.json');
const councillors = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

/**
 * @swagger
 * /api/councillor/ward/{wardNumber}:
 *   get:
 *     tags: [Digital Bridge]
 *     summary: Get councillor info by ward number
 */
router.get('/ward/:wardNumber', authenticate, (req, res, next) => {
  try {
    const ward = parseInt(req.params.wardNumber);
    const councillor = councillors.find(c => c.ward === ward);
    
    if (!councillor) throw ApiError.notFound('Councillor not found for this ward');
    
    return ApiResponse.success(res, councillor);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/councillor/escalate/{issueId}:
 *   post:
 *     tags: [Digital Bridge]
 *     summary: Directly escalate an issue to the local ward councillor
 */
router.post('/escalate/:issueId', authenticate, async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) throw ApiError.notFound('Issue not found');
    
    if (!issue.location.ward) throw ApiError.badRequest('Issue does not have a ward specified');
    
    const councillor = councillors.find(c => c.ward === parseInt(issue.location.ward));
    if (!councillor) throw ApiError.notFound('Councillor info not available to escalate');

    // Here we would integrate WhatsApp/Email API to ping the councillor
    // Mocking the escalation:
    issue.councillorNotified = true;
    issue.timeline.push({
      status: issue.status,
      note: `Escalated to Ward ${councillor.ward} Councillor: ${councillor.name}`,
      changedBy: req.user._id
    });
    
    await issue.save();

    return ApiResponse.success(res, { issue, councillor }, 'Successfully escalated to Ward Councillor');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
