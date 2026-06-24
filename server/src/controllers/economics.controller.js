const Issue = require('../models/Issue.model');
const economicsService = require('../services/economicsService');

/**
 * Recalculates and updates the economic impact for all open issues.
 * In a real production app, this would be a background job, but we provide it here
 * as an endpoint for the dashboard to trigger or fetch real-time aggregated data.
 */
exports.getCitywideEconomicWaste = async (req, res) => {
  try {
    const openIssues = await Issue.find({ status: { $ne: 'resolved' } });

    let totalWaste = 0;
    let categoryBreakdown = {
      potholeDamage: 0,
      waterLoss: 0,
      crimeCost: 0,
      productivityLoss: 0,
      healthCost: 0,
    };

    // Update models dynamically
    for (const issue of openIssues) {
      const impact = economicsService.calculateImpact(issue);
      issue.estimatedCostInr = impact.totalCost;
      issue.costBreakdown = impact.breakdown;
      issue.roiToFix = impact.roiToFix;
      
      // Accumulate
      totalWaste += impact.totalCost;
      categoryBreakdown.potholeDamage += impact.breakdown.potholeDamage;
      categoryBreakdown.waterLoss += impact.breakdown.waterLoss;
      categoryBreakdown.crimeCost += impact.breakdown.crimeCost;
      categoryBreakdown.productivityLoss += impact.breakdown.productivityLoss;
      categoryBreakdown.healthCost += impact.breakdown.healthCost;

      // Save the updated calculation
      await issue.save();
    }

    res.status(200).json({
      success: true,
      data: {
        totalActiveIssues: openIssues.length,
        totalEconomicWasteInr: totalWaste,
        breakdown: categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Error calculating economic waste:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
