const statusUpdateJob = require('./statusUpdate.job');
const { startGovtDataSyncJob } = require('./syncGovtData');
const logger = require('../config/logger');

function startJobs() {
  statusUpdateJob.start();
  logger.info('[CRON] statusUpdateJob scheduled: daily at 2:00 AM');
  
  startGovtDataSyncJob();
}

function stopJobs() {
  statusUpdateJob.stop();
  logger.info('[CRON] All jobs stopped');
}

module.exports = { startJobs, stopJobs };
