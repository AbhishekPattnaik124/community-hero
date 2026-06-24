const cron = require('node-cron');
const Issue = require('../models/Issue.model');
const { notifyStatusChange } = require('../services/notification.service');
const logger = require('../config/logger');

/**
 * Auto-escalate issues that have been 'open' for more than 7 days with >= 10 upvotes
 * Runs: every day at 2:00 AM
 */
const statusUpdateJob = cron.schedule('0 2 * * *', async () => {
  logger.info('[CRON] Running status update job...');

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleIssues = await Issue.find({
      status: 'open',
      createdAt: { $lte: sevenDaysAgo },
      upvoteCount: { $gte: 10 },
      isArchived: false,
    }).populate('reporter', 'name email notifications');

    let escalated = 0;
    for (const issue of staleIssues) {
      issue.status = 'escalated';
      issue.isEscalated = true;
      issue.escalationLevel = (issue.escalationLevel || 0) + 1;
      issue.lastEscalatedAt = new Date();
      issue.timeline.push({
        status: 'escalated',
        note: 'Auto-escalated: open for 7+ days with 10+ upvotes',
        timestamp: new Date(),
      });
      await issue.save();
      escalated++;
    }

    logger.info(`[CRON] Status update complete. Escalated: ${escalated} issues`);
  } catch (err) {
    logger.error('[CRON] Status update job failed:', err);
  }
}, { scheduled: false });

module.exports = statusUpdateJob;
