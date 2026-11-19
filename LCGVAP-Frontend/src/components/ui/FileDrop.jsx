import { CheckCircle2, UploadCloud } from 'lucide-react';
import { cn } from './cn';
import { useFieldContext } from './fieldContext';

const formatFileSize = (file) => {
  if (!file) return '';
  if (file.size < 1024 * 1024) return `${Math.max(1, Math.round(file.size / 1024))} KB`;
  return `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * File picker styled as a drop target. The native input stays in the DOM
 * (visually hidden) so keyboard, screen readers and mobile pickers all work.
 * Inside a <Field> it picks up id, aria-describedby and invalid state.
 *
 *   <Field label="Degree certificate" error={errors.degreeFile} required>
 *     <FileDrop accept=".pdf,image/*" file={file} onSelect={setFile} prompt="PDF or image, up to 5 MB" />
 *   </Field>
 */
export default function FileDrop({ id, accept, file, onSelect, prompt = 'Choose a file', icon = UploadCloud, className }) {
  const Icon = icon;
  const field = useFieldContext();
  const inputId = id ?? field?.id;
  const invalid = field?.invalid;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'group flex min-h-20 cursor-pointer items-center gap-4 rounded-panel border border-dashed px-4 py-4 transition-colors duration-150',
        'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus',
        invalid
          ? 'border-danger bg-danger-soft/40'
          : file
            ? 'border-solid border-primary/40 bg-tint'
            : 'border-line-strong bg-paper hover:border-primary hover:bg-wash',
        className
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        aria-describedby={field?.describedBy}
        aria-invalid={invalid || undefined}
        aria-required={field?.required || undefined}
        onChange={(event) => onSelect(event.target.files?.[0])}
      />
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full',
          file ? 'bg-primary text-on-primary' : 'bg-tint text-primary'
        )}
      >
        {file ? (
          <CheckCircle2 className="size-5" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{file ? file.name : 'Choose a file'}</span>
        <span className="block text-caption text-muted">{file ? `${formatFileSize(file)}. Choose again to replace it.` : prompt}</span>
      </span>
    </label>
  );
}
