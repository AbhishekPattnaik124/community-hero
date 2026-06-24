const cron = require('node-cron');
const logger = require('../config/logger');
const { syncSBMStatus } = require('../integrations/sbm.integration');
const { fetchMyGovGrievances } = require('../integrations/mygov.integration');
const { fetchInfrastructureData } = require('../integrations/dataGov.integration');
const { checkDisasterRisk } = require('../integrations/ndma.integration');
const { fetchRoadNetwork } = require('../integrations/osm.integration');
const { fetchWeatherData } = require('../integrations/imd.integration');
const rourkelaEngine = require('../cities/rourkela/rourkela.engine');
const kolkataEngine = require('../cities/kolkata/kolkata.engine');

function startGovtDataSyncJob() {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('[Govt Sync Job] Starting 6-hour background sync...');
    try {
      // For demonstration, using hardcoded typical inputs for Bangalore
      await Promise.all([
        syncSBMStatus('KA_BLR_01'),
        fetchMyGovGrievances('Bangalore'),
        fetchInfrastructureData('560001'),
        checkDisasterRisk(12.9716, 77.5946),
        fetchRoadNetwork('12.9,77.5,13.0,77.6'),
        fetchWeatherData(12.9716, 77.5946)
      ]);
      logger.info('[Govt Sync Job] Sync completed successfully.');
    } catch (err) {
      logger.error(`[Govt Sync Job] Error during sync: ${err.message}`);
    }
  });
  logger.info('🕒 Govt Data Sync cron job scheduled (Runs every 6 hours)');

  // Hyper-Local Predictive Engines (Run Hourly)
  cron.schedule('0 * * * *', async () => {
    logger.info('[Predictive Engine] Running hourly hyper-local checks...');
    try {
      // Rourkela Engine
      const rourkelaWeather = await fetchWeatherData(22.2604, 84.8536);
      if (rourkelaWeather) {
        const floodAlerts = rourkelaEngine.checkFloodRisk(148, rourkelaWeather.rainfall_mm || 0);
        const pollutionAlerts = rourkelaEngine.calculatePollutionZone(250, rourkelaWeather.wind_direction || 200);
        
        if (floodAlerts.length > 0) logger.warn(`[Rourkela] Flood Alerts: ${JSON.stringify(floodAlerts)}`);
        if (pollutionAlerts) logger.warn(`[Rourkela] Pollution Alerts: ${JSON.stringify(pollutionAlerts)}`);
      }

      // Kolkata Engine
      const kolkataWeather = await fetchWeatherData(22.5726, 88.3639);
      if (kolkataWeather) {
        const kolkataAlerts = kolkataEngine.predictWaterlogging(kolkataWeather.rainfall_mm || 0);
        if (kolkataAlerts.length > 0) logger.warn(`[Kolkata] Waterlogging Alerts: ${JSON.stringify(kolkataAlerts)}`);
      }
    } catch (err) {
      logger.error(`[Predictive Engine] Error: ${err.message}`);
    }
  });
  logger.info('🕒 Hyper-Local Predictive Engine scheduled (Runs every hour)');
}

module.exports = { startGovtDataSyncJob };
