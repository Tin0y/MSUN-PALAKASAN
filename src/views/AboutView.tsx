import React from 'react';
import {
  Trophy,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { COLLEGES, VENUES, getNormalizedScoringRules } from '../data/initialData';
import { getCollegeBadgeStyle } from '../utils/collegeTheme';
import { usePalakasan } from '../context/PalakasanContext';
import { CollegeId } from '../types';

interface AboutViewProps {
  onOpenCollegeModal: (collegeId: CollegeId) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenCollegeModal }) => {
  const { currentPalakasan, venues } = usePalakasan();
  const displayVenues = venues.length > 0 ? venues.map(v => v.name) : VENUES;
  const normalized = getNormalizedScoringRules(currentPalakasan?.scoringRules);
  const { sports, cultural, literary, special } = normalized.byCategory;

  const formatScale = (pts: Record<'1st' | '2nd' | '3rd' | '4th' | 'DQ', number>) =>
    `${pts['1st']} • ${pts['2nd']} • ${pts['3rd']} • ${pts['4th']} pts`;

  return (
    <div className="py-8 sm:py-10 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
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
      </div>

      {/* Official Scoring System (Separated Per Category) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
            Section 3 & 4
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Official Scoring System by Category
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Each competition pillar follows its own separated point structure (1st • 2nd • 3rd • 4th place).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sports Events (3 Tiers + Sub-Disciplines) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">🏅 Sports Events (3 Tiers)</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                3-Tier System
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Major Sports</span>
                <span className="font-mono font-bold text-blue-700">{formatScale(sports.majorPoints)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Minor Sports</span>
                <span className="font-mono font-bold text-slate-700">{formatScale(sports.minorPoints)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-lg border border-amber-200">
                <span className="font-bold text-amber-950">Special Sports (Arnis, Swimming)</span>
                <span className="font-mono font-bold text-amber-900">{formatScale(sports.specialPoints)}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-0.5">
                Multi-discipline heats scale: <span className="font-mono font-semibold text-slate-700">{sports.disciplinePoints['1st']}-{sports.disciplinePoints['2nd']}-{sports.disciplinePoints['3rd']}-{sports.disciplinePoints['4th']}-{sports.disciplinePoints['5th']}-{sports.disciplinePoints['6th']} pts</span>
              </div>
            </div>
          </div>

          {/* Special Events (Distinct from Special Sports) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">⭐ Special Events</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                {special.useMinorTier !== false ? 'Major & Minor' : 'Major Points Only'}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">
                  {special.useMinorTier !== false ? 'Major Special Events' : 'All Special Events (Major Scale)'}
                </span>
                <span className="font-mono font-bold text-purple-700">{formatScale(special.majorPoints)}</span>
              </div>
              {special.useMinorTier !== false && (
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800">Minor Special Events</span>
                  <span className="font-mono font-bold text-slate-700">{formatScale(special.minorPoints)}</span>
                </div>
              )}
              <p className="text-[11px] text-slate-500 pt-0.5">
                Applies to Mr. & Ms. PALAKASAN, Cheerdance, Tough Model, and Laro ng Lahi — configured separately from Special Sports.
              </p>
            </div>
          </div>

          {/* Cultural & Arts Events */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">🎭 Cultural & Arts Events</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {cultural.useMinorTier !== false ? 'Major & Minor' : 'Major Points Only'}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">
                  {cultural.useMinorTier !== false ? 'Major Cultural' : 'All Cultural (Major Scale)'}
                </span>
                <span className="font-mono font-bold text-emerald-700">{formatScale(cultural.majorPoints)}</span>
              </div>
              {cultural.useMinorTier !== false && (
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800">Minor Cultural</span>
                  <span className="font-mono font-bold text-slate-700">{formatScale(cultural.minorPoints)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Literary Events */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">📚 Literary Events</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                {literary.useMinorTier !== false ? 'Major & Minor' : 'Major Points Only'}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">
                  {literary.useMinorTier !== false ? 'Major Literary' : 'All Literary (Major Scale)'}
                </span>
                <span className="font-mono font-bold text-indigo-700">{formatScale(literary.majorPoints)}</span>
              </div>
              {literary.useMinorTier !== false && (
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800">Minor Literary</span>
                  <span className="font-mono font-bold text-slate-700">{formatScale(literary.minorPoints)}</span>
                </div>
              )}
            </div>
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
          {displayVenues.map(venue => (
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
