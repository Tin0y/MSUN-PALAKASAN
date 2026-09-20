import React from 'react';
import {
  Trophy,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { COLLEGES, VENUES } from '../data/initialData';
import { getCollegeBadgeStyle } from '../utils/collegeTheme';
import { CollegeId } from '../types';

interface AboutViewProps {
  onOpenCollegeModal: (collegeId: CollegeId) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenCollegeModal }) => {
  return (
    <div className="py-8 sm:py-10 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>Tournament Guidelines & Rules</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          About MSUN Palakasan
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          The Mindanao State University at Naawan (MSUN) PALAKASAN is the annual university-wide athletic, cultural, literary, and special events tournament fostering camaraderie, sporting excellence, and collegiate leadership.
        </p>
      </div>

      {/* Official Scoring System (Section 3) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
            Section 3 & 4
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Official Scoring System</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every event automatically allocates standardized points based on certified placement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-center space-y-1 shadow-xs">
            <div className="text-2xl">🥇</div>
            <div className="text-xs uppercase font-bold text-amber-800">1st Place</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">50</div>
            <div className="text-[10px] text-amber-700 uppercase font-semibold">Points</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1 shadow-xs">
            <div className="text-2xl">🥈</div>
            <div className="text-xs uppercase font-bold text-slate-700">2nd Place</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">40</div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Points</div>
          </div>

          <div className="bg-amber-100/40 border border-amber-200 rounded-xl p-4 text-center space-y-1 shadow-xs">
            <div className="text-2xl">🥉</div>
            <div className="text-xs uppercase font-bold text-amber-900">3rd Place</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">30</div>
            <div className="text-[10px] text-amber-800 uppercase font-semibold">Points</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1 shadow-xs">
            <div className="text-2xl">🏅</div>
            <div className="text-xs uppercase font-bold text-slate-600">4th Place</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">20</div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Points</div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-center space-y-1 shadow-xs">
            <div className="text-2xl">🚫</div>
            <div className="text-xs uppercase font-bold text-rose-700">Disqualified</div>
            <div className="text-2xl sm:text-3xl font-bold text-rose-700">0</div>
            <div className="text-[10px] text-rose-600 uppercase font-semibold">Points</div>
          </div>
        </div>

        {/* Official DQ Rule Callout */}
        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 flex items-start gap-3 text-xs text-rose-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-rose-800">Official Disqualification (DQ) Rule:</strong>{' '}
            A college that is Disqualified (DQ) receives exactly 0 points for that event. However, DQ
            is retained as an official record and displayed distinctly (e.g.{' '}
            <code className="text-rose-800 bg-rose-100 px-1 py-0.5 rounded font-mono text-[11px]">CELS — DQ — 0 Points</code>
            ). A DQ does NOT eliminate the college from the overall university ranking; the college
            continues to accumulate points earned in other sanctioned events.
          </div>
        </div>
      </div>

      {/* The Four Participating Colleges */}
      <div className="space-y-3.5">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
            Section 1
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">The Four Participating Colleges</h2>
          <p className="text-xs text-slate-500">
            MSUN PALAKASAN is contested by exactly four colleges. Click any college to view its complete point audit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COLLEGES.map(college => {
            const style = getCollegeBadgeStyle(college.acronym);
            return (
              <div
                key={college.id}
                onClick={() => onOpenCollegeModal(college.id)}
                className="group cursor-pointer rounded-xl border border-slate-200 hover:border-blue-300 bg-white p-5 space-y-2.5 shadow-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${style.bg} ${style.text} ${style.border}`}
                  >
                    {college.acronym}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {college.acronym}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium">Moniker: {college.moniker || college.mascot}</div>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-800">{college.name}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{college.description}</p>
                <div className="text-[11px] text-blue-700 font-medium italic">
                  "{college.tagline}"
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The Four Major Categories */}
      <div className="space-y-3.5">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
            Section 2
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Four Core Competition Pillars</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-1.5 shadow-xs">
            <div className="text-2xl">🏅</div>
            <h3 className="font-bold text-slate-900 text-base">Sports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Basketball, Volleyball, Badminton, Table Tennis, Chess, Athletics & other sports competitions.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-1.5 shadow-xs">
            <div className="text-2xl">🎭</div>
            <h3 className="font-bold text-slate-900 text-base">Cultural</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hiphop Dance, Folk Dance, Singing & Musical Showdown, Vocal Solo & acoustic battles.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-1.5 shadow-xs">
            <div className="text-2xl">📚</div>
            <h3 className="font-bold text-slate-900 text-base">Literary</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Balak Performance, Essay Writing, Extemporaneous Speech, Parliamentary Debate & Poetry.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-1.5 shadow-xs">
            <div className="text-2xl">⭐</div>
            <h3 className="font-bold text-slate-900 text-base">Special Events</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tough Model, Mr. & Ms. Palakasan Coronation, Cheerdance, and university spectacles.
            </p>
          </div>
        </div>
      </div>

      {/* Venues Directory */}
      <div className="space-y-3.5">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Official MSUN Campus Venues</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {VENUES.map(venue => (
            <div
              key={venue}
              className="p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>{venue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
