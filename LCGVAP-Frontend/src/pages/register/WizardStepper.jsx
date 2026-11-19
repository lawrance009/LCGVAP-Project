import { Check } from 'lucide-react';
import { cn } from '../../components/ui';
import { WIZARD_STEPS } from './wizardSteps';

/**
 * Registration progress. Vertical list from lg, a compact "Step 2 of 4" with a
 * segmented bar below that. Completed steps are buttons (go back and change);
 * later steps are not reachable until the current one passes its checks.
 */
export default function WizardStepper({ current, onGoTo }) {
  return (
    <>
      {/* Phones and tablets */}
      <div className="lg:hidden">
        <p className="text-caption text-muted">
          <span className="font-semibold text-accent">Step {current + 1} of {WIZARD_STEPS.length}</span>
          <span className="mx-2 text-faint" aria-hidden="true">/</span>
          {WIZARD_STEPS[current].title}
        </p>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {WIZARD_STEPS.map((step, idx) => (
            <span
              key={step.title}
              className={cn('h-1 flex-1 rounded-full transition-colors duration-300', idx <= current ? 'bg-primary' : 'bg-line')}
            />
          ))}
        </div>
      </div>

      {/* Desktop */}
      <nav aria-label="Application steps" className="hidden lg:block">
        <ol className="relative">
          {WIZARD_STEPS.map((step, idx) => {
            const done = idx < current;
            const active = idx === current;
            const node = (
              <>
                <span
                  className={cn(
                    'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-colors duration-300',
                    done && 'border-primary bg-primary text-on-primary',
                    active && 'border-primary bg-paper text-primary',
                    !done && !active && 'border-line-strong bg-paper text-muted'
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : idx + 1}
                </span>
                <span className="min-w-0 pt-2">
                  <span className={cn('block font-semibold', active ? 'text-ink' : done ? 'text-primary' : 'text-muted')}>
                    {step.title}
                  </span>
                  {done && <span className="block text-caption text-muted">Done. Select to change.</span>}
                </span>
              </>
            );

            return (
              <li key={step.title} className="relative pb-8 last:pb-0">
                {idx < WIZARD_STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn('absolute top-10 bottom-0 left-[19px] w-0.5 transition-colors duration-300', done ? 'bg-primary' : 'bg-line')}
                  />
                )}
                {done ? (
                  <button
                    type="button"
                    onClick={() => onGoTo(idx)}
                    className="flex w-full items-start gap-4 rounded-doc text-left hover:[&>span:last-child>span:first-child]:underline"
                  >
                    {node}
                    <span className="sr-only">(completed)</span>
                  </button>
                ) : (
                  <div className="flex items-start gap-4" aria-current={active ? 'step' : undefined}>
                    {node}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
