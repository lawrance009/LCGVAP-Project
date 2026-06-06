/**
 * degreeRoutes.js
 * ---------------------------------------------------------------
 * Routes for degree management.
 *
 * USER ROUTES  (authenticated graduate)
 *   GET    /users/me/degrees              → list all my degrees + badges
 *   POST   /users/me/degrees              → submit a new degree
 *   PUT    /users/me/degrees/:degreeId    → update an unverified degree
 *   DELETE /users/me/degrees/:degreeId    → remove an unverified degree
 *
 * PUBLIC ROUTES
 *   GET    /users/:userId/degrees         → public verified degrees of a user
 *
 * ADMIN ROUTES  (requires admin role)
 *   GET    /degrees/pending              → list all pending degrees
 *   PUT    /degrees/:degreeId/verify     → verify + award badge
 *   PUT    /degrees/:degreeId/reject     → reject with reason
 * ---------------------------------------------------------------
 */

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/degreeController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin      = require('../middleware/adminMiddleware');
const upload       = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const { verifyDegreeSchema, rejectDegreeSchema } = require('../validation/schemas');

// -------------------------------------------------------
// ADMIN-ONLY: pending list + verify/reject
// Mount at /degrees in app.js
// -------------------------------------------------------
router.get(
  '/pending',
  authenticate,
  isAdmin,
  controller.getPendingDegrees
);

router.put(
  '/:degreeId/verify',
  authenticate,
  isAdmin,
  validate(verifyDegreeSchema),
  controller.verifyDegree
);

router.put(
  '/:degreeId/reject',
  authenticate,
  isAdmin,
  validate(rejectDegreeSchema),
  controller.rejectDegree
);

module.exports = router;
