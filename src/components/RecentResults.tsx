import React from 'react';
import { FileText, CheckCircle2, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CollegeId, NavigationTab } from '../types';
import { getCategoryMeta, getCollegeBadgeStyle, getPlacementBadge } from '../utils/collegeTheme';

interface RecentResultsProps {
  onOpenEventModal: (eventId: string) => void;
  onOpenCollegeModal: (collegeId: CollegeId) => void;
  onSelectTab: (tab: NavigationTab) => void;
  maxItems?: number;
}

export const RecentResults: React.FC<RecentResultsProps> = ({
  onOpenEventModal,
  onOpenCollegeModal,
  onSelectTab,
  maxItems = 4,
}) => {
  const { getRecentResults } = usePalakasan();
  const recentEvents = getRecentResults(maxItems);

  return (
    <section className="py-8 sm:py-10 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Certified Match Outcomes</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Recent Results
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Certified scores and points awarded from concluded events
            </p>
          </div>

          <button
            id="view-all-results-btn"
            onClick={() => onSelectTab('results')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors self-start sm:self-auto"
          >
            <span>View All Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentEvents.map(event => {
              const meta = getCategoryMeta(event.category);
              return (
                <div
                  key={event.id}
                  id={`recent-result-${event.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category + Status */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.name}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <CheckCircle2 className="w-3 h-3 text-slate-500" />
                        Completed
                      </span>
                    </div>

                    {/* Event Title */}
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3
                        onClick={() => onOpenEventModal(event.id)}
                        className="font-bold text-base sm:text-lg text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {event.eventName}
                      </h3>
                    </div>

                    {/* Date & Venue */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.date}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.venue}</span>
                      </div>
                    </div>

                    {/* Placements and Points Breakdown Table */}
                    <div className="space-y-1.5 mb-3">
                      {event.results?.map((res) => {
                        const badge = getPlacementBadge(res.placement);
                        const collegeStyle = getCollegeBadgeStyle(res.collegeId);
                        const isDQ = res.placement === 'DQ';

                        return (
                          <div
                            key={res.collegeId}
                            className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg border transition-colors ${
                              isDQ
                                ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* Placement badge */}
                              <span
                                className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-xs font-bold border ${badge.badgeClass}`}
                              >
                                {badge.icon}
                              </span>

                              {/* College Acronym Button */}
                              <button
                                onClick={() => onOpenCollegeModal(res.collegeId)}
                                className={`font-bold text-xs px-2 py-0.5 rounded border ${collegeStyle.bg} ${collegeStyle.text} ${collegeStyle.border}`}
                              >
                                {res.collegeId}
                              </button>

                              {/* DQ note if any */}
                              {isDQ && res.note && (
                                <span className="hidden sm:inline text-[11px] text-rose-600 italic line-clamp-1 max-w-[140px]">
                                  ({res.note})
                                </span>
                              )}
                            </div>

                            {/* Points Awarded */}
                            <div className="flex items-center gap-2">
                              {isDQ ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                                    DQ
                                  </span>
                                  <span className="text-xs font-medium text-slate-500">0 pts</span>
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  +{res.points} pts
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Points calculated & synced
                    </span>
                    <button
                      onClick={() => onOpenEventModal(event.id)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      <span>Match Report</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No results have been recorded yet.
          </div>
        )}
      </div>
    </section>
  );
};
