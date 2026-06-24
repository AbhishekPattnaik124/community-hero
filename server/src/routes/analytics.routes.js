const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// Read Analytics
router.get('/wards', analyticsController.getAllWardsPerformance);
router.get('/wards/:wardId', analyticsController.getWardPerformance);
router.get('/contractors', analyticsController.getContractors);

// ML Predictions & Optimizations
router.post('/optimize-budget', analyticsController.optimizeBudget);
router.post('/predict-maintenance', analyticsController.predictPotholes);
router.post('/predict-outbreak', analyticsController.predictOutbreak);

// PDF Generation
router.get('/report/:wardId/pdf', analyticsController.downloadWardReport);

module.exports = router;
