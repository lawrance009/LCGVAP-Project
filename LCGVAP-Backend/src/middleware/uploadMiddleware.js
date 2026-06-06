const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const MAX_UPLOAD_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '15', 10);

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter — MIME type check (first line of defence)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP and PDF are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    // Keep this above typical mobile photo sizes so optimizeImages can run.
    limits:  { fileSize: 1024 * 1024 * MAX_UPLOAD_SIZE_MB },
    fileFilter: fileFilter,
});

/**
 * validateMagicBytes — second line of defence.
 * Reads the actual first bytes of a saved file and confirms they
 * match the expected format, catching renamed malicious files.
 *
 * Call this AFTER Multer has saved the file, before persisting the path to DB.
 *
 * @param {string} filePath  — absolute or relative path to the saved file
 * @param {string} mimeType  — the MIME type the client claimed (file.mimetype)
 * @returns {boolean}        — true if valid, false if mismatch
 */
const MAGIC_BYTES = {
    'image/jpeg':      [0xFF, 0xD8, 0xFF],
    'image/png':       [0x89, 0x50, 0x4E, 0x47],
    'image/webp':      null,   // WEBP checked differently (RIFF....WEBP)
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
};

const validateMagicBytes = (filePath, mimeType) => {
    try {
        const buffer = Buffer.alloc(12);
        const fd     = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 12, 0);
        fs.closeSync(fd);

        if (mimeType === 'image/webp') {
            // WEBP: bytes 0-3 = "RIFF", bytes 8-11 = "WEBP"
            const riff = buffer.slice(0, 4).toString('ascii');
            const webp = buffer.slice(8, 12).toString('ascii');
            return riff === 'RIFF' && webp === 'WEBP';
        }

        const expected = MAGIC_BYTES[mimeType];
        if (!expected) return false;

        return expected.every((byte, i) => buffer[i] === byte);
    } catch {
        return false;
    }
};

/**
 * optimizeImages — Phase 3 Scaling
 * Uses Sharp to intercept uploaded profile photos, resize them to 500x500 max,
 * and convert them to highly compressed WebP format before the controller runs.
 */
const optimizeImages = async (req, res, next) => {
    if (!req.files || !req.files['profile_photo']) {
        return next();
    }

    try {
        const file = req.files['profile_photo'][0];
        
        // Skip if it's already a webp maybe, or just re-compress everything
        const sharp = require('sharp');
        const outputPath = path.join(uploadDir, `optimized-${Date.now()}.webp`);

        await sharp(file.path)
            .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(outputPath);

        // Delete the original bloated upload
        fs.unlinkSync(file.path);

        // Update req.files so the controller uses the new optimized webp
        req.files['profile_photo'][0].path = outputPath;
        req.files['profile_photo'][0].filename = path.basename(outputPath);
        req.files['profile_photo'][0].mimetype = 'image/webp';

        next();
    } catch (error) {
        console.error('Image optimization failed:', error);
        // Fall back to original file if sharp fails
        next();
    }
};

module.exports = upload;
module.exports.validateMagicBytes = validateMagicBytes;
module.exports.optimizeImages = optimizeImages;
