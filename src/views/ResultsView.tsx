import React, { useState } from 'react';
import { CheckCircle2, Calendar, MapPin, Search, Lock } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CategoryId, CollegeId } from '../types';
import { getCategoryMeta, getCollegeBadgeStyle, getPlacementBadge } from '../utils/collegeTheme';

interface ResultsViewProps {
  onOpenEventModal: (eventId: string) => void;
  onOpenCollegeModal: (collegeId: CollegeId) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  onOpenEventModal,
  onOpenCollegeModal,
}) => {
  const { events, isRankingHidden } = usePalakasan();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedCollege, setSelectedCollege] = useState<CollegeId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const completedEvents = events.filter(
    e => e.status === 'completed' && e.results && e.results.length > 0
  );

  const filteredResults = completedEvents.filter(ev => {
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    if (
      selectedCollege !== 'all' &&
      !ev.results?.some(r => r.collegeId === selectedCollege)
    )
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ev.eventName.toLowerCase().includes(q);
      const matchVenue = ev.venue.toLowerCase().includes(q);
      const matchColleges = ev.results?.some(r => r.collegeId.toLowerCase().includes(q));
      if (!matchName && !matchVenue && !matchColleges) return false;
    }
    return true;
  });

  return (
    <div className="py-8 sm:py-10 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Official Event Ledger</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Palakasan Results Archive
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          Certified match reports, placement finishes, and official point allocations for all concluded PALAKASAN tournament events.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="sports">🏅 Sports</option>
            <option value="cultural">🎭 Cultural</option>
            <option value="literary">📚 Literary</option>
            <option value="special">⭐ Special Events</option>
          </select>

          {/* College Filter */}
          <select
            value={selectedCollege}
            onChange={e => setSelectedCollege(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Participating Colleges</option>
            <option value="CBIT">CBIT</option>
            <option value="CESS-IDS">CESS-IDS</option>
            <option value="CFMS">CFMS</option>
            <option value="CELS">CELS</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search completed results..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Results Grid */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map(event => {
            const meta = getCategoryMeta(event.category);

            return (
              <div
                key={event.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1.5"
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.name}</span>
                    </span>
                    <h2
                      onClick={() => onOpenEventModal(event.id)}
                      className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {event.eventName}
                    </h2>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <CheckCircle2 className="w-3 h-3 text-slate-500" />
                    Completed
                  </span>
                </div>

                {/* Event Date and Venue */}
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
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

                {/* Certified Placement Rows */}
                <div className="space-y-1.5 pt-1">
                  {(() => {
                    const isEventSealed = isRankingHidden('events') || isRankingHidden(event.category);
                    return event.results?.map(res => {
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
                              {isEventSealed ? '🔒' : badge.icon} {isEventSealed ? 'Sealed' : badge.label}
                            </span>
                            <button
                              onClick={() => onOpenCollegeModal(res.collegeId)}
                              className={`px-2 py-0.5 rounded text-xs font-bold border ${collegeStyle.bg} ${collegeStyle.text} ${collegeStyle.border}`}
                            >
                              {res.collegeId}
                            </button>
                            {!isEventSealed && isDQ && res.note && (
                              <span className="text-[11px] text-rose-600 italic hidden sm:inline">
                                ({res.note})
                              </span>
                            )}
                          </div>

                          <div>
                            {isEventSealed ? (
                              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Points Sealed
                              </span>
                            ) : isDQ ? (
                              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                                DQ — 0 pts
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                +{res.points} pts
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center rounded-xl border border-slate-200 bg-white text-slate-500">
          No matching tournament results found.
        </div>
      )}
    </div>
  );
};
