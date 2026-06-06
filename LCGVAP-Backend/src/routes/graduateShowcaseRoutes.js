const express = require('express');
const GraduateShowcaseController = require('../controllers/graduateShowcaseController');
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

const router = express.Router();

// Public routes (specific first, then params)
router.get('/featured', GraduateShowcaseController.getFeatured);

// Admin routes
router.get('/', authenticateToken, isAdmin, GraduateShowcaseController.getAll);
router.post('/', authenticateToken, isAdmin, GraduateShowcaseController.create);
router.put('/:id', authenticateToken, isAdmin, GraduateShowcaseController.update);
router.delete('/:id', authenticateToken, isAdmin, GraduateShowcaseController.delete);

// Public route with param (last so it doesn't catch other routes)
router.get('/:id', GraduateShowcaseController.getById);

module.exports = router;
