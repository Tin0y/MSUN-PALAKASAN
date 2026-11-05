import React from 'react';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Trophy,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CategoryId, CollegeId } from '../types';
import { getCategoryMeta, getCollegeBadgeStyle, getPlacementBadge } from '../utils/collegeTheme';

interface CategoryStandingViewProps {
  categoryId: CategoryId;
  onOpenCollegeModal: (collegeId: CollegeId) => void;
  onOpenEventModal: (eventId: string) => void;
}

export const CategoryStandingView: React.FC<CategoryStandingViewProps> = ({
  categoryId,
  onOpenCollegeModal,
  onOpenEventModal,
}) => {
  const {
    getCategoryStandings,
    events,
    categories,
    colleges,
    isRankingHidden,
    rankingsVisibility,
    isAdminLoggedIn,
    adminSpectatorPreview,
    setAdminSpectatorPreview,
  } = usePalakasan();

  const isHidden = isRankingHidden(categoryId);
  const isEventsHidden = isRankingHidden('events') || isHidden;

  const categoryMeta = getCategoryMeta(categoryId);
  const categoryInfo = categories.find(c => c.id === categoryId);
  const standings = getCategoryStandings(categoryId);

  // Completed events in this category
  const completedEvents = events.filter(
    e => e.category === categoryId && e.status === 'completed' && e.results && e.results.length > 0
  );

  // Upcoming events in this category
  const upcomingEvents = events.filter(
    e => e.category === categoryId && (e.status === 'upcoming' || e.status === 'ongoing')
  );

  return (
    <div className="py-8 sm:py-10 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Admin Spectator Preview Switch if this category is sealed */}
      {isAdminLoggedIn && isHidden && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              <Lock className="w-3 h-3 text-amber-800" />
              <span>Thrill Mode Active</span>
            </span>
            <span className="text-amber-800">
              {categoryMeta.name} rankings are currently <strong>sealed from public spectators</strong>.
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

      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
            >
              <span>{categoryMeta.icon}</span>
              <span>{categoryMeta.name} Division</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{categoryMeta.name} Standings</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {categoryInfo?.description}
          </p>
        </div>

        {/* Category Leader Badge or Sealed Badge */}
        {isHidden ? (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs self-start md:self-auto">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-bold border border-amber-300">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Final Day Thrill Mode
              </div>
              <div className="text-xl font-bold text-slate-900">Rankings Sealed</div>
              <div className="text-xs text-amber-800 font-medium">
                Unveiled at Closing Ceremonies
              </div>
            </div>
          </div>
        ) : standings.length > 0 ? (
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs self-start md:self-auto">
            <div className="w-10 h-10 rounded-lg bg-white text-blue-800 flex items-center justify-center text-lg font-bold border border-blue-200">
              🥇
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Division Leader
              </div>
              <div className="text-xl font-bold text-slate-900">
                {standings[0].college.acronym}
              </div>
              <div className="text-xs text-blue-800 font-semibold">
                {standings[0].points} Division Points
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Category Ranking Table or Sealed Display */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-600" />
            <span>Official {categoryMeta.name} College Ranking</span>
          </h2>
          <span className="text-xs text-slate-500">
            {completedEvents.length} Event{completedEvents.length === 1 ? '' : 's'} Completed
          </span>
        </div>

        {isHidden ? (
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 p-6 sm:p-10 text-center shadow-xs space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-sm animate-pulse">
              <Lock className="w-8 h-8 text-amber-700" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <Trophy className="w-3.5 h-3.5 text-amber-700" />
                <span>{categoryMeta.name} Division • Standings Sealed</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {categoryMeta.name} Rankings Under Committee Seal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {rankingsVisibility.thrillMessage ||
                  `In anticipation of the Grand Awarding and Closing Ceremony, tournament standings for ${categoryMeta.name} have been sealed for final suspense! Winners will be unveiled live.`}
              </p>
            </div>

            {/* Contender Colleges Cards */}
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
              ✨ Concluded events remain audited. Standings will be unveiled during the Grand Awarding!
            </div>
          </div>
        ) : (
          <>
            {/* Mobile-Friendly Cards View (Prevents horizontal overflow and scrolling on small screens) */}
            <div className="block sm:hidden space-y-3 mb-4">
              {standings.map(item => {
                const college = item.college;
                const style = getCollegeBadgeStyle(college.id);
                const isFirst = item.rank === 1;

                return (
                  <div
                    key={college.id}
                    onClick={() => onOpenCollegeModal(college.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-2xs ${
                      isFirst ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex items-center justify-center shrink-0">
                          {item.rank === 1 && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                              🥇
                            </span>
                          )}
                          {item.rank === 2 && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                              🥈
                            </span>
                          )}
                          {item.rank === 3 && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100/60 text-amber-900 font-bold text-xs border border-amber-200">
                              🥉
                            </span>
                          )}
                          {item.rank === 4 && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-slate-600 font-medium text-xs border border-slate-200">
                              4th
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-base text-slate-900 truncate">
                              {college.acronym}
                            </span>
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: style.hex }}
                              title={`Designated Color: ${style.colorName}`}
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
                          </div>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {college.name}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl font-black text-blue-900 font-mono">
                          {item.points}
                          <span className="text-[10px] font-sans font-medium text-slate-500 ml-0.5">pts</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                      <span>Events Contested</span>
                      <span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {item.eventsCompleted} Completed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop & Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full min-w-[550px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-blue-50/70 text-[11px] font-bold uppercase tracking-wider text-blue-900">
                  <th className="py-3 px-4 sm:px-6 text-center w-20">Rank</th>
                  <th className="py-3 px-4 sm:px-6">College & Designated Color</th>
                  <th className="py-3 px-4 sm:px-6 text-center">Events Contested</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Category Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {standings.map((item) => {
                  const college = item.college;
                  const style = getCollegeBadgeStyle(college.id);

                  return (
                    <tr
                      key={college.id}
                      onClick={() => onOpenCollegeModal(college.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center">
                          {item.rank === 1 && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                              🥇
                            </span>
                          )}
                          {item.rank === 2 && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                              🥈
                            </span>
                          )}
                          {item.rank === 3 && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100/60 text-amber-900 font-bold text-xs border border-amber-200">
                              🥉
                            </span>
                          )}
                          {item.rank === 4 && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-slate-600 font-medium text-xs border border-slate-200">
                              4th
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border shrink-0 ${style.badge}`}
                          >
                            {college.acronym}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">
                                {college.acronym}
                              </span>
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: style.hex }}
                                title={`Designated Color: ${style.colorName}`}
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
                            </div>
                            <div className="text-xs text-slate-500 font-normal line-clamp-1">
                              {college.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                          {item.eventsCompleted} Completed
                        </span>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <span className="text-lg font-black text-blue-900 font-mono">
                          {item.points}{' '}
                          <span className="text-xs uppercase text-slate-500 font-sans font-semibold">pts</span>
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

      {/* Completed Events in this Category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Completed {categoryMeta.name} Events & Placements</span>
          </h2>
        </div>

        {completedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedEvents.map(event => (
              <div
                key={event.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      onClick={() => onOpenEventModal(event.id)}
                      className="font-bold text-base text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {event.eventName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{event.date}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Concluded
                  </span>
                </div>

                {/* Placements List */}
                <div className="space-y-1.5 pt-1">
                  {event.results?.map(res => {
                    const badge = getPlacementBadge(res.placement);
                    const collegeStyle = getCollegeBadgeStyle(res.collegeId);
                    const isDQ = res.placement === 'DQ';

                    return (
                      <div
                        key={res.collegeId}
                        className={`flex items-center justify-between p-2 rounded-lg border ${
                          isDQ
                            ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`min-w-[24px] h-6 px-1.5 rounded flex items-center justify-center text-xs font-bold border ${badge.badgeClass}`}
                          >
                            {isEventsHidden ? '🔒' : badge.icon} {isEventsHidden ? 'Sealed' : badge.label}
                          </span>
                          <button
                            onClick={() => onOpenCollegeModal(res.collegeId)}
                            className={`px-2 py-0.5 rounded text-xs font-bold border ${collegeStyle.bg} ${collegeStyle.text} ${collegeStyle.border}`}
                          >
                            {res.collegeId}
                          </button>
                        </div>

                        <div>
                          {isEventsHidden ? (
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Points Sealed
                            </span>
                          ) : isDQ ? (
                            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                              DQ (0 pts)
                            </span>
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
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border border-slate-200 bg-white text-slate-500 text-xs">
            No completed {categoryMeta.name} events recorded yet.
          </div>
        )}
      </div>

      {/* Upcoming / Ongoing Events in this Category */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Upcoming {categoryMeta.name} Events</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                onClick={() => onOpenEventModal(event.id)}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-white cursor-pointer shadow-xs transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{event.date}</span>
                  <span className="text-blue-700 font-semibold">{event.startTime}</span>
                </div>
                <div className="font-bold text-slate-900 text-sm line-clamp-1">
                  {event.eventName}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{event.venue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
