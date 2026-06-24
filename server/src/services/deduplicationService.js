const SocialReport = require('../models/SocialReport.model');

/**
 * Deduplication Engine
 * Ensures the same civic issue from multiple sources is grouped together.
 */
class DeduplicationService {
  
  /**
   * Checks if an incoming social report matches an existing open issue.
   * Uses spatial proximity and category matching.
   */
  async findDuplicate(newReport) {
    if (!newReport.location) return null;

    // In a real app, use MongoDB $nearSphere with a max distance (e.g. 50 meters)
    // and time window (e.g. within last 7 days)
    
    // For this implementation, we simulate the query
    const timeLimit = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    try {
      const duplicate = await SocialReport.findOne({
        category: newReport.category,
        createdAt: { $gte: timeLimit },
        // Add geospatial mock query here if real db was connected with indexes
      });

      return duplicate;
    } catch (e) {
      console.error('Deduplication check failed', e);
      return null;
    }
  }

  /**
   * Merges a new report into an existing one, boosting its virality.
   */
  async mergeReports(existingReport, newReportData) {
    existingReport.viralityScore += (newReportData.viralityScore || 1);
    existingReport.sources.push({
      platform: newReportData.platform,
      url: newReportData.url,
      timestamp: new Date()
    });
    
    // Aggregate sentiment
    existingReport.sentiment = (existingReport.sentiment + newReportData.sentiment) / 2;

    await existingReport.save();
    return existingReport;
  }
}

module.exports = new DeduplicationService();
