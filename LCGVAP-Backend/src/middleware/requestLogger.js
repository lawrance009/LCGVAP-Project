/**
 * requestLogger.js
 * ============================================================
 * Logs every HTTP request using Winston.
 * Replaces verbose console.log calls scattered in controllers.
 *
 * Output includes:
 *   - HTTP method + URL
 *   - Response status code
 *   - Response time in ms
 *   - Correlation ID (from correlationMiddleware)
 *   - Client IP
 * ============================================================
 */

const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms     = Date.now() - start;
    const level  = res.statusCode >= 500 ? 'error'
                 : res.statusCode >= 400 ? 'warn'
                 : 'info';

    logger[level](`${req.method} ${req.originalUrl}`, {
      status:        res.statusCode,
      responseTimeMs: ms,
      correlationId: req.correlationId,
      ip:            req.ip,
    });
  });

  next();
};

module.exports = requestLogger;
