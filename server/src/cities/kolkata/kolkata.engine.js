const config = require('./config.json');

/**
 * Waterlogging Prediction Engine
 */
function predictWaterlogging(aliporeRainfall) {
  let alerts = [];
  
  if (aliporeRainfall > 50) {
    alerts.push({
      zone: 'All Low Lying Wards',
      risk: 'CRITICAL',
      message: 'Severe rainfall detected at Alipore. Expected waterlogging in Mominpur and Tollygunge within 3 hours. Pumps activated.'
    });
  }
  return alerts;
}

/**
 * Heritage Building Alert: Checks if the issue is within 100m of a Heritage Building
 * (Simplified distance calculation for demonstration)
 */
function heritageBuildingCheck(lat, lng) {
  // Mock heritage zones
  const heritageZones = [
    { name: "Victoria Memorial", lat: 22.5448, lng: 88.3426 },
    { name: "Writers' Building", lat: 22.5735, lng: 88.3496 }
  ];

  for (let zone of heritageZones) {
    const dLat = Math.abs(zone.lat - lat);
    const dLng = Math.abs(zone.lng - lng);
    // Rough approximation for 100m
    if (dLat < 0.001 && dLng < 0.001) {
      return {
        isHeritage: true,
        building: zone.name,
        department: 'INTACH Kolkata'
      };
    }
  }
  
  return { isHeritage: false };
}

module.exports = {
  predictWaterlogging,
  heritageBuildingCheck,
  config
};
