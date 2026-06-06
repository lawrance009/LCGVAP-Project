/**
 * AuthContext.jsx
 * ============================================================
 * SECURITY CHANGES:
 *
 *   OLD: Token stored in localStorage (XSS-readable)
 *   NEW: Access token stored in api.js module memory only.
 *        Refresh token is HttpOnly cookie (XSS-proof, managed by browser).
 *
 *   On page refresh: we call POST /auth/token/refresh to silently
 *   restore the access token from the cookie. If the cookie is
 *   expired, the user sees the login page — no stale data.
 *
 *   localStorage is no longer used for tokens.
 *   User profile data is still stored in localStorage for
 *   fast initial render (not sensitive — no token, no credentials).
 * ============================================================
 */

import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api, { setAccessToken, clearAccessToken } from '../services/api';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // Guard against React StrictMode's double-invoke of useEffect in dev,
  // which could race two restoreSession calls and wipe a valid token.
  const sessionRestored = useRef(false);

  // ── Restore session on page load ───────────────────────────
  // Attempt a silent refresh using the HttpOnly cookie.
  // If it works → we get a fresh access token and restore the session.
  // If it fails → user is not logged in (cookie expired or doesn't exist).
  useEffect(() => {
    if (sessionRestored.current) return; // already ran — skip StrictMode re-run
    sessionRestored.current = true;

    const restoreSession = async () => {
      try {
        const { data } = await api.post('/auth/token/refresh');
        setAccessToken(data.token);

        // Restore user profile from localStorage (non-sensitive display data)
        const storedUser = localStorage.getItem('lcgvap_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);

          // STRICT SEPARATION: admins must use /patron-entry — never bleed into public site
          if (parsed.role === 'admin' || parsed.role === 'master_admin') {
            clearAccessToken();
            localStorage.removeItem('lcgvap_user');
            setUser(null);
            return;
          }

          setUser(parsed);
        } else {
          // Fetch fresh profile if localStorage is empty
          const profile = await api.get('/users/me');
          const u = profile.data;

          // Same guard for freshly fetched profile
          if (u.role === 'admin' || u.role === 'master_admin') {
            clearAccessToken();
            localStorage.removeItem('lcgvap_user');
            setUser(null);
            return;
          }

          localStorage.setItem('lcgvap_user', JSON.stringify(u));
          setUser(u);
        }
      } catch {
        // No valid session — user needs to log in
        clearAccessToken();
        localStorage.removeItem('lcgvap_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Internal helper — save tokens + user after any login ──
  const saveSession = useCallback((token, userData) => {
    setAccessToken(token);
    if (userData) {
      localStorage.setItem('lcgvap_user', JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  // ── OTP Request ────────────────────────────────────────────
  const requestOtp = async (email) => {
    try {
      await api.post('/auth/otp/request', { email });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to send OTP.';
      const code = error.response?.data?.code;
      Swal.fire('Error', msg, 'error');
      return { success: false, message: msg, code };
    }
  };

  // ── OTP Verify ─────────────────────────────────────────────
  const verifyOtp = async (email, otp) => {
    try {
      const { data } = await api.post('/auth/otp/verify', { email, otp });

      // Store the access token in memory
      saveSession(data.token, data.user);

      return { success: true, isNewUser: data.isNewUser, user: data.user };
    } catch (error) {
      const errData = error.response?.data;

      // Show attempts remaining if available
      if (errData?.code === 'OTP_WRONG' && errData?.attempts_remaining !== undefined) {
        Swal.fire({
          icon:  'warning',
          title: 'Incorrect Code',
          text:  `${errData.error} Please try again.`,
        });
      } else if (errData?.code === 'OTP_LOCKED') {
        Swal.fire({
          icon:  'error',
          title: 'OTP Locked',
          text:  'Too many incorrect attempts. Please request a new code.',
        });
      } else {
        Swal.fire('Error', errData?.error || 'Verification failed.', 'error');
      }

      return { 
        success: false, 
        message: errData?.error,
        isLocked: errData?.code === 'OTP_LOCKED',
        // OTP_INVALID = expired (or never existed) → user must request a new code
        isExpired: errData?.code === 'OTP_INVALID'
      };
    }
  };

  // ── Register ───────────────────────────────────────────────
  const register = async (formData) => {
    try {
      await api.post('/auth/register', formData);
      return { success: true };
    } catch (error) {
      const fieldError = error.response?.data?.errors?.[0]?.message;
      const msg = fieldError || error.response?.data?.error || 'Registration failed.';
      Swal.fire('Error', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // ── Admin Login ─────────────────────────────────────────────
  const adminLogin = async (email, password) => {
    try {
      const { data } = await api.post('/auth/admin/login', { email, password });
      saveSession(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed.';
      Swal.fire('Error', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // ── Logout ─────────────────────────────────────────────────
  const logout = async () => {
    try {
      // Tell server to clear the HttpOnly cookie
      await api.post('/auth/logout');
    } catch {
      // Even if the request fails, clear local state
    } finally {
      clearAccessToken();
      localStorage.removeItem('lcgvap_user');
      setUser(null);
    }
  };

  // ── Compatibility shim ─────────────────────────────────────
  // Some components use setAuth(user, token) — keep this working
  const setAuth = useCallback((userData, token) => {
    saveSession(token, userData);
  }, [saveSession]);

  const value = {
    user,
    loading,
    requestOtp,
    verifyOtp,
    register,
    adminLogin,
    logout,
    setAuth,
    // Refresh user data from server (called after profile edit)
    refreshUser: async () => {
      try {
        const { data } = await api.get('/users/me');
        localStorage.setItem('lcgvap_user', JSON.stringify(data));
        setUser(data);
      } catch { /* silent */ }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
