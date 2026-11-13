import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ArrowRight, User, Phone } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CategoryId, CollegeId, NavigationTab } from '../types';
import { getCategoryMeta, getCollegeBadgeStyle } from '../utils/collegeTheme';

interface UpcomingActivitiesProps {
  onOpenEventModal: (eventId: string) => void;
  onOpenCollegeModal: (collegeId: CollegeId) => void;
  onSelectTab: (tab: NavigationTab) => void;
  maxItems?: number;
}

export const UpcomingActivities: React.FC<UpcomingActivitiesProps> = ({
  onOpenEventModal,
  onSelectTab,
  maxItems = 6,
}) => {
  const { events } = usePalakasan();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

  const upcomingEvents = events
    .filter(e => e.status === 'upcoming')
    .filter(e => (selectedCategory === 'all' ? true : e.category === selectedCategory))
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.startTime.localeCompare(b.startTime);
    });

  const displayedEvents = upcomingEvents.slice(0, maxItems);

  return (
    <section className="py-8 sm:py-10 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Category Quick Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming Matches & Contests</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Next Activities
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Scheduled events ordered chronologically
            </p>
          </div>

          {/* Quick Category Pills */}
          <div className="flex items-center flex-wrap gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              All ({events.filter(e => e.status === 'upcoming').length})
            </button>
            {(['sports', 'cultural', 'literary', 'special'] as CategoryId[]).map(catId => {
              const meta = getCategoryMeta(catId);
              const count = events.filter(e => e.status === 'upcoming' && e.category === catId).length;
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(catId)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedCategory === catId
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{meta.name}</span>
                  <span className="text-[10px] text-slate-400">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid of Event Cards */}
        {displayedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedEvents.map(event => {
              const meta = getCategoryMeta(event.category);
              return (
                <div
                  key={event.id}
                  id={`activity-card-${event.id}`}
                  onClick={() => onOpenEventModal(event.id)}
                  className="group cursor-pointer rounded-xl border border-slate-200 hover:border-blue-300 bg-white p-4 shadow-xs transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category Badge + Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.name}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Upcoming
                      </span>
                    </div>

                    {/* Matchup / Main Event Title */}
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                      {event.eventName}
                    </h3>

                    {/* Matchup banner if 1v1 */}
                    {event.matchup && (
                      <div className="text-xs font-semibold text-blue-800 mb-1.5">
                        {event.matchup}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {event.description}
                    </p>
                  </div>

                  {/* Bottom Meta & Participants */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {/* Date & Time */}
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-800 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{event.startTime} – {event.endTime}</span>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>

                    {/* Person In-charge & Contact Number */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-600 bg-slate-50/80 border border-slate-100 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-slate-500 shrink-0">In-charge:</span>
                        <span className="font-semibold text-slate-800 truncate">
                          {event.personInCharge || 'TBA'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {event.contactNumber ? (
                          <a
                            href={`tel:${event.contactNumber.replace(/\s+/g, '')}`}
                            onClick={e => e.stopPropagation()}
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            {event.contactNumber}
                          </a>
                        ) : (
                          <span className="text-slate-400 font-medium">TBA</span>
                        )}
                      </div>
                    </div>

                    {/* Participating Colleges Badges */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        {event.participatingColleges.map(cId => {
                          const badge = getCollegeBadgeStyle(cId);
                          return (
                            <span
                              key={cId}
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {cId}
                            </span>
                          );
                        })}
                      </div>

                      <span className="text-[11px] text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
                        Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No upcoming activities currently listed.
          </div>
        )}

        {/* View full schedule CTA */}
        <div className="mt-6 text-center">
          <button
            id="view-full-schedule-cta-btn"
            onClick={() => onSelectTab('schedule')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-blue-50 text-blue-700 font-semibold text-xs sm:text-sm border border-blue-300 shadow-xs transition-colors"
          >
            <span>Explore Complete Schedule & Venues</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    </section>
  );
};
