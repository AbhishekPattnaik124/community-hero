const cron = require('node-cron');
const Issue = require('../models/Issue.model');
const logger = require('../config/logger');
const rtiService = require('../services/rti.service');

const checkSLAs = async () => {
  try {
    logger.info('[SLA Engine] Running SLA Breach Check...');
    
    const now = new Date();
    
    // Find issues where SLA has passed but not resolved
    const breachedIssues = await Issue.find({
      slaDeadline: { $lt: now },
      status: { $nin: ['resolved', 'closed', 'archived'] },
      isFake: false
    });

    for (const issue of breachedIssues) {
      if (issue.escalationLevel === 0) {
        issue.escalationLevel = 1;
        issue.timeline.push({ status: issue.status, note: 'SLA Breached - Auto-escalated to Level 1 (Red Alert)' });
        logger.warn(`Issue ${issue._id} breached SLA. Escalating.`);
      }

      // Check for 30-day RTI threshold
      const daysSinceCreation = (now - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > 30 && issue.escalationLevel < 2) {
        issue.escalationLevel = 2;
        issue.timeline.push({ status: issue.status, note: '30 Days Unresolved - RTI Auto-Generated' });
        
        // Generate RTI PDF
        try {
          const rtiResult = await rtiService.generateRTI(issue);
          // In real life, email rtiResult.filePath to PIO here
          logger.info(`[SLA Engine] Auto-generated RTI for issue ${issue._id} at ${rtiResult.url}`);
        } catch (err) {
          logger.error(`[SLA Engine] Failed to generate RTI for issue ${issue._id}: ${err.message}`);
        }
      }

      await issue.save();
    }
  } catch (error) {
    logger.error(`[SLA Engine Error] ${error.message}`);
  }
};

// Run every hour
cron.schedule('0 * * * *', checkSLAs);

module.exports = { checkSLAs };
