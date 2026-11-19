import { Archive, Check, Network, ShieldCheck } from 'lucide-react';
import { BRAND } from '../constants/branding';
import PageHero from '../components/PageHero';
import { Button, Container, Seal, cn } from '../components/ui';
import useInView from '../hooks/useInView';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import ProcessSection from './home/ProcessSection';
import VerifyCallout from './home/VerifyCallout';

const trustPillars = [
  {
    title: 'Verified records',
    text: 'A graduate appears on the register only after their academic records are reviewed and approved.',
    icon: ShieldCheck,
  },
  {
    title: 'Alumni legacy',
    text: 'A living record of the Liberians who studied in Cyprus, kept in one place.',
    icon: Archive,
  },
  {
    title: 'Professional connection',
    text: 'Employers, institutions and fellow alumni can find verified members by name.',
    icon: Network,
  },
];

// Not a sequence, so not numbered (design-system.md, banned patterns).
const objectives = [
  'Maintain a trusted register of verified Liberian graduates from Cyprus.',
  'Strengthen alumni recognition, professional visibility and community pride.',
  'Support academic integrity through careful review of credentials.',
  'Preserve the shared history of Liberian academic achievement in Cyprus.',
  'Build stronger links between graduates, universities and opportunities.',
];

const About = () => (
  <>
    <PageHero
      title={`About ${BRAND.shortName}`}
      lead={`${BRAND.portalName} documents, verifies and connects Liberian graduates of universities in Cyprus, so that every record can be trusted and every graduate can be found.`}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="accent" size="lg" to="/register">
          Get verified
        </Button>
        <Button variant="inverse" size="lg" to="/directory">
          Search the register
        </Button>
      </div>
    </PageHero>

    {/* Definition */}
    <section aria-labelledby="definition-title">
      <Container className="grid gap-8 py-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-24">
        <div className="lg:col-span-7">
          <h2 id="definition-title" className="font-display text-heading font-semibold text-balance text-ink sm:text-headline">
            {BRAND.shortName} is the {BRAND.fullName}.
          </h2>
          <p className="mt-5 max-w-measure text-lead text-muted">
            The portal is the community&apos;s official place for verification, discovery and alumni recognition:
            one organised record of approved graduates, and of Liberian academic achievement in Cyprus.
          </p>
        </div>
        <div className="flex justify-center lg:col-span-5">
          <Seal size="xl" className="size-48 sm:size-56" />
        </div>
      </Container>
    </section>

    {/* Mission and vision */}
    <section aria-label="Mission and vision" className="bg-tint">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:gap-16 lg:py-24">
        <Statement label="Our mission">
          Connect, document and empower Liberian graduates from Cyprus through a secure platform for recognition
          and opportunity.
        </Statement>
        <Statement label="Our vision">
          A globally recognised alumni community known for credibility, excellence and lifelong engagement.
        </Statement>
      </Container>
    </section>

    <TrustPillars />

    <ProcessSection />

    {/* Objectives */}
    <section aria-labelledby="objectives-title">
      <Container className="grid gap-10 py-16 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <div className="lg:col-span-5">
          <h2 id="objectives-title" className="font-display text-heading font-semibold text-balance text-ink sm:text-headline">
            What we work towards
          </h2>
          <p className="mt-4 text-lead text-muted">
            One goal behind all of them: a verified alumni community that can be trusted, recognised and carried forward.
          </p>
        </div>
        <ul className="border-t border-line lg:col-span-7">
          {objectives.map((objective) => (
            <li key={objective} className="flex gap-4 border-b border-line py-5">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
              </span>
              <p className="text-body text-ink">{objective}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>

    <VerifyCallout />
  </>
);

const Statement = ({ label, children }) => (
  <figure>
    <figcaption className="flex items-center gap-3 text-caption font-semibold text-accent">
      {label}
    </figcaption>
    <blockquote className="mt-5 font-display text-title leading-snug font-semibold text-balance text-ink sm:text-heading sm:leading-tight">
      {children}
    </blockquote>
  </figure>
);

/** Three ruled columns; the rules draw in from the left on first view. */
const TrustPillars = () => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const reducedMotion = usePrefersReducedMotion();
  const revealed = inView || reducedMotion;

  return (
    <section aria-labelledby="trust-title">
      <Container className="py-16 lg:py-24">
        <h2 id="trust-title" className="max-w-2xl font-display text-heading font-semibold text-balance text-ink sm:text-headline">
          What the register protects
        </h2>
        <ul ref={ref} className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {trustPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <li key={pillar.title} className="relative pt-6">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-line">
                  <span
                    className={cn(
                      'absolute inset-0 origin-left bg-primary transition-transform duration-700 ease-out-quart',
                      revealed ? 'scale-x-100' : 'scale-x-0'
                    )}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  />
                </span>
                <Icon className="size-7 text-accent" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mt-4 font-display text-title font-semibold text-ink">{pillar.title}</h3>
                <p className="mt-2 text-body text-muted">{pillar.text}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
};

export default About;
