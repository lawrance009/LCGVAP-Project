/**
 * redis.js
 * ============================================================
 * Centralized Redis connection manager using ioredis.
 *
 * Uses the Upstash Serverless Redis URL provided in .env.
 * Automatically handles reconnections.
 * ============================================================
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  logger.warn('REDIS_URL is not defined in .env. Redis features (rate-limiting, queues) may fail.');
}

let redisReady = false;
let redisDisabled = false;

const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times <= 10) {
      logger.warn(`Redis connection lost. Retrying... (Attempt ${times})`);
      return Math.min(times * 200, 3000);
    }
    // Fail-soft after repeated failures. Core API keeps working.
    redisDisabled = true;
    logger.error('Redis unavailable after multiple retries. Redis-backed features are now fail-soft.');
    return null;
  }
});

redisClient.on('connect', () => {
  redisReady = true;
  redisDisabled = false;
  logger.info('Connected to Redis (Upstash) successfully');
});

redisClient.on('error', (err) => {
  redisReady = false;
  logger.error('Redis connection error', { error: err.message });
});

const initRedis = async () => {
  if (!redisUrl) {
    redisDisabled = true;
    return false;
  }
  if (redisClient.status === 'ready' || redisClient.status === 'connect' || redisClient.status === 'connecting') {
    return true;
  }
  try {
    await redisClient.connect();
    return true;
  } catch (err) {
    if (String(err.message || '').includes('already connecting/connected')) {
      return true;
    }
    redisDisabled = true;
    logger.error('Initial Redis connection failed; running in fail-soft mode', { error: err.message });
    return false;
  }
};

const isRedisReady = () => redisReady && !redisDisabled;
const isRedisDisabled = () => redisDisabled;

module.exports = { redisClient, initRedis, isRedisReady, isRedisDisabled };
