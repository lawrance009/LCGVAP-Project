import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { Container, cn } from '../../components/ui';

/**
 * Published FAQs (or the defaults) as a disclosure list, following the WAI
 * disclosure pattern: a heading wraps the button; the button controls the panel.
 * The id is linked from the footer ("Questions before you apply").
 */
export default function GuidelinesSection({ items }) {
  return (
    <section id="verification-guidelines" aria-labelledby="guidelines-title" className="border-t border-line">
      <Container className="grid gap-10 py-16 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <div className="lg:col-span-4">
          <h2 id="guidelines-title" className="font-display text-heading font-semibold text-balance text-ink sm:text-headline">
            Questions before you apply
          </h2>
          <p className="mt-4 text-lead text-muted">
            What graduates most often ask before submitting documents or checking on an application.
          </p>
        </div>

        <div className="border-t border-line lg:col-span-8">
          {items.map((item, idx) => (
            <QuestionItem key={item.id ?? idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function QuestionItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-start justify-between gap-6 rounded-doc py-5 text-left text-body font-semibold text-ink hover:text-primary"
        >
          {question}
          <Plus
            className={cn('mt-0.5 size-5 shrink-0 text-primary transition-transform duration-200', open && 'rotate-45')}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={panelId}
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <p className="max-w-measure pb-6 text-body text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}
