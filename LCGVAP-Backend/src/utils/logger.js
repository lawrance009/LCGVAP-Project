/**
 * logger.js
 * ============================================================
 * Winston structured logger for LCGVAP.
 *
 * In DEVELOPMENT: pretty coloured output to console.
 * In PRODUCTION:  JSON lines written to rotating daily log files.
 *
 * Log files:
 *   logs/combined-YYYY-MM-DD.log  — all levels
 *   logs/error-YYYY-MM-DD.log     — errors only
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Server started', { port: 5000 });
 *   logger.warn('Rate limit hit', { ip: req.ip });
 *   logger.error('DB query failed', { error: err.message });
 * ============================================================
 */

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, printf, colorize, errors, json } = format;

const isProduction = process.env.NODE_ENV === 'production';

// ── Dev format: readable one-liner with colour ─────────────────
const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, correlationId, stack, ...meta }) => {
    const cid  = correlationId ? ` [${correlationId}]` : '';
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp}${cid} ${level}: ${stack || message}${rest}`;
  })
);

// ── Prod format: structured JSON (parsed by log aggregators) ───
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ── Transports ─────────────────────────────────────────────────
const prodTransports = [
  new transports.DailyRotateFile({
    filename:    'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level:       'error',
    maxSize:     '20m',
    maxFiles:    '30d',  // keep 30 days of error logs
    zippedArchive: true,
  }),
  new transports.DailyRotateFile({
    filename:    'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize:     '20m',
    maxFiles:    '14d',
    zippedArchive: true,
  }),
];

const logger = createLogger({
  level:      isProduction ? 'info' : 'debug',
  format:     isProduction ? prodFormat : devFormat,
  transports: isProduction
    ? prodTransports
    : [new transports.Console()],

  // Don't crash on uncaught promise rejections
  exitOnError: false,
});

// ── Also log to console in production for container stdout ─────
if (isProduction) {
  logger.add(new transports.Console({ format: prodFormat }));
}

module.exports = logger;
