import React from 'react';
import { X, Calendar, Clock, MapPin, Users, Award, Shield, CheckCircle2, Star, User, Phone, Pause, Layers } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CollegeId } from '../types';
import { getEffectivePointTier } from '../data/initialData';
import { getCategoryMeta, getCollegeBadgeStyle, getPlacementBadge } from '../utils/collegeTheme';

interface EventDetailModalProps {
  eventId: string | null;
  onClose: () => void;
  onOpenCollegeModal: (collegeId: CollegeId) => void;
  onEnterResultClick?: (eventId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  eventId,
  onClose,
  onOpenCollegeModal,
  onEnterResultClick,
}) => {
  const { events, currentPalakasan, isAdminLoggedIn } = usePalakasan();

  if (!eventId) return null;

  const event = events.find(e => e.id === eventId);
  if (!event) return null;

  const meta = getCategoryMeta(event.category);
  const effectiveTier = getEffectivePointTier(event, currentPalakasan?.scoringRules);
  const isSpecialSports = event.category === 'sports' && effectiveTier === 'special';
  const isSpecialCategory = event.category === 'special';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
              >
                <span>{meta.icon}</span>
                <span className="uppercase tracking-wider text-[10px]">{meta.name}</span>
              </span>

              {isSpecialSports && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-700 text-amber-700" />
                  <span>Special Sports</span>
                </span>
              )}

              {!isSpecialSports && isSpecialCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  <Star className="w-3 h-3 fill-purple-700 text-purple-700" />
                  <span>{effectiveTier === 'major' ? 'Major Special Event' : 'Minor Special Event'}</span>
                </span>
              )}

              {event.status === 'ongoing' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Now
                </span>
              )}

              {event.status === 'paused' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Pause className="w-3 h-3 text-amber-700" />
                  <span>Paused — Resumes Soon</span>
                </span>
              )}

              {event.status === 'upcoming' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Upcoming
                </span>
              )}

              {event.status === 'completed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  Completed
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{event.eventName}</h2>
            {event.matchup && (
              <p className="text-xs sm:text-sm font-semibold text-blue-800 mt-0.5">{event.matchup}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Key Event Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Date</span>
                <span className="font-semibold text-slate-900">{event.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Schedule</span>
                <span className="font-semibold text-slate-900">{event.startTime} – {event.endTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 sm:col-span-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Venue</span>
                <span className="font-semibold text-slate-900">{event.venue}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Person In-charge</span>
                <span className="font-semibold text-slate-900">{event.personInCharge || 'TBA'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <Phone className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Contact Number</span>
                {event.contactNumber ? (
                  <a
                    href={`tel:${event.contactNumber.replace(/\s+/g, '')}`}
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    {event.contactNumber}
                  </a>
                ) : (
                  <span className="font-semibold text-slate-500">TBA</span>
                )}
              </div>
            </div>
          </div>

          {/* Paused Multi-Day Notice */}
          {event.status === 'paused' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Pause className="w-3.5 h-3.5 text-amber-700" />
                  <span>Tournament Temporarily Paused</span>
                </span>
                {event.resumeDate && (
                  <span className="px-2 py-0.5 rounded bg-white border border-amber-200 font-semibold text-amber-800">
                    Resumes: {event.resumeDate}
                  </span>
                )}
              </div>
              <p className="text-amber-800">
                {event.pausedReason ||
                  'Initial matches completed; remaining matches will resume on the next scheduled play day.'}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Event Overview
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              {event.description}
            </p>
          </div>

          {/* Participating Colleges */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Participating Colleges</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.participatingColleges.map(cId => {
                const style = getCollegeBadgeStyle(cId);
                return (
                  <button
                    key={cId}
                    onClick={() => {
                      onClose();
                      onOpenCollegeModal(cId);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}
                  >
                    {cId}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-Event Divisions & Brackets */}
          {event.subCategories && event.subCategories.length > 0 && (
            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sub-Event Divisions ({event.subCategories.length})</span>
                </span>
                <span className="text-[10px] font-semibold text-purple-700">
                  {event.subCategories.filter(s => Boolean(s.championCollegeId)).length} / {event.subCategories.length} decided
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.subCategories.map(sub => {
                  const total = sub.games?.length || 0;
                  const done = sub.games?.filter(g => g.status === 'completed').length || 0;
                  const champStyle = sub.championCollegeId
                    ? getCollegeBadgeStyle(sub.championCollegeId)
                    : null;
                  return (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-lg bg-white border border-purple-100 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{sub.name}</div>
                        {total > 0 && (
                          <div className="text-[10px] text-slate-500">
                            {done}/{total} matches played
                          </div>
                        )}
                      </div>
                      {sub.championCollegeId && champStyle ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${champStyle.bg} ${champStyle.text} ${champStyle.border}`}
                        >
                          👑 {sub.championCollegeId}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          Ongoing
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Results (If Completed) */}
          {event.status === 'completed' && event.results && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Certified Official Placements & Points</span>
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {event.results.map((res) => {
                  const badge = getPlacementBadge(res.placement);
                  const collegeStyle = getCollegeBadgeStyle(res.collegeId);
                  const isDQ = res.placement === 'DQ';

                  return (
                    <div
                      key={res.collegeId}
                      className={`flex items-center justify-between p-2.5 rounded-lg border ${
                        isDQ
                          ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-xs font-bold border ${badge.badgeClass}`}
                        >
                          {badge.icon} {badge.label}
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenCollegeModal(res.collegeId);
                          }}
                          className={`font-bold text-xs px-2 py-0.5 rounded border ${collegeStyle.bg} ${collegeStyle.text} ${collegeStyle.border}`}
                        >
                          {res.collegeId}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDQ ? (
                          <div className="text-right">
                            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                              DQ — 0 pts
                            </span>
                            {res.note && (
                              <div className="text-[10px] text-rose-600 italic mt-0.5">
                                {res.note}
                              </div>
                            )}
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

              {/* Multi-Category Accumulated Point Breakdown */}
              {event.accumulatedScores && (
                <div className="mt-4 p-3 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-900">
                    <span className="flex items-center gap-1.5">
                      <span>🥋/🏊 Multi-Category Breakdown</span>
                      {event.subCategories && event.subCategories.length > 0 && (
                        <span className="font-normal text-purple-700">({event.subCategories.length} categories)</span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 font-normal">10-8-6-4-2-0 Point System</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-xs">
                    {Object.entries(event.accumulatedScores).map(([colId, score]) => (
                      <div key={colId} className="p-2 bg-white rounded-lg border border-purple-200/80 text-center">
                        <span className="font-bold text-slate-800 block text-[11px]">{colId}</span>
                        <span className="font-black text-purple-700 text-sm">{score} <span className="text-[10px] font-normal">pts</span></span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-purple-700 leading-tight">
                    *Total points won across all sub-categories determine the final championship placement for this event.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {isAdminLoggedIn && onEnterResultClick && (
            <button
              onClick={() => onEnterResultClick(event.id)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{event.status === 'completed' ? 'Edit Official Result' : 'Enter Official Result'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
