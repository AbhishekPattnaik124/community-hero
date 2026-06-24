const express = require('express');
const router = express.Router();
const economicsController = require('../controllers/economics.controller');

// Public route to fetch the citywide dashboard stats
router.get('/citywide', economicsController.getCitywideEconomicWaste);

module.exports = router;
