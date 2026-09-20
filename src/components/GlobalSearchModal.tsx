import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, ArrowRight } from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import { CollegeId } from '../types';
import { getCategoryMeta, getCollegeBadgeStyle } from '../utils/collegeTheme';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCollegeModal: (collegeId: CollegeId) => void;
  onOpenEventModal: (eventId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onOpenCollegeModal,
  onOpenEventModal,
}) => {
  const { events, colleges } = usePalakasan();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Matched colleges
  const matchedColleges = trimmed
    ? colleges.filter(
        c =>
          c.name.toLowerCase().includes(trimmed) ||
          c.acronym.toLowerCase().includes(trimmed) ||
          c.shortName.toLowerCase().includes(trimmed) ||
          c.moniker?.toLowerCase().includes(trimmed) ||
          c.mascot?.toLowerCase().includes(trimmed)
      )
    : [];

  // Matched events
  const matchedEvents = trimmed
    ? events.filter(
        e =>
          e.eventName.toLowerCase().includes(trimmed) ||
          e.venue.toLowerCase().includes(trimmed) ||
          e.category.toLowerCase().includes(trimmed) ||
          e.description.toLowerCase().includes(trimmed) ||
          e.participatingColleges.some(c => c.toLowerCase().includes(trimmed)) ||
          e.matchup?.toLowerCase().includes(trimmed)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search colleges (CBIT, CESS-IDS, CFMS, CELS), events, sports, or venues..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 rounded border border-slate-200 font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!trimmed && (
            <div className="py-6 text-center text-xs text-slate-500 space-y-2">
              <p>Quick search suggestions:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['CBIT', 'CESS-IDS', 'CFMS', 'CELS', 'Basketball', 'Hiphop Dance', 'Balak', 'Tough Model', 'TSAC'].map(
                  term => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium text-xs border border-slate-200"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Colleges Results */}
          {matchedColleges.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2">
                Colleges ({matchedColleges.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedColleges.map(c => {
                  const style = getCollegeBadgeStyle(c.acronym);
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        onClose();
                        onOpenCollegeModal(c.id);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 text-left transition-colors"
                    >
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {c.acronym}
                      </span>
                      <div className="overflow-hidden">
                        <div className="text-sm font-bold text-slate-900 truncate">{c.name}</div>
                        <div className="text-xs text-slate-500 truncate">{c.moniker || c.mascot}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Events Results */}
          {matchedEvents.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2">
                Events & Matches ({matchedEvents.length})
              </div>
              <div className="space-y-2">
                {matchedEvents.map(event => {
                  const meta = getCategoryMeta(event.category);
                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        onClose();
                        onOpenEventModal(event.id);
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 cursor-pointer transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            <span>{meta.icon}</span>
                            <span>{meta.name}</span>
                          </span>
                          <span className="text-xs text-slate-500">{event.date}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-blue-700 font-semibold">
                            {event.startTime}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">{event.eventName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{event.venue}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            event.status === 'completed'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : event.status === 'ongoing'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {event.status}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {trimmed && matchedColleges.length === 0 && matchedEvents.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">
              No matching colleges, events, or venues found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
