const analyticsService = require('../services/analyticsService');
const pdfService = require('../services/pdfService');

exports.getWardPerformance = async (req, res) => {
  try {
    const { wardId } = req.params;
    const data = await analyticsService.getWardPerformance(wardId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllWardsPerformance = async (req, res) => {
  try {
    const data = await analyticsService.getAllWardsPerformance();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.optimizeBudget = async (req, res) => {
  try {
    const { total_budget } = req.body;
    const data = await analyticsService.optimizeBudget(total_budget);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.predictPotholes = async (req, res) => {
  try {
    const { ward_id, rainfall_mm, road_age_years, traffic_volume } = req.body;
    const data = await analyticsService.predictPotholes(ward_id, rainfall_mm, road_age_years, traffic_volume);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.predictOutbreak = async (req, res) => {
  try {
    const { stagnant_water_reports, avg_temp_c, population_density } = req.body;
    const data = await analyticsService.predictOutbreak(stagnant_water_reports, avg_temp_c, population_density);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContractors = async (req, res) => {
  try {
    const data = await analyticsService.getContractorRatings();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadWardReport = async (req, res) => {
  try {
    const { wardId } = req.params;
    const wardData = await analyticsService.getWardPerformance(wardId);
    
    const pdfBuffer = await pdfService.generateWardReport(wardData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Ward_${wardId}_Report.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Download Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
};
