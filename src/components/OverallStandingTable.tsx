import React from 'react';
import {
  Trophy,
  ArrowUpRight,
  Award,
  Sparkles,
  BookOpen,
  Flame,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
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
  const {
    overallStandings,
    colleges,
    isRankingHidden,
    rankingsVisibility,
    isAdminLoggedIn,
    adminSpectatorPreview,
    setAdminSpectatorPreview,
  } = usePalakasan();

  const isHidden = isRankingHidden('overall');

  const getRankBadge = (rank: number, isTie?: boolean) => {
    switch (rank) {
      case 1:
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 shadow-2xs">
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

  return (
    <section id="overall-standing-section" className="py-8 sm:py-10 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Preview Switch if Rankings are sealed */}
        {isAdminLoggedIn && (rankingsVisibility.hideAllRankings || rankingsVisibility.hideOverallStandings) && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                <Lock className="w-3 h-3 text-amber-800" />
                <span>Thrill Mode Active</span>
              </span>
              <span className="text-amber-800">
                Overall rankings are currently <strong>sealed from public spectators</strong> for final day suspense.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAdminSpectatorPreview(!adminSpectatorPreview)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold transition-colors cursor-pointer"
            >
              {adminSpectatorPreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{adminSpectatorPreview ? 'Switch to Committee Live View' : 'Preview Public Sealed Screen'}</span>
            </button>
          </div>
        )}

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
                Cumulative certified championship points across Sports, Cultural, Literary, and Special Events. Click any college to view full score breakdown.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/80">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <span>Formula: Sports + Cultural + Literary + Special</span>
          </div>
        </div>

        {/* Final Day Thrill Mode Curtain / Sealed Rankings View */}
        {isHidden ? (
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 p-6 sm:p-10 text-center shadow-xs space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-sm animate-pulse">
              <Lock className="w-8 h-8 text-amber-700" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <Trophy className="w-3.5 h-3.5 text-amber-700" />
                <span>Final Day Thrill Mode • Standings Sealed</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Championship Standings Sealed
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {rankingsVisibility.thrillMessage ||
                  'In anticipation of the Grand Awarding and Closing Ceremony, tournament standings have been sealed! Grand Winners and Champions will be unveiled live.'}
              </p>
            </div>

            {/* Contender Cards with Sealed mystery scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
              {colleges.map((c) => {
                const style = getCollegeBadgeStyle(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => onOpenCollegeModal(c.id)}
                    className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs text-center space-y-2 cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center font-extrabold text-xs border ${style.bg} ${style.text} ${style.border}`}
                    >
                      {c.acronym}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{style.colorName} Team</div>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Sealed for Reveal</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              ✨ Stay tuned to the live TSAC Closing Ceremony to celebrate the Overall University Champion!
            </div>
          </div>
        ) : (
          <>
            {/* Mobile-Friendly Cards View (Prevents overlapping on small screens) */}
            <div className="block sm:hidden space-y-3 mb-4">
              {overallStandings.map((item) => {
                const college = item.college;
                const badgeStyle = getCollegeBadgeStyle(college.id);
                const isFirst = item.rank === 1;

                return (
                  <div
                    key={college.id}
                    onClick={() => onOpenCollegeModal(college.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-2xs ${
                      isFirst ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Header Row: Rank, College, Total */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getRankBadge(item.rank, item.isTie)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-base text-slate-900 truncate">
                              {college.acronym}
                            </span>
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: badgeStyle.hex }}
                              title={`${college.acronym} Color: ${badgeStyle.colorName}`}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {college.name}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl font-black text-blue-900 font-mono">
                          {item.overallPoints}
                          <span className="text-[10px] font-sans font-medium text-slate-500 ml-0.5">pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Categories Grid */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs pt-1.5 border-t border-slate-100">
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-slate-400 block text-[10px] font-bold">Sports</span>
                        <span className="font-bold text-slate-800 font-mono">{item.sports}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-slate-400 block text-[10px] font-bold">Cultural</span>
                        <span className="font-bold text-slate-800 font-mono">{item.cultural}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-slate-400 block text-[10px] font-bold">Literary</span>
                        <span className="font-bold text-slate-800 font-mono">{item.literary}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-slate-400 block text-[10px] font-bold">Special</span>
                        <span className="font-bold text-slate-800 font-mono">{item.special}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop & Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full min-w-[650px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-blue-50/70 text-[11px] font-bold uppercase tracking-wider text-blue-900">
                    <th className="py-3 px-4 sm:px-6 text-center w-16">Rank</th>
                    <th className="py-3 px-4 sm:px-6">Participating College & Color</th>
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
                    const badgeStyle = getCollegeBadgeStyle(college.id);
                    const isFirst = item.rank === 1;

                    return (
                      <tr
                        key={college.id}
                        onClick={() => onOpenCollegeModal(college.id)}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          isFirst ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          {getRankBadge(item.rank, item.isTie)}
                        </td>

                        {/* College Info */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${badgeStyle.badge}`}
                            >
                              {college.acronym}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                                  {college.acronym}
                                </span>
                                <span
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.2 rounded-full border shrink-0"
                                  style={{
                                    backgroundColor: badgeStyle.hex + '15',
                                    color: badgeStyle.hex,
                                    borderColor: badgeStyle.hex + '40',
                                  }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: badgeStyle.hex }}
                                  />
                                  {badgeStyle.colorName}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
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
                            <div className="text-lg sm:text-xl font-bold text-blue-900 tracking-tight flex items-baseline gap-1 font-mono">
                              <span>{item.overallPoints}</span>
                              <span className="text-[10px] text-slate-500 font-sans font-medium uppercase">pts</span>
                            </div>
                            {/* Progress Bar in college's official designated color */}
                            <div className="w-20 sm:w-28 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  backgroundColor: badgeStyle.hex,
                                  width: `${Math.min(100, Math.max(5, (item.overallPoints / 400) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action Link */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="text-slate-400 hover:text-blue-600 transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
