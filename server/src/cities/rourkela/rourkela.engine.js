const config = require('./config.json');

/**
 * Dual Authority Routing: Determine if coordinates fall within SAIL RSP Township or RMC.
 */
function determineAuthority(lat, lng) {
  const { min_lat, max_lat, min_lng, max_lng } = config.sail_bounding_box;
  
  if (lat >= min_lat && lat <= max_lat && lng >= min_lng && lng <= max_lng) {
    return 'SAIL RSP Township';
  }
  return 'RMC';
}

/**
 * Flood Prediction Engine (Koel & Sanjo Rivers)
 */
function checkFloodRisk(koelRiverLevel, rainfallPerHour) {
  let alerts = [];
  
  if (koelRiverLevel > 147) {
    alerts.push({
      zone: 'Bondamunda Low Area',
      risk: 'HIGH',
      message: 'Koel river level exceeded 147m. Immediate flood risk for Bondamunda.'
    });
  }
  
  if (rainfallPerHour > 40) {
    alerts.push({
      zone: 'Jhirpani River Bank',
      risk: 'HIGH',
      message: 'Heavy rainfall (>40mm/hr) detected. Waterlogging expected in Jhirpani.'
    });
  }
  
  return alerts;
}

/**
 * Steel Plant Pollution Tracker
 */
function calculatePollutionZone(aqi, windDirection) {
  // Simplified logic: If AQI is poor and wind is blowing towards Sector 1-10 (e.g. South West)
  if (aqi > 200 && (windDirection > 180 && windDirection < 270)) {
    return {
      affectedSectors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      advisory: 'High pollution from RSP detected. Residents in Sectors 1-10 are advised to stay indoors.'
    };
  }
  return null;
}

module.exports = {
  determineAuthority,
  checkFloodRisk,
  calculatePollutionZone,
  config
};
