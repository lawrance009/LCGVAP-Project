const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

router.get('/', departmentController.getAllDepartments);
router.post('/', authenticate, isAdmin, departmentController.createDepartment);
router.put('/:id', authenticate, isAdmin, departmentController.updateDepartment);
router.delete('/:id', authenticate, isAdmin, departmentController.deleteDepartment);

module.exports = router;
