import { createElement, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  BadgeCheck,
  CalendarDays,
  History,
  ImageIcon,
  Landmark,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import api from '../services/api';
import getFileUrl from '../utils/getFileUrl';
import { BRAND } from '../constants/branding';

const MotionDiv = motion.div;
const MotionArticle = motion.article;

const tabs = [
  { id: 'current', label: 'Current Committee' },
  { id: 'past', label: 'Leadership Archive' },
];

const formatYear = (date) => {
  if (!date) return 'Present';
  const year = new Date(date).getFullYear();
  return Number.isNaN(year) ? 'Present' : year;
};

const formatServiceRange = (leader) => {
  const startYear = formatYear(leader.start_date);
  const endYear = leader.end_date ? formatYear(leader.end_date) : 'Present';
  return `${startYear} - ${endYear}`;
};

const getLeaderInitials = (name = '') => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase() || 'LC';

const Leadership = () => {
  const [leaders, setLeaders] = useState({ current: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);

      try {
        const response = await api.get('/leaders');
        setLeaders({
          current: Array.isArray(response.data?.current) ? response.data.current : [],
          past: Array.isArray(response.data?.past) ? response.data.past : [],
        });
      } catch (error) {
        console.error('Error fetching leaders:', error);
        setLeaders({ current: [], past: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  const currentLeaders = leaders.current;
  const pastLeaders = leaders.past;
  const featuredLeader = currentLeaders[0];
  const supportingLeaders = currentLeaders.slice(1);

  const snapshotItems = useMemo(() => [
    {
      label: 'Current Leaders',
      value: currentLeaders.length,
      icon: UsersRound,
      tone: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Archived Leaders',
      value: pastLeaders.length,
      icon: Archive,
      tone: 'bg-red-50 text-red-700',
    },
    {
      label: 'Governance Focus',
      value: 'Service',
      icon: ShieldCheck,
      tone: 'bg-sky-50 text-sky-700',
    },
  ], [currentLeaders.length, pastLeaders.length]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-[#0b1020] text-white">
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=80"
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
              <Landmark className="h-4 w-4" aria-hidden="true" />
              Leadership
            </div>

            <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Leadership Stewarding The {BRAND.shortName} Community
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Meet the leaders guiding alumni recognition, verification standards, and the shared legacy of
              Liberian graduates from Cyprus.
            </p>
          </MotionDiv>
        </div>
      </section>

      <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 rounded-md bg-white p-4 shadow-xl shadow-slate-950/10 sm:grid-cols-3 sm:p-5">
          {snapshotItems.map((item, index) => (
            <SnapshotItem key={item.label} item={item} index={index} />
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase text-indigo-700">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Leadership Records
            </div>
            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              {activeTab === 'current' ? 'Current Executive Committee' : 'Leadership Archive'}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-md bg-white p-1 shadow-sm sm:grid-cols-2">
            {tabs.map((tab) => {
              const count = tab.id === 'current' ? currentLeaders.length : pastLeaders.length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-xs font-bold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                    activeTab === tab.id ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <LeadershipSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'current' ? (
              <MotionDiv
                key="current"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {currentLeaders.length > 0 ? (
                  <>
                    {featuredLeader && <FeaturedLeaderCard leader={featuredLeader} />}

                    {supportingLeaders.length > 0 && (
                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {supportingLeaders.map((leader, index) => (
                          <LeaderCard key={leader.id} leader={leader} index={index} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="Current leadership team to be announced."
                    text="Once the committee is published by the admin team, it will appear here."
                  />
                )}
              </MotionDiv>
            ) : (
              <MotionDiv
                key="past"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {pastLeaders.length > 0 ? (
                  <div className="space-y-4">
                    {pastLeaders.map((leader, index) => (
                      <ArchiveLeaderRow key={leader.id} leader={leader} index={index} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No archived leadership records yet."
                    text="Past service records will appear here once they are added."
                  />
                )}
              </MotionDiv>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

const SnapshotItem = ({ item, index }) => (
  <MotionDiv
    className="flex items-center gap-4 rounded-md bg-slate-50 p-4"
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
  >
    <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md ${item.tone}`}>
      {createElement(item.icon, {
        className: 'h-5 w-5',
        'aria-hidden': 'true',
      })}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-black text-slate-950">{item.value}</p>
      <p className="truncate text-xs font-bold uppercase text-slate-500">{item.label}</p>
    </div>
  </MotionDiv>
);

const FeaturedLeaderCard = ({ leader }) => {
  const imageUrl = getFileUrl(leader.image_url);

  return (
    <MotionArticle
      className="grid overflow-hidden rounded-md bg-white shadow-sm shadow-slate-950/5 lg:grid-cols-[0.92fr_1.08fr]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <LeaderImage
        imageUrl={imageUrl}
        name={leader.name}
        className="min-h-[320px] lg:min-h-[460px]"
        initialsClassName="h-24 w-24 text-3xl"
      />

      <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
        <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-xs font-black uppercase text-indigo-700">
          <ShieldCheck className="h-4 w-4 text-red-600" aria-hidden="true" />
          Current Committee
        </div>

        <h3 className="text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
          {leader.name}
        </h3>
        <p className="mt-3 text-base font-black uppercase text-indigo-700">
          {leader.position}
        </p>

        {leader.bio && (
          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
            {leader.bio}
          </p>
        )}

        <div className="mt-7 flex items-center gap-3 text-sm font-bold text-slate-500">
          <CalendarDays className="h-4 w-4 text-red-600" aria-hidden="true" />
          Serving {formatServiceRange(leader)}
        </div>
      </div>
    </MotionArticle>
  );
};

const LeaderCard = ({ leader, index }) => {
  const imageUrl = getFileUrl(leader.image_url);

  return (
    <MotionArticle
      className="group flex min-h-[420px] flex-col overflow-hidden rounded-md bg-white shadow-sm shadow-slate-950/5 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-950/10"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.42, delay: index * 0.04 }}
    >
      <LeaderImage
        imageUrl={imageUrl}
        name={leader.name}
        className="h-64"
        initialsClassName="h-20 w-20 text-2xl"
      />

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-xs font-black uppercase text-red-700">Current Leader</p>
        <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-950">
          {leader.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-indigo-700">
          {leader.position}
        </p>
        {leader.bio && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
            {leader.bio}
          </p>
        )}
        <div className="mt-auto pt-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
            <CalendarDays className="h-4 w-4 text-red-600" aria-hidden="true" />
            {formatServiceRange(leader)}
          </div>
        </div>
      </div>
    </MotionArticle>
  );
};

const ArchiveLeaderRow = ({ leader, index }) => {
  const imageUrl = getFileUrl(leader.image_url);

  return (
    <MotionArticle
      className="grid gap-4 rounded-md bg-white p-4 shadow-sm shadow-slate-950/5 sm:grid-cols-[104px_1fr] sm:items-center sm:p-5"
      initial={{ opacity: 0, x: 18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.42, delay: index * 0.04 }}
    >
      <LeaderImage
        imageUrl={imageUrl}
        name={leader.name}
        className="h-24 sm:h-28"
        initialsClassName="h-14 w-14 text-base"
      />

      <div className="min-w-0">
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase text-slate-500">
          <History className="h-4 w-4 text-indigo-700" aria-hidden="true" />
          {formatServiceRange(leader)}
        </div>
        <h3 className="text-xl font-black leading-tight text-slate-950">
          {leader.name}
        </h3>
        <p className="mt-1 text-sm font-bold uppercase text-indigo-700">
          {leader.position}
        </p>
        {leader.bio && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
            {leader.bio}
          </p>
        )}
      </div>
    </MotionArticle>
  );
};

const LeaderImage = ({
  imageUrl,
  name,
  className,
  initialsClassName,
}) => (
  <div className={`relative overflow-hidden bg-indigo-800 ${className}`}>
    {imageUrl ? (
      <img
        src={imageUrl}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-indigo-800 text-white">
        <div className={`flex items-center justify-center rounded-md bg-white/10 font-black ${initialsClassName}`}>
          {getLeaderInitials(name)}
        </div>
      </div>
    )}
  </div>
);

const LeadershipSkeleton = () => (
  <div>
    <div className="grid overflow-hidden rounded-md bg-white shadow-sm shadow-slate-950/5 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="min-h-[320px] animate-pulse bg-slate-200 lg:min-h-[460px]"></div>
      <div className="space-y-4 p-5 sm:p-8 lg:p-10">
        <div className="h-8 w-36 animate-pulse rounded-md bg-slate-200"></div>
        <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200"></div>
        <div className="h-4 w-44 animate-pulse rounded bg-slate-100"></div>
        <div className="h-4 w-full animate-pulse rounded bg-slate-100"></div>
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100"></div>
      </div>
    </div>

    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="overflow-hidden rounded-md bg-white shadow-sm shadow-slate-950/5">
          <div className="h-64 animate-pulse bg-slate-200"></div>
          <div className="space-y-4 p-5">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100"></div>
            <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200"></div>
            <div className="h-4 w-full animate-pulse rounded bg-slate-100"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ title, text }) => (
  <div className="rounded-md bg-white px-5 py-14 text-center shadow-sm sm:px-8">
    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
      <ImageIcon className="h-6 w-6" aria-hidden="true" />
    </div>
    <h2 className="text-2xl font-black text-slate-950">{title}</h2>
    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
      {text}
    </p>
  </div>
);

export default Leadership;
