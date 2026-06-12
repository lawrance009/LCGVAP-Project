/**
 * ProfilePage.jsx  (replaces Profile.jsx)
 * ---------------------------------------------------------------
 * VCLGC — User Profile Display System
 *
 * ARCHITECTURE SUMMARY:
 *   - Degrees belong to users.
 *   - Badges belong to degrees, NOT directly to users.
 *   - Premium Veteran = verified Bachelor + verified Master (server-computed).
 *   - The client NEVER creates or manipulates badge data — it only
 *     displays what the server returns.
 *
 * COMPONENTS USED:
 *   ProfileHeader  — avatar, name, email, Premium Veteran tag
 *   DegreeCard     — per-degree credential + badge display
 *   BadgeList      — aggregated badge strip (verified only)
 *   AddDegreeForm  — submit a new credential for review
 *
 * API CALLS:
 *   GET  /users/me          → profile info
 *   GET  /users/me/degrees  → degrees[] + is_premium_veteran
 *   POST /users/me/degrees  → add new degree
 *   PUT  /users/me          → update basic profile fields
 * ---------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getMyDegrees, addDegree as apiAddDegree } from '../services/degreeService';
import Swal from 'sweetalert2';

import ProfileHeader  from '../components/profile/ProfileHeader';
import DegreeCard     from '../components/profile/DegreeCard';
import BadgeList      from '../components/profile/BadgeList';
import AddDegreeForm  from '../components/profile/AddDegreeForm';

// ---------------------------------------------------------------
// Mock data — used only when the backend is unavailable during
// development. Remove / toggle MOCK_MODE to false in production.
// ---------------------------------------------------------------
const MOCK_MODE = false; // ← set true to preview UI with mock data

const MOCK_DATA = {
  user: {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Liberian engineer and alumnus of the Cyprus-Liberia Academic Program. Passionate about sustainable infrastructure.',
    profile_photo: null,
    is_verified: true,
  },
  degrees: [
    {
      id: 1,
      degree_type: 'BACHELOR',
      field_of_study: 'Civil Engineering',
      university_name: 'University of Nicosia',
      department_name: 'Engineering',
      graduation_year: 2017,
      is_verified: true,
      verified_at: '2023-04-10T00:00:00Z',
      badge: { id: 1, name: "Bachelor Graduate", icon: "🎓", description: "Verified bachelor's credential" },
      degree_file: null,
    },
    {
      id: 2,
      degree_type: 'MASTER',
      field_of_study: 'Public Administration',
      university_name: 'Frederick University',
      department_name: 'Social Sciences',
      graduation_year: 2021,
      is_verified: true,
      verified_at: '2024-01-15T00:00:00Z',
      badge: { id: 2, name: "Master's Scholar", icon: "🥇", description: "Verified master's credential" },
      degree_file: null,
    },
    {
      id: 3,
      degree_type: 'PHD',
      field_of_study: 'Environmental Policy',
      university_name: 'University of Cyprus',
      department_name: 'Policy Studies',
      graduation_year: null,
      is_verified: false,
      verified_at: null,
      badge: null,
      rejection_reason: null,
      degree_file: 'http://example.com/doc.pdf',
    },
  ],
  is_premium_veteran: true,
};

// ---------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------
const ProfilePage = () => {
  const { user: authUser } = useAuth();

  // --- State ---
  const [profile,          setProfile]          = useState(null);
  const [degrees,          setDegrees]          = useState([]);
  const [isPremiumVeteran, setIsPremiumVeteran] = useState(false);
  const [loadingProfile,   setLoadingProfile]   = useState(true);
  const [loadingDegrees,   setLoadingDegrees]   = useState(true);

  // Edit profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName,    setEditFirstName]    = useState('');
  const [editLastName,     setEditLastName]     = useState('');
  const [editBio,          setEditBio]          = useState('');
  const [editPhoto,        setEditPhoto]        = useState(null);
  const [savingProfile,    setSavingProfile]    = useState(false);

  // Add degree form state
  const [showAddDegree, setShowAddDegree] = useState(false);
  const [savingDegree,  setSavingDegree]  = useState(false);

  // Supporting dropdowns (lazy-load universities etc.)
  const [universities, setUniversities] = useState([]);
  const [departments,  setDepartments]  = useState([]);

  // ── Fetch Profile ──────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (MOCK_MODE) {
      setProfile(MOCK_DATA.user);
      setEditFirstName(MOCK_DATA.user.first_name);
      setEditLastName(MOCK_DATA.user.last_name);
      setEditBio(MOCK_DATA.user.bio || '');
      setLoadingProfile(false);
      return;
    }
    try {
      const { data } = await api.get('/users/me');
      setProfile(data);
      setEditFirstName(data.first_name || '');
      setEditLastName(data.last_name  || '');
      setEditBio(data.bio             || '');
    } catch (err) {
      console.error('Profile fetch error:', err);
      Swal.fire('Error', 'Failed to load your profile.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // ── Fetch Degrees ──────────────────────────────────────────
  const fetchDegrees = useCallback(async () => {
    if (MOCK_MODE) {
      setDegrees(MOCK_DATA.degrees);
      setIsPremiumVeteran(MOCK_DATA.is_premium_veteran);
      setLoadingDegrees(false);
      return;
    }
    try {
      const { data } = await getMyDegrees();
      setDegrees(data.degrees || []);
      setIsPremiumVeteran(data.is_premium_veteran || false);
    } catch (err) {
      console.error('Degrees fetch error:', err);
    } finally {
      setLoadingDegrees(false);
    }
  }, []);

  // ── Fetch Dropdown Data (for Add Degree form) ──────────────
  const fetchDropdowns = useCallback(async () => {
    if (MOCK_MODE) return;
    try {
      const [uniRes, deptRes] = await Promise.allSettled([
        api.get('/universities'),
        api.get('/departments'),
      ]);
      if (uniRes.status  === 'fulfilled') setUniversities(uniRes.value.data  || []);
      if (deptRes.status === 'fulfilled') setDepartments(deptRes.value.data  || []);
    } catch (err) {
      console.warn('Dropdown fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchDegrees();
    fetchDropdowns();
  }, [fetchProfile, fetchDegrees, fetchDropdowns]);

  // ── Save Profile Edit ──────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const fd = new FormData();
      if (editFirstName) fd.append('first_name', editFirstName);
      if (editLastName)  fd.append('last_name',  editLastName);
      if (editBio)       fd.append('bio',         editBio);
      if (editPhoto)     fd.append('profile_photo', editPhoto);

      const { data } = await api.put('/users/me', fd);
      setProfile(data.user);
      setIsEditingProfile(false);
      Swal.fire('Saved', 'Profile updated successfully.', 'success');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Update failed.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Add New Degree ─────────────────────────────────────────
  const handleAddDegree = async (formData) => {
    setSavingDegree(true);
    try {
      await apiAddDegree(formData);
      setShowAddDegree(false);
      await fetchDegrees();
      Swal.fire('Submitted', 'Your degree has been submitted for verification.', 'success');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Submission failed.', 'error');
    } finally {
      setSavingDegree(false);
    }
  };

  // ── Derived data ───────────────────────────────────────────
  // Aggregate badges from all verified degrees
  const aggregatedBadges = degrees
    .filter(d => d.is_verified && d.badge && d.badge.name)
    .map(d => d.badge);

  // ── Loading state ──────────────────────────────────────────
  const isLoading = loadingProfile && loadingDegrees;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-label="Loading profile">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6" id="profile-page">

      {/* ── Page Title (screen-reader only) ──────────── */}
      <h1 className="sr-only">My Profile — VCLGC Alumni Portal</h1>

      {/* ── SECTION 1: Profile Header ─────────────────── */}
      {!loadingProfile && profile && (
        <ProfileHeader
          profile={profile}
          isPremiumVeteran={isPremiumVeteran}
          onEditClick={() => setIsEditingProfile(true)}
        />
      )}

      {/* ── Edit Profile Form (modal-style inline) ────── */}
      {isEditingProfile && (
        <section
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          aria-labelledby="edit-profile-heading"
        >
          <h2 id="edit-profile-heading" className="text-base font-semibold text-gray-800 mb-5">
            Edit Profile Information
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="edit-first-name"
                  type="text"
                  value={editFirstName}
                  onChange={e => setEditFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="edit-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="edit-last-name"
                  type="text"
                  value={editLastName}
                  onChange={e => setEditLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="edit-bio"
                rows={4}
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="Tell us about your professional background…"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="edit-photo" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo
              </label>
              <input
                id="edit-photo"
                type="file"
                accept="image/*"
                onChange={e => setEditPhoto(e.target.files[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            {/* Info notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-600">
              ℹ Your passport number and date of birth are anchored to your identity and cannot be changed here.
              Contact support for corrections.
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ── SECTION 2: Badge Aggregation ──────────────── */}
      {!loadingDegrees && aggregatedBadges.length > 0 && (
        <BadgeList badges={aggregatedBadges} />
      )}

      {/* ── SECTION 3: Academic Credentials ───────────── */}
      <section aria-labelledby="degrees-heading">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="degrees-heading"
            className="text-sm font-semibold text-gray-500 uppercase tracking-wide"
          >
            Academic Credentials
          </h2>
          {!showAddDegree && (
            <button
              id="add-degree-btn"
              onClick={() => setShowAddDegree(true)}
              className="text-sm text-indigo-600 border border-indigo-300 px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors"
            >
              + Add Degree
            </button>
          )}
        </div>

        {/* Add Degree Form */}
        {showAddDegree && (
          <div className="bg-white rounded-lg border border-indigo-200 shadow-sm p-5 mb-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Submit New Academic Credential
            </h3>
            <AddDegreeForm
              universities={universities}
              departments={departments}
              onSubmit={handleAddDegree}
              onCancel={() => setShowAddDegree(false)}
              loading={savingDegree}
            />
          </div>
        )}

        {/* Degree List */}
        {loadingDegrees ? (
          <div className="text-center py-8 text-sm text-gray-400">Loading credentials…</div>
        ) : degrees.length === 0 ? (
          /* Edge Case 1: No degrees */
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-2xl mb-2" aria-hidden="true">📄</p>
            <p className="text-gray-500 font-medium mb-1">No academic records yet</p>
            <p className="text-sm text-gray-400">
              Click <strong>+ Add Degree</strong> above to submit your first credential for verification.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {degrees.map(degree => (
              <DegreeCard key={degree.id} degree={degree} />
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION 4: Verification Info ──────────────── */}
      <section aria-labelledby="verification-info-heading">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 id="verification-info-heading" className="text-sm font-semibold text-blue-800 mb-1">
            About Verification
          </h2>
          <p className="text-sm text-blue-700 leading-relaxed">
            Each degree is individually reviewed by a platform administrator.
            A verified degree earns a permanent badge. Holding both a verified
            Bachelor's and Master's degree qualifies you for{' '}
            <strong>Premium Veteran</strong> status.
          </p>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
