/**
 * correlationMiddleware.js
 * ============================================================
 * Attaches a unique request correlation ID to every incoming
 * request and response. This lets you trace a single request
 * across all log lines — critical for debugging production issues.
 *
 * ID source priority:
 *   1. X-Correlation-ID header (from upstream load balancer / frontend)
 *   2. X-Request-ID header (common alternative)
 *   3. Generated UUID (fallback)
 *
 * Adds:
 *   req.correlationId  — available inside controllers/middleware
 *   X-Correlation-ID   — echoed back in every response header
 * ============================================================
 */

const { randomUUID } = require('crypto');

const correlationMiddleware = (req, res, next) => {
  const id =
    req.headers['x-correlation-id'] ||
    req.headers['x-request-id']     ||
    randomUUID();

  req.correlationId = id;
  res.setHeader('X-Correlation-ID', id);
  next();
};

module.exports = correlationMiddleware;
