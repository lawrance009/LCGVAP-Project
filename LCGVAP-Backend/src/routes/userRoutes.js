const express = require('express');
const router = express.Router();
const userController   = require('../controllers/userController');
const degreeController = require('../controllers/degreeController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin      = require('../middleware/adminMiddleware');
const isMasterAdmin = require('../middleware/masterAdminMiddleware');
const upload       = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const { rejectUserSchema } = require('../validation/schemas');

// -------------------------------------------------------
// PUBLIC — Graduate Directory
// -------------------------------------------------------
router.get('/', userController.getGraduates);

// -------------------------------------------------------
// PUBLIC — Homepage statistics (safe aggregate counts only)
// Declared before the authenticate gate and before '/:id'.
// -------------------------------------------------------
router.get('/stats/public', userController.getPublicStats);

// -------------------------------------------------------
// AUTHENTICATED — My Degrees
// MUST be declared BEFORE /:userId/degrees so the literal
// string 'me' is matched here first, not as a wildcard ID.
// -------------------------------------------------------
router.get('/me/degrees', authenticate, degreeController.getMyDegrees);

router.post(
    '/me/degrees',
    authenticate,
    upload.fields([{ name: 'degree_file', maxCount: 1 }]),
    degreeController.addDegree
);

router.put(
    '/me/degrees/:degreeId',
    authenticate,
    upload.fields([{ name: 'degree_file', maxCount: 1 }]),
    degreeController.updateDegree
);

router.delete('/me/degrees/:degreeId', authenticate, degreeController.deleteDegree);

// -------------------------------------------------------
// PUBLIC — User's verified degrees (by user ID)
// Safe to declare here because 'me' is already handled above.
// -------------------------------------------------------
router.get('/:userId/degrees', degreeController.getPublicUserDegrees);

// Signed private file access — must stay public so window.open() works
// (browser navigation cannot attach the Bearer access token).
router.get('/uploads/protected/:filename', userController.getProtectedUpload);

// -------------------------------------------------------
// AUTHENTICATED ROUTES
// NOTE: `authenticate` is applied per-route below (not via a
// blanket router.use()) so that the public '/:id' profile route
// declared at the bottom of this file is NOT accidentally gated
// behind a login requirement. It previously was, which made
// anonymous visitors get a 401 on any directory profile and the
// frontend displayed that as "Profile not found".
// -------------------------------------------------------

// --- My Profile ---
router.get('/me', authenticate, userController.getProfile);
router.get('/files/sign', authenticate, userController.signPrivateFileUrl);
router.put('/me',
    authenticate,
    upload.fields([
        { name: 'profile_photo', maxCount: 1 },
        { name: 'degree_file',   maxCount: 1 }
    ]),
    userController.updateProfile
);


// -------------------------------------------------------
// ADMIN ROUTES
// -------------------------------------------------------
router.get('/stats',     authenticate, isAdmin, userController.getDashboardStats);
router.get('/pending',   authenticate, isAdmin, userController.getPendingUsers);
router.get('/graduates', authenticate, isAdmin, userController.getAllGraduatesAdmin);
router.put('/:id/verify', authenticate, isAdmin, userController.verifyUser);
router.put('/:id/reject', authenticate, isAdmin, validate(rejectUserSchema), userController.rejectUser);
router.delete('/:id/graduate', authenticate, isAdmin, userController.deleteGraduate);

// -------------------------------------------------------
// MASTER ADMIN ROUTES (Boss Admin only)
// -------------------------------------------------------
router.get('/admins',        authenticate, isMasterAdmin, userController.getAdmins);
router.delete('/admins/:id', authenticate, isMasterAdmin, userController.deleteAdmin);

// -------------------------------------------------------
// PUBLIC — User profile by ID (must remain last so the literal
// paths above, e.g. '/stats', '/admins', take precedence over
// this catch-all ':id' pattern)
// -------------------------------------------------------
router.get('/:id', userController.getPublicUserProfile);

module.exports = router;

