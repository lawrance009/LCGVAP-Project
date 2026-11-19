import { useState } from 'react';
import { cn } from './cn';

const sizes = {
  sm: 'size-9 text-caption',
  md: 'size-12 text-body',
  lg: 'size-20 text-title',
  xl: 'size-32 text-heading',
};

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Graduate photo, falling back to initials when there is no photo or it fails to load.
 * `src` should already be resolved (use utils/getFileUrl).
 * Decorative by default, because the name is almost always printed beside it.
 * Pass `decorative={false}` when the avatar stands alone.
 */
export default function Avatar({ src, name, size = 'md', decorative = true, className }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && failedSrc !== src;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-tint font-display font-semibold text-primary',
        sizes[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={decorative || !name ? '' : `Photo of ${name}`}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <>
          <span aria-hidden="true">{initialsOf(name)}</span>
          {!decorative && name && <span className="sr-only">{name}</span>}
        </>
      )}
    </span>
  );
}
