import { cn } from './cn';

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Stand-in for a large portrait when there is no photo: deep blue panel with
 * the person's initials in display type over a short flag-red rule.
 * Decorative; the name is always printed next to it.
 */
export default function PortraitFallback({ name, className }) {
  return (
    <div aria-hidden="true" className={cn('flex flex-col items-center justify-center gap-3 bg-deep', className)}>
      <span className="font-display text-display leading-none font-semibold tracking-wide text-paper">
        {initialsOf(name)}
      </span>
    </div>
  );
}
