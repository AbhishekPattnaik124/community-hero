/**
 * Carbon Footprint Engine
 * Calculates real emissions caused by decaying civic infrastructure.
 */

const logger = require('../config/logger');

class CarbonService {
  /**
   * Calculate kg of CO2 impact for a specific issue
   */
  calculateImpact(category, severity) {
    logger.info(`[Environment] Calculating carbon footprint for ${category}...`);
    
    let baseKg = 0;
    const cat = category.toLowerCase();
    
    if (cat.includes('pothole') || cat.includes('road')) {
      // Potholes cause vehicles to slow down and idle, wasting fuel.
      // Assuming 500 cars per day waste 0.1 liters of fuel. (1 liter petrol = 2.31 kg CO2)
      baseKg = 11.5; 
    } else if (cat.includes('water') && cat.includes('leak')) {
      // Water treatment requires high energy (approx 0.002 kg CO2 per liter).
      // Assuming 1000 liters leaked per day.
      baseKg = 2.0; 
    } else if (cat.includes('light')) {
      // Streetlight left on during the day (12 hours * 250W = 3 kWh).
      // India grid emission factor = 0.82 kg CO2 / kWh
      baseKg = 2.46;
    } else if (cat.includes('garbage')) {
      // Burning 10kg of mixed waste = ~15 kg CO2 + toxic PM2.5
      baseKg = 15.0;
    }

    // Multiply by severity multiplier
    const severityMultiplier = { low: 1, medium: 2, high: 4, critical: 10 }[severity] || 1;
    
    return baseKg * severityMultiplier;
  }
}

module.exports = new CarbonService();
