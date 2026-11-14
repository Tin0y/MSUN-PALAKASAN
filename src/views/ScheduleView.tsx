import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Filter,
  Search,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  User,
  Phone,
  Pause,
} from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CategoryId, CollegeId, EventStatus } from '../types';
import { VENUES } from '../data/initialData';
import { getCategoryMeta, getCollegeBadgeStyle } from '../utils/collegeTheme';

interface ScheduleViewProps {
  onOpenEventModal: (eventId: string) => void;
  onOpenCollegeModal: (collegeId: CollegeId) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  onOpenEventModal,
  onOpenCollegeModal,
}) => {
  const { events, colleges, venues } = usePalakasan();

  const availableVenues = useMemo(() => {
    const base = venues.length > 0 ? venues.map(v => v.name) : VENUES;
    const set = new Set<string>(base);
    events.forEach(e => {
      if (e.venue?.trim()) set.add(e.venue.trim());
    });
    return Array.from(set);
  }, [venues, events]);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');
  const [selectedCollege, setSelectedCollege] = useState<CollegeId | 'all'>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique dates from events
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(events.map(e => e.date)));
    return dates.sort();
  }, [events]);

  // Filtered & Chronologically Sorted Events
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
        if (selectedStatus !== 'all' && event.status !== selectedStatus) return false;
        if (selectedCollege !== 'all' && !event.participatingColleges.includes(selectedCollege))
          return false;
        if (selectedVenue !== 'all' && event.venue !== selectedVenue) return false;
        if (selectedDate !== 'all' && event.date !== selectedDate) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = event.eventName.toLowerCase().includes(q);
          const matchVenue = event.venue.toLowerCase().includes(q);
          const matchMatchup = event.matchup?.toLowerCase().includes(q);
          const matchColleges = event.participatingColleges.some(c => c.toLowerCase().includes(q));
          if (!matchName && !matchVenue && !matchMatchup && !matchColleges) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        if (dateCmp !== 0) return dateCmp;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [
    events,
    selectedCategory,
    selectedStatus,
    selectedCollege,
    selectedVenue,
    selectedDate,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedCollege('all');
    setSelectedVenue('all');
    setSelectedDate('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    selectedCollege !== 'all' ||
    selectedVenue !== 'all' ||
    selectedDate !== 'all' ||
    searchQuery !== '';

  return (
    <div className="py-8 sm:py-10 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Tournament Timetable</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Palakasan Schedule
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          Master schedule of sports tournaments, cultural exhibitions, literary contests, and special events across MSU at Naawan venues.
        </p>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter Events</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search events, sport titles, matchups, or venue names..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="sports">🏅 Sports</option>
              <option value="cultural">🎭 Cultural</option>
              <option value="literary">📚 Literary</option>
              <option value="special">⭐ Special Events</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing (Live)</option>
              <option value="paused">Paused (Resumes Later)</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* College Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              College
            </label>
            <select
              value={selectedCollege}
              onChange={e => setSelectedCollege(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All 4 Colleges</option>
              {colleges.map(c => (
                <option key={c.id} value={c.id}>
                  {c.acronym}
                </option>
              ))}
            </select>
          </div>

          {/* Venue Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              Venue
            </label>
            <select
              value={selectedVenue}
              onChange={e => setSelectedVenue(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Venues</option>
              {availableVenues.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              Date
            </label>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              {uniqueDates.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900">{filteredEvents.length}</strong> event
          {filteredEvents.length === 1 ? '' : 's'}
        </span>
        <span>Sorted chronologically by date and match time</span>
      </div>

      {/* Events Chronological List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-2.5">
          {filteredEvents.map(event => {
            const meta = getCategoryMeta(event.category);
            const isLive = event.status === 'ongoing';
            const isPaused = event.status === 'paused';
            const isCompleted = event.status === 'completed';

            return (
              <div
                key={event.id}
                onClick={() => onOpenEventModal(event.id)}
                className={`group cursor-pointer rounded-xl border p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isLive
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                    : isPaused
                    ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                    : isCompleted
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                }`}
              >
                {/* Left block: Category & Time */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 sm:min-w-[200px]">
                  <div className="text-center px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Date</div>
                    <div className="text-xs font-bold text-slate-800">{event.date}</div>
                    <div className="text-[11px] font-semibold text-blue-700 mt-0.5">
                      {event.startTime}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.name}</span>
                      </span>

                      {isLive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live Now
                        </span>
                      )}

                      {isPaused && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded border border-amber-300">
                          <Pause className="w-3 h-3 text-amber-700" />
                          <span>
                            Paused{event.resumeDate ? ` • Resumes ${event.resumeDate}` : ''}
                          </span>
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.2 rounded border border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" /> Done
                        </span>
                      )}

                      {!isLive && !isPaused && !isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                          {event.status === 'cancelled'
                            ? 'Cancelled'
                            : event.status === 'postponed'
                            ? 'Postponed'
                            : 'Upcoming'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {event.eventName}
                    </h3>

                    {event.matchup && (
                      <div className="text-xs font-medium text-blue-800">{event.matchup}</div>
                    )}
                  </div>
                </div>

                {/* Middle: Venue & Colleges */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{event.venue}</span>
                    </div>
                    {(event.personInCharge || event.contactNumber) && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="font-medium text-slate-700">{event.personInCharge || 'TBA'}</span>
                        </span>
                        {event.contactNumber && (
                          <a
                            href={`tel:${event.contactNumber.replace(/\s+/g, '')}`}
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-blue-700 hover:underline font-medium"
                          >
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{event.contactNumber}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    {event.participatingColleges.map(cId => {
                      const badge = getCollegeBadgeStyle(cId);
                      return (
                        <button
                          key={cId}
                          onClick={e => {
                            e.stopPropagation();
                            onOpenCollegeModal(cId);
                          }}
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {cId}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: CTA */}
                <div className="flex items-center justify-end shrink-0">
                  <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 text-xs font-semibold transition-colors">
                    <span>{isCompleted ? 'Results' : 'Details'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center rounded-xl border border-slate-200 bg-white space-y-2.5">
          <Calendar className="w-7 h-7 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No scheduled activities found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your category, college, or venue filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200 hover:bg-blue-100"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
