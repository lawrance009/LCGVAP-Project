const express = require('express');
const router = express.Router();
const leaderController = require('../controllers/leaderController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Route
router.get('/', leaderController.getLeaders);

// Admin Routes
router.post('/', authenticate, isAdmin, upload.single('image'), leaderController.createLeader);
router.put('/:id', authenticate, isAdmin, upload.single('image'), leaderController.updateLeader);
router.delete('/:id', authenticate, isAdmin, leaderController.deleteLeader);

module.exports = router;
