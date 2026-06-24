const express = require('express');
const router = express.Router();
const floodPrediction = require('../services/floodPrediction');
const { ROURKELA_DATA } = require('../utils/rourkelaData');

/**
 * GET /api/environment/aqi
 * Returns simulated AQI data for Rourkela from CPCB
 */
router.get('/aqi', async (req, res) => {
  try {
    // In production, fetch from: https://api.data.gov.in (CPCB AQI API)
    const month = new Date().getMonth();
    const isMonsoon = month >= 5 && month <= 9;
    const baseAQI = 85 + Math.floor(Math.random() * (isMonsoon ? 60 : 80));

    res.json({
      aqi: baseAQI,
      station: 'Rourkela (CPCB)',
      pm25:  parseFloat((baseAQI * 0.4).toFixed(1)),
      pm10:  parseFloat((baseAQI * 0.6).toFixed(1)),
      no2:   parseFloat((12 + Math.random() * 15).toFixed(1)),
      so2:   parseFloat((8  + Math.random() * 20).toFixed(1)),
      co:    parseFloat((0.8 + Math.random() * 0.6).toFixed(2)),
      temperature: parseFloat((26 + Math.random() * 6).toFixed(1)),
      humidity:    parseInt(60 + Math.random() * 20),
      updatedAt:   new Date().toISOString(),
      source: 'simulated'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/environment/flood-prediction  (also aliased in analytics route)
 * Returns current flood risk assessment for Rourkela
 */
router.get('/flood-prediction', async (req, res) => {
  try {
    const prediction = await floodPrediction.computeFloodRisk();
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/environment/rourkela-data
 * Returns static Rourkela city data (wards, landmarks, contacts)
 */
router.get('/rourkela-data', (req, res) => {
  res.json(ROURKELA_DATA);
});

module.exports = router;
