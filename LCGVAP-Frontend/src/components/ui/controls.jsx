import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './cn';
import { useFieldContext } from './fieldContext';

/**
 * Shared control styling. 16px text so iOS does not zoom on focus; 44px tall
 * so the touch target meets the floor; 2px corners like a printed form.
 */
const controlClass =
  'block w-full rounded-doc border border-line-strong bg-paper px-3 text-body text-ink ' +
  'placeholder:text-faint transition-colors duration-150 ' +
  'hover:border-muted focus:border-focus focus:outline-none focus-visible:outline-none focus:ring-1 focus:ring-focus ' +
  'disabled:cursor-not-allowed disabled:bg-tint disabled:text-muted ' +
  'aria-invalid:border-danger aria-invalid:ring-danger aria-invalid:bg-danger-soft/40';

function useControlProps(props) {
  const field = useFieldContext();
  if (!field) return props;
  return {
    id: props.id ?? field.id,
    'aria-describedby': [field.describedBy, props['aria-describedby']].filter(Boolean).join(' ') || undefined,
    'aria-invalid': props['aria-invalid'] ?? (field.invalid || undefined),
    required: props.required ?? (field.required || undefined),
    ...withoutKeys(props, ['id', 'aria-describedby', 'aria-invalid', 'required']),
  };
}

function withoutKeys(obj, keys) {
  const out = { ...obj };
  keys.forEach((key) => delete out[key]);
  return out;
}

export const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  const controlProps = useControlProps(props);
  return <input ref={ref} type={type} className={cn(controlClass, 'h-11', className)} {...controlProps} />;
});

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...props }, ref) {
  const controlProps = useControlProps(props);
  return <textarea ref={ref} rows={rows} className={cn(controlClass, 'min-h-24 py-2.5', className)} {...controlProps} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  const controlProps = useControlProps(props);
  return (
    <div className="relative">
      <select ref={ref} className={cn(controlClass, 'h-11 appearance-none pr-10', className)} {...controlProps}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </div>
  );
});
