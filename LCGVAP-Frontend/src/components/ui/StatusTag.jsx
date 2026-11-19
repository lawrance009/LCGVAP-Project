import { BadgeCheck, Clock3, CircleX, Circle } from 'lucide-react';
import { cn } from './cn';

/**
 * Status of a verification record. Colour is never the only signal: each tone
 * has its own icon and the label is always visible text.
 * There is no green or amber in the system (docs/redesign/design-system.md).
 */
const tones = {
  verified: { icon: BadgeCheck, label: 'Verified', className: 'bg-primary text-on-primary border-primary' },
  pending: { icon: Clock3, label: 'Pending review', className: 'bg-tint text-ink border-line' },
  rejected: { icon: CircleX, label: 'Rejected', className: 'bg-danger-soft text-danger border-danger/30' },
  neutral: { icon: Circle, label: '', className: 'bg-paper text-muted border-line' },
};

export default function StatusTag({ status = 'neutral', children, className }) {
  const tone = tones[status] ?? tones.neutral;
  const Icon = tone.icon;
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-doc border px-2.5 text-caption font-semibold whitespace-nowrap',
        tone.className,
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
      {children ?? tone.label}
    </span>
  );
}
