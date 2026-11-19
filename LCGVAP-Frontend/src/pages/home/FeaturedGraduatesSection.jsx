import { useState } from 'react';
import getFileUrl from '../../utils/getFileUrl';
import useAutoAdvance from '../../hooks/useAutoAdvance';
import { Container, PortraitFallback, Seal } from '../../components/ui';
import RotationControls from './RotationControls';

const GRADUATE_INTERVAL_MS = 6000;

/**
 * Admin-curated featured graduates, one at a time, laid out like a certificate.
 * Renders nothing until there is at least one graduate.
 */
export default function FeaturedGraduatesSection({ graduates }) {
  const rotation = useAutoAdvance(graduates.length, GRADUATE_INTERVAL_MS);
  if (graduates.length === 0) return null;

  const graduate = graduates[rotation.index];
  return <FeaturedGraduatesView graduate={graduate} graduates={graduates} rotation={rotation} />;
}

function FeaturedGraduatesView({ graduate, graduates, rotation }) {
  const [failedPhoto, setFailedPhoto] = useState(null);
  const showPhoto = graduate.photo_url && failedPhoto !== graduate.photo_url;

  return (
    <section aria-labelledby="featured-title" {...rotation.regionProps}>
      <Container className="py-16 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="featured-title" className="font-display text-heading font-semibold text-ink sm:text-headline">
              Featured graduates
            </h2>
            <p className="mt-3 text-lead text-muted">Verified members of the register and the work they do now.</p>
          </div>
          <RotationControls rotation={rotation} count={graduates.length} noun="graduate" />
        </div>

        <article key={rotation.index} className="mt-10 grid animate-swap gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            {showPhoto ? (
              <img
                onError={() => setFailedPhoto(graduate.photo_url)}
                src={getFileUrl(graduate.photo_url)}
                alt={`Portrait of ${graduate.name}`}
                className="aspect-[4/5] w-full rounded-panel bg-tint object-cover sm:aspect-[4/3] lg:aspect-[4/5]"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <PortraitFallback name={graduate.name} className="aspect-[4/3] rounded-panel lg:aspect-[4/5]" />
            )}
          </div>

          <div className="lg:col-span-7 lg:pt-4">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h3 className="font-display text-headline font-semibold text-balance text-ink">{graduate.name}</h3>
                {graduate.degree_type && <p className="mt-2 text-lead text-primary">{graduate.degree_type}</p>}
              </div>
              <Seal size="lg" className="hidden sm:block" />
            </div>

            <dl className="mt-8 grid gap-x-8 border-y border-line py-5 sm:grid-cols-2">
              {graduate.university && (
                <div className="py-2">
                  <dt className="text-caption text-muted">University</dt>
                  <dd className="mt-0.5 font-semibold text-ink">{graduate.university}</dd>
                </div>
              )}
              {graduate.department && (
                <div className="py-2">
                  <dt className="text-caption text-muted">Department</dt>
                  <dd className="mt-0.5 font-semibold text-ink">{graduate.department}</dd>
                </div>
              )}
            </dl>

            {graduate.featured_story && (
              <p className="mt-6 max-w-measure text-lead text-ink">{graduate.featured_story}</p>
            )}
            {graduate.bio && <p className="mt-4 max-w-measure text-body text-muted">{graduate.bio}</p>}
          </div>
        </article>
      </Container>
    </section>
  );
}
