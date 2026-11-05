import React from 'react';
import { X, Trophy, Award, Music, BookOpen, Flame, Lock } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CategoryId, CollegeId } from '../types';
import { getCollegeBadgeStyle, getPlacementBadge } from '../utils/collegeTheme';

interface CollegePointHistoryModalProps {
  collegeId: CollegeId | null;
  onClose: () => void;
  onOpenEventModal: (eventId: string) => void;
}

export const CollegePointHistoryModal: React.FC<CollegePointHistoryModalProps> = ({
  collegeId,
  onClose,
  onOpenEventModal,
}) => {
  const { getCollegeHistory, isRankingHidden } = usePalakasan();

  if (!collegeId) return null;

  const history = getCollegeHistory(collegeId);
  const college = history.college;
  const badgeStyle = getCollegeBadgeStyle(college.id || college.acronym);
  const isOverallHidden = isRankingHidden('overall');

  const categoryConfigs: {
    id: CategoryId;
    title: string;
    icon: string;
    iconComponent: React.ReactNode;
  }[] = [
    {
      id: 'sports',
      title: 'Sports',
      icon: '🏅',
      iconComponent: <Award className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'cultural',
      title: 'Cultural',
      icon: '🎭',
      iconComponent: <Music className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'literary',
      title: 'Literary',
      icon: '📚',
      iconComponent: <BookOpen className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'special',
      title: 'Special Events',
      icon: '⭐',
      iconComponent: <Flame className="w-4 h-4 text-blue-600" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border shadow-xs ${badgeStyle.badge}`}
            >
              {college.acronym}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{college.acronym}</h2>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Rank #{history.overallRank} Overall
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border"
                  style={{
                    backgroundColor: badgeStyle.hex + '18',
                    color: badgeStyle.hex,
                    borderColor: badgeStyle.hex + '40',
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badgeStyle.hex }} />
                  {badgeStyle.colorName}
                </span>
                {(college.moniker || college.mascot) && (
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Moniker: {college.moniker || college.mascot}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium">{college.name}</p>
              <p className="text-[11px] text-slate-400 italic mt-0.5">{college.tagline}</p>
            </div>
          </div>

          <button
            id="close-college-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Breakdown */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Overall Points Summary Box */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white text-blue-800 flex items-center justify-center font-bold border border-blue-200">
                <Trophy className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-blue-700 tracking-wider">
                  Total Accumulated Score
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Cumulative sum of all 4 official divisions
                </div>
              </div>
            </div>
            <div className="text-right">
              {isOverallHidden ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100/80 text-amber-900 border border-amber-300 font-extrabold text-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Points Sealed</span>
                </div>
              ) : (
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-950">
                  {history.overallTotal}{' '}
                  <span className="text-xs uppercase font-semibold text-slate-500">Points</span>
                </div>
              )}
            </div>
          </div>

          {/* Transparent Category Breakdown */}
          <div className="space-y-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Audit Breakdown by Category
            </div>

            {categoryConfigs.map(cat => {
              const catScore = history.categories[cat.id];
              const isCatHidden = isRankingHidden(cat.id);

              return (
                <div
                  key={cat.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-xs"
                >
                  {/* Category summary header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{cat.title}</h4>
                      <span className={`text-xs px-2 py-0.2 rounded border ${
                        isCatHidden
                          ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold flex items-center gap-1'
                          : 'text-slate-500 bg-slate-50 border-slate-200'
                      }`}>
                        {isCatHidden ? (
                          <>
                            <Lock className="w-2.5 h-2.5" />
                            <span>Rank Sealed</span>
                          </>
                        ) : (
                          `Rank #${catScore.rank}`
                        )}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      {isCatHidden ? (
                        <span className="text-amber-800 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Sealed</span>
                        </span>
                      ) : (
                        `${cat.title}: ${catScore.points} pts`
                      )}
                    </div>
                  </div>

                  {/* List of completed events in this category */}
                  {catScore.breakdown.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {catScore.breakdown
                        .filter(item => item.points >= 0)
                        .map((item, idx) => {
                          const badge = getPlacementBadge(item.placement);
                          const isDQ = item.placement === 'DQ';

                          return (
                            <div
                              key={idx}
                              onClick={() => onOpenEventModal(item.eventId)}
                              className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200 cursor-pointer transition-colors text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                                  {item.eventName}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                  <span>{item.date}</span>
                                  <span>•</span>
                                  <span>{item.venue}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded font-bold text-[11px] border ${badge.badgeClass}`}
                                >
                                  {badge.icon} {badge.label}
                                </span>
                                <span
                                  className={`font-bold text-xs ${
                                    isDQ ? 'text-rose-700' : 'text-blue-900'
                                  }`}
                                >
                                  {isDQ ? 'DQ (0 pts)' : `+${item.points} pts`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic py-1">
                      No points recorded yet in {cat.title}.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Official MSUN PALAKASAN Score Audit</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
