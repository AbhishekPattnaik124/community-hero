const axios = require('axios');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

class AnalyticsService {
  async getWardPerformance(wardId) {
    // Mock aggregation from DB
    return {
      wardId: wardId,
      issuesPerCapita: 0.05,
      resolutionTimeAvgDays: 4.2,
      citizenSatisfactionScore: 82,
      repeatIssueRate: 0.12,
      seasonalReadinessScore: 78
    };
  }

  async getAllWardsPerformance() {
    // Mock map data for all 141 KMC Wards
    const wards = [];
    for (let i = 1; i <= 141; i++) {
      wards.push({
        id: `W-${i}`,
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        openIssues: Math.floor(Math.random() * 50) + 10,
        trustIndex: Math.floor(Math.random() * 30) + 70
      });
    }
    return wards;
  }

  async optimizeBudget(totalBudget) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/api/optimize-budget`, {
        total_budget: totalBudget
      });
      return response.data;
    } catch (error) {
      console.error('ML Service Budget Optimization Failed:', error.message);
      // Fallback dummy optimization
      return {
        success: true,
        allocations: {
          potholes_to_fix: Math.floor(totalBudget * 0.4 / 2000),
          water_leaks_to_fix: Math.floor(totalBudget * 0.3 / 5000),
          streetlights_to_fix: Math.floor(totalBudget * 0.2 / 1000),
          garbage_zones_to_clear: Math.floor(totalBudget * 0.1 / 500)
        },
        fallback: true
      };
    }
  }

  async predictPotholes(wardId, rainfall, age, traffic) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/api/predict-maintenance`, {
        ward_id: wardId,
        rainfall_mm: rainfall,
        road_age_years: age,
        traffic_volume: traffic
      });
      return response.data;
    } catch (error) {
      console.error('ML Service Maintenance Prediction Failed:', error.message);
      throw error;
    }
  }

  async predictOutbreak(waterReports, temp, density) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/api/predict-outbreak`, {
        stagnant_water_reports: waterReports,
        avg_temp_c: temp,
        population_density: density
      });
      return response.data;
    } catch (error) {
      console.error('ML Service Outbreak Prediction Failed:', error.message);
      throw error;
    }
  }

  async getContractorRatings() {
    // Mock contractor DB
    return [
      { id: 'C-001', name: 'L&T Civic Works', qualityScore: 92, timelineAdherence: 88, repeatFailureRate: 0.05 },
      { id: 'C-002', name: 'Bengal Roadways', qualityScore: 78, timelineAdherence: 85, repeatFailureRate: 0.12 },
      { id: 'C-003', name: 'Kolkata Infra', qualityScore: 65, timelineAdherence: 60, repeatFailureRate: 0.22, alert: 'High Risk' },
      { id: 'C-004', name: 'Eastern Pipes & Plumbing', qualityScore: 89, timelineAdherence: 95, repeatFailureRate: 0.03 }
    ];
  }
}

module.exports = new AnalyticsService();
