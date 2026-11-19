import { useEffect, useRef, useState } from 'react';
import { UsersRound } from 'lucide-react';
import api from '../services/api';
import { BRAND } from '../constants/branding';
import PageHero from '../components/PageHero';
import { Container, EmptyState, Skeleton, cn } from '../components/ui';
import { FeaturedLeader, LeaderItem, PastLeaderRow } from './leadership/LeaderViews';

const tabs = [
  { id: 'current', label: 'Current committee' },
  { id: 'past', label: 'Past leaders' },
];

const Leadership = () => {
  const [leaders, setLeaders] = useState({ current: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const tabRefs = useRef({});

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

  // WAI tabs pattern: arrow keys move between tabs.
  const handleTabKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    const nextIndex =
      event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    const next = tabs[nextIndex].id;
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <PageHero
        title="Leadership"
        lead={`The committee that runs ${BRAND.shortName}: verification standards, alumni recognition and the community's shared record.`}
      />

      <Container as="section" aria-label="Leadership records" className="py-10 lg:py-14">
        <div role="tablist" aria-label="Leadership" className="flex gap-6 border-b border-line" onKeyDown={handleTabKeyDown}>
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            const count = tab.id === 'current' ? currentLeaders.length : pastLeaders.length;
            return (
              <button
                key={tab.id}
                ref={(node) => { tabRefs.current[tab.id] = node; }}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative -mb-px inline-flex h-12 items-center gap-2 rounded-doc border-b-2 text-body font-semibold transition-colors duration-150',
                  selected ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
                )}
              >
                {tab.label}
                {!loading && <span className="text-caption text-faint tabular-nums">{count}</span>}
              </button>
            );
          })}
        </div>

        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="mt-10 rounded-doc"
          aria-busy={loading || undefined}
        >
          {loading ? (
            <LeadershipSkeleton />
          ) : activeTab === 'current' ? (
            currentLeaders.length > 0 ? (
              <div key="current" className="animate-swap">
                {featuredLeader && <FeaturedLeader leader={featuredLeader} />}
                {supportingLeaders.length > 0 && (
                  <ul className="mt-14 grid gap-x-8 gap-y-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-3">
                    {supportingLeaders.map((leader, index) => (
                      <LeaderItem key={leader.id} leader={leader} delayMs={Math.min(index, 8) * 60} />
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <EmptyState
                icon={UsersRound}
                title="The current committee has not been published yet"
                description="It appears here as soon as the VCLGC team adds it."
              />
            )
          ) : pastLeaders.length > 0 ? (
            <ul key="past" className="animate-swap border-t border-line">
              {pastLeaders.map((leader, index) => (
                <PastLeaderRow key={leader.id} leader={leader} delayMs={Math.min(index, 10) * 40} />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={UsersRound}
              title="No past leaders recorded yet"
              description="Earlier committees appear here once their service records are added."
            />
          )}
        </div>
      </Container>
    </>
  );
};

const LeadershipSkeleton = () => (
  <div aria-hidden="true">
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <Skeleton className="aspect-[4/5] w-full max-w-sm rounded-panel lg:col-span-5" />
      <div className="space-y-4 lg:col-span-7">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-20 w-full" />
      </div>
    </div>
  </div>
);

export default Leadership;
