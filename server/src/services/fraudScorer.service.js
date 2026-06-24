/**
 * ML Fraud Scorer Service
 * Interfaces with the Python XGBoost model (mocked here for real-time Node.js pipeline).
 */

const logger = require('../config/logger');

class FraudScorerService {
  /**
   * Pass issue features to the ML Model
   * Returns a score 0-100 and SHAP explanation.
   */
  async calculateFraudScore(issueData, user, fraudFlags) {
    logger.info(`[FraudScorer] Calculating score for user ${user._id}`);
    
    // Feature extraction
    const features = {
      accountAgeDays: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
      issuesReported: user.issuesReported,
      fakeReports: user.fakeReports || 0,
      hasPhoneVerified: user.isPhoneVerified ? 1 : 0,
      flagCount: fraudFlags ? fraudFlags.length : 0,
      hasImages: issueData.images?.length > 0 ? 1 : 0,
    };

    // ML Inference Simulation
    let baseScore = 10;
    
    if (features.fakeReports > 0) baseScore += 40 * features.fakeReports;
    if (features.flagCount > 0) baseScore += 25 * features.flagCount;
    if (features.accountAgeDays < 2) baseScore += 15;
    if (!features.hasPhoneVerified) baseScore += 10;
    if (!features.hasImages) baseScore += 20;

    const finalScore = Math.min(100, baseScore);
    const isFake = finalScore >= 70;

    const explanation = [];
    if (features.fakeReports > 0) explanation.push('History of fake reports');
    if (features.flagCount > 0) explanation.push('Triggered heuristics (Location/Time)');
    if (features.accountAgeDays < 2) explanation.push('Very new account');

    return {
      score: finalScore,
      isFake,
      explanation: explanation.join(', '),
    };
  }
}

module.exports = new FraudScorerService();
