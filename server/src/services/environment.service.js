/**
 * Central Environmental Hub
 * Coordinates between AQI, Carbon, Health, and Earth Engine ML models.
 */

const aqiService = require('./aqi.service');
const carbonService = require('./carbon.service');
const { spawn } = require('child_process');
const path = require('path');
const logger = require('../config/logger');

class EnvironmentService {
  /**
   * Run the Python ML Disease Predictor
   */
  async predictDiseaseOutbreak(stagnantWaterCount, historyCount) {
    return new Promise((resolve) => {
      const scriptPath = path.join(__dirname, '../../ml/disease_predictor.py');
      const process = spawn('python', [scriptPath, stagnantWaterCount, historyCount]);
      
      let dataString = '';
      process.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      process.on('close', () => {
        try {
          const lines = dataString.trim().split('\n');
          const jsonLine = lines[lines.length - 1]; // The last line is the JSON output
          resolve(JSON.parse(jsonLine));
        } catch (e) {
          logger.error('Failed to parse Disease Predictor ML output');
          resolve({ outbreakRiskScore: 0, isWarning: false, primaryVector: 'Unknown' });
        }
      });
    });
  }

  /**
   * Run the Python ML Earth Engine script
   */
  async analyzeUrbanHeat(lat, lng) {
    return new Promise((resolve) => {
      const scriptPath = path.join(__dirname, '../../ml/earth_engine.py');
      const process = spawn('python', [scriptPath, lat, lng]);
      
      let dataString = '';
      process.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      process.on('close', () => {
        try {
          const lines = dataString.trim().split('\n');
          const jsonLine = lines[lines.length - 1]; // The last line is the JSON output
          resolve(JSON.parse(jsonLine));
        } catch (e) {
          logger.error('Failed to parse Earth Engine ML output');
          resolve({ ndvi: 0.2, surfaceTemperatureC: 35.0, isUrbanHeatIsland: false, suggestion: '' });
        }
      });
    });
  }

  /**
   * Assess complete environmental impact of a new issue
   */
  async assessImpact(issueData) {
    logger.info(`[Environment] Assessing full environmental impact for category: ${issueData.category}`);
    
    // 1. Carbon Footprint
    const carbonImpactKg = carbonService.calculateImpact(issueData.category, issueData.severity);
    
    // 2. AQI Correlation (For garbage/fire)
    const aqiSpike = await aqiService.correlateIssueWithAQI(issueData.category, issueData.location?.city || 'Kolkata');
    
    // 3. Health Risk (Dengue for water)
    let healthRiskScore = 0;
    if (issueData.category.toLowerCase().includes('water')) {
      const outbreakData = await this.predictDiseaseOutbreak(5, 10); // Mocking local density
      healthRiskScore = outbreakData.outbreakRiskScore;
    } else if (aqiSpike) {
      healthRiskScore = 85; // High risk from toxic fumes
    }

    // 4. Urban Heat
    let heatData = null;
    if (issueData.location && issueData.location.coordinates) {
      heatData = await this.analyzeUrbanHeat(issueData.location.coordinates[1], issueData.location.coordinates[0]);
    }

    return {
      carbonImpactKg,
      healthRiskScore,
      aqiSpike,
      heatData
    };
  }
}

module.exports = new EnvironmentService();
