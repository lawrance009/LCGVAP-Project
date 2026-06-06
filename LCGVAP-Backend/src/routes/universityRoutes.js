const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

// Public routes
router.get('/', universityController.getAllUniversities);
router.get('/featured', universityController.getFeaturedUniversities);
router.get('/:id/departments', universityController.getDepartmentsByUniversity);
router.get('/departments/:id/advisors', universityController.getAdvisorsByDepartment);

// Admin Routes (Protected)
router.post('/', authenticateToken, isAdmin, universityController.createUniversity);
router.put('/:id', authenticateToken, isAdmin, universityController.updateUniversity);
router.delete('/:id', authenticateToken, isAdmin, universityController.deleteUniversity);

module.exports = router;
