const cron = require('node-cron');
const Issue = require('../models/Issue.model');
const RtiService = require('./rtiService');

// Define SLAs by category in hours
const SLA_DEFINITIONS = {
  water: 24,
  electricity: 24,
  sanitation: 48,
  infrastructure: 72, // 3 days
  roads: 168, // 7 days (potholes)
  other: 168 // Default 7 days
};

/**
 * Service to manage Service Level Agreements (SLAs).
 * Triggers escalations and RTI generation for breached SLAs.
 */
class SlaService {
  constructor() {
    this.startCronJobs();
  }

  /**
   * Initializes background jobs to check for SLA breaches.
   */
  startCronJobs() {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('Running daily SLA check job...');
      await this.checkSlaBreaches();
      await this.checkRtiEligibility();
    });
  }

  /**
   * Calculates the deadline based on category SLA.
   * @param {String} category Issue category
   * @param {Date} createdAt Creation timestamp
   * @returns {Date} Deadline timestamp
   */
  calculateSlaDeadline(category, createdAt) {
    const hours = SLA_DEFINITIONS[category] || SLA_DEFINITIONS.other;
    return new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
  }

  /**
   * Checks open issues for SLA breaches.
   */
  async checkSlaBreaches() {
    try {
      const now = new Date();
      // Find open issues that have breached their SLA and aren't marked as escalated
      const breachedIssues = await Issue.find({
        status: { $in: ['open', 'in_progress'] },
        slaDeadline: { $lt: now },
        escalationLevel: 0
      });

      for (const issue of breachedIssues) {
        issue.escalationLevel = 1;
        issue.status = 'escalated';
        issue.timeline.push({
          status: 'escalated',
          note: 'System auto-escalation due to SLA breach.'
        });
        await issue.save();
        console.log(`Auto-escalated issue ${issue._id} due to SLA breach.`);
        
        // TODO: Trigger notification to ward councillor here
      }
    } catch (error) {
      console.error('Error checking SLA breaches:', error);
    }
  }

  /**
   * Checks for issues unresolved for > 30 days to generate RTI.
   */
  async checkRtiEligibility() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const rtiEligibleIssues = await Issue.find({
        status: { $nin: ['resolved', 'closed'] },
        createdAt: { $lt: thirtyDaysAgo },
        escalationLevel: { $lt: 2 } // Hasn't triggered RTI yet
      });

      for (const issue of rtiEligibleIssues) {
        // Auto-generate RTI
        await RtiService.autoFileRti(issue);
        
        issue.escalationLevel = 2; // Mark RTI filed
        issue.timeline.push({
          status: 'escalated',
          note: 'RTI Application auto-generated after 30 days of inaction.'
        });
        await issue.save();
        console.log(`RTI generated for issue ${issue._id}`);
      }
    } catch (error) {
      console.error('Error checking RTI eligibility:', error);
    }
  }
}

// Instantiate the service so the cron jobs start upon require
module.exports = new SlaService();
