import React from 'react';
import { GraduationCap, Trophy, Award, AlertOctagon, Calendar, CheckCircle2 } from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { COLLEGES } from '../../data/initialData';
import { getCollegeBadgeStyle } from '../../utils/collegeTheme';

export const AdminCollegesView: React.FC = () => {
  const { getCollegeStats, overallStandings } = usePalakasan();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Participating Colleges Registry
          </h3>
          <p className="text-xs text-slate-500">
            Overview of the 4 constituent academic units of Mindanao State University at Naawan.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
          <span>4 Colleges Competing</span>
        </div>
      </div>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {COLLEGES.map(college => {
          const stats = getCollegeStats(college.id);
          const badge = getCollegeBadgeStyle(college.id);
          const standing = overallStandings.find(s => s.college.id === college.id);

          return (
            <div
              key={college.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* College Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-black ${badge.bg} ${badge.text}`}
                      >
                        {college.acronym}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {college.shortName}
                      </span>
                      {(college.moniker || college.mascot) && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Moniker: {college.moniker || college.mascot}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">{college.name}</h4>
                    <p className="text-xs text-slate-500 italic">"{college.tagline}"</p>
                  </div>

                  {/* Rank Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Overall Rank
                    </span>
                    <span className="text-2xl font-black text-blue-950">
                      #{standing?.rank || '-'}
                    </span>
                  </div>
                </div>

                {/* Total Points Highlight */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Total Championship Points
                  </span>
                  <span className="text-xl font-black text-blue-950 font-mono">
                    {stats.totalPoints} pts
                  </span>
                </div>

                {/* Points by Category */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-semibold">Sports</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {stats.sportsPoints}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-semibold">Cultural</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {stats.culturalPoints}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-semibold">Literary</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {stats.literaryPoints}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-semibold">Special</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {stats.specialPoints}
                    </span>
                  </div>
                </div>

                {/* Performance Highlights: Participation, Wins, DQs */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-lg bg-slate-50/70 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Participated</span>
                    <span className="font-black text-slate-900 text-sm">
                      {stats.eventsParticipated}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/60">
                    <span className="text-[10px] text-amber-700 block font-bold">1st Place Wins</span>
                    <span className="font-black text-amber-900 text-sm">
                      {stats.wins}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-red-50/60 border border-red-200/60">
                    <span className="text-[10px] text-red-700 block font-bold">Disqualifications</span>
                    <span className="font-black text-red-900 text-sm">
                      {stats.dqs}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dean / Campus representation */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Constituent Faculty & Student Council</span>
                <span className="font-medium text-slate-600">{college.shortName}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
