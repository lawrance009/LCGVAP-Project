/**
 * getFileUrl.js
 * ---------------------------------------------------------------
 * Shared utility for building file URLs from paths stored in the DB.
 *
 * Handles:
 *   - Full URLs (http://...) → returned as-is
 *   - Relative paths (uploads/photo.jpg) → prepended with API base URL
 *   - Windows backslashes (uploads\\photo.jpg) → normalized to forward slashes
 *   - null/undefined → returns null
 * ---------------------------------------------------------------
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${API_URL}${path.replace(/\\/g, '/')}`;
  return `${API_URL}/${path.replace(/\\/g, '/')}`;
};

export default getFileUrl;
