import { cn } from './cn';

/**
 * Page title block. No eyebrow label above the title (banned pattern);
 * context belongs in breadcrumbs or the description.
 */
export default function PageHeader({ title, description, actions, breadcrumb, as = 'h1', className }) {
  const Heading = as;
  return (
    <header className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {breadcrumb && <div className="mb-3">{breadcrumb}</div>}
        <Heading className="font-display text-headline font-semibold text-balance text-ink">{title}</Heading>
        {description && <p className="mt-2 max-w-measure text-lead text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
