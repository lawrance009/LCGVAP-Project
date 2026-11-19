import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from './cn';
import { FieldContext } from './fieldContext';

/**
 * Form field: visible label, optional hint, error under the control.
 * The control inside (Input / Select / Textarea) picks up id, aria-describedby,
 * aria-invalid and required from context, so callers never wire ids by hand.
 *
 *   <Field label="Email address" hint="We send your verification result here." error={errors.email}>
 *     <Input type="email" name="email" value={...} onChange={...} autoComplete="email" />
 *   </Field>
 */
export default function Field({ label, hint, error, required = false, optional = false, id, className, children }) {
  const autoId = useId();
  const controlId = id || `field-${autoId}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldContext.Provider value={{ id: controlId, describedBy, invalid: Boolean(error), required }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={controlId} className="text-caption font-semibold text-ink">
            {label}
            {required && (
              <span className="text-muted" aria-hidden="true">
                {' '}*
              </span>
            )}
            {optional && <span className="font-normal text-muted"> (optional)</span>}
          </label>
        )}
        {children}
        {hint && (
          <p id={hintId} className="text-caption text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="flex items-start gap-1.5 text-caption font-medium text-danger">
            <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
