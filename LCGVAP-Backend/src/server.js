// Railway injects RAILWAY_* vars — always run production mode there
// (even if NODE_ENV=development was copied from local .env.example)
if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) {
  process.env.NODE_ENV = 'production';
}

// Only load .env in local development — never on Railway or in production.
// This prevents local .env values (e.g. REDIS_URL=redis://localhost:6379)
// from overwriting Railway's injected reference variables at runtime.
if (!process.env.RAILWAY_ENVIRONMENT && !process.env.RAILWAY_PROJECT_ID && process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { ensureUploadDirs } = require('./utils/ensureUploadDirs');

ensureUploadDirs();

const app    = require('./app');
const logger = require('./utils/logger');
const db     = require('./config/db');
const { initRedis, redisClient } = require('./config/redis');

const { initCronJobs } = require('./services/cronService');
const { initEmailWorker, closeEmailWorker } = require('./workers/emailWorker');
const { verifyMailTransport } = require('./utils/mailTransport');

const PORT = process.env.PORT || 5000;

// ── Start the server ──────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info('LCGVAP Backend started', {
    port:        PORT,
    environment: process.env.NODE_ENV || 'development',
  });

  // Start background cron jobs
  initCronJobs();
});

(async () => {
  await verifyMailTransport();

  const redisOk = await initRedis();
  if (redisOk) {
    initEmailWorker();
  } else {
    logger.warn('Starting without Redis worker support (fail-soft mode enabled).');
  }
})();

// ── Graceful Shutdown ─────────────────────────────────────────
// On SIGTERM or SIGINT, stop accepting new connections,
// wait for in-flight requests to finish, then close the DB pool.
// This prevents data corruption when the process is killed.

const shutdown = async (signal) => {
  logger.warn(`${signal} received — initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed — no new connections accepted');

    try {
      await closeEmailWorker(); // Stop processing background emails safely
      if (redisClient) {
        try { await redisClient.quit(); } catch (_) {}
      }
      await db.end();          // close the PostgreSQL connection pool
      logger.info('Database pool, Redis client, and email worker closed');
    } catch (err) {
      logger.error('Error during shutdown', { error: err.message });
    }

    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force exit after 10 seconds if something hangs
  setTimeout(() => {
    logger.error('Forced shutdown — graceful timeout exceeded (10s)');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Unhandled errors ─────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception — shutting down', { error: err.message, stack: err.stack });
  shutdown('uncaughtException');
});
