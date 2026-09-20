import React, { useState } from 'react';
import {
  Trophy,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Search,
  ArrowRight,
  ShieldCheck,
  Edit,
  RotateCcw,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Play,
  Calendar,
  MapPin,
  X,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CollegeId, GameMatch, PalakasanEvent, ResultStatus } from '../../types';
import { COLLEGES } from '../../data/initialData';
import { getCategoryMeta, getCollegeBadgeStyle, getPlacementBadge } from '../../utils/collegeTheme';

interface AdminResultsManagementProps {
  onOpenEnterResult: (event: PalakasanEvent) => void;
  onOpenEventDetail: (eventId: string) => void;
}

type ResultTab = 'all' | 'pending' | 'draft' | 'official' | 'live-matches';

export const AdminResultsManagement: React.FC<AdminResultsManagementProps> = ({
  onOpenEnterResult,
  onOpenEventDetail,
}) => {
  const { events, reopenOfficialResult, recordGameResult, editGameResult } = usePalakasan();
  const [currentTab, setCurrentTab] = useState<ResultTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable match breakdown per event
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});

  // Match score entry modal state
  const [activeMatchForScoring, setActiveMatchForScoring] = useState<{
    event: PalakasanEvent;
    game: GameMatch;
  } | null>(null);
  const [matchScoreA, setMatchScoreA] = useState('');
  const [matchScoreB, setMatchScoreB] = useState('');
  const [matchEditReason, setMatchEditReason] = useState('');
  const [matchScoringError, setMatchScoringError] = useState<string | null>(null);

  const toggleMatches = (eventId: string) => {
    setExpandedMatches(prev => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleOpenMatchScore = (event: PalakasanEvent, game: GameMatch) => {
    if (!game.isUnlocked && game.status === 'scheduled') return;
    setActiveMatchForScoring({ event, game });
    setMatchScoreA(game.scoreA !== undefined ? String(game.scoreA) : '');
    setMatchScoreB(game.scoreB !== undefined ? String(game.scoreB) : '');
    setMatchEditReason('');
    setMatchScoringError(null);
  };

  const handleSubmitMatchScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatchForScoring) return;

    const { event, game } = activeMatchForScoring;
    const numA = parseInt(matchScoreA, 10);
    const numB = parseInt(matchScoreB, 10);

    if (isNaN(numA) || isNaN(numB)) {
      setMatchScoringError('Please enter valid numeric scores.');
      return;
    }
    if (numA < 0 || numB < 0) {
      setMatchScoringError('Scores cannot be negative.');
      return;
    }

    if (
      (event.competitionFormat === 'double-elimination' ||
        event.competitionFormat === 'single-elimination') &&
      numA === numB
    ) {
      setMatchScoringError('Elimination matches cannot end in a tie. Please record the score after overtime.');
      return;
    }

    const cA = game.collegeA || game.participantA?.collegeId;
    const cB = game.collegeB || game.participantB?.collegeId;

    if (!cA || !cB) {
      setMatchScoringError('Participating teams must be resolved first.');
      return;
    }

    const winnerId: CollegeId = numA > numB ? cA : cB;
    const loserId: CollegeId = numA > numB ? cB : cA;

    if (game.status === 'completed') {
      const res = editGameResult(
        event.id,
        game.id,
        numA,
        numB,
        winnerId,
        loserId,
        matchEditReason.trim() || 'Score correction',
        'MSUN Tournament Officials'
      );
      if (!res.success) {
        setMatchScoringError(res.error || 'Failed to update score.');
        return;
      }
    } else {
      const res = recordGameResult(
        event.id,
        game.id,
        numA,
        numB,
        winnerId,
        loserId,
        'MSUN Tournament Officials'
      );
      if (!res.success) {
        setMatchScoringError(res.error || 'Failed to record score.');
        return;
      }
    }

    setActiveMatchForScoring(null);
  };

  // Partition events according to their result status:
  const pendingEvents = events.filter(
    e =>
      (!e.resultStatus || e.resultStatus === 'pending') &&
      (e.status === 'completed' || e.status === 'ongoing' || !e.results || e.results.length === 0)
  );

  const draftEvents = events.filter(e => e.resultStatus === 'draft');
  const officialEvents = events.filter(e => e.resultStatus === 'official');
  const liveMatchEvents = events.filter(
    e => e.games && e.games.some(g => g.status === 'ongoing' || (g.isUnlocked && g.status === 'scheduled'))
  );

  let displayEvents: PalakasanEvent[] = [];
  if (currentTab === 'pending') displayEvents = pendingEvents;
  else if (currentTab === 'draft') displayEvents = draftEvents;
  else if (currentTab === 'official') displayEvents = officialEvents;
  else if (currentTab === 'live-matches') displayEvents = liveMatchEvents;
  else displayEvents = [...events];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayEvents = displayEvents.filter(
      e =>
        e.eventName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.results && e.results.some(r => r.collegeId.toLowerCase().includes(q))) ||
        (e.games &&
          e.games.some(
            g => {
              const cA = g.collegeA || g.participantA?.collegeId;
              const cB = g.collegeB || g.participantB?.collegeId;
              return (cA && cA.toLowerCase().includes(q)) || (cB && cB.toLowerCase().includes(q));
            }
          ))
    );
  }

  const handleReopen = async (event: PalakasanEvent) => {
    const reason = window.prompt(
      `Enter reason for reopening official result for "${event.eventName}":`
    );
    if (reason && reason.trim()) {
      await reopenOfficialResult(event.id, reason.trim(), 'MSUN Admin Committee');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Summary Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              Tournament Results Certification Console
            </h3>
            <p className="text-xs text-slate-500">
              Enter match scores, review bracket advancements, and certify binding PALAKASAN championship rankings.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search event, college, or match..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Section Tabs: Pending, Draft, Official, Live Matches */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setCurrentTab('pending')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentTab === 'pending'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Results</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                currentTab === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingEvents.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('live-matches')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentTab === 'live-matches'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tournament Matches</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                currentTab === 'live-matches' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {liveMatchEvents.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('draft')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentTab === 'draft'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Draft Results</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                currentTab === 'draft' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {draftEvents.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('official')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentTab === 'official'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Results</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                currentTab === 'official' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {officialEvents.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              currentTab === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Events ({events.length})
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {displayEvents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No events found in this category</p>
            <p className="text-xs">All records are completely up to date.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayEvents.map(event => {
              const catMeta = getCategoryMeta(event.category);
              const isOfficial = event.resultStatus === 'official';
              const isDraft = event.resultStatus === 'draft';
              const firstPlace = event.results?.find(r => r.placement === '1st');
              const hasGames = event.games && event.games.length > 0;
              const isMatchesExpanded = Boolean(expandedMatches[event.id]);

              const completedGames = event.games?.filter(g => g.status === 'completed').length || 0;
              const totalGames = event.games?.length || 0;
              const allMatchesCompleted = totalGames > 0 && completedGames === totalGames;

              return (
                <div key={event.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Event Meta */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                          {catMeta.icon} {catMeta.name}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                            isOfficial
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDraft
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isOfficial ? 'Official' : isDraft ? 'Draft' : 'Pending Result'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {event.date} • {event.venue}
                        </span>

                        {hasGames && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {event.competitionFormat || 'Bracket'} • {completedGames}/{totalGames} Matches
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900">{event.eventName}</h4>

                      {/* Winner highlight if available */}
                      {firstPlace ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                          <span className="font-bold text-amber-600">👑 Champion:</span>
                          <span className="font-extrabold text-slate-900">{firstPlace.collegeId}</span>
                          <span className="text-slate-400">
                            ({isOfficial ? '50 pts awarded to standings' : 'Awaiting official declaration to credit 50 pts'})
                          </span>
                        </div>
                      ) : allMatchesCompleted && event.championCollegeId ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 w-fit">
                          <span className="font-black">👑 Match Champion:</span>
                          <span className="font-bold">{event.championCollegeId}</span>
                          <span>— Ready to declare official results</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Toggle Matches button if event has games */}
                      {hasGames && (
                        <button
                          type="button"
                          onClick={() => toggleMatches(event.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                            isMatchesExpanded
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isMatchesExpanded ? 'Hide Matches' : 'Manage Match Scores'}</span>
                          {isMatchesExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenEnterResult(event)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-colors ${
                          isOfficial
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {isOfficial
                            ? 'Edit Result'
                            : isDraft
                            ? 'Declare Official'
                            : allMatchesCompleted
                            ? 'Certify Match Results'
                            : 'Declare Official Winner'}
                        </span>
                      </button>

                      {isOfficial && (
                        <button
                          type="button"
                          onClick={() => handleReopen(event)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          title="Reopen official result to draft state"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reopen</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenEventDetail(event.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        title="View complete event parameters"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Match-by-Match Scoring Drawer */}
                  {hasGames && isMatchesExpanded && (
                    <div className="p-4 bg-slate-50/80 border border-blue-200 rounded-xl space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="font-extrabold text-xs text-slate-900">
                            Tournament Matches — {event.competitionFormat || 'Bracket'}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {completedGames} of {totalGames} matches completed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {event.games?.map(game => {
                          const isDone = game.status === 'completed';
                          const isLive = game.status === 'ongoing';
                          const isCancelled = game.status === 'cancelled';
                          const isUnlocked = game.isUnlocked;
                          const colA = game.collegeA || game.participantA?.collegeId;
                          const colB = game.collegeB || game.participantB?.collegeId;
                          const descA = game.sourceDescriptionA || game.participantA?.placeholderText || 'TBD';
                          const descB = game.sourceDescriptionB || game.participantB?.placeholderText || 'TBD';
                          const badgeA = colA ? getCollegeBadgeStyle(colA) : null;
                          const badgeB = colB ? getCollegeBadgeStyle(colB) : null;

                          return (
                            <div
                              key={game.id}
                              className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                                isCancelled
                                  ? 'bg-slate-100/60 border-dashed border-slate-200 opacity-60'
                                  : isDone
                                  ? 'bg-white border-slate-200 shadow-2xs'
                                  : isLive
                                  ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400/20'
                                  : isUnlocked
                                  ? 'bg-white border-blue-200/80 shadow-2xs'
                                  : 'bg-slate-100/50 border-slate-200/60 opacity-80'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-slate-600">
                                  #{game.gameNumber} • {game.roundName}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded font-bold ${
                                    isDone
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isLive
                                      ? 'bg-blue-600 text-white animate-pulse'
                                      : isCancelled
                                      ? 'bg-slate-200 text-slate-600'
                                      : isUnlocked
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {isDone ? 'Completed' : isLive ? 'Live' : isCancelled ? 'N/A' : isUnlocked ? 'Ready' : 'Locked'}
                                </span>
                              </div>

                              {/* Opponents & Score */}
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    {colA && badgeA ? (
                                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${badgeA.bg} ${badgeA.text}`}>
                                        {colA}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic text-[11px]">{descA}</span>
                                    )}
                                    {game.winnerCollegeId === colA && (
                                      <span className="text-[10px] text-emerald-700 font-bold">✓</span>
                                    )}
                                  </div>
                                  <span className="font-mono font-black text-slate-800">
                                    {game.scoreA !== undefined ? game.scoreA : '—'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    {colB && badgeB ? (
                                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${badgeB.bg} ${badgeB.text}`}>
                                        {colB}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic text-[11px]">{descB}</span>
                                    )}
                                    {game.winnerCollegeId === colB && (
                                      <span className="text-[10px] text-emerald-700 font-bold">✓</span>
                                    )}
                                  </div>
                                  <span className="font-mono font-black text-slate-800">
                                    {game.scoreB !== undefined ? game.scoreB : '—'}
                                  </span>
                                </div>
                              </div>

                              {/* Action to Score */}
                              {!isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenMatchScore(event, game)}
                                  disabled={!isUnlocked && !isDone}
                                  className={`w-full py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                                    isDone
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                      : isUnlocked
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  }`}
                                >
                                  {isDone ? (
                                    <>
                                      <Edit className="w-3 h-3" />
                                      <span>Edit Score</span>
                                    </>
                                  ) : isUnlocked ? (
                                    <>
                                      <Play className="w-3 h-3 fill-current" />
                                      <span>Enter Score</span>
                                    </>
                                  ) : (
                                    <span>Waiting Prior Match</span>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Placements Breakdown (1st, 2nd, 3rd, 4th, DQ) */}
                  {event.results && event.results.length > 0 && (
                    <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Recorded Placements & Points
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {event.results.map(r => {
                          const badge = getCollegeBadgeStyle(r.collegeId);
                          const pBadge = getPlacementBadge(r.placement);
                          return (
                            <div
                              key={r.collegeId}
                              className="p-2 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-black border ${pBadge.badgeClass}`}
                                >
                                  {r.placement}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}
                                >
                                  {r.collegeId}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-slate-700 text-[11px]">
                                {r.points} pts
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MATCH SCORE ENTRY MODAL */}
      {activeMatchForScoring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Game #{activeMatchForScoring.game.gameNumber} • {activeMatchForScoring.game.roundName}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Record Match Score
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMatchForScoring(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitMatchScore} className="p-5 space-y-4 text-xs">
              {matchScoringError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{matchScoringError}</span>
                </div>
              )}

              {(() => {
                const teamA = activeMatchForScoring.game.collegeA || activeMatchForScoring.game.participantA?.collegeId;
                const teamB = activeMatchForScoring.game.collegeB || activeMatchForScoring.game.participantB?.collegeId;
                const descA = activeMatchForScoring.game.sourceDescriptionA || activeMatchForScoring.game.participantA?.placeholderText || 'TBD';
                const descB = activeMatchForScoring.game.sourceDescriptionB || activeMatchForScoring.game.participantB?.placeholderText || 'TBD';
                const badgeA = teamA ? getCollegeBadgeStyle(teamA) : null;
                const badgeB = teamB ? getCollegeBadgeStyle(teamB) : null;

                return (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Team A</span>
                      <div>
                        {teamA && badgeA ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-black ${badgeA.bg} ${badgeA.text}`}
                          >
                            {teamA}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-600">
                            {descA}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={matchScoreA}
                        onChange={e => setMatchScoreA(e.target.value)}
                        placeholder="0"
                        className="w-20 mx-auto text-center font-black text-lg py-1 bg-white border border-slate-300 rounded-lg"
                        required
                      />
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Team B</span>
                      <div>
                        {teamB && badgeB ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-black ${badgeB.bg} ${badgeB.text}`}
                          >
                            {teamB}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-600">
                            {descB}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={matchScoreB}
                        onChange={e => setMatchScoreB(e.target.value)}
                        placeholder="0"
                        className="w-20 mx-auto text-center font-black text-lg py-1 bg-white border border-slate-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                );
              })()}

              {activeMatchForScoring.game.status === 'completed' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Correction Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={matchEditReason}
                    onChange={e => setMatchEditReason(e.target.value)}
                    placeholder="e.g. Referee audit revision"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveMatchForScoring(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {activeMatchForScoring.game.status === 'completed' ? 'Save Correction' : 'Commit Match Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
