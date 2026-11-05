import React from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { NavigationTab } from '../types';

interface HeroProps {
  onSelectTab: (tab: NavigationTab) => void;
  onScrollToOverall: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectTab, onScrollToOverall }) => {
  const { overallStandings, events, getHappeningNowEvent, currentPalakasan } = usePalakasan();
  const overallLeader = overallStandings.length > 0 ? overallStandings[0] : null;
  const liveEvent = getHappeningNowEvent();
  const completedCount = events.filter(e => e.status === 'completed').length;
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;

  return (
    <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-blue-50/80 via-white to-slate-50 border-b border-slate-200/90">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 mb-4 max-w-full">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide truncate">
              Unity • Excellence • Sportsmanship
            </span>
            <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0 hidden sm:inline-block" />
            <span className="text-xs font-medium text-blue-700 hidden sm:inline-block">
              {currentPalakasan ? currentPalakasan.name || `PALAKASAN ${currentPalakasan.year}` : 'MSUN Tournament'}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-2 break-words max-w-full">
            {currentPalakasan?.theme?.title ? (
              currentPalakasan.theme.title
            ) : (
              <>MSUN <span className="text-blue-600">PALAKASAN</span></>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl font-semibold text-slate-700 max-w-2xl mb-3 px-2">
            {currentPalakasan?.theme?.tagline || 'MSU at Naawan University-Wide Competition'}
          </p>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed mb-8 px-2">
            The official information portal for live tournament standings, category leaders,
            schedules, and certified match points across all four colleges.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 mb-10 w-full max-w-md sm:max-w-none">
            <button
              id="hero-view-overall-btn"
              onClick={onScrollToOverall}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-sm transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-white" />
              <span>View Overall Standing</span>
            </button>

            <button
              id="hero-view-schedule-btn"
              onClick={() => onSelectTab('schedule')}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 font-semibold text-sm sm:text-base border border-blue-300 shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>View Schedule</span>
            </button>
          </div>

          {/* Quick Tournament Snapshot Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-left shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Colleges
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">4 Colleges</div>
              <div className="text-[11px] text-slate-500 mt-0.5">CBIT • CESS-IDS • CFMS • CELS</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 text-left shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Pillars
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">4 Categories</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Sports • Cultural • Lit • Special</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 text-left shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Tournament Status
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {completedCount} <span className="text-xs font-normal text-slate-500">Done</span> / {upcomingCount} <span className="text-xs font-normal text-slate-500">Next</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                {liveEvent ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 1 Event Live Now
                  </span>
                ) : (
                  <span className="text-slate-500">Schedule Active</span>
                )}
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-left shadow-xs">
              <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Current Leader</span>
                <span className="text-xs">🥇</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-900">
                {overallLeader ? overallLeader.college.acronym : 'TBD'}
              </div>
              <div className="text-[11px] text-blue-700 mt-0.5 font-medium">
                {overallLeader ? `${overallLeader.overallPoints} Total Points` : 'Calculating'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
