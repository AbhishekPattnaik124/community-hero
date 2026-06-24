const Redis = require('ioredis');
const logger = require('./logger');

let client = null;

async function connectRedis() {
  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      if (times > 3) return null;
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) return true;
      return false;
    },
  });

  client.on('connect', () => logger.info('Redis client connected'));
  client.on('error', (err) => logger.error('Redis client error:', err));
  client.on('reconnecting', () => logger.warn('Redis client reconnecting...'));

  await client.ping();
  return client;
}

function getRedisClient() {
  if (!client) throw new Error('Redis client not initialized. Call connectRedis() first.');
  return client;
}

module.exports = { connectRedis, getRedisClient };
