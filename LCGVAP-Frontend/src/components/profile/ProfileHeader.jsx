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

import { Pencil } from 'lucide-react';
import PremiumTag from './PremiumTag';
import getFileUrl from '../../utils/getFileUrl';
import { Avatar, Button, Seal, StatusTag } from '../ui';

const ProfileHeader = ({ profile, isPremiumVeteran, onEditClick }) => {
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Graduate';

  return (
    <section className="relative rounded-panel border border-line bg-paper p-6 sm:p-8" aria-labelledby="profile-name">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0 self-start">
          <Avatar
            name={fullName}
            src={profile?.profile_photo ? getFileUrl(profile.profile_photo) : null}
            size="xl"
            decorative={false}
          />
          {profile?.is_verified && (
            <Seal size="sm" backed tilted={false} className="absolute -right-1 -bottom-1 size-11" label="Verified graduate" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 id="profile-name" className="font-display text-headline font-semibold text-balance text-ink">
            {fullName}
          </h1>
          <p className="mt-1 text-body break-all text-muted">{profile?.email}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusTag status={profile?.is_verified ? 'verified' : 'pending'}>
              {profile?.is_verified ? 'Verified graduate' : 'Verification in progress'}
            </StatusTag>
            <PremiumTag isPremiumVeteran={isPremiumVeteran} />
          </div>
        </div>

        {onEditClick && (
          <Button id="profile-edit-btn" variant="secondary" leadingIcon={Pencil} onClick={onEditClick} className="self-start">
            Edit profile
          </Button>
        )}
      </div>

      {profile?.bio && (
        <div className="mt-6 border-t border-line pt-6">
          <p className="max-w-measure text-body whitespace-pre-wrap text-muted">{profile.bio}</p>
        </div>
      )}
    </section>
  );
};

export default ProfileHeader;
