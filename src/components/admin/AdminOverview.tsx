import React from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  PlusCircle,
  CalendarDays,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  History,
  Radio,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { AdminSection } from '../../types';
import { getCollegeBadgeStyle } from '../../utils/collegeTheme';

interface AdminOverviewProps {
  onNavigateSection: (section: AdminSection) => void;
  onOpenCreateEvent: () => void;
  onSelectEventDetail: (eventId: string) => void;
  onEnterResult: (eventId: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onNavigateSection,
  onOpenCreateEvent,
  onSelectEventDetail,
  onEnterResult,
}) => {
  const {
    events,
    overallStandings,
    getOverallLeader,
    getEventStats,
    activityLogs,
  } = usePalakasan();

  const stats = getEventStats();
  const leader = getOverallLeader();

  // Events that require immediate committee attention:
  // 1. Ongoing events
  // 2. Completed events that lack official results (pending results)
  const ongoingEvents = events.filter(e => e.status === 'ongoing');
  const pendingEvents = events.filter(
    e => (e.status === 'completed' || e.status === 'ongoing') && e.resultStatus !== 'official'
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Official Tournament Operations
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              MSUN PALAKASAN Management
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Real-time administrative command center. Oversee scheduling, assign official medal results, and supervise automatic university standings calculations.
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="overview-btn-create-event"
              onClick={onOpenCreateEvent}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>+ Create Event</span>
            </button>
            <button
              id="overview-btn-manage-schedule"
              onClick={() => onNavigateSection('schedule')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-500/40 text-xs font-semibold transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Manage Schedule</span>
            </button>
            <button
              id="overview-btn-manage-competitions"
              onClick={() => onNavigateSection('competitions')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-400/40 text-xs font-semibold transition-colors shadow-xs"
            >
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span>Manage Competitions</span>
            </button>
            <button
              id="overview-btn-enter-results"
              onClick={() => onNavigateSection('results')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-500/40 text-xs font-semibold transition-colors"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-300" />
              <span>Enter Results</span>
            </button>
            <button
              id="overview-btn-view-standings"
              onClick={() => onNavigateSection('standings')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-500/40 text-xs font-semibold transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>View Standings</span>
            </button>
          </div>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Grid (Clean White Cards, Blue Accents, Rounded Corners, Minimal Shadows) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Colleges */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Total Colleges</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalColleges}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">CBIT, CESS-IDS, CFMS, CELS</p>
        </div>

        {/* Total Events */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Total Events</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalEvents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sports, Cultural, Literary, Special</p>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Upcoming Events</span>
            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">
            {stats.upcomingEvents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled on timetable</p>
        </div>

        {/* Ongoing Events */}
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-2xs hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between text-blue-800 mb-1.5">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Ongoing Events
            </span>
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Radio className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700 tracking-tight">
            {stats.ongoingEvents}
          </div>
          <p className="text-[11px] text-blue-600/80 mt-1">Live in progress now</p>
        </div>

        {/* Completed Events */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Completed Events</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            {stats.completedEvents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Matches concluded</p>
        </div>

        {/* Events with Pending Results */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs hover:border-amber-300 transition-colors bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 mb-1.5">
            <span className="text-xs font-bold">Pending Results</span>
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700 tracking-tight">
            {stats.pendingResultsEvents}
          </div>
          <p className="text-[11px] text-amber-700/80 mt-1">Awaiting official certification</p>
        </div>

        {/* Events with Declared Winners */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Declared Winners</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-blue-900 tracking-tight">
            {stats.declaredWinnersEvents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Official verified results</p>
        </div>

        {/* Current Overall Leader Card */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs bg-gradient-to-br from-blue-50/40 via-white to-white">
          <div className="flex items-center justify-between text-blue-900 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Leader</span>
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              👑
            </span>
          </div>
          {leader ? (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-blue-950">
                  {leader.college.acronym}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  ({leader.overallPoints} pts)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {leader.college.name}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Standings pending</p>
          )}
        </div>
      </div>

      {/* Game/Match Operational Metrics Strip */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Tournament Match Operations</span>
          </div>
          <button
            onClick={() => onNavigateSection('competitions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>Open Competition Brackets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Matches / Games</span>
            <div className="text-xl font-black text-slate-900">{stats.totalGames}</div>
            <span className="text-[10px] text-slate-400">Across tournament brackets</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-blue-800 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Matches Ongoing
            </span>
            <div className="text-xl font-black text-blue-700">{stats.gamesOngoing}</div>
            <span className="text-[10px] text-blue-600/80">Courts actively playing</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-800 block mb-1">Awaiting Match Results</span>
            <div className="text-xl font-black text-amber-700">{stats.gamesAwaitingResults}</div>
            <span className="text-[10px] text-amber-700/80">Ready for score entry</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-800 block mb-1">Matches Concluded</span>
            <div className="text-xl font-black text-emerald-700">{stats.gamesCompleted}</div>
            <span className="text-[10px] text-slate-400">Scores locked in brackets</span>
          </div>
        </div>
      </div>

      {/* Two-Column Middle Section: Standings Quick View & Immediate Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Quick View of Current Standings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-600" />
                Current Standings Overview
              </h3>
              <p className="text-xs text-slate-500">
                Calculated purely and automatically from official verified results.
              </p>
            </div>
            <button
              onClick={() => onNavigateSection('standings')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Full Standings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">College</th>
                  <th className="py-2.5 px-2 text-center">Sports</th>
                  <th className="py-2.5 px-2 text-center">Cultural</th>
                  <th className="py-2.5 px-2 text-center">Literary</th>
                  <th className="py-2.5 px-2 text-center">Special</th>
                  <th className="py-2.5 px-3 text-right">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overallStandings.map(s => {
                  const badge = getCollegeBadgeStyle(s.college.id);
                  const isTop = s.rank === 1;
                  return (
                    <tr
                      key={s.college.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isTop ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-700">
                        {isTop ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-white text-[11px] font-black">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-1">{s.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${badge.bg} ${badge.text}`}
                          >
                            {s.college.acronym}
                          </span>
                          <span className="font-semibold text-slate-800 hidden sm:inline">
                            {s.college.shortName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-medium text-slate-600">
                        {s.sports}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-medium text-slate-600">
                        {s.cultural}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-medium text-slate-600">
                        {s.literary}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-medium text-slate-600">
                        {s.special}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-sm text-blue-950 font-mono">
                          {s.overallPoints}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Events Requiring Committee Attention */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Action Required
              </h3>
              <p className="text-xs text-slate-500">Live matches and uncertified results</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {pendingEvents.length} items
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs font-semibold text-slate-600">All results up to date!</p>
                <p className="text-[11px]">No events currently pending result declaration.</p>
              </div>
            ) : (
              pendingEvents.slice(0, 4).map(event => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        {event.category}
                      </span>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{event.eventName}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        event.status === 'ongoing'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {event.status === 'ongoing' ? 'Ongoing' : 'Pending Result'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                    <span>{event.venue}</span>
                    <button
                      id={`enter-result-quick-${event.id}`}
                      onClick={() => onEnterResult(event.id)}
                      className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      <span>Enter Results</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Admin Activity Log Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Activity Log</h3>
              <p className="text-xs text-slate-500">
                Official audit trail of tournament administration actions.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection('activity-log')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {activityLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  {log.eventTitle && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {log.eventTitle}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px]">{log.description}</p>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                <span>{log.adminUser}</span>
                <span>•</span>
                <span>{log.date} {log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
