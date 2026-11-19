import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cake, Megaphone, Newspaper } from 'lucide-react';
import api from '../services/api';
import getFileUrl from '../utils/getFileUrl';
import { BRAND } from '../constants/branding';
import PageHero from '../components/PageHero';
import { Container, EmptyState, Skeleton, cn } from '../components/ui';

const filters = [
  { id: 'all', label: 'All updates' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'birthday', label: 'Celebrations' },
];

const getFeedType = (item) => (item.type === 'birthday' || item.is_birthday ? 'birthday' : 'announcement');

const formatDate = (date) => {
  if (!date) return 'Date to be confirmed';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const stripHtml = (value = '') => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const buildExcerpt = (item) => {
  const content = stripHtml(item.content || '');
  if (content.length <= 150) return content;
  return `${content.slice(0, 150).trim()}…`;
};

const News = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);

    try {
      const response = await api.get('/news');
      setFeed(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching news:', error);
      setFeed([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizedFeed = useMemo(
    () => feed.map((item) => ({ ...item, feedType: getFeedType(item) })),
    [feed]
  );

  const counts = useMemo(() => ({
    all: normalizedFeed.length,
    announcement: normalizedFeed.filter((item) => item.feedType === 'announcement').length,
    birthday: normalizedFeed.filter((item) => item.feedType === 'birthday').length,
  }), [normalizedFeed]);

  const filteredFeed = useMemo(() => (
    filter === 'all'
      ? normalizedFeed
      : normalizedFeed.filter((item) => item.feedType === filter)
  ), [filter, normalizedFeed]);

  const featuredItem = filteredFeed[0];
  const gridItems = featuredItem ? filteredFeed.slice(1) : [];

  return (
    <>
      <PageHero
        title="News and announcements"
        lead={`Official updates from ${BRAND.shortName}, community announcements and celebrations of verified alumni.`}
      />

      <Container as="section" aria-labelledby="feed-title" className="py-10 lg:py-14">
        <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="feed-title" aria-live="polite" className="font-display text-heading font-semibold text-ink">
            {loading
              ? 'Loading updates…'
              : `${filteredFeed.length.toLocaleString()} ${filteredFeed.length === 1 ? 'update' : 'updates'}`}
          </h2>

          <div role="group" aria-label="Show" className="flex flex-wrap gap-1 rounded-panel bg-tint p-1">
            {filters.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-doc px-3.5 text-caption font-semibold transition-colors duration-150',
                    active ? 'bg-paper text-primary shadow-[0_1px_2px_rgb(14_26_51/0.12)]' : 'text-muted hover:text-ink'
                  )}
                >
                  {item.label}
                  <span className={cn('tabular-nums', active ? 'text-accent' : 'text-faint')}>{counts[item.id]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10" aria-busy={loading || undefined}>
          {loading ? (
            <NewsSkeleton />
          ) : filteredFeed.length > 0 ? (
            <div key={filter} className="animate-swap">
              {featuredItem && <LeadStory item={featuredItem} />}

              {gridItems.length > 0 && (
                <ul className="mt-12 grid gap-x-8 gap-y-12 border-t border-line pt-12 md:grid-cols-2 xl:grid-cols-3">
                  {gridItems.map((item, index) => (
                    <StoryItem key={item.id} item={item} delayMs={Math.min(index, 8) * 50} />
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Newspaper}
              title={filter === 'birthday' ? 'No celebrations yet' : filter === 'announcement' ? 'No announcements yet' : 'No updates yet'}
              description="New posts from the VCLGC team appear here as soon as they are published."
            />
          )}
        </div>
      </Container>
    </>
  );
};

const FeedType = ({ isBirthday }) => {
  const Icon = isBirthday ? Cake : Megaphone;
  return (
    <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-accent">
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
      {isBirthday ? 'Celebration' : 'Announcement'}
    </span>
  );
};

const StoryImage = ({ item, className }) => {
  const [failed, setFailed] = useState(false);
  const imageUrl = getFileUrl(item.image_url);
  const isBirthday = item.feedType === 'birthday';

  if (!imageUrl || failed) {
    const Icon = isBirthday ? Cake : Newspaper;
    return (
      <div className={cn('flex items-center justify-center bg-deep text-canton-300', className)} aria-hidden="true">
        <Icon className="size-10" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('bg-tint object-cover transition-[scale] duration-500 ease-out-quart group-hover:scale-[1.03]', className)}
    />
  );
};

const LeadStory = ({ item }) => (
  <article className="group relative grid animate-rise gap-6 lg:grid-cols-12 lg:items-center lg:gap-12">
    <div className="overflow-hidden rounded-panel lg:col-span-7">
      <StoryImage item={item} className="aspect-[16/10] w-full" />
    </div>
    <div className="lg:col-span-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <FeedType isBirthday={item.feedType === 'birthday'} />
        <time dateTime={item.created_at} className="text-caption text-muted">{formatDate(item.created_at)}</time>
      </div>
      <h3 className="mt-3 font-display text-heading font-semibold text-balance text-ink sm:text-headline">
        <Link to={`/news/${item.id}`} className="rounded-doc after:absolute after:inset-0 group-hover:text-primary">
          {item.title}
        </Link>
      </h3>
      {item.subtitle && <p className="mt-3 text-lead text-muted">{item.subtitle}</p>}
      {buildExcerpt(item) && <p className="mt-4 text-body text-muted">{buildExcerpt(item)}</p>}
      <p className="mt-5 text-caption font-semibold text-primary underline decoration-primary/40 decoration-2 underline-offset-4">
        Read the full story
      </p>
    </div>
  </article>
);

const StoryItem = ({ item, delayMs }) => (
  <li className="group relative animate-rise" style={{ animationDelay: `${delayMs}ms` }}>
    <div className="overflow-hidden rounded-panel">
      <StoryImage item={item} className="aspect-[3/2] w-full" />
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
      <FeedType isBirthday={item.feedType === 'birthday'} />
      <time dateTime={item.created_at} className="text-caption text-muted">{formatDate(item.created_at)}</time>
    </div>
    <h3 className="mt-2 font-display text-title font-semibold text-ink">
      <Link to={`/news/${item.id}`} className="rounded-doc after:absolute after:inset-0 group-hover:text-primary">
        {item.title}
      </Link>
    </h3>
    {(item.subtitle || buildExcerpt(item)) && (
      <p className="mt-2 line-clamp-3 text-caption text-muted">{item.subtitle || buildExcerpt(item)}</p>
    )}
  </li>
);

const NewsSkeleton = () => (
  <div aria-hidden="true">
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
      <Skeleton className="aspect-[16/10] w-full rounded-panel lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
    <div className="mt-12 grid gap-8 border-t border-line pt-12 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="space-y-3">
          <Skeleton className="aspect-[3/2] w-full rounded-panel" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-4/5" />
        </div>
      ))}
    </div>
  </div>
);

export default News;
