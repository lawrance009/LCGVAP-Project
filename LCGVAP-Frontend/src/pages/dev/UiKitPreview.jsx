import { useState } from 'react';
import { Search, Trash2, UserPlus, Users } from 'lucide-react';
import {
  Avatar,
  Button,
  Container,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Panel,
  Seal,
  Select,
  Skeleton,
  StatusTag,
  Textarea,
} from '../../components/ui';
import FeaturedGraduatesSection from '../home/FeaturedGraduatesSection';
import { FeaturedLeader, LeaderItem, PastLeaderRow } from '../leadership/LeaderViews';

/**
 * Dev-only reference page for the UI kit (route /__kit, never in production builds).
 * Every component in every state, used for screenshot review each sprint.
 */
// Fixture for reviewing sections that are empty in a fresh database.
const sampleGraduates = [
  {
    name: 'Ruth Musu Kollie',
    degree_type: 'Master of Business Administration',
    university: 'Eastern Mediterranean University',
    department: 'Business Administration',
    featured_story: 'Leads the finance team of a logistics company in Monrovia and mentors new graduates returning from Cyprus.',
    bio: 'Graduated in 2021. Active in the VCLGC careers circle.',
    photo_url: null,
  },
  {
    name: 'Amos K. Togba',
    degree_type: 'Bachelor of Civil Engineering',
    university: 'Near East University',
    department: 'Civil Engineering',
    featured_story: 'Site engineer on public road projects in Bong County.',
    photo_url: `${window.location.origin}/home/alumni-meeting.jpg`,
  },
];

const sampleLeaders = [
  { id: 1, name: 'Joseph M. Sirleaf', position: 'President', start_date: '2024-01-01', bio: 'Leads the committee and chairs the verification review board. Graduated from Near East University in 2015.', image_url: null },
  { id: 2, name: 'Musu Kollie', position: 'Vice President', start_date: '2024-01-01', bio: 'Coordinates alumni events in Monrovia.', image_url: null },
  { id: 3, name: 'Prince Togba', position: 'Secretary General', start_date: '2024-01-01', bio: 'Keeps the register and committee minutes.', image_url: null },
  { id: 4, name: 'Comfort Weah', position: 'Treasurer', start_date: '2024-01-01', image_url: null },
];
const samplePastLeader = { id: 9, name: 'Emmanuel Doe', position: 'Founding President', start_date: '2019-03-01', end_date: '2023-12-31', bio: 'Founded VCLGC with graduates of EMU and NEU.', image_url: null };

const swatches = [
  ['Canton Blue', 'bg-primary', '#002868', 'text-on-primary'],
  ['Seal Red', 'bg-seal', '#BF0A30', 'text-on-primary'],
  ['Paper', 'bg-paper border border-line', '#FFFFFF', 'text-ink'],
  ['Guilloche', 'bg-tint', '#E9EEF6', 'text-ink'],
  ['Register Ink', 'bg-ink', '#0E1A33', 'text-on-primary'],
  ['Ledger Slate', 'bg-muted', '#56627A', 'text-on-primary'],
  ['Ledger Line', 'bg-line', '#D5DBE5', 'text-ink'],
];

const typeScale = [
  ['text-display-lg', 'Display large, 60', 'font-display font-semibold hidden lg:block'],
  ['text-display', 'Display, 48', 'font-display font-semibold'],
  ['text-headline', 'Headline, 36', 'font-display font-semibold'],
  ['text-heading', 'Heading, 28', 'font-display font-semibold'],
  ['text-title', 'Title, 22', 'font-display font-semibold'],
  ['text-lead', 'Lead, 18. Every name in the register has been checked against degree documents.', ''],
  ['text-body', 'Body, 16. Graduates submit their degree certificate and an administrator reviews it before the record is published.', ''],
  ['text-caption', 'Caption, 14. Near East University, Bachelor of Civil Engineering, 2019', 'text-muted'],
];

function Section({ title, children }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-6 font-display text-heading font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function UiKitPreview() {
  const [loading, setLoading] = useState(false);

  return (
    <main className="py-12">
      <Container>
        <PageHeader
          title="UI kit"
          description="Reference for every component in src/components/ui. Development builds only."
          actions={<Button variant="secondary" to="/">Back to site</Button>}
        />

        <Section title="Colour">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {swatches.map(([name, bg, hex, fg]) => (
              <li key={name} className={`flex h-28 flex-col justify-end rounded-panel p-3 ${bg} ${fg}`}>
                <span className="text-caption font-semibold">{name}</span>
                <span className="text-caption tabular-nums opacity-80">{hex}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type">
          <div className="space-y-4">
            {typeScale.map(([size, text, extra]) => (
              <p key={size} className={`${size} ${extra} max-w-measure`}>
                {text}
              </p>
            ))}
          </div>
        </Section>

        <Section title="Seal">
          <div className="flex flex-wrap items-end gap-8">
            <Seal size="xl" stamped />
            <Seal size="lg" />
            <Seal size="md" />
            <Seal size="sm" />
            <Seal size="xs" />
            <Seal size="lg" tilted={false} />
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button leadingIcon={UserPlus}>Get verified</Button>
            <Button variant="secondary">Sign in</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="danger" leadingIcon={Trash2}>Delete graduate</Button>
            <Button variant="danger-outline">Reject application</Button>
            <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>
              Save changes
            </Button>
            <Button disabled>Disabled</Button>
            <Button size="icon" variant="secondary" aria-label="Search">
              <Search className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 rounded-panel bg-primary p-4">
            <Button variant="inverse">Search the register</Button>
          </div>
        </Section>

        <Section title="Form fields">
          <div className="grid max-w-3xl gap-6 md:grid-cols-2">
            <Field label="Full name" required>
              <Input placeholder="As printed on your degree" autoComplete="name" />
            </Field>
            <Field label="Email address" hint="Your verification result is sent here." required>
              <Input type="email" autoComplete="email" />
            </Field>
            <Field label="Passport number" error="Enter the passport number exactly as it appears, letters and digits only." required>
              <Input defaultValue="LR-00?" />
            </Field>
            <Field label="University" required>
              <Select defaultValue="">
                <option value="" disabled>Choose a university</option>
                <option>Near East University</option>
                <option>Eastern Mediterranean University</option>
              </Select>
            </Field>
            <Field label="Short biography" optional className="md:col-span-2">
              <Textarea placeholder="Where you work now and what you studied" />
            </Field>
            <Field label="Year of graduation" hint="Read-only once verified.">
              <Input defaultValue="2019" disabled />
            </Field>
          </div>
        </Section>

        <Section title="Status tags">
          <div className="flex flex-wrap gap-3">
            <StatusTag status="verified" />
            <StatusTag status="pending" />
            <StatusTag status="rejected" />
            <StatusTag status="neutral">Draft</StatusTag>
          </div>
        </Section>

        <Section title="Avatars">
          <div className="flex flex-wrap items-end gap-4">
            <Avatar name="Ruth Musu Kollie" size="xl" />
            <Avatar name="Amos Togba" size="lg" />
            <Avatar name="Amos Togba" size="md" src="/broken-photo.jpg" />
            <Avatar name="Comfort" size="sm" />
          </div>
        </Section>

        <Section title="Panels">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel>
              <h3 className="font-display text-title font-semibold">Paper</h3>
              <p className="mt-2 text-muted">Bordered surface for grouped content.</p>
            </Panel>
            <Panel tone="tint">
              <h3 className="font-display text-title font-semibold">Tint</h3>
              <p className="mt-2 text-muted">Quiet emphasis without a border.</p>
            </Panel>
            <Panel tone="primary">
              <h3 className="font-display text-title font-semibold">Primary</h3>
              <p className="mt-2 opacity-90">Use once per page at most.</p>
            </Panel>
          </div>
        </Section>

        <Section title="Loading and empty">
          <div className="grid gap-6 md:grid-cols-2">
            <Panel aria-busy="true" aria-label="Loading graduates">
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </Panel>
            <Panel padding="none">
              <EmptyState
                icon={Users}
                title="No graduates match these filters"
                description="Try a different university or clear the year filter."
                action={<Button variant="secondary">Clear filters</Button>}
              />
            </Panel>
          </div>
        </Section>
      </Container>

      <div className="mt-10 border-t-4 border-primary">
        <Container>
          <h2 className="pt-10 font-display text-heading font-semibold">Home sections with fixture data</h2>
        </Container>
        <FeaturedGraduatesSection graduates={sampleGraduates} />
        <Container className="space-y-12 py-12">
          <h3 className="font-display text-title font-semibold">Leadership views</h3>
          <FeaturedLeader leader={sampleLeaders[0]} />
          <ul className="grid gap-x-8 gap-y-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-3">
            {sampleLeaders.slice(1).map((leader, index) => (
              <LeaderItem key={leader.id} leader={leader} delayMs={index * 60} />
            ))}
          </ul>
          <ul className="border-t border-line">
            <PastLeaderRow leader={samplePastLeader} delayMs={0} />
          </ul>
        </Container>
      </div>
    </main>
  );
}
