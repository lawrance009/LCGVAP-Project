const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const { createNewsSchema } = require('../validation/schemas');

// Public Routes (Anyone can read news)
router.get('/', newsController.getNews);
router.get('/:id', newsController.getNewsById);

// Protected Admin Routes (Create/Delete)
router.post('/', authenticate, isAdmin, upload.single('image'), validate(createNewsSchema), newsController.createNews);
router.put('/:id', authenticate, isAdmin, upload.single('image'), validate(createNewsSchema.partial()), newsController.updateNews);
router.delete('/:id', authenticate, isAdmin, newsController.deleteNews);

module.exports = router;
