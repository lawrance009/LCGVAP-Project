import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Search } from 'lucide-react';
import getFileUrl from '../../utils/getFileUrl';
import useAutoAdvance from '../../hooks/useAutoAdvance';
import { BRAND } from '../../constants/branding';
import { Button, Container, Seal, Skeleton, cn } from '../../components/ui';
import CountUpNumber from './CountUpNumber';
import { FALLBACK_SLIDES } from './homeContent';

const SLIDE_INTERVAL_MS = 7000;

const STAT_ITEMS = [
  { key: 'verified', label: 'verified graduates' },
  { key: 'universities', label: 'universities' },
  { key: 'departments', label: 'departments' },
];

// The four checks every record passes. Shown as the hero's one orchestrated
// sequence: the card rises, each check ticks in, then the seal stamps it.
const RECORD_CHECKS = [
  'Identity matches passport',
  'Degree certificate reviewed',
  'University and year confirmed',
  'Approved for the public register',
];
const CARD_DELAY_MS = 250;
const FIRST_TICK_MS = 750;
const TICK_GAP_MS = 320;
const STAMP_DELAY_MS = FIRST_TICK_MS + RECORD_CHECKS.length * TICK_GAP_MS + 150;

/**
 * Canton Blue hero: headline, register search and live counts on the left;
 * the admin's slide photo bleeds to the right edge with the verification
 * record card across it. The photo always has an image (fallback slides).
 */
export default function HeroSection({ slides, stats, statsLoading }) {
  const usingFallback = slides.length === 0;
  const activeSlides = usingFallback ? FALLBACK_SLIDES : slides;
  // CMS slides are API uploads (resolve via getFileUrl); fallbacks are local /public files.
  const imageFor = (slide) =>
    usingFallback ? slide.image_url : getFileUrl(slide.image_url) || FALLBACK_SLIDES[0].image_url;
  // Rotates on its own, with no visible controls (user decision, 2026-11-17).
  // Still pauses on hover/focus and never moves under reduced motion.
  const rotation = useAutoAdvance(activeSlides.length, SLIDE_INTERVAL_MS);

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-deep text-on-primary">
      <Container className="relative z-10 py-14 sm:py-16 lg:grid lg:min-h-[640px] lg:grid-cols-12 lg:items-center lg:py-20">
        <div className="lg:col-span-6">
          <h1
            id="hero-title"
            className="font-display text-headline font-semibold text-balance sm:text-display xl:text-display-lg"
          >
            Liberian graduates of Cyprus universities, verified one by one.
          </h1>
          <p className="mt-5 max-w-xl text-lead text-canton-100">
            The official register of the {BRAND.fullName}. Every record is checked against the
            graduate&apos;s degree documents before it is published.
          </p>

          <RegisterSearch />

          <p className="mt-5 text-body text-canton-100">
            Graduated from a university in Cyprus?{' '}
            <Link
              to="/register"
              className="rounded-doc font-semibold text-paper underline decoration-paper/50 decoration-2 underline-offset-4 hover:decoration-paper focus-visible:outline-paper"
            >
              Get verified
            </Link>
          </p>

          <RegisterCounts stats={stats} loading={statsLoading} />
        </div>
      </Container>

      {/* Photo: in flow on mobile, bleeding to the right edge from lg up.
          Slides enter from the right and the outgoing one leaves to the left. */}
      <figure
        className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-[44%]"
        aria-label="Photos from the VCLGC community"
        {...rotation.regionProps}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-canton-900 sm:aspect-[16/9] lg:aspect-auto lg:h-full">
          <div className="absolute inset-0 animate-settle">
            {activeSlides.map((slide, idx) => {
              const isCurrent = idx === rotation.index;
              const isLeaving = idx === rotation.previous && !isCurrent;
              return (
                <img
                  key={slide.id ?? idx}
                  src={imageFor(slide)}
                  alt={isCurrent ? slide.title || '' : ''}
                  aria-hidden={!isCurrent || undefined}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : undefined}
                  decoding="async"
                  className={cn(
                    'absolute inset-0 size-full object-cover',
                    // First paint: no slide (the wrapper settles instead).
                    isCurrent && (rotation.previous == null ? 'z-10' : 'z-10 animate-slide-in'),
                    isLeaving && 'z-0 animate-slide-out',
                    !isCurrent && !isLeaving && 'invisible'
                  )}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_SLIDES[0].image_url;
                  }}
                />
              );
            })}
          </div>
        </div>

        <VerificationCard />
      </figure>
    </section>
  );
}

function VerificationCard() {
  return (
    <div
      className="relative z-10 mx-4 -mt-16 mb-10 animate-rise rounded-panel bg-paper p-5 pr-16 text-ink shadow-overlay sm:mx-auto sm:max-w-sm lg:absolute lg:bottom-12 lg:left-10 lg:m-0 lg:w-[22rem] xl:left-14"
      style={{ animationDelay: `${CARD_DELAY_MS}ms` }}
    >
      <p className="font-display text-title font-semibold">Verification record</p>
      <p className="text-caption text-muted">Checked before anything is published</p>
      <ul className="mt-4 space-y-3">
        {RECORD_CHECKS.map((check, idx) => (
          <li key={check} className="flex items-center gap-3 text-caption font-medium">
            <span
              className="flex size-6 shrink-0 animate-tick items-center justify-center rounded-full bg-primary text-on-primary"
              style={{ animationDelay: `${FIRST_TICK_MS + idx * TICK_GAP_MS}ms` }}
              aria-hidden="true"
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            {check}
          </li>
        ))}
      </ul>
      <Seal
        size="lg"
        stamped
        backed
        decorative
        className="absolute -top-10 -right-2 size-24 sm:-top-12 sm:-right-10 sm:size-28"
        style={{ animationDelay: `${STAMP_DELAY_MS}ms` }}
      />
    </div>
  );
}

function RegisterSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/directory?search=${encodeURIComponent(term)}` : '/directory');
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="mt-8 max-w-xl">
      <label htmlFor="hero-search" className="text-caption font-semibold text-paper">
        Search the register by graduate name
      </label>
      <div className="mt-2 flex gap-1.5 rounded-panel bg-paper p-1.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-paper">
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ruth Kollie"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-doc bg-paper px-3 text-body text-ink placeholder:text-faint focus:outline-none"
        />
        <Button type="submit" variant="accent" leadingIcon={Search} className="shrink-0">
          Search
        </Button>
      </div>
    </form>
  );
}

function RegisterCounts({ stats, loading }) {
  const hasAny = STAT_ITEMS.some(({ key }) => stats[key] != null);
  // If the stats request failed there is nothing true to show; hide the row.
  if (!loading && !hasAny) return null;

  return (
    <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-paper/20 pt-6" aria-busy={loading || undefined}>
      {STAT_ITEMS.map(({ key, label }) => {
        if (!loading && stats[key] == null) return null;
        return (
          <div key={key} className="flex flex-col-reverse">
            <dt className="text-caption text-canton-300">{label}</dt>
            <dd className="font-display text-headline leading-tight font-semibold tabular-nums">
              {loading ? <Skeleton className="my-1.5 h-8 w-14 bg-paper/15" /> : <CountUpNumber value={stats[key]} />}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
