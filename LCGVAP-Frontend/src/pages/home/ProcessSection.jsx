import { FileUp, ShieldCheck, UserPlus } from 'lucide-react';
import useInView from '../../hooks/useInView';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { Button, Container, Seal, cn } from '../../components/ui';
import { PROCESS_STEPS, REVIEW_TIME } from './homeContent';

const ICONS = { UserPlus, FileUp, ShieldCheck };
const STEP_GAP_MS = 380;

/**
 * The verification procedure as a stepper: numbered nodes on a track that fills
 * in once, in order, the first time the section is seen. Horizontal from lg up,
 * vertical below. Reduced motion shows the finished state (global rule).
 */
export default function ProcessSection() {
  const [listRef, seen] = useInView({ threshold: 0.4 });
  // Reduced motion: show the finished state straight away.
  const reducedMotion = usePrefersReducedMotion();
  const inView = seen || reducedMotion;
  const lastIndex = PROCESS_STEPS.length - 1;
  const trackDuration = STEP_GAP_MS * lastIndex;

  return (
    <section aria-labelledby="process-title" className="bg-tint">
      <Container className="py-16 lg:py-24">
        <div className="max-w-2xl">
          <h2 id="process-title" className="font-display text-heading font-semibold text-balance text-ink sm:text-headline">
            How a record gets on the register
          </h2>
          <p className="mt-4 text-lead text-muted">
            Four steps from application to the public register. Review usually takes {REVIEW_TIME}.
          </p>
        </div>

        <ol ref={listRef} className="relative mt-12 md:mt-16 md:grid md:grid-cols-4 md:gap-6 lg:gap-8">
          {/* Horizontal track (lg+), centre of first node to centre of last. */}
          <span aria-hidden="true" className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-0.5 bg-line-strong md:block">
            <span
              className={cn(
                'absolute inset-0 origin-left bg-primary transition-transform ease-linear',
                inView ? 'scale-x-100' : 'scale-x-0'
              )}
              style={{ transitionDuration: `${trackDuration}ms` }}
            />
          </span>

          {PROCESS_STEPS.map((step, idx) => {
            const reached = inView;
            const delay = `${idx * STEP_GAP_MS}ms`;
            const isLast = idx === lastIndex;
            const Icon = ICONS[step.icon];

            return (
              <li
                key={step.title}
                className="relative grid grid-cols-[3.5rem_1fr] gap-x-5 pb-10 last:pb-0 md:flex md:flex-col md:items-center md:pb-0 md:text-center"
              >
                {/* Vertical connector (below lg), from this node to the next. */}
                {!isLast && (
                  <span aria-hidden="true" className="absolute top-14 bottom-0 left-[27px] w-0.5 bg-line-strong md:hidden">
                    <span
                      className={cn(
                        'absolute inset-0 origin-top bg-primary transition-transform duration-300 ease-linear',
                        reached ? 'scale-y-100' : 'scale-y-0'
                      )}
                      style={{ transitionDelay: delay }}
                    />
                  </span>
                )}

                <span
                  aria-hidden="true"
                  className={cn(
                    'relative z-10 flex size-14 items-center justify-center rounded-full border-2 transition-colors duration-300',
                    isLast
                      ? reached
                        ? 'border-primary bg-paper'
                        : 'border-line-strong bg-paper'
                      : reached
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-line-strong bg-paper text-muted'
                  )}
                  style={{ transitionDelay: delay }}
                >
                  {isLast ? (
                    <Seal size="sm" decorative tilted={false} className={cn('transition-opacity duration-300', reached ? 'opacity-100' : 'opacity-30')} style={{ transitionDelay: delay }} />
                  ) : (
                    <Icon className="size-6" strokeWidth={1.75} />
                  )}
                </span>

                <div className="pt-1 md:mt-5 md:max-w-60 md:pt-0">
                  <p className="text-caption font-semibold text-accent">Step {idx + 1}</p>
                  <h3 className="mt-1 text-body font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-caption text-muted">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-16 md:justify-center">
          <Button to="/register" size="lg" variant="accent">
            Start your application
          </Button>
          <p className="text-caption text-muted">Have your degree certificate and passport ready.</p>
        </div>
      </Container>
    </section>
  );
}
