import { useId } from 'react';
import { cn } from './cn';

const sizes = {
  xs: 'size-6',
  sm: 'size-10',
  md: 'size-16',
  lg: 'size-28',
  xl: 'size-40',
};

/**
 * The verification seal — the one signature element of the design.
 * Meaning: this record has been verified by VCLGC. Use it ONLY on verified
 * records (see "The red rule" in docs/redesign/design-system.md).
 *
 * - `stamped` plays the one-time stamp animation (home hero only).
 * - Below lg the ring text is dropped (unreadable) and only the star remains.
 * - `backed` paints a paper disc behind it, for placing the seal over a photo.
 * - Decorative when `decorative` is set (next to visible "Verified" text);
 *   otherwise it is announced as "Verified graduate".
 */
export default function Seal({
  size = 'md',
  stamped = false,
  tilted = true,
  backed = false,
  decorative = false,
  label = 'Verified graduate',
  className,
  style,
}) {
  const pathId = `seal-ring-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const showRing = size === 'lg' || size === 'xl';

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn(
        'shrink-0 text-seal',
        sizes[size],
        tilted && '-rotate-12',
        stamped && 'animate-stamp',
        className
      )}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      focusable="false"
      style={style}
    >
      {backed && <circle cx="60" cy="60" r="58.5" fill="var(--color-paper)" />}
      <g fill="none" stroke="currentColor">
        <circle cx="60" cy="60" r="57" strokeWidth="3" />
        <circle cx="60" cy="60" r="53" strokeWidth="1" />
        <circle cx="60" cy="60" r={showRing ? 36 : 30} strokeWidth="1.5" />
      </g>

      {showRing && (
        <>
          <defs>
            <path id={pathId} d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0" />
          </defs>
          <text
            fill="currentColor"
            fontFamily="'Public Sans', system-ui, sans-serif"
            fontSize="9"
            fontWeight="700"
            letterSpacing="1"
          >
            <textPath href={`#${pathId}`} startOffset="0" textLength="252" lengthAdjust="spacing">
              VERIFIED GRADUATE ★ VCLGC REGISTER ★
            </textPath>
          </text>
        </>
      )}

      <polygon
        fill="currentColor"
        points="60.00,43.00 64.06,54.42 76.17,54.75 66.56,62.13 69.99,73.75 60.00,66.90 50.01,73.75 53.44,62.13 43.83,54.75 55.94,54.42"
        transform={showRing ? undefined : 'translate(-24 -24) scale(1.4)'}
      />
    </svg>
  );
}
