import { useEffect, useState } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import getFileUrl from '../../utils/getFileUrl';
import useInView from '../../hooks/useInView';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { Container, Skeleton, cn } from '../../components/ui';

const STAGGER_MS = 140;
// Circumference of the ring (r = 46 in a 100 x 100 viewBox).
const RING_LENGTH = 2 * Math.PI * 46;

/**
 * Admin-featured universities as a row of medallions that echo the seal.
 * On first view each ring draws around its logo, one after another, as the
 * entries rise. Entries are divided by hairlines, not boxed as cards.
 * Fetch logic unchanged from the former components/FeaturedUniversitiesSection.jsx.
 */
export default function UniversitiesSection() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listRef, inView] = useInView({ threshold: 0.25 });
  const reducedMotion = usePrefersReducedMotion();
  const revealed = inView || reducedMotion;

  useEffect(() => {
    const fetchFeaturedUniversities = async () => {
      try {
        const response = await api.get('/universities/featured');
        setUniversities(response.data || []);
      } catch {
        setUniversities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedUniversities();
  }, []);

  if (!loading && universities.length === 0) return null;

  return (
    <section aria-labelledby="universities-title" className="border-t border-line bg-paper">
      <Container className="py-16 lg:py-24">
        <div>
          <div className="max-w-2xl">
            <h2 id="universities-title" className="font-display text-heading font-semibold text-balance text-ink sm:text-headline">
              Where our graduates studied
            </h2>
            <p className="mt-4 text-lead text-muted">
              Universities in Northern Cyprus whose Liberian graduates are on the register.
            </p>
          </div>
        </div>

        <ul
          ref={listRef}
          aria-busy={loading || undefined}
          className="mt-12 flex flex-wrap justify-center gap-y-12 border-t border-line pt-12 lg:flex-nowrap lg:divide-x lg:divide-line"
        >
          {loading
            ? [0, 1, 2, 3].map((item) => (
                <li key={item} className="flex w-1/2 flex-col items-center gap-4 md:w-1/4 lg:w-auto lg:flex-1 lg:px-6">
                  <Skeleton className="size-24 rounded-full" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-32" />
                </li>
              ))
            : universities.map((university, idx) => (
                <UniversityMedallion
                  key={university.id}
                  university={university}
                  revealed={revealed}
                  delayMs={idx * STAGGER_MS}
                />
              ))}
        </ul>
      </Container>
    </section>
  );
}

function UniversityMedallion({ university, revealed, delayMs }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = university.logo_url && !logoFailed;
  const shortName = university.acronym || initialsOf(university.name);

  return (
    <li
      className={cn(
        'group flex w-1/2 flex-col items-center px-3 text-center transition-[opacity,translate] duration-500 ease-out-quart md:w-1/4 lg:w-auto lg:flex-1 lg:px-6',
        revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <span className="relative flex size-24 items-center justify-center sm:size-28">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r="49" fill="var(--color-paper)" stroke="var(--color-line)" strokeWidth="1" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={revealed ? 0 : RING_LENGTH}
            className="transition-[stroke-dashoffset] duration-1000 ease-out-quart"
            style={{ transitionDelay: `${delayMs + 150}ms` }}
          />
        </svg>
        <span className="relative flex size-14 items-center justify-center transition-[scale] duration-200 group-hover:scale-110 sm:size-16">
          {showLogo ? (
            <img
              src={getFileUrl(university.logo_url)}
              alt=""
              className="max-h-full max-w-full object-contain"
              loading="lazy"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <Building2 className="size-7 text-primary" strokeWidth={1.5} aria-hidden="true" />
          )}
        </span>
      </span>

      <p className="mt-5 font-display text-title font-semibold text-primary" aria-hidden="true">
        {shortName}
      </p>
      <h3 className="mt-1 max-w-56 text-caption font-semibold text-ink">{university.name}</h3>
      {university.short_description && (
        <p className="mt-2 line-clamp-3 max-w-60 text-caption text-muted">{university.short_description}</p>
      )}
      {university.website_url && (
        <a
          href={university.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 rounded-doc py-2.5 -my-2.5 text-caption font-semibold text-primary underline-offset-4 hover:underline"
        >
          Visit website
          <ExternalLink className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span className="sr-only">of {university.name} (opens in a new tab)</span>
        </a>
      )}
    </li>
  );
}

function initialsOf(name = '') {
  return name
    .split(/\s+/)
    .filter((word) => word && word[0] === word[0].toUpperCase())
    .map((word) => word[0])
    .join('')
    .slice(0, 4);
}
