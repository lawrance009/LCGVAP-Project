/**
 * degreeController.js
 * ---------------------------------------------------------------
 * HTTP handlers for degree and badge management.
 *
 * KEY DESIGN RULES:
 *   - Badges are NEVER created manually by users.
 *   - Badges are auto-generated on admin verification.
 *   - All badge display data is sourced from the backend.
 * ---------------------------------------------------------------
 */

const degreeModel = require('../models/degreeModel');
const { validateMagicBytes } = require('../middleware/uploadMiddleware');
const fs = require('fs');

const ensureGraduateRole = (req, res) => {
  if (!req.user || req.user.role !== 'graduate') {
    res.status(403).json({ error: 'Graduate access required for this action.' });
    return false;
  }
  return true;
};

// ---------------------------------------------------------------
// GET /users/me/degrees
// Returns all degrees (with badges) for the authenticated user.
// ---------------------------------------------------------------
const getMyDegrees = async (req, res, next) => {
  try {
    if (!ensureGraduateRole(req, res)) return;
    const userId  = req.user.id;
    const degrees = await degreeModel.getDegreesByUserId(userId);

    // Compute Premium Veteran status server-side
    // A user is Premium Veteran if they hold BOTH a verified Bachelor AND a verified Master
    const verifiedTypes = degrees
      .filter(d => d.is_verified)
      .map(d => d.degree_type);

    const isPremiumVeteran = degreeModel.computeIsPremiumVeteran(verifiedTypes);

    res.json({
      degrees,
      is_premium_veteran: isPremiumVeteran,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// POST /users/me/degrees
// Submit a new degree for verification.
// ---------------------------------------------------------------
const addDegree = async (req, res, next) => {
  try {
    if (!ensureGraduateRole(req, res)) return;
    const userId = req.user.id;
    const {
      degree_type, university_id, department_id, advisor_id,
      graduation_year, field_of_study
    } = req.body;

    if (!degree_type) {
      return res.status(400).json({ error: 'degree_type is required' });
    }

    const validTypes = ['BACHELOR', 'MASTER', 'PHD', 'POSTDOC', 'ASSOCIATE', 'DIPLOMA'];
    if (!validTypes.includes(degree_type.toUpperCase())) {
      return res.status(400).json({ error: `degree_type must be one of: ${validTypes.join(', ')}` });
    }

    // Handle degree file upload
    let degree_file = null;
    if (req.files && req.files['degree_file']) {
      const f = req.files['degree_file'][0];
      if (!validateMagicBytes(f.path, f.mimetype)) {
        fs.unlinkSync(f.path);
        return res.status(400).json({ error: 'Degree file content does not match its extension.' });
      }
      degree_file = `${req.app.locals.baseUrl}/private/${req.files['degree_file'][0].filename}`;
    }

    if (!degree_file) {
      return res.status(400).json({ error: 'A degree document (PDF or image) is required' });
    }

    const degree = await degreeModel.createDegree({
      user_id: userId,
      degree_type: degree_type.toUpperCase(),
      university_id: university_id || null,
      department_id: department_id || null,
      advisor_id:    advisor_id    || null,
      graduation_year: graduation_year || null,
      field_of_study: field_of_study || null,
      degree_file,
    });

    res.status(201).json({ message: 'Degree submitted for verification', degree });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// PUT /users/me/degrees/:degreeId
// Update an unverified degree.
// ---------------------------------------------------------------
const updateDegree = async (req, res, next) => {
  try {
    if (!ensureGraduateRole(req, res)) return;
    const userId   = req.user.id;
    const degreeId = parseInt(req.params.degreeId);
    const updates  = { ...req.body };

    if (req.files && req.files['degree_file']) {
      const f = req.files['degree_file'][0];
      if (!validateMagicBytes(f.path, f.mimetype)) {
        fs.unlinkSync(f.path);
        return res.status(400).json({ error: 'Degree file content does not match its extension.' });
      }
      updates.degree_file = `${req.app.locals.baseUrl}/private/${req.files['degree_file'][0].filename}`;
    }

    const degree = await degreeModel.updateDegree(degreeId, userId, updates);

    if (!degree) {
      return res.status(404).json({ error: 'Degree not found or already verified' });
    }

    res.json({ message: 'Degree updated', degree });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// DELETE /users/me/degrees/:degreeId
// Delete an unverified degree.
// ---------------------------------------------------------------
const deleteDegree = async (req, res, next) => {
  try {
    if (!ensureGraduateRole(req, res)) return;
    const userId   = req.user.id;
    const degreeId = parseInt(req.params.degreeId);

    const degree = await degreeModel.deleteDegree(degreeId, userId);

    if (!degree) {
      return res.status(404).json({ error: 'Degree not found or already verified (cannot delete)' });
    }

    res.json({ message: 'Degree removed' });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /degrees/pending  (Admin)
// List all degrees awaiting verification.
// ---------------------------------------------------------------
const getPendingDegrees = async (req, res, next) => {
  try {
    const degrees = await degreeModel.getPendingDegrees();
    res.json(degrees);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// PUT /degrees/:degreeId/verify  (Admin)
// Verify a degree and auto-award its badge.
// ---------------------------------------------------------------
const verifyDegree = async (req, res, next) => {
  try {
    const adminId  = req.user.id;
    const degreeId = parseInt(req.params.degreeId);

    if (!Number.isInteger(degreeId) || degreeId <= 0) {
      return res.status(400).json({ error: 'Invalid degree ID' });
    }

    // Optional: admin can supply a custom badge name/icon in body
    const { badge_name, badge_icon, badge_description } = req.body || {};

    const existing = await degreeModel.getDegreeById(degreeId);
    if (!existing) {
      return res.status(404).json({ error: 'Degree not found' });
    }
    if (existing.is_verified) {
      return res.status(409).json({ error: 'This degree has already been verified.' });
    }
    if (existing.rejection_reason) {
      return res.status(409).json({ error: 'This degree was rejected and cannot be verified.' });
    }

    const result = await degreeModel.verifyDegree(degreeId, adminId, {
      name:        badge_name,
      icon:        badge_icon,
      description: badge_description,
    });

    if (!result) {
      return res.status(409).json({ error: 'Degree is no longer pending verification.' });
    }

    res.json({
      message: 'Degree verified and badge awarded',
      degree:  result.degree,
      badge:   result.badge,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// PUT /degrees/:degreeId/reject  (Admin)
// Reject a degree with a reason.
// ---------------------------------------------------------------
const rejectDegree = async (req, res, next) => {
  try {
    const adminId  = req.user.id;
    const degreeId = parseInt(req.params.degreeId);
    const { reason } = req.body;

    if (!Number.isInteger(degreeId) || degreeId <= 0) {
      return res.status(400).json({ error: 'Invalid degree ID' });
    }

    const degree = await degreeModel.rejectDegree(degreeId, adminId, reason);

    if (!degree) {
      return res.status(404).json({ error: 'Degree not found' });
    }

    res.json({ message: 'Degree rejected', degree });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /users/:userId/degrees  (Public — only verified degrees)
// Used by the public ProfileDetail page.
// ---------------------------------------------------------------
const getPublicUserDegrees = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    // Safety guard — should never happen due to (\d+) regex on route,
    // but we protect against it anyway.
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const degrees = await degreeModel.getDegreesByUserId(userId);

    // Only expose verified degrees publicly
    const publicDegrees = degrees.filter(d => d.is_verified);

    const verifiedTypes    = publicDegrees.map(d => d.degree_type);
    const isPremiumVeteran = degreeModel.computeIsPremiumVeteran(verifiedTypes);

    res.json({ degrees: publicDegrees, is_premium_veteran: isPremiumVeteran });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyDegrees,
  addDegree,
  updateDegree,
  deleteDegree,
  getPendingDegrees,
  verifyDegree,
  rejectDegree,
  getPublicUserDegrees,
};
