const express = require('express');
const router = express.Router();
const slideController = require('../controllers/slideController');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Slide Images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/slides/';
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'slide-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Routes
router.get('/', authenticate, isAdmin, slideController.getAllSlides); // Admin view (all)
router.get('/public', slideController.getPublicSlides); // Public view (active only)
router.post('/', authenticate, isAdmin, upload.single('image'), slideController.addSlide);
router.put('/:id', authenticate, isAdmin, slideController.updateSlide);
router.delete('/:id', authenticate, isAdmin, slideController.deleteSlide);

// Error handling middleware for Multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File is too large. Max size is 20MB.' });
        }
    }
    next(err);
});

module.exports = router;
