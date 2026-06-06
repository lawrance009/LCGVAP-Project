const express = require('express');
const FAQController = require('../controllers/faqController');
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const helpfulLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many helpful votes. Please try again later.' },
});

// Public routes (specific first)
router.get('/published', FAQController.getPublished);
router.post('/submit', FAQController.submit);

// Admin routes
router.get('/', authenticateToken, isAdmin, FAQController.getAll);
router.post('/:id/answer', authenticateToken, isAdmin, FAQController.answer);
router.put('/:id', authenticateToken, isAdmin, FAQController.update);
router.delete('/:id', authenticateToken, isAdmin, FAQController.delete);
router.get('/:id/admin', authenticateToken, isAdmin, FAQController.getById);

// Public routes with params (last)
router.post('/:id/helpful', helpfulLimiter, FAQController.markHelpful);
router.get('/:id', FAQController.getById);

module.exports = router;
