import React, { useState } from 'react';
import { Trophy, Award, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CategoryId } from '../../types';
import { CATEGORIES } from '../../data/initialData';
import { getCategoryMeta, getCollegeBadgeStyle } from '../../utils/collegeTheme';

export const AdminStandingsView: React.FC = () => {
  const { overallStandings, getCategoryStandings, getEventStats } = usePalakasan();
  const [activeTab, setActiveTab] = useState<'overall' | CategoryId>('overall');
  const stats = getEventStats();

  const currentCategoryStandings = activeTab !== 'overall' ? getCategoryStandings(activeTab) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                University Standings Ledger
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                System Auto-Calculated
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Standings are derived strictly from {stats.declaredWinnersEvents} certified official results. Standings cannot be manually edited.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-600">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>1st = 50 pts • 2nd = 40 pts • 3rd = 30 pts • 4th = 20 pts • DQ = 0 pts</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('overall')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'overall'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            🏆 Overall University Standings
          </button>

          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-900">
            {activeTab === 'overall' ? 'MSUN Overall Championship Leaderboard' : `${getCategoryMeta(activeTab).name} Division Standings`}
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Based on {stats.declaredWinnersEvents} official events
          </span>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'overall' ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/30">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-3 text-center">Sports Points</th>
                  <th className="py-3 px-3 text-center">Cultural Points</th>
                  <th className="py-3 px-3 text-center">Literary Points</th>
                  <th className="py-3 px-3 text-center">Special Events</th>
                  <th className="py-3 px-4 text-right">Total Championship Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overallStandings.map(item => {
                  const badge = getCollegeBadgeStyle(item.college.id);
                  const isTop = item.rank === 1;
                  return (
                    <tr
                      key={item.college.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTop ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold">
                        {isTop ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-white font-black text-xs shadow-2xs">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-1.5 font-mono">{item.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-bold ${badge.bg} ${badge.text}`}
                          >
                            {item.college.acronym}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{item.college.name}</p>
                            <p className="text-[10px] text-slate-400">{item.college.tagline}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.sports}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.cultural}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.literary}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.special}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-base text-blue-950 font-mono">
                          {item.overallPoints}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/30">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-3 text-center">Gold (1st)</th>
                  <th className="py-3 px-3 text-center">Silver (2nd)</th>
                  <th className="py-3 px-3 text-center">Bronze (3rd)</th>
                  <th className="py-3 px-3 text-center">4th Place</th>
                  <th className="py-3 px-4 text-right">Category Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentCategoryStandings?.map(item => {
                  const badge = getCollegeBadgeStyle(item.college.id);
                  const isTop = item.rank === 1;
                  return (
                    <tr
                      key={item.college.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTop ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold">
                        {isTop ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-white font-black text-xs shadow-2xs">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-1.5 font-mono">{item.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-bold ${badge.bg} ${badge.text}`}
                          >
                            {item.college.acronym}
                          </span>
                          <span className="font-bold text-slate-900">{item.college.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-amber-600 font-bold">
                        {item.gold}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.silver}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-amber-800">
                        {item.bronze}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.fourth}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-base text-blue-950 font-mono">
                          {item.points}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
