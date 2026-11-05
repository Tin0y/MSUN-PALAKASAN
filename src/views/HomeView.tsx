import React from 'react';
import { Hero } from '../components/Hero';
import { CategoryLeaders } from '../components/CategoryLeaders';
import { OverallStandingTable } from '../components/OverallStandingTable';
import { HappeningNow } from '../components/HappeningNow';
import { UpcomingActivities } from '../components/UpcomingActivities';
import { RecentResults } from '../components/RecentResults';
import { CollegeId, NavigationTab } from '../types';
import { ChevronRight, Lock } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { getCollegeBadgeStyle } from '../utils/collegeTheme';

interface HomeViewProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenCollegeModal: (collegeId: CollegeId) => void;
  onOpenEventModal: (eventId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  onOpenCollegeModal,
  onOpenEventModal,
}) => {
  const { getCategoryStandings, isRankingHidden } = usePalakasan();

  const handleScrollToOverall = () => {
    const el = document.getElementById('overall-standing-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-0">
      {/* 1. HERO SECTION */}
      <Hero onSelectTab={onSelectTab} onScrollToOverall={handleScrollToOverall} />

      {/* 2. CATEGORY LEADERS (Dynamic Cards) */}
      <CategoryLeaders onSelectTab={onSelectTab} onOpenCollegeModal={onOpenCollegeModal} />

      {/* 3. OVERALL PALAKASAN STANDING (Table & Breakdown) */}
      <OverallStandingTable onOpenCollegeModal={onOpenCollegeModal} />

      {/* 4. HAPPENING NOW */}
      <HappeningNow
        onOpenEventModal={onOpenEventModal}
        onOpenCollegeModal={onOpenCollegeModal}
      />

      {/* 5. NEXT ACTIVITIES */}
      <UpcomingActivities
        onOpenEventModal={onOpenEventModal}
        onOpenCollegeModal={onOpenCollegeModal}
        onSelectTab={onSelectTab}
        maxItems={6}
      />

      {/* 6. RECENT RESULTS */}
      <RecentResults
        onOpenEventModal={onOpenEventModal}
        onOpenCollegeModal={onOpenCollegeModal}
        onSelectTab={onSelectTab}
        maxItems={4}
      />

      {/* 7. QUICK CATEGORY HUBS SECTION */}
      <section className="py-10 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                Category Hubs
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Explore Category Divisions
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              In-depth view of individual division results and point breakdowns
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'sports' as const, name: 'Sports Division', icon: '🏅', tab: 'sports' as const, desc: 'Basketball, Volleyball, Athletics, Badminton & more' },
              { id: 'cultural' as const, name: 'Cultural Division', icon: '🎭', tab: 'cultural' as const, desc: 'Hiphop, Folk Dance, Vocal Solo & Musical Showdown' },
              { id: 'literary' as const, name: 'Literary Division', icon: '📚', tab: 'literary' as const, desc: 'Balak Performance, Debate, Extemp & Essay Writing' },
              { id: 'special' as const, name: 'Special Events', icon: '⭐', tab: 'special' as const, desc: 'Tough Model, Pageantry & Campus Spectacles' },
            ].map(cat => {
              const isCatHidden = isRankingHidden(cat.id);
              const standings = getCategoryStandings(cat.id);
              const leader = standings[0];
              const badge = leader ? getCollegeBadgeStyle(leader.college.acronym) : null;

              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectTab(cat.tab)}
                  className="group cursor-pointer rounded-xl border border-slate-200 hover:border-blue-300 bg-white p-5 shadow-xs transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-2xl">{cat.icon}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      {isCatHidden ? 'Standings:' : 'Leader:'}
                    </span>
                    {isCatHidden ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>Sealed for Reveal</span>
                      </span>
                    ) : leader ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badge?.bg} ${badge?.text} ${badge?.border}`}>
                        {leader.college.acronym} ({leader.points} pts)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">TBD</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
