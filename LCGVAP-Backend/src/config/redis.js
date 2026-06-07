/**
 * redis.js
 * ============================================================
 * Centralized Redis connection manager using ioredis.
 *
 * Supports REDIS_URL (Upstash, Railway plugin) or individual
 * REDIS_HOST / REDIS_PORT / REDIS_PASSWORD vars from Railway.
 * Automatically handles reconnections.
 * ============================================================
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

/** Resolve Redis URL from env (Railway, Upstash, Docker Compose, etc.) */
const resolveRedisUrl = () => {
  const direct =
    process.env.REDIS_URL ||
    process.env.REDIS_PRIVATE_URL ||
    process.env.REDIS_PUBLIC_URL;

  if (direct && direct.trim()) {
    return direct.trim();
  }

  const host = process.env.REDIS_HOST || process.env.REDISHOST;
  const port = process.env.REDIS_PORT || process.env.REDISPORT || '6379';
  const password = process.env.REDIS_PASSWORD || process.env.REDISPASSWORD;

  if (host) {
    const auth = password ? `default:${encodeURIComponent(password)}@` : '';
    return `redis://${auth}${host}:${port}`;
  }

  return null;
};

const redisUrl = resolveRedisUrl();

const onRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID
);

let redisReady = false;
let redisDisabled = !redisUrl;

if (!redisUrl) {
  logger.warn(
    'REDIS_URL is not set. Local dev: use redis://localhost:6379 or start Redis via docker compose. Redis features run in fail-soft mode.'
  );
} else if (/localhost|127\.0\.0\.1|::1/.test(redisUrl) && onRailway) {
  logger.error(
    'REDIS_URL points to localhost — that will not work on Railway. Delete this variable and use Add Reference → Redis service → REDIS_URL instead.'
  );
  redisDisabled = true;
}

const redisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: true,
  lazyConnect: true,
  retryStrategy(times) {
    if (times <= 10) {
      logger.warn(`Redis connection lost. Retrying... (Attempt ${times})`);
      return Math.min(times * 200, 3000);
    }
    redisDisabled = true;
    redisReady = false;
    logger.error('Redis unavailable after multiple retries. Redis-backed features are now fail-soft.');
    return null;
  },
};

// TLS for rediss:// URLs (Upstash, some managed Redis providers)
if (redisUrl && redisUrl.startsWith('rediss://')) {
  redisOptions.tls = { rejectUnauthorized: false };
}

const redisClient = redisUrl ? new Redis(redisUrl, redisOptions) : null;

if (redisClient) {
  redisClient.on('ready', () => {
    redisReady = true;
    redisDisabled = false;
    logger.info('Connected to Redis successfully');
  });

  redisClient.on('error', (err) => {
    redisReady = false;
    logger.error('Redis connection error', { error: err.message || String(err) });
  });

  redisClient.on('end', () => {
    redisReady = false;
  });
}

const waitForRedisReady = (client, timeoutMs = 15_000) =>
  new Promise((resolve, reject) => {
    if (client.status === 'ready') {
      resolve(true);
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Redis connection timed out'));
    }, timeoutMs);

    const onReady = () => {
      cleanup();
      resolve(true);
    };

    const cleanup = () => {
      clearTimeout(timer);
      client.off('ready', onReady);
    };

    client.once('ready', onReady);
  });

const initRedis = async () => {
  if (!redisClient || !redisUrl) {
    redisDisabled = true;
    return false;
  }

  if (redisClient.status === 'ready') {
    return true;
  }

  try {
    if (redisClient.status === 'wait') {
      await redisClient.connect();
    }
    await waitForRedisReady(redisClient);
    return true;
  } catch (err) {
    if (String(err.message || '').includes('already connecting/connected')) {
      try {
        await waitForRedisReady(redisClient);
        return true;
      } catch (waitErr) {
        redisDisabled = true;
        logger.error('Initial Redis connection failed; running in fail-soft mode', {
          error: waitErr.message,
        });
        return false;
      }
    }
    redisDisabled = true;
    logger.error('Initial Redis connection failed; running in fail-soft mode', {
      error: err.message,
    });
    return false;
  }
};

const isRedisReady = () => Boolean(redisClient) && redisReady && !redisDisabled;
const isRedisDisabled = () => redisDisabled || !redisClient;

module.exports = { redisClient, initRedis, isRedisReady, isRedisDisabled };
