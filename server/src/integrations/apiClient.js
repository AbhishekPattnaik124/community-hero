const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const logger = require('../config/logger');
const { getCache, setCache } = require('../services/cache.service');

// Default Mock Data per integration domain to serve when API is down/401
const MOCK_DATA = {
  'sbm.gov.in': { odf_status: true, sanitation_coverage: 92.5, total_toilets_constructed: 1250000 },
  'api.mygov.in': { active_grievances: 450, avg_response_time_hrs: 48, resolved_today: 120 },
  'data.gov.in': { road_condition_index: 68, active_pipelines: 4500, municipal_budget: '500M' },
  'ndma.gov.in': { flood_risk_zone: false, vulnerability_score: 45, alert_level: 'NORMAL' },
  'overpass-api.de': { road_network_density: 'high', building_footprints_mapped: 85000 },
  'imd.gov.in': { rainfall_mm: 12.5, temp_max: 38, temp_min: 24, flood_risk: 'LOW' },
  'uidai.gov.in': { verified: true, kyc_status: 'COMPLETE', aadhaar_linked: true }
};

// Unified Axios Instance
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'CommunityHero-Agent/1.0',
    'Content-Type': 'application/json'
  }
});

// Configure Exponential Backoff (3 retries)
axiosRetry(apiClient, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 429 Too Many Requests
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  }
});

// Cache & Mock Interceptor
apiClient.interceptors.request.use(async (config) => {
  // Check Redis Cache First
  const cacheKey = `govt_api:${config.url}`;
  
  // Attach cacheKey to config for the response interceptor
  config.meta = config.meta || {};
  config.meta.cacheKey = cacheKey;

  try {
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      logger.info(`[API Client] Cache HIT for ${config.url}`);
      // Return cached response
      config.adapter = () => {
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK',
          headers: { 'x-cache': 'HIT' },
          config,
          request: {}
        });
      };
    }
  } catch (err) {
    logger.warn(`[API Client] Redis cache check failed: ${err.message}`);
  }

  logger.info(`[API Client] Fetching from ${config.url}`);
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  async (response) => {
    // Cache the successful response for 1 hour (3600 seconds)
    if (response.config.meta?.cacheKey && !response.headers['x-cache']) {
      await setCache(response.config.meta.cacheKey, response.data, 3600);
    }
    return response;
  },
  (error) => {
    // Fallback Mock Logic
    const url = error.config?.url || '';
    logger.error(`[API Client] Error calling ${url}: ${error.message}. Serving mock fallback.`);
    
    let fallbackData = {};
    for (const [domain, mock] of Object.entries(MOCK_DATA)) {
      if (url.includes(domain)) {
        fallbackData = mock;
        break;
      }
    }

    return Promise.resolve({
      data: fallbackData,
      status: 200,
      statusText: 'MOCK_FALLBACK',
      headers: { 'x-mock': 'TRUE' },
      config: error.config
    });
  }
);

module.exports = apiClient;
