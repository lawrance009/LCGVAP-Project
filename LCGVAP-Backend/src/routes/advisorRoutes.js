const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

router.get('/', advisorController.getAllAdvisors);
router.post('/', authenticate, isAdmin, advisorController.createAdvisor);
router.put('/:id', authenticate, isAdmin, advisorController.updateAdvisor);
router.delete('/:id', authenticate, isAdmin, advisorController.deleteAdvisor);

module.exports = router;
