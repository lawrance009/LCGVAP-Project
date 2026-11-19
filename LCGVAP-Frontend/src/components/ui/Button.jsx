import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { cn } from './cn';

const base =
  'inline-flex items-center justify-center gap-2 rounded-doc font-semibold whitespace-nowrap ' +
  'transition-colors duration-150 select-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  // Flag red, for joining / verifying actions ("Get verified", "Start your application").
  accent: 'bg-accent text-on-primary hover:bg-accent-hover',
  secondary: 'border border-line-strong bg-paper text-primary hover:bg-tint',
  ghost: 'text-primary hover:bg-tint',
  danger: 'bg-danger text-on-primary hover:bg-danger-hover',
  'danger-outline': 'border border-danger/40 bg-paper text-danger hover:bg-danger-soft',
  // For use on Canton Blue surfaces.
  inverse: 'bg-paper text-primary hover:bg-tint',
};

const sizes = {
  sm: 'h-9 px-3 text-caption',
  md: 'h-11 px-4 text-caption',
  lg: 'h-12 px-6 text-body',
  icon: 'size-11',
};

/**
 * Button. Renders a <Link> when `to` is set, an <a> when `href` is set,
 * otherwise a <button type="button">.
 *
 * `loading` disables the control, shows a spinner and keeps the label so the
 * width does not jump. Icon-only buttons (size="icon") must pass aria-label.
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    to,
    href,
    type = 'button',
    loading = false,
    disabled = false,
    leadingIcon: LeadingIcon,
    trailingIcon: TrailingIcon,
    className,
    children,
    ...props
  },
  ref
) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        LeadingIcon && <LeadingIcon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      )}
      {children}
      {TrailingIcon && !loading && (
        <TrailingIcon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      )}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || undefined} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} aria-disabled={disabled || undefined} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
