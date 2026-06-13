const userModel = require('../models/userModel');
const degreeModel = require('../models/degreeModel');
const { validateMagicBytes } = require('../middleware/uploadMiddleware');
const { sanitizeUserForClient } = require('../utils/sanitizeUser');
const { normalizeStoredPath } = require('../utils/filePaths');
const { signFileAccessToken, verifyFileAccessToken, FILE_ACCESS_TTL_SECONDS } = require('../utils/fileAccessToken');
const fs = require('fs');
const path = require('path');

/**
 * Get current user profile
 * GET /users/me
 */
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findUserByEmail(req.user.email);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(sanitizeUserForClient(user));
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * PUT /users/me
 * Allowed updates: first_name, last_name, profile_photo, degree_file
 */
const updateProfile = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'graduate') {
            return res.status(403).json({ error: 'Graduate access required for this action.' });
        }
        const userId = req.user.id;
        const updates = req.body; // Contains text fields

        // Handle Files
        if (req.files) {
            if (req.files['profile_photo']) {
                const f = req.files['profile_photo'][0];
                if (!validateMagicBytes(f.path, f.mimetype)) {
                    fs.unlinkSync(f.path);
                    return res.status(400).json({ error: 'Profile photo content does not match its extension.' });
                }
                updates.profile_photo = `${req.app.locals.baseUrl}/uploads/${req.files['profile_photo'][0].filename}`;
            }
            if (req.files['degree_file']) {
                const f = req.files['degree_file'][0];
                if (!validateMagicBytes(f.path, f.mimetype)) {
                    fs.unlinkSync(f.path);
                    return res.status(400).json({ error: 'Degree file content does not match its extension.' });
                }
                updates.degree_file = `${req.app.locals.baseUrl}/private/${req.files['degree_file'][0].filename}`;
            }
        }

        // Whitelist updates
        const allowedUpdates = {};
        if (updates.first_name) allowedUpdates.first_name = updates.first_name;
        if (updates.last_name) allowedUpdates.last_name = updates.last_name;
        if (updates.profile_photo) allowedUpdates.profile_photo = updates.profile_photo;
        if (updates.degree_file) allowedUpdates.degree_file = updates.degree_file;
        if (updates.bio) allowedUpdates.bio = updates.bio;

        // If no updates
        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ error: 'No valid updates provided' });
        }

        const updatedUser = await userModel.updateUserProfile(userId, allowedUpdates);

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated', user: sanitizeUserForClient(updatedUser) });
    } catch (error) {
        next(error);
    }
};

/**
 * Get public list of graduates
 * GET /users
 * Query Params: search, university_id, department_id, page
 */
const getGraduates = async (req, res, next) => {
    try {
        const limit = 12;

        // ── Validate & sanitize public query params ──────────────
        const toPositiveIntOrUndefined = (val) => {
            const n = parseInt(val, 10);
            return Number.isInteger(n) && n > 0 ? n : undefined;
        };

        const pageRaw = parseInt(req.query.page, 10);
        const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

        const search = typeof req.query.search === 'string' && req.query.search.trim()
            ? req.query.search.trim().slice(0, 100)
            : undefined;
        const university_id = toPositiveIntOrUndefined(req.query.university_id);
        const department_id = toPositiveIntOrUndefined(req.query.department_id);

        const offset = (page - 1) * limit;
        const filters = { search, university_id, department_id, limit, offset };

        // Fetch the page and the total count in parallel for real pagination.
        const [graduates, total] = await Promise.all([
            userModel.findAllVerifiedUsers(filters),
            userModel.countAllVerifiedUsers(filters),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        res.json({
            data: graduates,
            meta: { page, limit, total, totalPages },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get PUBLIC site statistics (homepage counters)
 * GET /users/stats/public
 */
const getPublicStats = async (req, res, next) => {
    try {
        const stats = await userModel.getPublicStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

/**
 * Get ALL graduates with FULL details (Admin)
 * GET /admin/graduates
 */
const getAllGraduatesAdmin = async (req, res, next) => {
    try {
        const graduates = await userModel.findAllVerifiedUsersAdmin();
        const safeGraduates = graduates.map(sanitizeUserForClient);
        res.json(safeGraduates);
    } catch (error) {
        next(error);
    }
};

/**
 * Get public user profile by ID
 * GET /users/:id
 */
const getPublicUserProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userModel.findPublicUserById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const degrees = await degreeModel.getDegreesByUserId(parseInt(id, 10));
        const verifiedDegrees = degrees
            .filter((d) => d.is_verified)
            .map(({ degree_file, rejection_reason, ...safeDegree }) => safeDegree);

        res.json({
            ...user,
            verified_degrees: verifiedDegrees,
            verified_degree_types: verifiedDegrees.map((d) => d.degree_type),
            is_premium_veteran: degreeModel.computeIsPremiumVeteran(
                verifiedDegrees.map((d) => d.degree_type)
            ),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get protected upload by filename
 * GET /users/uploads/protected/:filename
 */
const getProtectedUpload = async (req, res, next) => {
    try {
        const requestedName = path.basename(req.params.filename || '');
        const token = req.query.token;
        if (!token) {
            return res.status(401).json({ error: 'Missing file access token.' });
        }

        let decoded;
        try {
            decoded = verifyFileAccessToken(token);
        } catch {
            return res.status(401).json({ error: 'Invalid or expired file access token.' });
        }

        if (!decoded || decoded.typ !== 'file_access') {
            return res.status(401).json({ error: 'Invalid file access token.' });
        }
        if (decoded.filename !== requestedName) {
            return res.status(403).json({ error: 'File token does not match requested file.' });
        }

        const absolutePath = path.resolve(process.cwd(), 'uploads', requestedName);
        const uploadsRoot = path.resolve(process.cwd(), 'uploads');

        if (!absolutePath.startsWith(uploadsRoot)) {
            return res.status(400).json({ error: 'Invalid file path.' });
        }
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ error: 'File not found.' });
        }

        const role = decoded.role;
        const userId = decoded.uid;

        // Admins can view any private file once they have a signed URL.
        if (role === 'admin' || role === 'master_admin') {
            await userModel.logFileAccessEvent(
                userId,
                'PRIVATE_FILE_ACCESS',
                null,
                `Admin downloaded private file: ${requestedName}`,
                req.ip
            );
            res.setHeader('Content-Disposition', 'inline');
            return res.sendFile(absolutePath);
        }

        if (role !== 'graduate') {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const user = await userModel.findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const ownFiles = new Set();
        if (user.profile_photo) ownFiles.add(normalizeStoredPath(user.profile_photo));
        if (user.degree_file) ownFiles.add(normalizeStoredPath(user.degree_file));

        const degrees = await degreeModel.getDegreesByUserId(userId);
        for (const degree of degrees) {
            if (degree.degree_file) {
                ownFiles.add(normalizeStoredPath(degree.degree_file));
            }
        }

        if (!ownFiles.has(requestedName)) {
            return res.status(403).json({ error: 'You are not allowed to access this file.' });
        }

        await userModel.logFileAccessEvent(
            userId,
            'PRIVATE_FILE_ACCESS',
            userId,
            `Graduate downloaded own private file: ${requestedName}`,
            req.ip
        );
        res.setHeader('Content-Disposition', 'inline');
        return res.sendFile(absolutePath);
    } catch (error) {
        next(error);
    }
};

/**
 * Create short-lived signed URL for private file download.
 * GET /users/files/sign?filename=...
 */
const signPrivateFileUrl = async (req, res, next) => {
    try {
        const requestedName = path.basename(req.query.filename || '');
        if (!requestedName) {
            return res.status(400).json({ error: 'filename query parameter is required.' });
        }

        const user = await userModel.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const role = req.user.role;
        const isAdminUser = role === 'admin' || role === 'master_admin';

        if (!isAdminUser) {
            const ownFiles = new Set();
            if (user.profile_photo) ownFiles.add(normalizeStoredPath(user.profile_photo));
            if (user.degree_file) ownFiles.add(normalizeStoredPath(user.degree_file));

            const degrees = await degreeModel.getDegreesByUserId(req.user.id);
            for (const degree of degrees) {
                if (degree.degree_file) {
                    ownFiles.add(normalizeStoredPath(degree.degree_file));
                }
            }
            if (!ownFiles.has(requestedName)) {
                return res.status(403).json({ error: 'You are not allowed to sign access for this file.' });
            }
        }

        const token = signFileAccessToken({
            filename: requestedName,
            userId: req.user.id,
            role,
        });

        const signedUrl = `${req.app.locals.baseUrl}/users/uploads/protected/${requestedName}?token=${encodeURIComponent(token)}`;
        res.json({
            url: signedUrl,
            expires_in_seconds: FILE_ACCESS_TTL_SECONDS,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Pending Users (Admin)
 * GET /users/pending
 */
const getPendingUsers = async (req, res, next) => {
    try {
        const users = await userModel.findPendingUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

/**
 * Verify User (Admin)
 * PUT /users/:id/verify
 */
const emailService = require('../utils/emailService');

const verifyUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const ipAddress = req.ip;

        const user = await userModel.verifyUser(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get total verified for email context
        const stats = await userModel.getDashboardStats();

        // Log Audit
        await userModel.logAuditEvent(adminId, 'VERIFY', id, 'User verified by admin', ipAddress);

        // Send Email
        const univ = await userModel.findPublicUserById(id); // Helper to get uni name/grad year if needed, or query again
        // Note: findPublicUserById returns joined fields like university_name
        // But userModel.verifyUser returns raw user table data.
        // Let's re-fetch details for the email to be safe and accurate
        const userDetails = await userModel.findPublicUserById(id);

        if (userDetails) {
            try {
                await emailService.sendVerificationEmail(
                    user.email,
                    `${user.first_name} ${user.last_name}`,
                    userDetails.university_name || 'Your University',
                    userDetails.graduation_year || user.graduation_year || 'N/A',
                    stats.verified
                );
            } catch (emailErr) {
                console.error('Verification email failed (user still verified):', emailErr.message);
            }
        }

        res.json({ message: 'User verified successfully', user: sanitizeUserForClient(user) });
    } catch (error) {
        next(error);
    }
};

const rejectUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;
        const ipAddress = req.ip;

        if (!reason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const user = await userModel.rejectAndPurgeGraduate(id, reason);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Log Audit
        await userModel.logAuditEvent(
            adminId,
            'REJECT_AND_PURGE',
            null,
            `Graduate rejected, sessions revoked, and account purged. Previous user_id=${id}. Reason: ${reason}`,
            ipAddress
        );

        // Send clear rejection email after purge so they can register again later.
        await emailService.sendRejectionPurgeEmail(user.email, `${user.first_name} ${user.last_name}`, reason);

        res.json({
            message: 'Graduate rejected, sessions revoked, and account removed successfully.',
            user: sanitizeUserForClient(user)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Dashboard Stats (Admin)
 * GET /users/stats
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await userModel.getDashboardStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a graduate permanently (Admin)
 * DELETE /users/:id
 */
const deleteGraduate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await userModel.deleteGraduate(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Graduate not found' });
        }
        res.json({ message: 'Graduate deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * List all regular admins (Master Admin only)
 * GET /users/admins
 */
const getAdmins = async (req, res, next) => {
    try {
        const admins = await userModel.findAllAdmins();
        res.json(admins);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a regular admin (Master Admin only)
 * DELETE /users/admins/:id
 */
const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Prevent deleting master_admins through this endpoint
        const target = await userModel.findUserById(id);
        if (!target) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        if (target.role === 'master_admin') {
            return res.status(403).json({ error: 'Cannot delete a Master Admin through this endpoint.' });
        }
        await userModel.deleteUserById(id);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getGraduates,
    getPublicStats,
    getAllGraduatesAdmin,
    getPublicUserProfile,
    signPrivateFileUrl,
    getProtectedUpload,
    getPendingUsers,
    verifyUser,
    rejectUser,
    getDashboardStats,
    deleteGraduate,
    getAdmins,
    deleteAdmin,
};
