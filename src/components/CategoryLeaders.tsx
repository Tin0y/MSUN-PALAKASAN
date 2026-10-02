import React from 'react';
import { Award, Sparkles, BookOpen, Flame, ChevronRight, Trophy, Lock } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CategoryId, NavigationTab } from '../types';

interface CategoryLeadersProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenCollegeModal: (collegeId: any) => void;
}

export const CategoryLeaders: React.FC<CategoryLeadersProps> = ({
  onSelectTab,
  onOpenCollegeModal,
}) => {
  const { getCategoryLeader, isRankingHidden } = usePalakasan();

  const leaderCards: {
    id: CategoryId;
    tab: NavigationTab;
    title: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'sports',
      tab: 'sports',
      title: 'Sports Leader',
      icon: <Award className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'cultural',
      tab: 'cultural',
      title: 'Cultural Leader',
      icon: <Sparkles className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'literary',
      tab: 'literary',
      title: 'Literary Leader',
      icon: <BookOpen className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'special',
      tab: 'special',
      title: 'Special Events Leader',
      icon: <Flame className="w-4 h-4 text-blue-600" />,
    },
  ];

  return (
    <section className="py-8 sm:py-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Category Champions</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Official Category Leaders
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Updated in real time based on certified tournament results
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaderCards.map(item => {
            const leader = getCategoryLeader(item.id);
            const college = leader?.college;
            const points = leader?.points ?? 0;

            return (
              <div
                key={item.id}
                id={`card-leader-${item.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line indicator */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      Top
                    </span>
                  </div>

                  {/* Leader College info */}
                  {isRankingHidden(item.id) ? (
                    <div className="my-2 py-2">
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Sealed for Reveal</span>
                        </div>
                        <div className="text-[11px] text-amber-800">
                          Final standings kept confidential for Closing Ceremonies
                        </div>
                      </div>
                    </div>
                  ) : college ? (
                    <div className="my-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <button
                          onClick={() => onOpenCollegeModal(college.id)}
                          className="text-left font-extrabold text-2xl tracking-tight text-slate-900 hover:text-blue-600 transition-colors"
                          title="Click to view points history"
                        >
                          {college.acronym}
                        </button>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          🥇 1st
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {college.name}
                      </div>

                      {/* Points count */}
                      <div className="pt-3">
                        <div className="text-2xl font-bold text-blue-900 tracking-tight flex items-baseline gap-1">
                          <span>{points}</span>
                          <span className="text-xs font-semibold text-slate-500">Points</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-5 text-center text-slate-400 text-xs">
                      No results recorded yet
                    </div>
                  )}
                </div>

                {/* View Category Standing Button */}
                <div className="pt-3 mt-2 border-t border-slate-100">
                  <button
                    id={`btn-view-${item.id}-standing`}
                    onClick={() => onSelectTab(item.tab)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-semibold transition-colors"
                  >
                    <span>View {item.id.charAt(0).toUpperCase() + item.id.slice(1)}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
