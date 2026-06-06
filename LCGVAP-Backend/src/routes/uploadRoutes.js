const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticate = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

// Create uploads directories if they don't exist
const universitiesDir = path.join(__dirname, '../../uploads/universities');
const graduatesDir = path.join(__dirname, '../../uploads/graduates');

if (!fs.existsSync(universitiesDir)) {
    fs.mkdirSync(universitiesDir, { recursive: true });
}
if (!fs.existsSync(graduatesDir)) {
    fs.mkdirSync(graduatesDir, { recursive: true });
}

// Configure multer for universities file uploads
const storageUniversities = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, universitiesDir);
    },
    filename: (req, file, cb) => {
        const safeOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueName = `${Date.now()}-${safeOriginal}`;
        cb(null, uniqueName);
    }
});

// Configure multer for graduates file uploads
const storageGraduates = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, graduatesDir);
    },
    filename: (req, file, cb) => {
        const safeOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueName = `${Date.now()}-${safeOriginal}`;
        cb(null, uniqueName);
    }
});

// Common file filter for images
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

const uploadUniversities = multer({
    storage: storageUniversities,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const uploadGraduates = multer({
    storage: storageGraduates,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Upload university logo endpoint
router.post('/logo', authenticate, isAdmin, uploadUniversities.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const fileUrl = `uploads/universities/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Upload graduate photo endpoint
router.post('/graduate-photo', authenticate, isAdmin, uploadGraduates.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const fileUrl = `uploads/graduates/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

module.exports = router;
