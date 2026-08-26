/**
 * redis.js
 * ============================================================
 * Centralized Redis connection manager using ioredis.
 *
 * Supports Redis protocol URLs (Railway/Upstash TCP) plus Upstash REST
 * credentials for environments where only REST access is configured.
 * Automatically handles reconnections.
 * ============================================================
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

const onRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID
);

const isLocalhostUrl = (url) =>
  Boolean(url && /localhost|127\.0\.0\.1|::1/.test(String(url).trim()));

const normalizeRestUrl = (url) => String(url || '').trim().replace(/\/$/, '');

const upstashRestUrl = normalizeRestUrl(process.env.UPSTASH_REDIS_REST_URL);
const upstashRestToken = String(process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
const upstashRestConfigured = Boolean(upstashRestUrl && upstashRestToken);

/** Resolve Redis URL from env (Railway, Upstash, Docker Compose, etc.) */
const resolveRedisUrl = () => {
  const direct =
    process.env.REDIS_URL ||
    process.env.REDIS_PRIVATE_URL ||
    process.env.REDIS_PUBLIC_URL;

  // On Railway, never use a stale localhost URL from local .env.example
  if (direct && direct.trim() && !(onRailway && isLocalhostUrl(direct))) {
    return direct.trim();
  }

  if (onRailway && isLocalhostUrl(direct)) {
    logger.warn(
      'Ignoring REDIS_URL=localhost on Railway. Link Redis via Variable Reference on the backend service.'
    );
  }

  const host = process.env.REDIS_HOST || process.env.REDISHOST;
  const port = process.env.REDIS_PORT || process.env.REDISPORT || '6379';
  const user = process.env.REDIS_USER || process.env.REDISUSER || 'default';
  const password = process.env.REDIS_PASSWORD || process.env.REDISPASSWORD;

  if (host && !isLocalhostUrl(host)) {
    const auth = password ? `${user}:${encodeURIComponent(password)}@` : '';
    return `redis://${auth}${host}:${port}`;
  }

  return null;
};

const redisUrl = resolveRedisUrl();

let redisReady = false;
let redisDisabled = !redisUrl && !upstashRestConfigured;

if (onRailway) {
  logger.info('Railway Redis config', {
    hasRedisUrl: Boolean(process.env.REDIS_URL),
    hasUpstashRestUrl: Boolean(upstashRestUrl),
    hasUpstashRestToken: Boolean(upstashRestToken),
    redisUrlIsLocalhost: isLocalhostUrl(process.env.REDIS_URL),
    hasRedisHost: Boolean(process.env.REDISHOST || process.env.REDIS_HOST),
    hasRedisPassword: Boolean(process.env.REDISPASSWORD || process.env.REDIS_PASSWORD),
    resolved: redisUrl || upstashRestConfigured ? 'ok' : 'missing',
  });
}

if (!redisUrl && !upstashRestConfigured) {
  const msg = onRailway
    ? 'Redis not configured on Railway. On the BACKEND service: delete REDIS_URL=localhost, then Add Reference → Redis → REDIS_URL (or REDISHOST + REDISPORT + REDISPASSWORD).'
    : 'Redis is not configured. Local dev: set REDIS_URL or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN. Redis features run in fail-soft mode.';
  logger.warn(msg);
} else if (isLocalhostUrl(redisUrl)) {
  logger.error('Redis URL points to localhost — not valid for cloud deploy.');
  redisDisabled = true;
} else if (!redisUrl && upstashRestConfigured) {
  logger.info('Using Upstash Redis REST connection. BullMQ workers require REDIS_URL/rediss:// and will stay disabled.');
}

const redisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: true,
  lazyConnect: true,
  // Railway private network is IPv6; ioredis defaults to IPv4-only DNS lookups
  ...(onRailway ? { family: 0 } : {}),
  retryStrategy(times) {
    if (redisDisabled) return null;
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

if (redisUrl && redisUrl.startsWith('rediss://')) {
  redisOptions.tls = { rejectUnauthorized: false };
}

// Do not create a client when disabled — prevents localhost retry spam on Railway
const redisClient = redisUrl && !redisDisabled ? new Redis(redisUrl, redisOptions) : null;

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

const pingUpstashRest = async () => {
  if (!upstashRestConfigured) return false;

  const response = await fetch(`${upstashRestUrl}/ping`, {
    headers: {
      Authorization: `Bearer ${upstashRestToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Upstash REST ping failed with HTTP ${response.status}`);
  }

  const payload = await response.json().catch(() => ({}));
  if (payload.result !== 'PONG') {
    throw new Error('Upstash REST ping did not return PONG');
  }

  redisReady = true;
  redisDisabled = false;
  logger.info('Connected to Upstash Redis REST successfully');
  return true;
};

const initRedis = async () => {
  if (!redisClient && upstashRestConfigured) {
    try {
      return await pingUpstashRest();
    } catch (err) {
      redisDisabled = true;
      redisReady = false;
      logger.error('Initial Upstash Redis REST connection failed; running in fail-soft mode', {
        error: err.message,
      });
      return false;
    }
  }

  if (!redisClient || !redisUrl || redisDisabled) {
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

const isRedisReady = () => redisReady && !redisDisabled;
const isRedisRestMode = () => upstashRestConfigured && !redisClient;
const isRedisDisabled = () => redisDisabled || (!redisClient && !upstashRestConfigured);

module.exports = { redisClient, initRedis, isRedisReady, isRedisRestMode, isRedisDisabled };
