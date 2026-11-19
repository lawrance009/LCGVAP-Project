import { Link } from 'react-router-dom';
import { Button, Container, Panel } from '../../components/ui';
import { REVIEW_TIME } from './homeContent';

/**
 * Closing call to action after the questions. Tint, not blue: the hero is the
 * page's one Canton Blue surface.
 */
export default function VerifyCallout() {
  return (
    <section aria-labelledby="callout-title">
      <Container className="pb-16 lg:pb-24">
        <Panel
          tone="tint"
          padding="lg"
          className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:p-12"
        >
          <div className="max-w-2xl">
            <h2 id="callout-title" className="font-display text-heading font-semibold text-balance text-ink">
              Ready to apply for verification?
            </h2>
            <p className="mt-3 text-body text-muted">
              Have your degree certificate and passport to hand. Applications are reviewed within {REVIEW_TIME}.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button size="lg" variant="accent" to="/register">
              Get verified
            </Button>
            <Link
              to="/login"
              className="rounded-doc px-1 py-2.5 -my-2.5 text-body font-semibold whitespace-nowrap text-primary underline decoration-line-strong underline-offset-4 hover:decoration-primary"
            >
              Check an application
            </Link>
          </div>
        </Panel>
      </Container>
    </section>
  );
}
