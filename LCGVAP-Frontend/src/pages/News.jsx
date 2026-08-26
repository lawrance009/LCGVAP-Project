import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Cake,
  CalendarDays,
  ImageIcon,
  Megaphone,
  Newspaper,
  SearchX,
} from 'lucide-react';
import api from '../services/api';
import getFileUrl from '../utils/getFileUrl';
import { BRAND } from '../constants/branding';

const MotionDiv = motion.div;
const MotionArticle = motion.article;

const filters = [
  { id: 'all', label: 'All Updates' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'birthday', label: 'Celebrations' },
];

const getFeedType = (item) => (item.type === 'birthday' || item.is_birthday ? 'birthday' : 'announcement');

const formatDate = (date) => {
  if (!date) return 'Date pending';

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
  return `${content.slice(0, 150).trim()}...`;
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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-[#0b1020] text-white">
        <img
          src="https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1920&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#0b1020]/75" aria-hidden="true"></div>
        <div className="absolute inset-x-0 top-0 grid h-1 grid-cols-3" aria-hidden="true">
          <div className="bg-red-600"></div>
          <div className="bg-white"></div>
          <div className="bg-indigo-600"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <MotionDiv
            className="max-w-4xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold uppercase text-red-200 backdrop-blur">
              <Newspaper className="h-4 w-4" aria-hidden="true" />
              Community Newsroom
            </div>

            <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              News, Announcements, And Alumni Moments
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Follow official updates from {BRAND.shortName}, community announcements, and verified alumni celebrations
              in one organized public feed.
            </p>
          </MotionDiv>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase text-indigo-700">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Official Feed
            </div>
            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              {loading ? 'Loading community updates...' : `${filteredFeed.length.toLocaleString()} update${filteredFeed.length === 1 ? '' : 's'}`}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-xs font-bold transition-colors ${
                  filter === item.id
                    ? 'bg-slate-950 text-white'
                    : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'
                }`}
              >
                {item.label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                  filter === item.id ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                }`}
                >
                  {counts[item.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <NewsSkeleton />
        ) : filteredFeed.length > 0 ? (
          <AnimatePresence mode="wait">
            <MotionDiv
              key={filter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {featuredItem && <FeaturedNewsCard item={featuredItem} />}

              {gridItems.length > 0 && (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {gridItems.map((item, index) => (
                    <NewsCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              )}
            </MotionDiv>
          </AnimatePresence>
        ) : (
          <EmptyState filter={filter} />
        )}
      </section>
    </div>
  );
};

const FeaturedNewsCard = ({ item }) => {
  const isBirthday = item.feedType === 'birthday';
  const imageUrl = getFileUrl(item.image_url);

  return (
    <MotionArticle
      className="grid overflow-hidden rounded-md bg-white shadow-sm shadow-slate-950/5 lg:grid-cols-[1.05fr_0.95fr]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="relative min-h-[260px] overflow-hidden bg-slate-950 sm:min-h-[340px] lg:min-h-[420px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <FallbackVisual isBirthday={isBirthday} />
        )}
        <div className="absolute left-4 top-4">
          <FeedBadge isBirthday={isBirthday} />
        </div>
      </div>

      <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
          <CalendarDays className="h-4 w-4 text-red-600" aria-hidden="true" />
          {formatDate(item.created_at)}
        </div>

        <h3 className="text-2xl font-black leading-tight text-slate-950 sm:text-4xl">
          {item.title}
        </h3>

        {item.subtitle && (
          <p className="mt-4 text-sm font-bold leading-6 text-indigo-700 sm:text-base">
            {item.subtitle}
          </p>
        )}

        <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
          {buildExcerpt(item)}
        </p>

        {!isBirthday && (
          <Link
            to={`/news/${item.id}`}
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-bold text-white transition-colors hover:bg-indigo-800 sm:w-fit"
          >
            Read Full Story
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </MotionArticle>
  );
};

const NewsCard = ({ item, index }) => {
  const isBirthday = item.feedType === 'birthday';
  const imageUrl = getFileUrl(item.image_url);

  return (
    <MotionArticle
      className="group flex min-h-[420px] flex-col overflow-hidden rounded-md bg-white shadow-sm shadow-slate-950/5 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-950/10"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.42, delay: index * 0.04 }}
    >
      <div className="relative h-56 overflow-hidden bg-slate-950">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <FallbackVisual isBirthday={isBirthday} />
        )}
        <div className="absolute left-3 top-3">
          <FeedBadge isBirthday={isBirthday} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
          <CalendarDays className="h-4 w-4 text-red-600" aria-hidden="true" />
          {formatDate(item.created_at)}
        </div>

        <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-950">
          {item.title}
        </h3>

        {item.subtitle && (
          <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-indigo-700">
            {item.subtitle}
          </p>
        )}

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {buildExcerpt(item)}
        </p>

        {!isBirthday && (
          <div className="mt-auto pt-5">
            <Link
              to={`/news/${item.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-950 hover:text-white"
            >
              Read Story
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </MotionArticle>
  );
};

const FeedBadge = ({ isBirthday }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase text-white shadow-sm ${
      isBirthday ? 'bg-red-600' : 'bg-indigo-700'
    }`}
  >
    {isBirthday ? (
      <Cake className="h-4 w-4" aria-hidden="true" />
    ) : (
      <Megaphone className="h-4 w-4" aria-hidden="true" />
    )}
    {isBirthday ? 'Celebration' : 'Announcement'}
  </span>
);

const FallbackVisual = ({ isBirthday }) => (
  <div className={`flex h-full w-full items-center justify-center ${isBirthday ? 'bg-red-700' : 'bg-indigo-800'}`}>
    <div className="flex h-20 w-20 items-center justify-center rounded-md bg-white/10 text-white">
      {isBirthday ? (
        <Cake className="h-10 w-10" aria-hidden="true" />
      ) : (
        <ImageIcon className="h-10 w-10" aria-hidden="true" />
      )}
    </div>
  </div>
);

const NewsSkeleton = () => (
  <div>
    <div className="grid overflow-hidden rounded-md bg-white shadow-sm shadow-slate-950/5 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="min-h-[260px] animate-pulse bg-slate-200 sm:min-h-[340px] lg:min-h-[420px]"></div>
      <div className="space-y-4 p-5 sm:p-8 lg:p-10">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200"></div>
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200"></div>
        <div className="h-4 w-full animate-pulse rounded bg-slate-100"></div>
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100"></div>
        <div className="h-12 w-36 animate-pulse rounded-md bg-slate-200"></div>
      </div>
    </div>

    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="overflow-hidden rounded-md bg-white shadow-sm shadow-slate-950/5">
          <div className="h-56 animate-pulse bg-slate-200"></div>
          <div className="space-y-4 p-5">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200"></div>
            <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200"></div>
            <div className="h-4 w-full animate-pulse rounded bg-slate-100"></div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ filter }) => (
  <div className="rounded-md bg-white px-5 py-14 text-center shadow-sm sm:px-8">
    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
      <SearchX className="h-6 w-6" aria-hidden="true" />
    </div>
    <h2 className="text-2xl font-black text-slate-950">No updates found.</h2>
    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
      {filter === 'all'
        ? 'There are no public news updates yet.'
        : 'There are no updates in this category right now.'}
    </p>
  </div>
);

export default News;
