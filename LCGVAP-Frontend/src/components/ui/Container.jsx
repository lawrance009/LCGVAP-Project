import { cn } from './cn';

/** Page-width wrapper: 1200px max, 16 / 24 / 32px gutters. */
export default function Container({ as = 'div', className, children, ...props }) {
  const Tag = as;
  return (
    <Tag className={cn('mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8', className)} {...props}>
      {children}
    </Tag>
  );
}
