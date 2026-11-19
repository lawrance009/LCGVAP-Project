import { Send } from 'lucide-react';
import { BRAND } from '../../constants/branding';
import { Button, Container, Field, Input, Panel, Textarea } from '../../components/ui';
import { REVIEW_TIME } from './homeContent';

/**
 * Contact form. State and submission stay in Home.jsx (unchanged logic);
 * this component only renders.
 */
export default function ContactSection({ form, onChange, onSubmit, submitting }) {
  const update = (field) => (event) => onChange({ ...form, [field]: event.target.value });

  return (
    <section aria-labelledby="contact-title" className="border-t border-line bg-wash">
      <Container className="grid gap-10 py-16 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <div className="lg:col-span-5">
          <h2 id="contact-title" className="font-display text-heading font-semibold text-balance text-ink sm:text-headline">
            Contact the verification office
          </h2>
          <p className="mt-4 text-lead text-muted">
            For application status, document questions, or anything about verified alumni status.
          </p>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            <div className="py-4">
              <dt className="text-caption text-muted">Email</dt>
              <dd className="mt-0.5">
                <a
                  href={`mailto:${BRAND.contactEmail}`}
                  className="inline-block rounded-doc py-2.5 -my-2.5 font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {BRAND.contactEmail.split('@')[0]}@<wbr />
                  {BRAND.contactEmail.split('@')[1]}
                </a>
              </dd>
            </div>
            <div className="py-4">
              <dt className="text-caption text-muted">Reply time</dt>
              <dd className="mt-0.5 font-semibold text-ink">{REVIEW_TIME}</dd>
            </div>
          </dl>
        </div>

        <Panel as="form" padding="lg" onSubmit={onSubmit} className="lg:col-span-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input value={form.name} onChange={update('name')} autoComplete="name" />
            </Field>
            <Field label="Email address" hint="We reply to this address." required>
              <Input type="email" value={form.email} onChange={update('email')} autoComplete="email" spellCheck={false} />
            </Field>
            <Field label="Subject" required className="sm:col-span-2">
              <Input
                value={form.subject}
                onChange={update('subject')}
                placeholder="For example, status of my application"
              />
            </Field>
            <Field label="Message" required className="sm:col-span-2">
              <Textarea rows={5} value={form.message} onChange={update('message')} />
            </Field>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption text-muted">Your details are used only to reply to you.</p>
            <Button type="submit" size="lg" loading={submitting} leadingIcon={Send}>
              {submitting ? 'Sending…' : 'Send message'}
            </Button>
          </div>
        </Panel>
      </Container>
    </section>
  );
}
