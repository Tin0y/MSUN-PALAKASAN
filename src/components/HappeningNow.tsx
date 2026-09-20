import React from 'react';
import { Clock, MapPin, Users, Calendar, ArrowRight, Radio } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { getCategoryMeta, getCollegeBadgeStyle } from '../utils/collegeTheme';
import { CollegeId } from '../types';

interface HappeningNowProps {
  onOpenEventModal: (eventId: string) => void;
  onOpenCollegeModal: (collegeId: CollegeId) => void;
}

export const HappeningNow: React.FC<HappeningNowProps> = ({
  onOpenEventModal,
  onOpenCollegeModal,
}) => {
  const { getHappeningNowEvent, getNextUpcomingEvent } = usePalakasan();
  const liveEvent = getHappeningNowEvent();
  const nextEvent = getNextUpcomingEvent();

  return (
    <section className="py-6 sm:py-8 bg-slate-50/50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Happening Now
            </h2>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Tournament Status:</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
              Live Competition
            </span>
          </div>
        </div>

        {liveEvent ? (
          /* Live Event Card */
          <div
            id={`event-card-${liveEvent.id}`}
            className="rounded-xl border border-emerald-200 bg-white p-5 sm:p-6 shadow-xs relative"
          >
            {/* Top Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Live Event
                </span>
                {(() => {
                  const meta = getCategoryMeta(liveEvent.category);
                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <span>{meta.icon}</span>
                      <span>{meta.name}</span>
                    </span>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{liveEvent.date}</span>
                <span className="text-slate-300">•</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-900 font-semibold">{liveEvent.startTime} – {liveEvent.endTime}</span>
              </div>
            </div>

            {/* Matchup / Title */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
              <div className="lg:col-span-2 space-y-2">
                {liveEvent.matchup && (
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {liveEvent.matchup}
                  </div>
                )}
                <h3 className="text-base sm:text-lg font-semibold text-blue-700">
                  {liveEvent.eventName}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {liveEvent.description}
                </p>

                {/* Venue */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 pt-1">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Venue:</span>
                  <span className="text-slate-900 font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {liveEvent.venue}
                  </span>
                </div>
              </div>

              {/* Participating Colleges Pill Block */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Competing Colleges</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {liveEvent.participatingColleges.map(cId => {
                    const style = getCollegeBadgeStyle(cId);
                    return (
                      <button
                        key={cId}
                        onClick={() => onOpenCollegeModal(cId)}
                        className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${style.bg} ${style.text} ${style.border}`}
                      >
                        {cId}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => onOpenEventModal(liveEvent.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Event Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state when no live event is currently running */
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                No event is currently ongoing
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                Competitions will resume according to the official tournament schedule.
              </p>
            </div>

            {/* Display the next upcoming event */}
            {nextEvent && (
              <div className="max-w-xl mx-auto pt-2 text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1.5">
                  Up Next:
                </div>
                <div
                  onClick={() => onOpenEventModal(nextEvent.id)}
                  className="cursor-pointer rounded-lg border border-slate-200 hover:border-blue-300 bg-slate-50/70 p-3 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-blue-700 uppercase">
                        {nextEvent.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-600 font-medium">{nextEvent.startTime}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {nextEvent.eventName}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{nextEvent.venue}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-50 shrink-0">
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
