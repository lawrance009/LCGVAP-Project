/**
 * ProfileHeader.jsx
 * ---------------------------------------------------------------
 * Profile header card: avatar, name, email, verification status,
 * and PremiumTag.
 *
 * Props:
 *   profile           {object}  — user profile data from /users/me
 *   isPremiumVeteran  {boolean} — from degree API response
 *   onEditClick       {fn}      — opens edit form
 * ---------------------------------------------------------------
 */

import PremiumTag from './PremiumTag';
import getFileUrl from '../../utils/getFileUrl';

const ProfileHeader = ({ profile, isPremiumVeteran, onEditClick }) => {
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Graduate';
  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* ── Avatar ───────────────────────────────── */}
        <div className="shrink-0">
          <div className="h-24 w-24 rounded-full bg-indigo-100 border-2 border-indigo-200 overflow-hidden flex items-center justify-center">
            {profile?.profile_photo ? (
              <img
                src={getFileUrl(profile.profile_photo)}
                alt={`${fullName} profile photo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-indigo-600" aria-hidden="true">
                {initials || '👤'}
              </span>
            )}
          </div>
        </div>

        {/* ── Name & Status ────────────────────────── */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
            {/* Premium Veteran tag — only renders if condition met */}
            <PremiumTag isPremiumVeteran={isPremiumVeteran} />
          </div>

          <p className="text-sm text-gray-500 mb-3">{profile?.email}</p>

          {/* Overall account verification pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              profile?.is_verified
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}
          >
            {profile?.is_verified ? '✓ Verified Graduate' : '⏳ Pending Verification'}
          </span>
        </div>

        {/* ── Edit Button ──────────────────────────── */}
        {onEditClick && (
          <div className="shrink-0">
            <button
              id="profile-edit-btn"
              onClick={onEditClick}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* ── Bio ──────────────────────────────────── */}
      {profile?.bio && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
