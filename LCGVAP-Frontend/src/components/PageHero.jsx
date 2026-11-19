import { Container, cn } from './ui';

/**
 * Interior-page header: deep blue band with the footer's red line along the
 * bottom, display-type title and lead. `children` sits below (search, actions).
 * No eyebrow label above the title (banned pattern, design-system.md).
 */
export default function PageHero({ title, lead, breadcrumb, children, className }) {
  return (
    <section className={cn('bg-deep text-on-primary', className)}>
      <Container className="py-12 sm:py-16 lg:py-20">
        {breadcrumb && <div className="mb-6">{breadcrumb}</div>}
        <h1 className="max-w-3xl animate-rise font-display text-headline font-semibold text-balance sm:text-display">
          {title}
        </h1>
        {lead && (
          <p className="mt-4 max-w-2xl animate-rise text-lead text-canton-100" style={{ animationDelay: '80ms' }}>
            {lead}
          </p>
        )}
        {children && (
          <div className="mt-8 animate-rise" style={{ animationDelay: '160ms' }}>
            {children}
          </div>
        )}
      </Container>
    </section>
  );
}
