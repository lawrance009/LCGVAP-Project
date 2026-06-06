/**
 * api.js
 * ============================================================
 * Axios instance with automatic silent token refresh.
 *
 * HOW THE DUAL-TOKEN FLOW WORKS:
 *
 *   1. After login, the frontend receives a short-lived
 *      ACCESS TOKEN (15 min) in the response body.
 *      It is stored in memory (authState in AuthContext) —
 *      NOT in localStorage (which is XSS-vulnerable).
 *
 *   2. A long-lived REFRESH TOKEN is automatically set by
 *      the backend as an HttpOnly cookie named lcgvap_refresh.
 *      JavaScript CANNOT read this cookie. It is sent
 *      automatically by the browser only to /auth/token/refresh.
 *
 *   3. When the access token expires, the backend returns:
 *        { code: "TOKEN_EXPIRED" }
 *      The RESPONSE INTERCEPTOR below catches this, silently
 *      calls POST /auth/token/refresh, gets a new access token,
 *      and retries the original request — all transparent to
 *      the user (no login screen flash).
 *
 *   4. If the refresh token is also expired, the interceptor
 *      logs the user out and redirects to /login.
 *
 * ============================================================
 */

import axios from 'axios';

// Base URL from environment variable (fallback to localhost for dev)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true, // ← REQUIRED: sends the HttpOnly refresh cookie
});

// ── In-memory token store ─────────────────────────────────────
// The access token is stored here — NOT in localStorage.
// This module acts as the single source of truth for the token.
let _accessToken = null;

export const setAccessToken  = (token) => { _accessToken = token; };
export const getAccessToken  = ()      => _accessToken;
export const clearAccessToken = ()     => { _accessToken = null; };

// ── Request Interceptor ───────────────────────────────────────
// Attach the current access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = _accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────
// Handle token expiry transparently
let _isRefreshing     = false;
let _refreshQueue     = []; // Queued requests while refresh is in progress

const processQueue = (error, token = null) => {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else       resolve(token);
  });
  _refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response, // success — pass through

  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 with TOKEN_EXPIRED code (not other 401s)
    const isTokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retried; // prevent infinite retry loop

    if (!isTokenExpired) {
      // Not a token expiry — propagate as normal error
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    // If already refreshing, queue this request until refresh completes
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _refreshQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // ── Start the refresh ───────────────────────────────────
    _isRefreshing = true;

    try {
      // The browser sends lcgvap_refresh cookie automatically here
      const { data } = await api.post('/auth/token/refresh');
      const newToken = data.token;

      setAccessToken(newToken);
      processQueue(null, newToken);

      // Retry the original failed request with the new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      // Refresh token is also expired — full logout
      processQueue(refreshError, null);
      clearAccessToken();

      // Only redirect if not already on a public auth page
      const publicPaths = ['/login', '/patron-entry', '/boss-entry', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);

    } finally {
      _isRefreshing = false;
    }
  }
);

export default api;

export const getSignedFileUrl = async (filePath) => {
  if (!filePath) return null;
  if (!filePath.startsWith('http')) return filePath;

  // Public uploads should not be signed
  if (filePath.includes('/uploads/')) return filePath;
  if (!filePath.includes('/private/')) return filePath;

  const filename = filePath.split('/').pop()?.split('?')[0];
  if (!filename) return filePath;

  const { data } = await api.get('/users/files/sign', {
    params: { filename }
  });
  return data?.url || filePath;
};
