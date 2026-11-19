import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, UserX } from 'lucide-react';
import api from '../services/api';
import getFileUrl from '../utils/getFileUrl';
import PremiumTag from '../components/profile/PremiumTag';
import DegreeCard from '../components/profile/DegreeCard';
import BadgeList from '../components/profile/BadgeList';
import { formatDegreeType, getPublicDegreeTypes, isPublicPremiumVeteran } from '../utils/degreeDisplay';
import { Button, Container, EmptyState, PortraitFallback, Seal, Skeleton, StatusTag } from '../components/ui';

/**
 * Public record of one verified graduate, laid out like a certificate.
 * Data loading is unchanged; the seal stamps onto the record on load.
 */
const ProfileDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={UserX}
          title="Record not found"
          description="This graduate is not on the public register, or the link is out of date."
          action={<Button to="/directory" variant="secondary">Search the register</Button>}
        />
      </Container>
    );
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  const verifiedDegrees = profile.verified_degrees || [];
  const degreeTypes = getPublicDegreeTypes(profile);
  const badges = verifiedDegrees.filter((d) => d.badge).map((d) => d.badge);
  const photoUrl = profile.profile_photo ? getFileUrl(profile.profile_photo) : null;

  return (
    // overflow-x-clip: the stamp animation starts the seal at 135% scale; never
    // let that flash a horizontal scrollbar on phones.
    <div className="overflow-x-clip bg-wash">
      <Container className="py-8 lg:py-12">
        <BackToDirectory />

        <article className="relative mt-6 rounded-panel border border-line bg-paper">
          {/* Certificate header */}
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-12">
            <div className="relative max-w-xs lg:col-span-4">
              {/* Phones: the seal stamps onto the photo corner (the header seal is sm+). */}
              <Seal size="lg" stamped backed className="absolute -right-3 -bottom-6 z-10 size-24 sm:hidden" />
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`Photo of ${fullName}`}
                  className="aspect-[4/5] w-full max-w-xs rounded-panel bg-tint object-cover"
                />
              ) : (
                <PortraitFallback name={fullName} className="aspect-[4/5] w-full max-w-xs rounded-panel" />
              )}
            </div>

            <div className="relative sm:pr-40 lg:col-span-8">
              <Seal size="xl" stamped className="absolute -top-4 right-0 hidden size-36 sm:block" />

              <h1 className="max-w-xl font-display text-headline font-semibold text-balance text-ink sm:text-display">
                {fullName || 'Verified graduate'}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusTag status="verified" />
                <PremiumTag isPremiumVeteran={isPublicPremiumVeteran(profile)} />
              </div>

              {degreeTypes.length > 0 && (
                <p className="mt-5 text-lead text-primary">{degreeTypes.map(formatDegreeType).join(', ')}</p>
              )}

              <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-3">
                <div>
                  <dt className="text-caption text-muted">University</dt>
                  <dd className="mt-1 font-semibold text-ink">{profile.university_name || 'Not listed'}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted">Department</dt>
                  <dd className="mt-1 font-semibold text-ink">{profile.department_name || 'Not listed'}</dd>
                </div>
                <div>
                  <dt className="text-caption text-muted">Member since</dt>
                  <dd className="mt-1 font-semibold text-ink tabular-nums">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : 'Not listed'}
                  </dd>
                </div>
              </dl>

              {profile.bio && (
                <div className="mt-8">
                  <h2 className="font-display text-title font-semibold text-ink">About</h2>
                  <p className="mt-2 max-w-measure whitespace-pre-wrap text-body text-muted">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>

          {(verifiedDegrees.length > 0 || badges.length > 0) && (
            <div className="space-y-10 border-t border-line bg-wash/60 p-6 sm:p-8 lg:p-12">
              {verifiedDegrees.length > 0 && (
                <section aria-labelledby="credentials-title">
                  <h2 id="credentials-title" className="font-display text-title font-semibold text-ink">
                    Verified credentials
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {verifiedDegrees.map((degree) => (
                      <DegreeCard key={degree.id} degree={{ ...degree, degree_file: null }} />
                    ))}
                  </div>
                </section>
              )}

              {badges.length > 0 && <BadgeList badges={badges} />}
            </div>
          )}
        </article>
      </Container>
    </div>
  );
};

const BackToDirectory = () => (
  <Link
    to="/directory"
    className="inline-flex items-center gap-1 rounded-doc py-2.5 -my-2.5 text-caption font-semibold text-primary underline-offset-4 hover:underline"
  >
    <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
    Back to the register
  </Link>
);

const ProfileSkeleton = () => (
  <div className="bg-wash" aria-busy="true" aria-label="Loading graduate record">
    <Container className="py-8 lg:py-12">
      <Skeleton className="h-4 w-36" />
      <div className="mt-6 grid gap-8 rounded-panel border border-line bg-paper p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-12">
        <Skeleton className="aspect-[4/5] w-full max-w-xs rounded-panel lg:col-span-4" />
        <div className="space-y-4 lg:col-span-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="mt-8 h-16 w-full" />
        </div>
      </div>
    </Container>
  </div>
);

export default ProfileDetail;
