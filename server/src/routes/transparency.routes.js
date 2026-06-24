const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @swagger
 * /api/transparency/scorecard:
 *   get:
 *     tags: [Digital Bridge]
 *     summary: Get the public transparency scorecard for all wards
 */
router.get('/scorecard', async (req, res, next) => {
  try {
    const scorecard = await analyticsService.getScorecard();
    return ApiResponse.success(res, scorecard.data, 'Transparency Scorecard generated');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
