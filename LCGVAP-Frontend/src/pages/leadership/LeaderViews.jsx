import { useState } from 'react';
import getFileUrl from '../../utils/getFileUrl';
import { Avatar, PortraitFallback, cn } from '../../components/ui';

/** Presentational pieces of the Leadership page (also rendered with fixtures on /__kit). */

const formatYear = (date) => {
  if (!date) return 'Present';
  const year = new Date(date).getFullYear();
  return Number.isNaN(year) ? 'Present' : year;
};

const formatServiceRange = (leader) => {
  const startYear = formatYear(leader.start_date);
  const endYear = leader.end_date ? formatYear(leader.end_date) : 'present';
  return `${startYear} to ${endYear}`;
};

export const LeaderPhoto = ({ leader, className, avatarSize = 'xl' }) => {
  const [failed, setFailed] = useState(false);
  const imageUrl = getFileUrl(leader.image_url);

  if (!imageUrl || failed) {
    return (
      avatarSize === 'xl' ? (
        <PortraitFallback name={leader.name} className={className} />
      ) : (
        <div className={cn('flex items-center justify-center bg-tint', className)}>
          <Avatar name={leader.name} size={avatarSize} className="bg-paper" />
        </div>
      )
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Portrait of ${leader.name}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('bg-tint object-cover', className)}
    />
  );
};

export const FeaturedLeader = ({ leader }) => (
  <article className="grid animate-rise gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
    <LeaderPhoto leader={leader} className="aspect-[4/5] w-full max-w-sm rounded-panel lg:col-span-5" />
    <div className="lg:col-span-7">
      <p className="text-caption font-semibold text-accent">{leader.position}</p>
      <h2 className="mt-2 font-display text-headline font-semibold text-balance text-ink sm:text-display">{leader.name}</h2>
      <p className="mt-3 text-caption text-muted tabular-nums">Serving {formatServiceRange(leader)}</p>
      {leader.bio && <p className="mt-6 max-w-measure text-lead text-muted">{leader.bio}</p>}
    </div>
  </article>
);

export const LeaderItem = ({ leader, delayMs }) => (
  <li className="animate-rise" style={{ animationDelay: `${delayMs}ms` }}>
    <LeaderPhoto leader={leader} className="aspect-[4/5] w-full rounded-panel" />
    <h3 className="mt-5 font-display text-title font-semibold text-ink">{leader.name}</h3>
    <p className="mt-1 text-caption font-semibold text-primary">{leader.position}</p>
    <p className="mt-1 text-caption text-muted tabular-nums">{formatServiceRange(leader)}</p>
    {leader.bio && <p className="mt-3 line-clamp-4 text-caption text-muted">{leader.bio}</p>}
  </li>
);

export const PastLeaderRow = ({ leader, delayMs }) => (
  <li
    className="grid animate-rise grid-cols-[3.5rem_1fr] items-start gap-x-5 gap-y-1 border-b border-line py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto]"
    style={{ animationDelay: `${delayMs}ms` }}
  >
    <LeaderPhoto leader={leader} avatarSize="md" className="size-14 rounded-full" />
    <div className="min-w-0">
      <h3 className="font-display text-title font-semibold text-ink">{leader.name}</h3>
      <p className="text-caption font-semibold text-primary">{leader.position}</p>
      {leader.bio && <p className="mt-2 max-w-measure text-caption text-muted">{leader.bio}</p>}
    </div>
    <p className="col-start-2 text-caption text-muted tabular-nums sm:col-start-3 sm:text-right">
      {formatServiceRange(leader)}
    </p>
  </li>
);

