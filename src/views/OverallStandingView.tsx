import React from 'react';
import { Trophy, ArrowUpRight, Lock } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CollegeId } from '../types';
import { getCollegeBadgeStyle } from '../utils/collegeTheme';
import { OverallStandingTable } from '../components/OverallStandingTable';

interface OverallStandingViewProps {
  onOpenCollegeModal: (collegeId: CollegeId) => void;
  onOpenEventModal: (eventId: string) => void;
}

export const OverallStandingView: React.FC<OverallStandingViewProps> = ({
  onOpenCollegeModal,
}) => {
  const { overallStandings, isRankingHidden, rankingsVisibility } = usePalakasan();
  const isHidden = isRankingHidden('overall');
  const leader = overallStandings[0];

  return (
    <div className="py-8 sm:py-10 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official University Leaderboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Overall Palakasan Standings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Live cumulative standings combining Sports, Cultural, Literary, and Special Events. Points are recalculated upon certified result submission.
          </p>
        </div>

        {/* Current Leader Callout Card or Thrill Mode Sealed Callout */}
        {isHidden ? (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg border border-amber-300">
              <Lock className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <span>Final Day Thrill Mode</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900">Rankings Sealed</div>
              <div className="text-xs text-amber-800 font-medium">
                Revealed Live at Closing Ceremonies
              </div>
            </div>
          </div>
        ) : leader ? (
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-white text-blue-800 flex items-center justify-center font-bold text-lg border border-blue-200">
              🥇
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Current #1 Leader
              </div>
              <div className="text-xl font-bold text-slate-900">{leader.college.acronym}</div>
              <div className="text-xs text-blue-800 font-semibold">
                {leader.overallPoints} Total Accumulated Points
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Main Scoreboard Table */}
      <OverallStandingTable onOpenCollegeModal={onOpenCollegeModal} showSubtitle={false} />

      {/* College Comparison Cards (4 Colleges in detail) */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">College Division Breakdown</h2>
          <p className="text-xs text-slate-500">
            {isHidden
              ? 'Individual college scores and standings are sealed by the committee for final day anticipation.'
              : 'Click any card to inspect full score history and certified point log.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overallStandings.map(item => {
            const college = item.college;
            const style = getCollegeBadgeStyle(college.id);

            return (
              <div
                key={college.id}
                onClick={() => onOpenCollegeModal(college.id)}
                className="group cursor-pointer rounded-xl border border-slate-200 hover:border-blue-300 bg-white p-4 sm:p-5 shadow-xs transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs border shrink-0 ${style.badge}`}
                      >
                        {college.acronym}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {college.acronym}
                          </h3>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: style.hex }}
                            title={`${college.acronym} Color: ${style.colorName}`}
                          />
                          <span
                            className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: style.lightBg,
                              color: style.hex,
                            }}
                          >
                            {style.colorName}
                          </span>
                          <span className={`text-xs px-2 py-0.2 rounded font-semibold ${
                            isHidden
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {isHidden ? (
                              <>
                                <Lock className="w-2.5 h-2.5" />
                                <span>Rank Sealed</span>
                              </>
                            ) : (
                              `Rank #${item.rank}`
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 truncate">{college.name}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isHidden ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>Sealed</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono">
                            {item.overallPoints}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Pts</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 4 Pillars Breakdown Grid */}
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-blue-700 font-semibold uppercase">Sports</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
                        {isHidden ? '—' : item.sports}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-blue-700 font-semibold uppercase">Cultural</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
                        {isHidden ? '—' : item.cultural}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-blue-700 font-semibold uppercase">Literary</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
                        {isHidden ? '—' : item.literary}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-blue-700 font-semibold uppercase">Special</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
                        {isHidden ? '—' : item.special}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="italic font-medium text-slate-600">{college.moniker || college.mascot}</span>
                  <span className="font-semibold text-blue-700 flex items-center gap-1 group-hover:underline">
                    View Point Audit <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
