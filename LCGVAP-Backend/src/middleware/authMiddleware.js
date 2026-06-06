/**
 * authMiddleware.js
 * ============================================================
 * Verifies the short-lived ACCESS token on every protected route.
 *
 * When the access token is expired, returns 401 with code
 * TOKEN_EXPIRED so the frontend interceptor knows to silently
 * hit /auth/token/refresh before retrying the original request.
 * ============================================================
 */

const { verifyAccessToken } = require('../utils/jwtUtils');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: No token provided',
      code:  'NO_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    // Distinguish expired vs invalid for the frontend refresh interceptor
    if (err.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        error: 'Access token expired',
        code:  'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      error: 'Unauthorized: Invalid token',
      code:  'TOKEN_INVALID',
    });
  }
};

module.exports = authenticate;
