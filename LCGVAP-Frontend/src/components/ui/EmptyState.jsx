import { cn } from './cn';

/**
 * Empty or zero-result state. Says what happened and offers the next step;
 * it is a direction, not a mood. One of the few centred layouts in the system.
 */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center', className)}>
      {Icon && (
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-tint text-primary">
          <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
        </span>
      )}
      <h2 className="font-display text-title font-semibold text-ink">{title}</h2>
      {description && <p className="mt-2 text-body text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
