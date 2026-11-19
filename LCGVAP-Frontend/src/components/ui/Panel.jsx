import { cn } from './cn';

const tones = {
  paper: 'border border-line bg-paper',
  tint: 'bg-tint',
  primary: 'bg-primary text-on-primary',
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/**
 * A surface. Separation comes from a border (paper) or a tint, never a resting shadow.
 * Use it for grouped content, not to box every element on the page.
 */
export default function Panel({ as = 'div', tone = 'paper', padding = 'md', className, children, ...props }) {
  const Tag = as;
  return (
    <Tag className={cn('rounded-panel', tones[tone], paddings[padding], className)} {...props}>
      {children}
    </Tag>
  );
}
