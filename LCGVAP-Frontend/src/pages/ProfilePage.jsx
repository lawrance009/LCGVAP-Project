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
import api from '../services/api';
import { getMyDegrees, addDegree as apiAddDegree } from '../services/degreeService';
import Swal from 'sweetalert2';

import ProfileHeader  from '../components/profile/ProfileHeader';
import DegreeCard     from '../components/profile/DegreeCard';
import BadgeList      from '../components/profile/BadgeList';
import AddDegreeForm  from '../components/profile/AddDegreeForm';
import { FileText, ImagePlus, Info, Plus } from 'lucide-react';
import { Button, Container, EmptyState, Field, FileDrop, Input, Panel, Skeleton, Textarea } from '../components/ui';

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
      <Container className="max-w-4xl py-10" aria-busy="true" aria-label="Loading your profile">
        <div className="flex gap-6 rounded-panel border border-line bg-paper p-8">
          <Skeleton className="size-32 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-7 w-32" />
          </div>
        </div>
      </Container>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="bg-wash" id="profile-page">
      <Container className="max-w-4xl space-y-8 py-10 lg:py-12">
        {/* ── Profile header ─────────────────────────── */}
        {!loadingProfile && profile && (
          <ProfileHeader
            profile={profile}
            isPremiumVeteran={isPremiumVeteran}
            onEditClick={() => setIsEditingProfile(true)}
          />
        )}

        {/* ── Edit profile ───────────────────────────── */}
        {isEditingProfile && (
          <Panel as="section" padding="lg" aria-labelledby="edit-profile-heading" className="animate-rise">
            <h2 id="edit-profile-heading" className="font-display text-title font-semibold text-ink">
              Edit your profile
            </h2>
            <form onSubmit={handleSaveProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="First name">
                <Input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} autoComplete="given-name" />
              </Field>
              <Field label="Last name">
                <Input value={editLastName} onChange={e => setEditLastName(e.target.value)} autoComplete="family-name" />
              </Field>
              <Field label="Short biography" hint="Shown on your public record." optional className="sm:col-span-2">
                <Textarea
                  rows={4}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="What you studied, where you work now"
                />
              </Field>
              <Field label="Profile photo" optional className="sm:col-span-2">
                <FileDrop
                  accept="image/*"
                  file={editPhoto}
                  onSelect={file => setEditPhoto(file || null)}
                  icon={ImagePlus}
                  prompt="A clear photo of your face"
                />
              </Field>

              <p className="flex gap-2 rounded-doc bg-tint p-3 text-caption text-muted sm:col-span-2">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                Your passport number and date of birth are tied to your identity and cannot be changed here.
                Contact the verification office for corrections.
              </p>

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={savingProfile}>
                  {savingProfile ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Panel>
        )}

        {/* ── Badges ─────────────────────────────────── */}
        {!loadingDegrees && aggregatedBadges.length > 0 && (
          <Panel padding="lg">
            <BadgeList badges={aggregatedBadges} />
          </Panel>
        )}

        {/* ── Academic credentials ───────────────────── */}
        <section aria-labelledby="degrees-heading">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="degrees-heading" className="font-display text-heading font-semibold text-ink">
              Your degrees
            </h2>
            {!showAddDegree && (
              <Button id="add-degree-btn" variant="secondary" leadingIcon={Plus} onClick={() => setShowAddDegree(true)}>
                Add a degree
              </Button>
            )}
          </div>

          {showAddDegree && (
            <Panel padding="lg" className="mt-5 animate-rise">
              <h3 className="font-display text-title font-semibold text-ink">Submit a degree for verification</h3>
              <div className="mt-6">
                <AddDegreeForm
                  universities={universities}
                  departments={departments}
                  onSubmit={handleAddDegree}
                  onCancel={() => setShowAddDegree(false)}
                  loading={savingDegree}
                />
              </div>
            </Panel>
          )}

          <div className="mt-5">
            {loadingDegrees ? (
              <div className="space-y-4" aria-hidden="true">
                <Skeleton className="h-40 w-full rounded-panel" />
              </div>
            ) : degrees.length === 0 ? (
              <Panel padding="none">
                <EmptyState
                  icon={FileText}
                  title="No degrees yet"
                  description="Add your first degree certificate to start verification."
                />
              </Panel>
            ) : (
              <div className="grid gap-4">
                {degrees.map(degree => (
                  <DegreeCard key={degree.id} degree={degree} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── About verification ─────────────────────── */}
        <section aria-labelledby="verification-info-heading" className="rounded-panel bg-tint p-6">
          <h2 id="verification-info-heading" className="font-semibold text-ink">
            How verification works
          </h2>
          <p className="mt-1 max-w-measure text-body text-muted">
            An administrator reviews each degree on its own. Every verified degree earns a badge. Holding both a
            verified bachelor&apos;s and master&apos;s degree gives you <span className="font-semibold text-ink">Premium veteran</span> status.
          </p>
        </section>
      </Container>
    </div>
  );
};

export default ProfilePage;
