/**
 * errorMiddleware.js
 * ============================================================
 * Centralized error handler.
 *
 * SECURITY RULE:
 *   Raw database errors (table names, column names, SQL fragments)
 *   MUST NOT reach the client. They go to the server log only.
 *   Clients receive a safe, generic message.
 *
 * DB error codes mapped to safe HTTP responses:
 *   23505 → unique_violation   → 409 Conflict
 *   23503 → foreign_key_violation → 400 Bad Request
 *   23502 → not_null_violation    → 400 Bad Request
 *   22P02 → invalid_text_representation → 400 Bad Request
 * ============================================================
 */

const DB_ERROR_MAP = {
  '23505': { status: 409, message: 'A record with this information already exists.' },
  '23503': { status: 400, message: 'Related record not found. Check the provided IDs.' },
  '23502': { status: 400, message: 'A required field is missing.' },
  '22001': { status: 400, message: 'Invalid data length provided.' },
  '23514': { status: 400, message: 'Invalid data format provided.' },
  '22P02': { status: 400, message: 'Invalid data format provided.' },
  '42703': { status: 400, message: 'Invalid field name provided.' },
};
const MAX_UPLOAD_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '15', 10);

const errorHandler = (err, req, res, next) => {
  // Always log the full error server-side (never expose to client)
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // ── Known application errors with explicit statusCode ────
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // ── PostgreSQL errors — map to safe messages ─────────────
  if (err.code && DB_ERROR_MAP[err.code]) {
    const mapped = DB_ERROR_MAP[err.code];
    return res.status(mapped.status).json({ error: mapped.message });
  }

  // ── Multer file upload errors ─────────────────────────────
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `File is too large. Maximum size is ${MAX_UPLOAD_SIZE_MB} MB.` });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  // ── Generic catch-all — NEVER expose internal details ────
  res.status(500).json({
    error: 'An unexpected error occurred. Please try again or contact support.',
  });
};

module.exports = errorHandler;
