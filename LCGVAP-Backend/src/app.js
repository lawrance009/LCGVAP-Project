/**
 * app.js
 * ============================================================
 * Express application setup.
 *
 * MIDDLEWARE ORDER (order matters):
 *   1. Correlation ID  — stamp every request with a trace ID
 *   2. Request logger  — log every HTTP request via Winston
 *   3. CORS            — allow/deny cross-origin requests
 *   4. Helmet          — set secure HTTP headers
 *   5. Cookie-parser   — parse HttpOnly refresh token cookies
 *   6. Rate limiters   — throttle abusive traffic
 *   7. Body parser     — parse JSON bodies
 *   8. Routes          — business logic
 *   9. Error handler   — catch-all
 * ============================================================
 */

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const logger            = require('./utils/logger');
const correlationMiddleware = require('./middleware/correlationMiddleware');
const requestLogger     = require('./middleware/requestLogger');

// Routes
const authRoutes             = require('./routes/authRoutes');
const userRoutes             = require('./routes/userRoutes');
const degreeRoutes           = require('./routes/degreeRoutes');
const universityRoutes       = require('./routes/universityRoutes');
const departmentRoutes       = require('./routes/departmentRoutes');
const advisorRoutes          = require('./routes/advisorRoutes');
const slideRoutes            = require('./routes/slideRoutes');
const graduateShowcaseRoutes = require('./routes/graduateShowcaseRoutes');
const faqRoutes              = require('./routes/faqRoutes');
const uploadRoutes           = require('./routes/uploadRoutes');
const errorMiddleware        = require('./middleware/errorMiddleware');
const path = require('path');

const app = express();

// Railway/Netlify sit behind a reverse proxy — required for rate-limit + client IP
app.set('trust proxy', 1);

// ── Base URL — used by controllers to build file URLs ─────────
app.locals.baseUrl = process.env.BASE_URL || 'http://localhost:5000';

// ── 1. Correlation ID ─────────────────────────────────────────
// Stamps every request with a unique trace ID before anything else
app.use(correlationMiddleware);

// ── 2. Request Logger ─────────────────────────────────────────
// Logs method, URL, status, and response time via Winston
app.use(requestLogger);

// ── 3. CORS ───────────────────────────────────────────────────
const normalizeOrigin = (value) => String(value || '').trim().replace(/\/$/, '');

let allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(normalizeOrigin).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];

// Optional alias — easier to remember on Railway than CORS_ORIGINS
if (process.env.FRONTEND_URL) {
  const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);
  if (frontendOrigin && !allowedOrigins.includes(frontendOrigin)) {
    allowedOrigins.push(frontendOrigin);
  }
}

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];
  logger.warn('CORS_ORIGINS parsed empty — using localhost defaults only');
}

// Production Netlify frontend (Railway deploy) — allow if not already configured
const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const netlifyProduction = 'https://lcgvap.netlify.app';
if (onRailway && process.env.NODE_ENV === 'production' && !allowedOrigins.includes(netlifyProduction)) {
  allowedOrigins.push(netlifyProduction);
  logger.info(`Auto-added CORS origin: ${netlifyProduction}`);
}

if (process.env.NODE_ENV === 'production') {
  logger.info(`CORS enabled for: ${allowedOrigins.join(', ')}`);
}

const originIsAllowed = (origin) => {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalized)) return true;

  // Netlify deploy previews: https://deploy-preview-123--lcgvap.netlify.app
  const allowsNetlify = allowedOrigins.some((o) => /lcgvap\.netlify\.app$/i.test(o));
  if (allowsNetlify && /^https:\/\/([a-z0-9-]+--)?lcgvap\.netlify\.app$/i.test(normalized)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (originIsAllowed(origin)) {
      callback(null, origin || true);
    } else {
      logger.warn(`CORS blocked request from ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      callback(null, false);
    }
  },
  credentials:          true,
  methods:              ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders:       ['Content-Type', 'Authorization', 'X-Admin-Secret', 'X-Correlation-ID'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ── 4. Helmet ─────────────────────────────────────────────────
app.use(helmet());

// ── 5. Cookie Parser ──────────────────────────────────────────
app.use(cookieParser());

// Mutating-request limiter: protects write endpoints without throttling
// high-traffic public reads (homepage assets/content).
const mutationLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15 minutes
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many requests. Please try again later.' },
  skip: (req) => req.method === 'OPTIONS' || req.method === 'GET' || req.method === 'HEAD',
});
app.use(mutationLimiter);

// Relaxed limiter for public read-heavy endpoints (homepage + static assets).
const publicReadLimiter = rateLimit({
  windowMs:        60 * 1000, // 1 minute
  max:             300,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many read requests. Please slow down.' },
  skip: (req) => req.method !== 'GET' && req.method !== 'HEAD',
});
app.use('/uploads', publicReadLimiter);
app.use('/slides/public', publicReadLimiter);
app.use('/graduates-showcase/featured', publicReadLimiter);
app.use('/faq/published', publicReadLimiter);
app.use('/users/stats/public', publicReadLimiter);
app.use('/universities', publicReadLimiter);

// Auth limiter: 10 requests per 15 min (OTP, login, register)
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15 minutes
  max:             parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many attempts. Please wait 15 minutes before trying again.' },
  skip: (req) => req.method === 'OPTIONS',
});

const refreshLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many refresh attempts. Please log in again.' },
  skip: (req) => req.method === 'OPTIONS',
});

// ── 7. Body Parser ────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Cross-origin resource policy for uploads ──────────────────
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Static file serving ───────────────────────────────────────
// Restrict direct access to sensitive graduate artifacts.
app.use('/uploads', (req, res, next) => {
  const pathPart = req.path || '';
  const lowerPath = pathPart.toLowerCase();
  const isSensitive =
    lowerPath.includes('degree_file-') ||
    lowerPath.endsWith('.pdf') ||
    lowerPath.includes('/degrees/');

  if (isSensitive) {
    return res.status(403).json({ error: 'Direct access to this file is restricted.' });
  }
  next();
}, express.static('uploads'));

// Private file endpoint (no static serving, must be accessed via signed URLs)
app.get('/private/:filename', (req, res) => {
  const requestedName = path.basename(req.params.filename || '');
  const absolutePath = path.resolve(process.cwd(), 'uploads', requestedName);
  const uploadsRoot = path.resolve(process.cwd(), 'uploads');

  if (!requestedName || !absolutePath.startsWith(uploadsRoot)) {
    return res.status(400).json({ error: 'Invalid file path.' });
  }

  return res.redirect(`/users/uploads/protected/${encodeURIComponent(requestedName)}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`);
});

// ── Health Check (/health) ────────────────────────────────────
// Fast ping — confirms the process is alive (used by Docker/load balancers)
app.get('/health', (req, res) => {
  const { getEmailStatus } = require('./utils/mailTransport');
  const emailStatus = getEmailStatus();
  res.status(200).json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
    email:     emailStatus.configured ? 'configured' : 'missing_credentials',
    smtp:      emailStatus.smtp_ok === true ? 'verified' : emailStatus.smtp_ok === false ? 'failed' : 'pending',
    smtp_error: emailStatus.smtp_error || undefined,
  });
});

// ── Readiness Check (/ready) ──────────────────────────────────
// Deeper check — confirms DB connectivity before accepting traffic
app.get('/ready', async (req, res) => {
  try {
    const db = require('./config/db');
    await db.query('SELECT 1');
    res.status(200).json({
      status:    'ready',
      database:  'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Readiness check failed — DB unreachable', { error: err.message });
    res.status(503).json({
      status:   'not ready',
      database: 'unreachable',
      error:    process.env.NODE_ENV === 'production'
        ? 'Database is currently unavailable.'
        : err.message,
    });
  }
});

// ── 8. Routes ─────────────────────────────────────────────────
// Rate-limit sensitive auth endpoints before the router handles them
app.use('/auth/otp',           authLimiter);  // OTP send + verify
app.use('/auth/admin/login',   authLimiter);  // Admin login
app.use('/auth/register',      authLimiter);  // Graduate registration
app.use('/auth/token/refresh', refreshLimiter); // Refresh endpoint
app.use('/auth',               authRoutes);
app.use('/users',              userRoutes);
app.use('/degrees',            degreeRoutes);
app.use('/universities',       universityRoutes);
app.use('/departments',        departmentRoutes);
app.use('/advisors',           advisorRoutes);
app.use('/slides',             slideRoutes);
app.use('/news',               require('./routes/newsRoutes'));
app.use('/leaders',            require('./routes/leaderRoutes'));
app.use('/graduates-showcase', graduateShowcaseRoutes);
app.use('/faq',                faqRoutes);
app.use('/upload',             uploadRoutes);

// ── 9. Error Handler ──────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;

