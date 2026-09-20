import React from 'react';
import { Trophy, ArrowUpRight, Award, Sparkles, BookOpen, Flame } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CollegeId } from '../types';
import { getCollegeBadgeStyle } from '../utils/collegeTheme';

interface OverallStandingTableProps {
  onOpenCollegeModal: (collegeId: CollegeId) => void;
  showSubtitle?: boolean;
}

export const OverallStandingTable: React.FC<OverallStandingTableProps> = ({
  onOpenCollegeModal,
  showSubtitle = true,
}) => {
  const { overallStandings } = usePalakasan();

  const getRankBadge = (rank: number, isTie?: boolean) => {
    switch (rank) {
      case 1:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
            🥇 {isTie && <span className="text-[10px] ml-0.5">T</span>}
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
            🥈 {isTie && <span className="text-[10px] ml-0.5">T</span>}
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100/60 text-amber-900 font-bold text-xs border border-amber-200">
            🥉 {isTie && <span className="text-[10px] ml-0.5">T</span>}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-slate-600 font-semibold text-xs border border-slate-200">
            {rank}
            {isTie && <span className="text-[10px] ml-0.5">T</span>}
          </span>
        );
    }
  };

  const maxPoints = Math.max(...overallStandings.map(s => s.overallPoints), 1);

  return (
    <section id="overall-standing-section" className="py-8 sm:py-10 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official Tournament Standings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Overall Palakasan Standings
            </h2>
            {showSubtitle && (
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Cumulative certified points across Sports, Cultural, Literary, and Special Events. Click any college to view full score audit.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/80">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Formula: Sports + Cultural + Literary + Special</span>
          </div>
        </div>

        {/* Standings Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-blue-50/70 text-[11px] font-bold uppercase tracking-wider text-blue-900">
                <th className="py-3 px-4 sm:px-6 text-center w-16">Rank</th>
                <th className="py-3 px-4 sm:px-6">Participating College</th>
                <th className="py-3 px-3 sm:px-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-800">
                    <Award className="w-3.5 h-3.5" />
                    <span>Sports</span>
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cultural</span>
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-800">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Literary</span>
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-800">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Special</span>
                  </div>
                </th>
                <th className="py-3 px-4 sm:px-6 text-right">
                  <div className="flex items-center justify-end gap-1 text-blue-900 font-extrabold">
                    <Trophy className="w-3.5 h-3.5 text-blue-600" />
                    <span>Total Points</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {overallStandings.map((item) => {
                const college = item.college;
                const badgeStyle = getCollegeBadgeStyle(college.acronym);
                const isFirst = item.rank === 1;

                return (
                  <tr
                    key={college.id}
                    id={`overall-row-${college.acronym}`}
                    onClick={() => onOpenCollegeModal(college.id)}
                    className={`group cursor-pointer transition-colors ${
                      isFirst
                        ? 'bg-blue-50/40 hover:bg-blue-50/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadge(item.rank, item.isTie)}
                      </div>
                    </td>

                    {/* College Details */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {college.acronym.substring(0, 4)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                              {college.acronym}
                            </span>
                            <span className="text-[11px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {college.moniker || college.mascot}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-normal line-clamp-1 max-w-xs sm:max-w-md">
                            {college.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sports Points */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs sm:text-sm">
                        {item.sports}
                      </span>
                    </td>

                    {/* Cultural Points */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs sm:text-sm">
                        {item.cultural}
                      </span>
                    </td>

                    {/* Literary Points */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs sm:text-sm">
                        {item.literary}
                      </span>
                    </td>

                    {/* Special Events Points */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs sm:text-sm">
                        {item.special}
                      </span>
                    </td>

                    {/* Overall Total Points */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex flex-col items-end">
                        <div className="text-lg sm:text-xl font-bold text-blue-900 tracking-tight flex items-baseline gap-1">
                          <span>{item.overallPoints}</span>
                          <span className="text-[10px] text-slate-500 font-medium uppercase">pts</span>
                        </div>
                        {/* Progress Bar proportional to top score */}
                        <div className="w-20 sm:w-28 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFirst ? 'bg-blue-600' : 'bg-blue-400'
                            }`}
                            style={{
                              width: `${Math.max((item.overallPoints / maxPoints) * 100, 5)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Drill-down arrow */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        title="View complete point audit history"
                        className="p-1 rounded text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info note */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 px-1 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-blue-700 font-semibold">Scoring standard:</span>
            <span>1st = 50 pts • 2nd = 40 pts • 3rd = 30 pts • 4th = 20 pts • DQ = 0 pts</span>
          </div>
          <span className="text-slate-500">
            Click any row to review complete breakdown.
          </span>
        </div>
      </div>
    </section>
  );
};
