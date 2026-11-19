import { cn } from './cn';

/**
 * Loading placeholder that reserves the final size of the content (no layout shift).
 * Hidden from assistive tech; announce loading once on the container instead
 * (e.g. aria-busy="true" on the list).
 */
export default function Skeleton({ className, as = 'span' }) {
  const Tag = as;
  return <Tag aria-hidden="true" className={cn('block animate-pulse rounded-doc bg-tint', className)} />;
}
