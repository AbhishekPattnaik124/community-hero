/**
 * Convert radius in km to radians (for $geoWithin sphere queries)
 */
function kmToRadians(km) {
  return km / 6378.1;
}

/**
 * Build a $geoWithin query for a circular area
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} radiusKm - Radius in kilometers
 */
function buildNearQuery(lng, lat, radiusKm = 5) {
  return {
    $near: {
      $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      $maxDistance: radiusKm * 1000, // metres
    },
  };
}

/**
 * Build a $geoWithin bounding box query
 * @param {number} swLng - Southwest longitude
 * @param {number} swLat - Southwest latitude
 * @param {number} neLng - Northeast longitude
 * @param {number} neLat - Northeast latitude
 */
function buildBoundsQuery(swLng, swLat, neLng, neLat) {
  return {
    $geoWithin: {
      $box: [
        [parseFloat(swLng), parseFloat(swLat)],
        [parseFloat(neLng), parseFloat(neLat)],
      ],
    },
  };
}

/**
 * Calculate distance between two points using Haversine formula
 * @returns distance in kilometres
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = { kmToRadians, buildNearQuery, buildBoundsQuery, haversineDistance };
