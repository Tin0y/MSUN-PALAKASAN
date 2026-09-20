import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Filter,
  CalendarDays,
  CheckCircle2,
  Radio,
  Ban,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { PalakasanEvent } from '../../types';
import { getCategoryMeta, getCollegeBadgeStyle } from '../../utils/collegeTheme';

interface AdminScheduleViewProps {
  onOpenCreateEvent: () => void;
  onOpenEventDetail: (eventId: string) => void;
  onOpenEnterResult: (event: PalakasanEvent) => void;
}

export const AdminScheduleView: React.FC<AdminScheduleViewProps> = ({
  onOpenCreateEvent,
  onOpenEventDetail,
  onOpenEnterResult,
}) => {
  const { events } = usePalakasan();
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // Extract unique dates sorted chronologically
  const uniqueDates = Array.from(new Set(events.map(e => e.date))).sort();

  // Filter events
  const filteredEvents = events.filter(e => {
    if (selectedDate !== 'all' && e.date !== selectedDate) return false;
    return true;
  });

  // Group by date
  const groupedEvents: Record<string, PalakasanEvent[]> = {};
  filteredEvents.forEach(e => {
    if (!groupedEvents[e.date]) {
      groupedEvents[e.date] = [];
    }
    groupedEvents[e.date].push(e);
  });

  // Sort within dates by start time
  Object.keys(groupedEvents).forEach(d => {
    groupedEvents[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const sortedGroupDates = Object.keys(groupedEvents).sort();

  return (
    <div className="space-y-6">
      {/* Schedule Header & Date Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Master Tournament Timetable
          </h3>
          <p className="text-xs text-slate-500">
            Sequential daily schedule. Click any event to reschedule, shift venues, or update results.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Pills */}
          <button
            onClick={() => setSelectedDate('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDate === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Tournament Days
          </button>
          {uniqueDates.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate === d
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {d}
            </button>
          ))}

          <button
            onClick={onOpenCreateEvent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add to Schedule</span>
          </button>
        </div>
      </div>

      {/* Chronological Schedule List */}
      <div className="space-y-6">
        {sortedGroupDates.map(dateStr => {
          const dayEvents = groupedEvents[dateStr];
          return (
            <div key={dateStr} className="space-y-3">
              {/* Date Section Marker */}
              <div className="flex items-center gap-2 px-1">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  {dateStr}
                </h4>
                <span className="text-[11px] text-slate-400 font-semibold">
                  ({dayEvents.length} events scheduled)
                </span>
                <div className="flex-1 h-px bg-slate-200 ml-2" />
              </div>

              {/* Event Cards for this date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dayEvents.map(event => {
                  const catMeta = getCategoryMeta(event.category);
                  const isOfficial = event.resultStatus === 'official';

                  return (
                    <div
                      key={event.id}
                      onClick={() => onOpenEventDetail(event.id)}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer space-y-3 text-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Header: Category & Status */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[10px] text-blue-700 uppercase tracking-wider">
                            {catMeta.icon} {catMeta.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              event.status === 'ongoing'
                                ? 'bg-blue-600 text-white animate-pulse'
                                : event.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : event.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : event.status === 'postponed'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>

                        {/* Title & Matchup */}
                        <div>
                          <h5 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                            {event.eventName}
                          </h5>
                          {event.matchup && (
                            <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                              {event.matchup}
                            </p>
                          )}
                        </div>

                        {/* Time & Venue */}
                        <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.startTime} – {event.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.venue}</span>
                          </div>
                        </div>

                        {/* Participating Colleges */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {event.participatingColleges.map(colId => {
                            const badge = getCollegeBadgeStyle(colId);
                            return (
                              <span
                                key={colId}
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}
                              >
                                {colId}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div
                        className="pt-2 border-t border-slate-100 flex items-center justify-between"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenEventDetail(event.id)}
                          className="text-[11px] font-bold text-slate-600 hover:text-blue-700"
                        >
                          Manage Schedule...
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenEnterResult(event)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-bold text-[11px] transition-colors"
                        >
                          <Trophy className="w-3 h-3 text-amber-500" />
                          <span>{isOfficial ? 'Results' : 'Enter Result'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
