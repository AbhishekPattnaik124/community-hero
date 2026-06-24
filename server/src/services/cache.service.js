const { getRedisClient } = require('../config/redis');
const logger = require('../config/logger');

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Get value from Redis cache
 */
async function get(key) {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.warn(`Cache GET failed for key "${key}":`, err.message);
    return null;
  }
}

/**
 * Set value in Redis cache
 */
async function set(key, value, ttl = DEFAULT_TTL) {
  try {
    const client = getRedisClient();
    await client.setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    logger.warn(`Cache SET failed for key "${key}":`, err.message);
  }
}

/**
 * Delete one or more keys from Redis
 */
async function del(...keys) {
  try {
    const client = getRedisClient();
    await client.del(...keys);
  } catch (err) {
    logger.warn('Cache DEL failed:', err.message);
  }
}

/**
 * Invalidate all keys matching a pattern
 */
async function invalidatePattern(pattern) {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      logger.debug(`Invalidated ${keys.length} cache keys matching "${pattern}"`);
    }
  } catch (err) {
    logger.warn(`Cache pattern invalidation failed for "${pattern}":`, err.message);
  }
}

/**
 * Cache-aside wrapper: try cache first, fallback to getter fn
 */
async function getOrSet(key, getter, ttl = DEFAULT_TTL) {
  const cached = await get(key);
  if (cached !== null) return cached;

  const value = await getter();
  await set(key, value, ttl);
  return value;
}

/**
 * Increment a counter (e.g., view counts)
 */
async function increment(key, by = 1, ttl = 86400) {
  try {
    const client = getRedisClient();
    const val = await client.incrby(key, by);
    if (val === by) await client.expire(key, ttl); // set TTL on first increment
    return val;
  } catch (err) {
    logger.warn(`Cache INCREMENT failed for "${key}":`, err.message);
    return null;
  }
}

module.exports = { get, set, del, invalidatePattern, getOrSet, increment };
