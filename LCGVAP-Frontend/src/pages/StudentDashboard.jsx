/**
 * StudentDashboard.jsx
 * ---------------------------------------------------------------
 * The graduate's home after login. Shows:
 *   - Account status (pending / verified)
 *   - Degree submission status summary
 *   - Quick links (profile, directory, add degree)
 *   - Verification steps guide for pending users
 * ---------------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, CircleAlert, FileText, PlusCircle, Search, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatDegreeType } from '../utils/degreeDisplay';
import { Container, EmptyState, Seal, Skeleton, StatusTag, cn } from '../components/ui';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/degrees')
      .then(res => setDegrees(res.data?.degrees || []))
      .catch(() => setDegrees([]))
      .finally(() => setLoading(false));
  }, []);

  const verified = degrees.filter(d => d.is_verified);
  const pending = degrees.filter(d => !d.is_verified && !d.rejection_reason);
  const rejected = degrees.filter(d => d.rejection_reason);

  const firstName = user?.first_name || 'Graduate';
  const isVerified = user?.is_verified;

  const steps = [
    { done: true, label: 'Account created', desc: 'Your application was received.' },
    { done: degrees.length > 0, label: 'Degree submitted', desc: 'At least one degree document is uploaded.' },
    { done: verified.length > 0, label: 'Degree verified', desc: 'An administrator has verified a degree.' },
    { done: isVerified, label: 'On the register', desc: 'Your public record can be found in the directory.' },
  ];
  const currentStep = steps.findIndex(s => !s.done);

  const counts = [
    { label: 'Degrees submitted', value: degrees.length },
    { label: 'Verified', value: verified.length },
    { label: 'In review', value: pending.length },
    { label: 'Need attention', value: rejected.length, alert: rejected.length > 0 },
  ];

  return (
    <div className="bg-wash">
      {/* Greeting */}
      <section className="overflow-x-clip border-b border-line bg-paper">
        <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:py-12">
          <div>
            <h1 className="font-display text-headline font-semibold text-balance text-ink">Welcome back, {firstName}</h1>
            <p className="mt-2 text-lead text-muted">
              {isVerified
                ? 'Your record is on the register. Keep your degrees and profile up to date here.'
                : 'Your application is in review. This page shows where each degree stands.'}
            </p>
            <div className="mt-4">
              <StatusTag status={isVerified ? 'verified' : 'pending'}>
                {isVerified ? 'Verified graduate' : 'Verification in progress'}
              </StatusTag>
            </div>
          </div>
          {isVerified && <Seal size="lg" stamped className="size-28 shrink-0 self-start sm:self-center" />}
        </Container>
      </section>

      <Container className="space-y-8 py-10 lg:py-12">
        {/* Progress */}
        <section aria-labelledby="progress-title" className="rounded-panel border border-line bg-paper p-6 sm:p-8">
          <h2 id="progress-title" className="font-display text-title font-semibold text-ink">Your verification</h2>
          <ol className="relative mt-8 md:grid md:grid-cols-4 md:gap-6">
            <span aria-hidden="true" className="absolute top-5 right-[12.5%] left-[12.5%] hidden h-0.5 bg-line md:block">
              <span
                className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-700 ease-out-quart"
                style={{ width: `${Math.max(0, (currentStep === -1 ? steps.length - 1 : currentStep - 1)) / (steps.length - 1) * 100}%` }}
              />
            </span>
            {steps.map((step, i) => {
              const isCurrent = i === currentStep;
              return (
                <li
                  key={step.label}
                  aria-current={isCurrent ? 'step' : undefined}
                  className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-8 last:pb-0 md:flex md:flex-col md:items-center md:pb-0 md:text-center"
                >
                  {i < steps.length - 1 && (
                    <span aria-hidden="true" className={cn('absolute top-10 bottom-0 left-[19px] w-0.5 md:hidden', step.done ? 'bg-primary' : 'bg-line')} />
                  )}
                  <span
                    className={cn(
                      'relative z-10 flex size-10 items-center justify-center rounded-full border-2 font-semibold',
                      step.done && 'border-primary bg-primary text-on-primary',
                      isCurrent && 'border-primary bg-paper text-primary',
                      !step.done && !isCurrent && 'border-line-strong bg-paper text-muted'
                    )}
                  >
                    {step.done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
                  </span>
                  <div className="pt-1.5 md:mt-3 md:pt-0">
                    <p className={cn('font-semibold', step.done ? 'text-ink' : isCurrent ? 'text-accent' : 'text-muted')}>
                      {step.label}
                      <span className="sr-only">{step.done ? ' (done)' : isCurrent ? ' (next)' : ' (to do)'}</span>
                    </p>
                    <p className="mt-0.5 text-caption text-muted">{step.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Counts */}
        <dl className="grid grid-cols-2 overflow-hidden rounded-panel border border-line bg-paper md:grid-cols-4" aria-busy={loading || undefined}>
          {counts.map((count, i) => (
            <div
              key={count.label}
              className={cn(
                'flex flex-col-reverse px-5 py-5 sm:px-6',
                i % 2 === 1 && 'border-l border-line',
                i >= 2 && 'border-t border-line md:border-t-0',
                i === 2 && 'md:border-l'
              )}
            >
              <dt className="text-caption text-muted">{count.label}</dt>
              <dd className={cn('font-display text-headline leading-tight font-semibold tabular-nums', count.alert ? 'text-danger' : 'text-ink')}>
                {loading ? <Skeleton className="my-1.5 h-8 w-10" /> : count.value}
              </dd>
            </div>
          ))}
        </dl>

        {rejected.length > 0 && (
          <section role="alert" className="rounded-panel border border-danger/30 bg-danger-soft p-6">
            <h2 className="flex items-center gap-2 font-semibold text-danger">
              <CircleAlert className="size-5" strokeWidth={1.75} aria-hidden="true" />
              {rejected.length === 1 ? 'One degree needs your attention' : `${rejected.length} degrees need your attention`}
            </h2>
            <p className="mt-1 text-body text-ink">Read the reason, then submit a corrected document from your profile.</p>
            <ul className="mt-4 space-y-2">
              {rejected.slice(0, 3).map(d => (
                <li key={d.id} className="rounded-doc border border-danger/20 bg-paper p-3">
                  <p className="font-semibold text-ink">
                    {formatDegreeType(d.degree_type)}
                    {d.university_name ? `, ${d.university_name}` : ''}
                  </p>
                  <p className="mt-0.5 text-caption text-danger">Reason: {d.rejection_reason}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Credentials */}
          <section aria-labelledby="credentials-title" className="rounded-panel border border-line bg-paper lg:col-span-8">
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <h2 id="credentials-title" className="font-display text-title font-semibold text-ink">Your degrees</h2>
              <Link to="/profile" className="inline-flex items-center gap-1 rounded-doc py-2.5 -my-2.5 text-caption font-semibold text-primary underline-offset-4 hover:underline">
                Manage degrees
                <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 p-6" aria-hidden="true">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : degrees.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No degrees submitted yet"
                description="Submit your first degree certificate to start verification."
              />
            ) : (
              <ul>
                {degrees.map(d => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 last:border-b-0">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{formatDegreeType(d.degree_type)}</p>
                      <p className="text-caption text-muted">
                        {d.university_name || 'University not set'}
                        {d.graduation_year ? `, ${d.graduation_year}` : ''}
                      </p>
                    </div>
                    <StatusTag status={d.is_verified ? 'verified' : d.rejection_reason ? 'rejected' : 'pending'}>
                      {d.is_verified ? 'Verified' : d.rejection_reason ? 'Needs attention' : 'In review'}
                    </StatusTag>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick links */}
          <nav aria-labelledby="actions-title" className="rounded-panel border border-line bg-paper lg:col-span-4">
            <h2 id="actions-title" className="border-b border-line px-6 py-4 font-display text-title font-semibold text-ink">
              Shortcuts
            </h2>
            <ul>
              {[
                { to: '/profile', icon: UserRound, label: 'Edit your profile', desc: 'Photo, name and short biography' },
                { to: '/profile', icon: PlusCircle, label: 'Submit another degree', desc: 'Add a credential for review' },
                { to: '/directory', icon: Search, label: 'Search the register', desc: 'Find other verified graduates' },
              ].map(item => (
                <li key={item.label} className="border-b border-line last:border-b-0">
                  <Link to={item.to} className="group flex items-center gap-4 px-6 py-4 hover:bg-wash">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tint text-primary">
                      <item.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink group-hover:text-primary">{item.label}</span>
                      <span className="block text-caption text-muted">{item.desc}</span>
                    </span>
                    <ChevronRight className="size-5 text-faint group-hover:text-primary" strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </div>
  );
};

export default StudentDashboard;
