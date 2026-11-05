import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Play,
  RotateCcw,
  Edit,
  ShieldCheck,
  ChevronRight,
  Info,
  CalendarDays,
  ArrowRight,
  Search,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import {
  CollegeId,
  CompetitionFormat,
  GameMatch,
  GameStatus,
  PalakasanEvent,
} from '../../types';
import { COLLEGES } from '../../data/initialData';
import { getCategoryMeta, getCollegeBadgeStyle } from '../../utils/collegeTheme';

interface AdminCompetitionsProps {
  onOpenDeclareWinner: (event: PalakasanEvent) => void;
  onOpenEventDetail: (eventId: string) => void;
}

export const AdminCompetitions: React.FC<AdminCompetitionsProps> = ({
  onOpenDeclareWinner,
  onOpenEventDetail,
}) => {
  const {
    events,
    recordGameResult,
    editGameResult,
    rescheduleGame,
    generateEventMatches,
  } = usePalakasan();

  // Filter state
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Events that have competition formats or games
  const competitionEvents = events.filter(
    e => Boolean(e.competitionFormat) || (e.games && e.games.length > 0)
  );

  // Default active event selection
  const [activeEventId, setActiveEventId] = useState<string>(() => {
    return competitionEvents[0]?.id || '';
  });

  const activeEvent =
    events.find(e => e.id === activeEventId) || competitionEvents[0] || null;

  // Match Scoring Modal State
  const [scoringGame, setScoringGame] = useState<GameMatch | null>(null);
  const [scoreA, setScoreA] = useState<string>('');
  const [scoreB, setScoreB] = useState<string>('');
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Reschedule Modal State
  const [reschedulingGame, setReschedulingGame] = useState<GameMatch | null>(null);
  const [newGameDate, setNewGameDate] = useState('');
  const [newGameStartTime, setNewGameStartTime] = useState('');
  const [newGameEndTime, setNewGameEndTime] = useState('');
  const [newGameVenue, setNewGameVenue] = useState('');

  // Open Score Entry Modal
  const handleOpenScoreEntry = (game: GameMatch) => {
    if (!game.isUnlocked && game.status === 'scheduled') {
      return; // Locked match waiting for prior results
    }
    setScoringGame(game);
    setScoreA(game.scoreA !== undefined ? String(game.scoreA) : '');
    setScoreB(game.scoreB !== undefined ? String(game.scoreB) : '');
    setIsEditingExisting(game.status === 'completed');
    setEditReason('');
    setScoringError(null);
  };

  // Submit Match Score
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !scoringGame || isSavingScore) return;

    const numA = parseInt(scoreA, 10);
    const numB = parseInt(scoreB, 10);

    if (isNaN(numA) || isNaN(numB)) {
      setScoringError('Please enter valid numeric scores for both teams.');
      return;
    }

    if (numA < 0 || numB < 0) {
      setScoringError('Scores cannot be negative.');
      return;
    }

    // Double elimination and single elimination matches cannot end in a draw
    if (
      (activeEvent.competitionFormat === 'double-elimination' ||
        activeEvent.competitionFormat === 'single-elimination') &&
      numA === numB
    ) {
      setScoringError(
        'Elimination bracket matches cannot end in a tie. Please record the final score after overtime/deciding set.'
      );
      return;
    }

    const cA = scoringGame.collegeA || scoringGame.participantA?.collegeId;
    const cB = scoringGame.collegeB || scoringGame.participantB?.collegeId;

    if (!cA || !cB) {
      setScoringError('Both colleges must be determined before recording scores.');
      return;
    }

    let winnerId: CollegeId;
    let loserId: CollegeId;

    if (numA > numB) {
      winnerId = cA;
      loserId = cB;
    } else {
      winnerId = cB;
      loserId = cA;
    }

    setIsSavingScore(true);
    setScoringError(null);

    try {
      if (isEditingExisting) {
        const res = await editGameResult(
          activeEvent.id,
          scoringGame.id,
          numA,
          numB,
          winnerId,
          loserId,
          editReason.trim() || 'Score correction',
          'MSUN Tournament Officials'
        );
        if (!res.success) {
          setScoringError(res.error || 'Failed to update game score.');
          return;
        }
      } else {
        const res = await recordGameResult(
          activeEvent.id,
          scoringGame.id,
          numA,
          numB,
          winnerId,
          loserId,
          'MSUN Tournament Officials'
        );
        if (!res.success) {
          setScoringError(res.error || 'Failed to record game score.');
          return;
        }
      }

      setScoringGame(null);
    } catch (err: any) {
      setScoringError(err?.message || 'Failed to record game score.');
    } finally {
      setIsSavingScore(false);
    }
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (game: GameMatch) => {
    setReschedulingGame(game);
    setNewGameDate(game.date);
    setNewGameStartTime(game.startTime);
    setNewGameEndTime(game.endTime);
    setNewGameVenue(game.venue);
  };

  // Submit Reschedule
  const handleSubmitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !reschedulingGame) return;

    if (!newGameDate || !newGameStartTime || !newGameEndTime) return;

    rescheduleGame(
      activeEvent.id,
      reschedulingGame.id,
      newGameDate,
      newGameStartTime,
      newGameEndTime,
      newGameVenue || reschedulingGame.venue,
      'MSUN Scheduling Committee'
    );

    setReschedulingGame(null);
  };

  // Regenerate Bracket
  const handleRegenerateBracket = () => {
    if (!activeEvent) return;
    const format = activeEvent.competitionFormat || 'double-elimination';
    if (
      window.confirm(
        `Are you sure you want to regenerate all matches for "${activeEvent.eventName}" (${format})? This will reset all match scores in this event.`
      )
    ) {
      generateEventMatches(activeEvent.id, format, 'MSUN Competition Committee');
    }
  };

  // Filter list of competitions
  const filteredCompetitions = competitionEvents.filter(ev => {
    if (selectedFormatFilter !== 'all' && ev.competitionFormat !== selectedFormatFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ev.eventName.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Tournament Automation Engine
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Competitions & Bracket Management
            </h3>
            <p className="text-xs text-slate-500">
              Oversee tournament brackets, record match scores, automate team advancements, and determine final medal placements.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tournaments..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Format Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Format:
          </span>
          <button
            onClick={() => setSelectedFormatFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              selectedFormatFilter === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Tournaments ({competitionEvents.length})
          </button>
          <button
            onClick={() => setSelectedFormatFilter('double-elimination')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              selectedFormatFilter === 'double-elimination'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Double Elimination
          </button>
          <button
            onClick={() => setSelectedFormatFilter('round-robin')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              selectedFormatFilter === 'round-robin'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Round Robin
          </button>
          <button
            onClick={() => setSelectedFormatFilter('single-elimination')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              selectedFormatFilter === 'single-elimination'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Single Elimination
          </button>
        </div>
      </div>

      {/* Main Two-Column View: Left Event Selector, Right Bracket / Games Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column (1 col): List of Tournaments */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Active Tournaments ({filteredCompetitions.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredCompetitions.map(ev => {
              const isSelected = ev.id === (activeEvent?.id || '');
              const totalGames = ev.games?.length || 0;
              const completedGames =
                ev.games?.filter(g => g.status === 'completed').length || 0;
              const isOfficial = ev.resultStatus === 'official';

              return (
                <button
                  key={ev.id}
                  onClick={() => setActiveEventId(ev.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        ev.competitionFormat === 'double-elimination'
                          ? 'bg-indigo-100 text-indigo-800'
                          : ev.competitionFormat === 'round-robin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ev.competitionFormat === 'double-elimination'
                        ? 'Double Elim'
                        : ev.competitionFormat === 'round-robin'
                        ? 'Round Robin'
                        : ev.competitionFormat || 'Tournament'}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isOfficial
                          ? 'text-emerald-700'
                          : ev.status === 'completed'
                          ? 'text-blue-700'
                          : ev.status === 'ongoing'
                          ? 'text-blue-600 animate-pulse'
                          : 'text-slate-400'
                      }`}
                    >
                      {isOfficial
                        ? 'Certified'
                        : ev.status === 'completed'
                        ? 'Completed'
                        : ev.status === 'ongoing'
                        ? 'Live'
                        : 'Upcoming'}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1 mb-1">
                    {ev.eventName}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {completedGames} / {totalGames} matches
                    </span>
                    <span className="text-[10px] text-slate-400">{ev.venue}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOfficial ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{
                        width: totalGames > 0 ? `${(completedGames / totalGames) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </button>
              );
            })}

            {filteredCompetitions.length === 0 && (
              <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                No competitions found matching filters.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (3 cols): Active Tournament Dashboard & Match Visualizer */}
        <div className="lg:col-span-3 space-y-6">
          {activeEvent ? (
            <div className="space-y-6">
              {/* Event Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                        {getCategoryMeta(activeEvent.category).icon}{' '}
                        {getCategoryMeta(activeEvent.category).name}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {activeEvent.date} ({activeEvent.startTime} – {activeEvent.endTime})
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {activeEvent.venue}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {activeEvent.eventName}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleRegenerateBracket}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                      title="Reset and regenerate all tournament match pairings"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Regenerate Bracket</span>
                    </button>

                    <button
                      onClick={() => onOpenEventDetail(activeEvent.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <span>Event Info</span>
                    </button>

                    <button
                      onClick={() => onOpenDeclareWinner(activeEvent)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {activeEvent.resultStatus === 'official'
                          ? 'Edit Official Results'
                          : 'Declare Official Results'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tournament Completion Banner if Champion Decided */}
                {activeEvent.championCollegeId && (
                  <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-white border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                        👑
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                          Tournament Champion Crowned
                        </div>
                        <div className="text-base font-black text-slate-900">
                          {activeEvent.championCollegeId} –{' '}
                          {
                            COLLEGES.find(c => c.id === activeEvent.championCollegeId)
                              ?.shortName
                          }
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        {activeEvent.resultStatus === 'official'
                          ? 'Points Certified'
                          : 'Awaiting Official Certification'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tournament Format Body */}
              {activeEvent.competitionFormat === 'double-elimination' && (
                <DoubleEliminationBracketView
                  event={activeEvent}
                  onScoreEntry={handleOpenScoreEntry}
                  onReschedule={handleOpenReschedule}
                />
              )}

              {activeEvent.competitionFormat === 'round-robin' && (
                <RoundRobinTableView
                  event={activeEvent}
                  onScoreEntry={handleOpenScoreEntry}
                  onReschedule={handleOpenReschedule}
                />
              )}

              {(activeEvent.competitionFormat === 'single-elimination' ||
                !activeEvent.competitionFormat) && (
                <SingleEliminationBracketView
                  event={activeEvent}
                  onScoreEntry={handleOpenScoreEntry}
                  onReschedule={handleOpenReschedule}
                />
              )}
            </div>
          ) : (
            <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 space-y-3">
              <Trophy className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">No Competition Selected</h3>
              <p className="text-xs">
                Select a tournament from the left panel to manage matches, enter scores, and review bracket progressions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MATCH SCORE ENTRY MODAL */}
      {/* ========================================================================= */}
      {scoringGame && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Game #{scoringGame.gameNumber} • {scoringGame.roundName}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Enter Match Score & Result
                </h3>
              </div>
              <button
                onClick={() => setScoringGame(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitScore} className="p-6 space-y-5 text-xs">
              {scoringError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{scoringError}</span>
                </div>
              )}

              {/* Matchup Banner */}
              {(() => {
                const teamA = scoringGame.collegeA || scoringGame.participantA?.collegeId;
                const teamB = scoringGame.collegeB || scoringGame.participantB?.collegeId;
                const descA = scoringGame.sourceDescriptionA || scoringGame.participantA?.placeholderText || 'TBD';
                const descB = scoringGame.sourceDescriptionB || scoringGame.participantB?.placeholderText || 'TBD';
                const badgeA = teamA ? getCollegeBadgeStyle(teamA) : null;
                const badgeB = teamB ? getCollegeBadgeStyle(teamB) : null;

                return (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {/* Team A */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Team A
                      </div>
                      {teamA && badgeA ? (
                        <div>
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-sm font-black ${badgeA.bg} ${badgeA.text}`}
                          >
                            {teamA}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            {COLLEGES.find(c => c.id === teamA)?.shortName}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">
                          {descA}
                        </span>
                      )}
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Final Score:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={scoreA}
                          onChange={e => setScoreA(e.target.value)}
                          placeholder="0"
                          className="w-24 mx-auto text-center font-black text-lg py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                          required
                        />
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Team B
                      </div>
                      {teamB && badgeB ? (
                        <div>
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-sm font-black ${badgeB.bg} ${badgeB.text}`}
                          >
                            {teamB}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            {COLLEGES.find(c => c.id === teamB)?.shortName}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">
                          {descB}
                        </span>
                      )}
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Final Score:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={scoreB}
                          onChange={e => setScoreB(e.target.value)}
                          placeholder="0"
                          className="w-24 mx-auto text-center font-black text-lg py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                          required
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Dynamic Advancement Hint */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-slate-600 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <Info className="w-3.5 h-3.5" />
                  <span>Automatic Tournament Consequences:</span>
                </div>
                {activeEvent.competitionFormat === 'double-elimination' && (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                    {scoringGame.gameNumber <= 2 && (
                      <>
                        <li>Winner advances to Winners Bracket Final (Game 3)</li>
                        <li>Loser moves to Losers Bracket Round 1 (Game 4)</li>
                      </>
                    )}
                    {scoringGame.gameNumber === 3 && (
                      <>
                        <li>Winner advances to Grand Championship (Game 6)</li>
                        <li>Loser moves to Losers Bracket Final (Game 5)</li>
                      </>
                    )}
                    {scoringGame.gameNumber === 4 && (
                      <>
                        <li>Winner advances to Losers Bracket Final (Game 5)</li>
                        <li className="text-red-700 font-semibold">
                          Loser is ELIMINATED with 2 losses (4th Place confirmed)
                        </li>
                      </>
                    )}
                    {scoringGame.gameNumber === 5 && (
                      <>
                        <li>Winner advances to Grand Championship (Game 6)</li>
                        <li className="text-amber-700 font-semibold">
                          Loser is ELIMINATED (3rd Place confirmed)
                        </li>
                      </>
                    )}
                    {scoringGame.gameNumber === 6 && (
                      <>
                        <li>If WB winner wins: Crowned Tournament Champion!</li>
                        <li>
                          If LB winner wins: Triggers Championship Reset Game 7!
                        </li>
                      </>
                    )}
                    {scoringGame.gameNumber === 7 && (
                      <>
                        <li>Winner is crowned Tournament Champion (1st Place)!</li>
                        <li>Loser finishes as Tournament Runner-up (2nd Place).</li>
                      </>
                    )}
                  </ul>
                )}
                {activeEvent.competitionFormat === 'round-robin' && (
                  <p>
                    Group standings, match counts, score differential, and competition points will automatically update.
                  </p>
                )}
              </div>

              {/* Edit Reason for already completed games */}
              {isEditingExisting && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Audit Log Reason for Correction <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={e => setEditReason(e.target.value)}
                    placeholder="e.g. Typo correction from official referee scoresheet"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSavingScore}
                  onClick={() => setScoringGame(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingScore}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSavingScore ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {isSavingScore
                      ? 'Saving Result...'
                      : isEditingExisting
                      ? 'Save Corrected Score'
                      : 'Record Official Match Result'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MATCH RESCHEDULE MODAL */}
      {/* ========================================================================= */}
      {reschedulingGame && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Game #{reschedulingGame.gameNumber} • {reschedulingGame.roundName}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Reschedule Match Time & Venue
                </h3>
              </div>
              <button
                onClick={() => setReschedulingGame(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReschedule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Match Date</label>
                <input
                  type="date"
                  value={newGameDate}
                  onChange={e => setNewGameDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={newGameStartTime}
                    onChange={e => setNewGameStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={newGameEndTime}
                    onChange={e => setNewGameEndTime(e.target.value)}
                    placeholder="11:30 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Court / Venue
                </label>
                <input
                  type="text"
                  value={newGameVenue}
                  onChange={e => setNewGameVenue(e.target.value)}
                  placeholder="e.g. Basketball Court 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReschedulingGame(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: DOUBLE ELIMINATION BRACKET VIEW
// =========================================================================
interface SubBracketProps {
  event: PalakasanEvent;
  onScoreEntry: (game: GameMatch) => void;
  onReschedule: (game: GameMatch) => void;
}

const DoubleEliminationBracketView: React.FC<SubBracketProps> = ({
  event,
  onScoreEntry,
  onReschedule,
}) => {
  const games = event.games || [];

  const g1 = games.find(g => g.gameNumber === 1);
  const g2 = games.find(g => g.gameNumber === 2);
  const g3 = games.find(g => g.gameNumber === 3);
  const g4 = games.find(g => g.gameNumber === 4);
  const g5 = games.find(g => g.gameNumber === 5);
  const g6 = games.find(g => g.gameNumber === 6);
  const g7 = games.find(g => g.gameNumber === 7);

  return (
    <div className="space-y-6">
      {/* Bracket Overview Explainer */}
      <div className="p-4 bg-blue-50/60 border border-blue-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="font-bold text-blue-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>4-College Double Elimination Tournament Structure</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Teams require 2 losses to be eliminated. Winners bracket finalists advance to Grand Finals; Game 7 is dynamically activated only if the Losers bracket champion defeats the undefeated team in Game 6.
          </p>
        </div>

        {event.eliminatedColleges && event.eliminatedColleges.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-500">Eliminated:</span>
            {event.eliminatedColleges.map(el => (
              <span
                key={el.collegeId}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700"
              >
                {el.collegeId} ({el.placement})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: WINNERS BRACKET */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Winners Bracket (Upper)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">0 Losses</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* WB Semifinals */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Semifinals (Round 1)
            </div>
            {g1 && (
              <MatchCardItem
                game={g1}
                onScoreEntry={onScoreEntry}
                onReschedule={onReschedule}
              />
            )}
            {g2 && (
              <MatchCardItem
                game={g2}
                onScoreEntry={onScoreEntry}
                onReschedule={onReschedule}
              />
            )}
          </div>

          {/* WB Final */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Winners Bracket Final
            </div>
            {g3 && (
              <MatchCardItem
                game={g3}
                onScoreEntry={onScoreEntry}
                onReschedule={onReschedule}
                note="Winner advances directly to Grand Championship. Loser moves to Losers Bracket Final (Game 5)."
              />
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: LOSERS BRACKET */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Losers Bracket (Elimination Stage)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">1 Loss — Facing Elimination</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LB Round 1 */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Minor Semifinal (1st Elimination)
            </div>
            {g4 && (
              <MatchCardItem
                game={g4}
                onScoreEntry={onScoreEntry}
                onReschedule={onReschedule}
                note="Losing team suffers 2nd loss and is permanently ELIMINATED (4th Place)."
              />
            )}
          </div>

          {/* LB Final */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Losers Bracket Final (3rd Place Decider)
            </div>
            {g5 && (
              <MatchCardItem
                game={g5}
                onScoreEntry={onScoreEntry}
                onReschedule={onReschedule}
                note="Winner advances to Grand Championship. Losing team is ELIMINATED (3rd Place Bronze)."
              />
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: GRAND CHAMPIONSHIP */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏆 Grand Championship Final</span>
            </h3>
          </div>
          <span className="text-[11px] text-amber-700 font-bold">1st & 2nd Place Decider</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Game 6 */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Championship Game 6
            </div>
            {g6 && (
              <MatchCardItem
                game={g6}
                onScoreEntry={onScoreEntry}
                onReschedule={onReschedule}
                note="If WB finalist wins, they are crowned Tournament Champion! If LB finalist wins, Reset Game 7 is activated."
              />
            )}
          </div>

          {/* Game 7 (Conditional Reset) */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Championship Reset (Game 7)</span>
              {g7?.status === 'cancelled' && (
                <span className="text-[10px] text-slate-400 font-normal italic">
                  Not needed (Champion decided in Game 6)
                </span>
              )}
            </div>
            {g7 && (
              <MatchCardItem
                game={g7}
                onScoreEntry={onScoreEntry}
                onReschedule={onReschedule}
                isConditionalReset={true}
                note="Conditional 'if necessary' match. Activated only if LB champion beats WB champion in Game 6."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: ROUND ROBIN TABLE & GAMES VIEW
// =========================================================================
const RoundRobinTableView: React.FC<SubBracketProps> = ({
  event,
  onScoreEntry,
  onReschedule,
}) => {
  const games = event.games || [];
  const stats = event.roundRobinStats || [];

  return (
    <div className="space-y-6">
      {/* Standings Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span>Round Robin Group Standings Table</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Rankings automatically calculate: 3 pts per win, 0 per loss. Tie-breakers resolve head-to-head and score differentials.
            </p>
          </div>
          <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
            Tie-Breaker: Competition Points → Head-to-Head → Score Diff
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-2 text-center w-10">Rank</th>
                <th className="py-2 px-3">College</th>
                <th className="py-2 px-2 text-center">P</th>
                <th className="py-2 px-2 text-center text-emerald-700 font-black">W</th>
                <th className="py-2 px-2 text-center text-red-600">L</th>
                <th className="py-2 px-2 text-center">PF</th>
                <th className="py-2 px-2 text-center">PA</th>
                <th className="py-2 px-2 text-center">+/-</th>
                <th className="py-2 px-3 text-center font-black text-blue-900">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map((row, idx) => {
                const badge = getCollegeBadgeStyle(row.collegeId);
                const col = COLLEGES.find(c => c.id === row.collegeId);

                return (
                  <tr
                    key={row.collegeId}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      idx === 0 ? 'bg-amber-50/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-900/10 text-amber-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          {row.collegeId}
                        </span>
                        <span className="text-xs text-slate-700 font-bold hidden sm:inline">
                          {col?.shortName}
                        </span>
                        {idx === 0 && row.won > 0 && (
                          <span className="text-[10px] text-amber-600 font-black">
                            👑 Current 1st
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600 font-semibold">
                      {row.played}
                    </td>
                    <td className="py-2.5 px-2 text-center text-emerald-700 font-black">
                      {row.won}
                    </td>
                    <td className="py-2.5 px-2 text-center text-red-600 font-semibold">
                      {row.lost}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-mono">
                      {row.pointsFor}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-mono">
                      {row.pointsAgainst}
                    </td>
                    <td
                      className={`py-2.5 px-2 text-center font-mono font-bold ${
                        row.pointDifference > 0
                          ? 'text-emerald-600'
                          : row.pointDifference < 0
                          ? 'text-red-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.pointDifference > 0 ? `+${row.pointDifference}` : row.pointDifference}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-black text-xs">
                        {row.competitionPoints}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matches Grid (6 Games) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>Group Fixtures & Results (6 Games Total)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            {games.filter(g => g.status === 'completed').length} / {games.length} matches completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map(game => (
            <MatchCardItem
              key={game.id}
              game={game}
              onScoreEntry={onScoreEntry}
              onReschedule={onReschedule}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: SINGLE ELIMINATION BRACKET VIEW
// =========================================================================
const SingleEliminationBracketView: React.FC<SubBracketProps> = ({
  event,
  onScoreEntry,
  onReschedule,
}) => {
  const games = event.games || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Single Elimination Bracket Fixtures
        </h3>
        <span className="text-[11px] text-slate-400">
          {games.filter(g => g.status === 'completed').length} / {games.length} Completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map(game => (
          <MatchCardItem
            key={game.id}
            game={game}
            onScoreEntry={onScoreEntry}
            onReschedule={onReschedule}
          />
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// REUSABLE MATCH CARD ITEM
// =========================================================================
interface MatchCardItemProps {
  game: GameMatch;
  onScoreEntry: (game: GameMatch) => void;
  onReschedule: (game: GameMatch) => void;
  note?: string;
  isConditionalReset?: boolean;
}

const MatchCardItem: React.FC<MatchCardItemProps> = ({
  game,
  onScoreEntry,
  onReschedule,
  note,
  isConditionalReset,
}) => {
  const isCompleted = game.status === 'completed';
  const isOngoing = game.status === 'ongoing';
  const isCancelled = game.status === 'cancelled';
  const isUnlocked = game.isUnlocked;

  const badgeA = game.collegeA ? getCollegeBadgeStyle(game.collegeA) : null;
  const badgeB = game.collegeB ? getCollegeBadgeStyle(game.collegeB) : null;

  const isWinnerA = isCompleted && game.winnerCollegeId === game.collegeA;
  const isWinnerB = isCompleted && game.winnerCollegeId === game.collegeB;

  return (
    <div
      className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${
        isCancelled
          ? 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'
          : !isUnlocked && !isCompleted
          ? 'bg-slate-50/40 border-slate-200/60 opacity-80'
          : isOngoing
          ? 'bg-blue-50/40 border-blue-400 ring-1 ring-blue-400/20'
          : isCompleted
          ? 'bg-white border-slate-200 shadow-2xs'
          : 'bg-white border-slate-200/90 shadow-2xs hover:border-blue-300'
      }`}
    >
      {/* Match Header */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-800 font-extrabold">
            #{game.gameNumber}
          </span>
          <span className="uppercase tracking-wider">{game.roundName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isCompleted && (
            <span className="px-2 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800">
              Completed
            </span>
          )}
          {isOngoing && (
            <span className="px-2 py-0.2 rounded-full font-bold bg-blue-600 text-white animate-pulse">
              Live
            </span>
          )}
          {!isCompleted && !isOngoing && !isCancelled && isUnlocked && (
            <span className="px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
              Ready
            </span>
          )}
          {!isCompleted && !isOngoing && !isCancelled && !isUnlocked && (
            <span className="px-2 py-0.2 rounded-full font-bold bg-slate-100 text-slate-500">
              Awaiting Prior Match
            </span>
          )}
          {isCancelled && (
            <span className="px-2 py-0.2 rounded-full font-bold bg-slate-200 text-slate-600">
              Not Required
            </span>
          )}

          <button
            type="button"
            onClick={() => onReschedule(game)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Reschedule match date or venue"
          >
            <CalendarDays className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Opponents & Score Row */}
      <div className="space-y-1.5 pt-1">
        {/* Team A */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
            isWinnerA
              ? 'bg-emerald-50/80 border border-emerald-200 font-bold'
              : 'bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-2">
            {game.collegeA && badgeA ? (
              <span
                className={`px-2 py-0.5 rounded text-xs font-black ${badgeA.bg} ${badgeA.text}`}
              >
                {game.collegeA}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {game.sourceDescriptionA || 'TBD'}
              </span>
            )}
            {isWinnerA && <span className="text-[10px] text-emerald-700 font-black">WINNER</span>}
          </div>

          <span
            className={`font-mono text-sm font-black ${
              isWinnerA ? 'text-emerald-800' : 'text-slate-700'
            }`}
          >
            {game.scoreA !== undefined ? game.scoreA : '—'}
          </span>
        </div>

        {/* Team B */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
            isWinnerB
              ? 'bg-emerald-50/80 border border-emerald-200 font-bold'
              : 'bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-2">
            {game.collegeB && badgeB ? (
              <span
                className={`px-2 py-0.5 rounded text-xs font-black ${badgeB.bg} ${badgeB.text}`}
              >
                {game.collegeB}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {game.sourceDescriptionB || 'TBD'}
              </span>
            )}
            {isWinnerB && <span className="text-[10px] text-emerald-700 font-black">WINNER</span>}
          </div>

          <span
            className={`font-mono text-sm font-black ${
              isWinnerB ? 'text-emerald-800' : 'text-slate-700'
            }`}
          >
            {game.scoreB !== undefined ? game.scoreB : '—'}
          </span>
        </div>
      </div>

      {/* Match Meta: Venue & Timing */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>
            {game.date} • {game.startTime}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span className="truncate max-w-[120px]">{game.venue}</span>
        </div>
      </div>

      {/* Note / Consequence description */}
      {note && !isCancelled && (
        <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
          {note}
        </p>
      )}

      {/* Action Button */}
      {!isCancelled && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => onScoreEntry(game)}
            disabled={!isUnlocked && !isCompleted}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isCompleted
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : isUnlocked
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isCompleted ? (
              <>
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Match Score</span>
              </>
            ) : isUnlocked ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Enter Match Score</span>
              </>
            ) : (
              <span>Locked (Waiting on prior matches)</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
