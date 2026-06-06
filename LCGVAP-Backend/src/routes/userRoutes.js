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

// -------------------------------------------------------
// AUTHENTICATED ROUTES (all routes below require login)
// -------------------------------------------------------
router.use(authenticate);

// --- My Profile ---
router.get('/me', userController.getProfile);
router.get('/files/sign', userController.signPrivateFileUrl);
router.get('/uploads/protected/:filename', userController.getProtectedUpload);
router.put('/me',
    upload.fields([
        { name: 'profile_photo', maxCount: 1 },
        { name: 'degree_file',   maxCount: 1 }
    ]),
    userController.updateProfile
);


// -------------------------------------------------------
// ADMIN ROUTES
// -------------------------------------------------------
router.get('/stats',     isAdmin, userController.getDashboardStats);
router.get('/pending',   isAdmin, userController.getPendingUsers);
router.get('/graduates', isAdmin, userController.getAllGraduatesAdmin);
router.put('/:id/verify', isAdmin, userController.verifyUser);
router.put('/:id/reject', isAdmin, validate(rejectUserSchema), userController.rejectUser);
router.delete('/:id/graduate', isAdmin, userController.deleteGraduate);

// -------------------------------------------------------
// MASTER ADMIN ROUTES (Boss Admin only)
// -------------------------------------------------------
router.get('/admins',        authenticate, isMasterAdmin, userController.getAdmins);
router.delete('/admins/:id', authenticate, isMasterAdmin, userController.deleteAdmin);

// -------------------------------------------------------
// PUBLIC — User profile by ID (must remain last)
// -------------------------------------------------------
router.get('/:id', userController.getPublicUserProfile);

module.exports = router;

