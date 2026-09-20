import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  MoreVertical,
  Trophy,
  Edit,
  Radio,
  CheckCircle2,
  Trash2,
  AlertCircle,
  ArrowUpDown,
  CalendarDays,
  FileCheck2,
  Star,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CategoryId, EventStatus, PalakasanEvent } from '../../types';
import { CATEGORIES } from '../../data/initialData';
import { getCategoryMeta, getCollegeBadgeStyle } from '../../utils/collegeTheme';

interface AdminEventsListProps {
  onOpenCreateEvent: () => void;
  onOpenEditEvent: (event: PalakasanEvent) => void;
  onOpenEventDetail: (eventId: string) => void;
  onOpenEnterResult: (event: PalakasanEvent) => void;
}

type StatusFilter = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled_postponed';

export const AdminEventsList: React.FC<AdminEventsListProps> = ({
  onOpenCreateEvent,
  onOpenEditEvent,
  onOpenEventDetail,
  onOpenEnterResult,
}) => {
  const { events, deleteEvent, startOngoingEvent, markEventCompleted } = usePalakasan();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'name'>('date_asc');

  // Filter logic
  const filteredEvents = events.filter(event => {
    // Search query
    const query = searchQuery.toLowerCase();
    const matchName = event.eventName.toLowerCase().includes(query);
    const matchCategory = event.category.toLowerCase().includes(query);
    const matchVenue = event.venue.toLowerCase().includes(query);
    const matchSearch = matchName || matchCategory || matchVenue;

    // Category filter
    const matchCat = selectedCategory === 'all' || event.category === selectedCategory;

    // Status filter
    let matchStatus = true;
    if (statusFilter === 'upcoming') matchStatus = event.status === 'upcoming';
    else if (statusFilter === 'ongoing') matchStatus = event.status === 'ongoing';
    else if (statusFilter === 'completed') matchStatus = event.status === 'completed';
    else if (statusFilter === 'cancelled_postponed') {
      matchStatus = event.status === 'cancelled' || event.status === 'postponed';
    }

    return matchSearch && matchCat && matchStatus;
  });

  // Sort logic
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'name') return a.eventName.localeCompare(b.eventName);
    if (sortBy === 'date_desc') return b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime);
    return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime);
  });

  const handleDelete = (event: PalakasanEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${event.eventName}"?`)) {
      deleteEvent(event.id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="admin-events-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by event name, category, or venue..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Action Button: Create Event */}
          <button
            id="admin-events-create-btn"
            onClick={onOpenCreateEvent}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Event</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Status Subfilters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'ongoing', label: 'Ongoing (Live)' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled_postponed', label: 'Cancelled / Postponed' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as StatusFilter)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as CategoryId | 'all')}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="date_asc">Sort: Date (Earliest)</option>
              <option value="date_desc">Sort: Date (Latest)</option>
              <option value="name">Sort: Event Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table / Card Layout */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{sortedEvents.length}</strong> of{' '}
            <strong className="text-slate-900">{events.length}</strong> total events
          </span>
          {statusFilter !== 'all' && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>

        {sortedEvents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No matching events found</p>
            <p className="text-xs">Adjust your search keyword or selected status filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedEvents.map(event => {
              const catMeta = getCategoryMeta(event.category);
              const isOfficial = event.resultStatus === 'official';

              return (
                <div
                  key={event.id}
                  onClick={() => onOpenEventDetail(event.id)}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Event Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                        {catMeta.icon} {catMeta.name}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-semibold px-2 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {event.eventType || 'Competition'}
                      </span>
                      {event.category === 'special' || event.pointTier === 'special' ? (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-purple-700 text-purple-700" />
                          <span>Special Tier</span>
                        </span>
                      ) : event.isMajor || event.pointTier === 'major' ? (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Major Tier
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                          Minor Tier
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
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
                      {isOfficial && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-200">
                          Official Results Certified
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {event.eventName}
                    </h3>

                    {/* Meta info: Date, Time, Venue, Participants */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {event.startTime} – {event.endTime}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {event.venue}
                      </span>
                    </div>

                    {/* Participating Colleges Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">Colleges:</span>
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

                  {/* Right: Quick Action Controls */}
                  <div
                    className="flex flex-wrap items-center gap-2 shrink-0 md:self-center"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Enter Result / Declare Winner Button */}
                    <button
                      type="button"
                      id={`event-action-result-${event.id}`}
                      onClick={() => onOpenEnterResult(event)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 font-bold text-xs rounded-xl shadow-2xs transition-colors"
                      title="Enter Scores or Declare Official Winners"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isOfficial ? 'Edit Result' : 'Enter Result'}</span>
                    </button>

                    {/* Quick Ongoing / Completed state switches */}
                    {event.status === 'upcoming' && (
                      <button
                        type="button"
                        onClick={() => startOngoingEvent(event.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors"
                        title="Mark event as currently live"
                      >
                        <Radio className="w-3.5 h-3.5 text-blue-600" />
                        <span>Start</span>
                      </button>
                    )}

                    {event.status === 'ongoing' && (
                      <button
                        type="button"
                        onClick={() => markEventCompleted(event.id, true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-colors"
                        title="Mark event finished"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Finish</span>
                      </button>
                    )}

                    {/* Edit Event Button */}
                    <button
                      type="button"
                      id={`event-action-edit-${event.id}`}
                      onClick={() => onOpenEditEvent(event)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                      title="Edit event parameters"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Event Button */}
                    <button
                      type="button"
                      id={`event-action-delete-${event.id}`}
                      onClick={e => handleDelete(event, e)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200/60 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
