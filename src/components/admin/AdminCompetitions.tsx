import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Edit,
  ShieldCheck,
  ChevronRight,
  Info,
  CalendarDays,
  ArrowRight,
  Search,
  Users,
  SlidersHorizontal,
  Shuffle,
  ArrowLeftRight,
  X,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import {
  CollegeId,
  CompetitionFormat,
  GameMatch,
  GameStatus,
  PalakasanEvent,
  SubCategoryDiscipline,
} from '../../types';
import { COLLEGES } from '../../data/initialData';
import { getCategoryMeta, getCollegeBadgeStyle } from '../../utils/collegeTheme';
import {
  canConfigureSubEvents,
  getDefaultSubCategoriesForEvent,
  isSpecialMultiCategorySport,
} from '../../utils/competitionEngine';

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
    colleges,
    recordGameResult,
    editGameResult,
    rescheduleGame,
    generateEventMatches,
    updateGameParticipants,
    updateEventBracketPairings,
    initializeEventSubCategories,
    addEventSubCategory,
    removeEventSubCategory,
    generateSubCategoryMatches,
    deleteEventBracket,
    disableEventSubCategories,
    enableEventSubCategories,
    pauseEvent,
    resumeEvent,
  } = usePalakasan();

  const collegeList = colleges && colleges.length > 0 ? colleges : COLLEGES;

  // Filter state
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Events that have competition formats, games, sub-event divisions, or belong to sports
  const competitionEvents = events.filter(
    e =>
      e.category === 'sports' ||
      Boolean(e.competitionFormat) ||
      (e.games && e.games.length > 0) ||
      isSpecialMultiCategorySport(e)
  );

  // Default active event selection
  const [activeEventId, setActiveEventId] = useState<string>(() => {
    return competitionEvents[0]?.id || '';
  });

  const activeEvent =
    events.find(e => e.id === activeEventId) || competitionEvents[0] || null;

  // Special Sports Sub-Event State
  const isSpecialSport = isSpecialMultiCategorySport(activeEvent);
  const canHaveSubEvents = canConfigureSubEvents(activeEvent);
  const subCategories: SubCategoryDiscipline[] = activeEvent?.subCategories || [];
  const hasSubCategories = isSpecialSport && subCategories.length > 0;
  const [quickGenerateFormat, setQuickGenerateFormat] =
    useState<CompetitionFormat>('double-elimination');

  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string>('');
  const [setupDraftSubs, setSetupDraftSubs] = useState<
    Array<{ id: string; name: string; competitionFormat: CompetitionFormat }>
  >([]);
  const [setupDefaultFormat, setSetupDefaultFormat] =
    useState<CompetitionFormat>('double-elimination');
  const [setupNewSubName, setSetupNewSubName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubFormat, setNewSubFormat] =
    useState<CompetitionFormat>('double-elimination');
  const [subActionError, setSubActionError] = useState<string | null>(null);
  const [isSubActionSaving, setIsSubActionSaving] = useState(false);

  const effectiveSubCategory: SubCategoryDiscipline | null = hasSubCategories
    ? subCategories.find(s => s.id === activeSubCategoryId) || subCategories[0] || null
    : null;

  const scopedSubCategoryId =
    hasSubCategories && effectiveSubCategory ? effectiveSubCategory.id : undefined;

  const activeFormat: CompetitionFormat =
    hasSubCategories && effectiveSubCategory
      ? effectiveSubCategory.competitionFormat || 'double-elimination'
      : activeEvent?.competitionFormat || 'double-elimination';

  const activeGames: GameMatch[] =
    hasSubCategories && effectiveSubCategory
      ? effectiveSubCategory.games || []
      : activeEvent?.games || [];

  const bracketViewEvent: PalakasanEvent | null = activeEvent
    ? hasSubCategories && effectiveSubCategory
      ? {
          ...activeEvent,
          competitionFormat: effectiveSubCategory.competitionFormat || 'double-elimination',
          games: effectiveSubCategory.games || [],
          eliminatedColleges: effectiveSubCategory.eliminatedColleges,
          roundRobinStats: effectiveSubCategory.roundRobinStats,
          championCollegeId: effectiveSubCategory.championCollegeId,
        }
      : activeEvent
    : null;

  // Sync active sub-category & initial draft list when switching events
  useEffect(() => {
    if (!activeEvent) {
      setActiveSubCategoryId('');
      setSetupDraftSubs([]);
      return;
    }
    const subs = activeEvent.subCategories || [];
    if (subs.length > 0) {
      setActiveSubCategoryId(prev =>
        subs.some(s => s.id === prev) ? prev : subs[0].id
      );
    } else {
      setActiveSubCategoryId('');
    }
    const defaults = getDefaultSubCategoriesForEvent(
      activeEvent.eventName,
      activeEvent.competitionFormat || 'double-elimination'
    );
    setSetupDraftSubs(
      defaults.map((d, idx) => ({
        id: `draft-${idx}-${d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: d.name,
        competitionFormat: d.competitionFormat,
      }))
    );
    setSetupDefaultFormat(activeEvent.competitionFormat || 'double-elimination');
    setSetupNewSubName('');
    setNewSubName('');
    setSubActionError(null);
  }, [activeEvent?.id]);

  // Keep activeSubCategoryId valid if sub-categories change externally
  useEffect(() => {
    if (subCategories.length > 0 && !subCategories.some(s => s.id === activeSubCategoryId)) {
      setActiveSubCategoryId(subCategories[0].id);
    }
  }, [subCategories.length, activeSubCategoryId]);

  const handleInitializeSubBrackets = async () => {
    if (!activeEvent || isSubActionSaving) return;
    const validItems = setupDraftSubs
      .map(s => ({ name: s.name.trim(), competitionFormat: s.competitionFormat }))
      .filter(s => s.name.length > 0);
    if (validItems.length === 0) {
      setSubActionError('Add at least one sub-event division before generating brackets.');
      return;
    }
    setIsSubActionSaving(true);
    setSubActionError(null);
    try {
      const res = await initializeEventSubCategories(
        activeEvent.id,
        validItems,
        'MSUN Competition Committee'
      );
      if (!res.success) {
        setSubActionError(res.error || 'Failed to initialize sub-event brackets.');
      }
    } finally {
      setIsSubActionSaving(false);
    }
  };

  const handleAddSingleSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || isSubActionSaving) return;
    const trimmed = newSubName.trim();
    if (!trimmed) {
      setSubActionError('Please enter a sub-event name (e.g. Laban Lightweight Men).');
      return;
    }
    setIsSubActionSaving(true);
    setSubActionError(null);
    try {
      const res = await addEventSubCategory(
        activeEvent.id,
        trimmed,
        newSubFormat,
        'MSUN Competition Committee'
      );
      if (!res.success) {
        setSubActionError(res.error || 'Failed to add sub-event.');
      } else {
        setNewSubName('');
      }
    } finally {
      setIsSubActionSaving(false);
    }
  };

  const handleRemoveSubCategory = async (sub: SubCategoryDiscipline) => {
    if (!activeEvent || isSubActionSaving) return;
    if (
      !window.confirm(
        `Remove sub-event "${sub.name}" and its bracket from "${activeEvent.eventName}"?`
      )
    ) {
      return;
    }
    setIsSubActionSaving(true);
    setSubActionError(null);
    try {
      const res = await removeEventSubCategory(
        activeEvent.id,
        sub.id,
        'MSUN Competition Committee'
      );
      if (!res.success) {
        setSubActionError(res.error || 'Failed to remove sub-event.');
      }
    } finally {
      setIsSubActionSaving(false);
    }
  };

  const handleSwitchSubCategoryFormat = async (
    sub: SubCategoryDiscipline,
    nextFormat: CompetitionFormat
  ) => {
    if (!activeEvent || isSubActionSaving) return;
    const hasCompleted = (sub.games || []).some(g => g.status === 'completed');
    if (
      hasCompleted &&
      !window.confirm(
        `Switching "${sub.name}" to ${nextFormat} will regenerate its matches and clear existing match scores in this sub-event. Continue?`
      )
    ) {
      return;
    }
    setIsSubActionSaving(true);
    setSubActionError(null);
    try {
      await generateSubCategoryMatches(
        activeEvent.id,
        sub.id,
        nextFormat,
        'MSUN Competition Committee'
      );
    } finally {
      setIsSubActionSaving(false);
    }
  };

  const handleDeleteAllBrackets = async () => {
    if (!activeEvent || isSubActionSaving) return;
    if (
      !window.confirm(
        `Delete all generated bracketing and match pairings for "${activeEvent.eventName}"? You can regenerate brackets later if needed.`
      )
    ) {
      return;
    }
    setIsSubActionSaving(true);
    setSubActionError(null);
    try {
      const res = await deleteEventBracket(activeEvent.id, 'MSUN Competition Committee');
      if (!res.success) {
        setSubActionError(res.error || 'Failed to delete generated bracket.');
      }
    } finally {
      setIsSubActionSaving(false);
    }
  };

  const handleDisableSubCategories = async () => {
    if (!activeEvent || isSubActionSaving) return;
    if (
      hasSubCategories &&
      !window.confirm(
        `Switch "${activeEvent.eventName}" to a single bracket with no sub-event divisions? All current sub-event divisions will be removed.`
      )
    ) {
      return;
    }
    setIsSubActionSaving(true);
    setSubActionError(null);
    try {
      const targetFmt: CompetitionFormat =
        activeEvent.competitionFormat &&
        activeEvent.competitionFormat !== 'custom' &&
        activeEvent.competitionFormat !== 'individual'
          ? activeEvent.competitionFormat
          : setupDefaultFormat || 'double-elimination';
      const res = await disableEventSubCategories(
        activeEvent.id,
        targetFmt,
        'MSUN Competition Committee'
      );
      if (!res.success) {
        setSubActionError(res.error || 'Failed to switch to single bracket mode.');
      }
    } finally {
      setIsSubActionSaving(false);
    }
  };

  const handleEnableSubCategories = async () => {
    if (!activeEvent || isSubActionSaving) return;
    setIsSubActionSaving(true);
    setSubActionError(null);
    try {
      const res = await enableEventSubCategories(activeEvent.id, 'MSUN Competition Committee');
      if (!res.success) {
        setSubActionError(res.error || 'Failed to enable sub-event setup.');
      }
    } finally {
      setIsSubActionSaving(false);
    }
  };

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

  // Pause / Resume Multi-Day Tournament Modal State
  const [showPausePrompt, setShowPausePrompt] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [pauseResumeDate, setPauseResumeDate] = useState('');
  const [isUpdatingPauseState, setIsUpdatingPauseState] = useState(false);

  // Per-Match Team / Matchup Editor State
  const [editingTeamsGame, setEditingTeamsGame] = useState<GameMatch | null>(null);
  const [editTeamA, setEditTeamA] = useState<CollegeId | ''>('');
  const [editTeamB, setEditTeamB] = useState<CollegeId | ''>('');
  const [editTeamsError, setEditTeamsError] = useState<string | null>(null);
  const [isSavingTeams, setIsSavingTeams] = useState(false);

  // Full Bracket Pairings Editor Modal State
  const [showBracketEditor, setShowBracketEditor] = useState(false);
  const [draftMatchups, setDraftMatchups] = useState<
    Record<string, { collegeA: CollegeId | ''; collegeB: CollegeId | '' }>
  >({});
  const [bracketAutoSwap, setBracketAutoSwap] = useState(true);
  const [showAllBracketGames, setShowAllBracketGames] = useState(false);
  const [bracketEditorError, setBracketEditorError] = useState<string | null>(null);
  const [isSavingBracket, setIsSavingBracket] = useState(false);

  const handleOpenPausePrompt = () => {
    if (!activeEvent) return;
    setPauseReason(
      activeEvent.pausedReason || 'Games 1–3 completed; remaining matches scheduled for another day'
    );
    setPauseResumeDate(activeEvent.resumeDate || '');
    setShowPausePrompt(true);
  };

  const handleConfirmPause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || isUpdatingPauseState) return;
    setIsUpdatingPauseState(true);
    try {
      await pauseEvent(activeEvent.id, pauseReason, pauseResumeDate);
      setShowPausePrompt(false);
    } finally {
      setIsUpdatingPauseState(false);
    }
  };

  const handleResumeTournament = async () => {
    if (!activeEvent || isUpdatingPauseState) return;
    setIsUpdatingPauseState(true);
    try {
      await resumeEvent(activeEvent.id);
    } finally {
      setIsUpdatingPauseState(false);
    }
  };

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
      (activeFormat === 'double-elimination' ||
        activeFormat === 'single-elimination') &&
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
          'MSUN Tournament Officials',
          scopedSubCategoryId
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
          'MSUN Tournament Officials',
          scopedSubCategoryId
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
      'MSUN Scheduling Committee',
      scopedSubCategoryId
    );

    setReschedulingGame(null);
  };

  // Regenerate Bracket
  const handleRegenerateBracket = () => {
    if (!activeEvent) return;
    if (hasSubCategories && effectiveSubCategory) {
      if (
        window.confirm(
          `Are you sure you want to regenerate all matches for "${activeEvent.eventName} — ${effectiveSubCategory.name}" (${activeFormat})? This will reset match scores for this sub-event.`
        )
      ) {
        generateSubCategoryMatches(
          activeEvent.id,
          effectiveSubCategory.id,
          activeFormat,
          'MSUN Competition Committee'
        );
      }
      return;
    }

    const format = activeEvent.competitionFormat || 'double-elimination';
    if (
      window.confirm(
        `Are you sure you want to regenerate all matches for "${activeEvent.eventName}" (${format})? This will reset all match scores in this event.`
      )
    ) {
      generateEventMatches(activeEvent.id, format, 'MSUN Competition Committee');
    }
  };

  // Open Per-Match Team Editor
  const handleOpenEditMatchTeams = (game: GameMatch) => {
    setEditingTeamsGame(game);
    setEditTeamA((game.collegeA || game.participantA?.collegeId || '') as CollegeId | '');
    setEditTeamB((game.collegeB || game.participantB?.collegeId || '') as CollegeId | '');
    setEditTeamsError(null);
  };

  const handleSubmitEditMatchTeams = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !editingTeamsGame || isSavingTeams) return;

    if (editTeamA && editTeamB && editTeamA === editTeamB) {
      setEditTeamsError('Team A and Team B cannot be the same college.');
      return;
    }

    setIsSavingTeams(true);
    setEditTeamsError(null);
    try {
      const res = await updateGameParticipants(
        activeEvent.id,
        editingTeamsGame.id,
        editTeamA,
        editTeamB,
        'MSUN Competition Committee',
        scopedSubCategoryId
      );
      if (!res.success) {
        setEditTeamsError(res.error || 'Failed to update match teams.');
        return;
      }
      setEditingTeamsGame(null);
    } catch (err: any) {
      setEditTeamsError(err?.message || 'Failed to update match teams.');
    } finally {
      setIsSavingTeams(false);
    }
  };

  // Helper: identify Round 1 / primary editable games for bracket pairing
  const getEditableBracketGames = (ev: PalakasanEvent, includeAll: boolean): GameMatch[] => {
    const games = ev.games || [];
    if (includeAll || ev.competitionFormat === 'round-robin') {
      return games.filter(g => g.status !== 'completed' && g.status !== 'cancelled');
    }
    const round1 = games.filter(
      g =>
        g.status !== 'completed' &&
        g.status !== 'cancelled' &&
        (g.roundName.toLowerCase().includes('round 1') ||
          g.roundName.toLowerCase().includes('semifinal') ||
          g.roundName.toLowerCase().includes('quarterfinal') ||
          g.gameNumber <= 2)
    );
    // Keep only opening-round games if downstream games are also named Semifinals/Final
    if (ev.competitionFormat === 'double-elimination') {
      const openings = games.filter(
        g => g.gameNumber <= 2 && g.status !== 'completed' && g.status !== 'cancelled'
      );
      return openings.length > 0
        ? openings
        : games.filter(g => g.status !== 'completed' && g.status !== 'cancelled');
    }
    return round1.length > 0
      ? round1
      : games.filter(g => g.status !== 'completed' && g.status !== 'cancelled');
  };

  const handleOpenBracketEditor = () => {
    if (!bracketViewEvent) return;
    const map: Record<string, { collegeA: CollegeId | ''; collegeB: CollegeId | '' }> = {};
    (bracketViewEvent.games || []).forEach(g => {
      map[g.id] = {
        collegeA: (g.collegeA || g.participantA?.collegeId || '') as CollegeId | '',
        collegeB: (g.collegeB || g.participantB?.collegeId || '') as CollegeId | '',
      };
    });
    setDraftMatchups(map);
    setShowAllBracketGames(false);
    setBracketEditorError(null);
    setShowBracketEditor(true);
  };

  const handleChangeDraftSlot = (
    gameId: string,
    side: 'A' | 'B',
    nextCollege: CollegeId | ''
  ) => {
    if (!activeEvent) return;
    setBracketEditorError(null);

    setDraftMatchups(prev => {
      const next = { ...prev };
      const currentPair = next[gameId] || { collegeA: '', collegeB: '' };
      const prevCollege = side === 'A' ? currentPair.collegeA : currentPair.collegeB;
      const otherSide = side === 'A' ? 'B' : 'A';
      const otherInSameGame = side === 'A' ? currentPair.collegeB : currentPair.collegeA;

      if (bracketAutoSwap && nextCollege) {
        // 1. If chosen college is on the opposite side of the same game, swap within the game
        if (otherInSameGame === nextCollege) {
          next[gameId] = {
            collegeA: side === 'A' ? nextCollege : prevCollege,
            collegeB: side === 'B' ? nextCollege : prevCollege,
          };
          return next;
        }

        // 2. For elimination Round 1 pairings, swap with the other opening-round match holding nextCollege
        if (bracketViewEvent && bracketViewEvent.competitionFormat !== 'round-robin') {
          const editableIds = getEditableBracketGames(bracketViewEvent, showAllBracketGames).map(
            g => g.id
          );
          for (const otherId of editableIds) {
            if (otherId === gameId) continue;
            const pair = next[otherId];
            if (!pair) continue;
            if (pair.collegeA === nextCollege) {
              next[otherId] = { ...pair, collegeA: prevCollege };
              break;
            }
            if (pair.collegeB === nextCollege) {
              next[otherId] = { ...pair, collegeB: prevCollege };
              break;
            }
          }
        }
      }

      next[gameId] = {
        ...currentPair,
        [side === 'A' ? 'collegeA' : 'collegeB']: nextCollege,
      };
      // Keep opposite side intact if unchanged
      if (otherSide === 'A' && !next[gameId].collegeA) {
        next[gameId].collegeA = currentPair.collegeA;
      }
      return next;
    });
  };

  const handleSwapDraftMatch = (gameId: string) => {
    setDraftMatchups(prev => {
      const current = prev[gameId];
      if (!current) return prev;
      return {
        ...prev,
        [gameId]: { collegeA: current.collegeB, collegeB: current.collegeA },
      };
    });
  };

  const handleClearAllDraftSlots = () => {
    if (!bracketViewEvent) return;
    const editable = getEditableBracketGames(bracketViewEvent, showAllBracketGames);
    setDraftMatchups(prev => {
      const next = { ...prev };
      editable.forEach(g => {
        next[g.id] = { collegeA: '', collegeB: '' };
      });
      return next;
    });
    setBracketEditorError(null);
  };

  const handleShuffleDraftBracket = () => {
    if (!bracketViewEvent) return;
    const poolBase =
      bracketViewEvent.participatingColleges && bracketViewEvent.participatingColleges.length >= 2
        ? [...bracketViewEvent.participatingColleges]
        : collegeList.map(c => c.id);
    // Fisher-Yates shuffle
    const pool = [...poolBase];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const editable = getEditableBracketGames(bracketViewEvent, false);
    setDraftMatchups(prev => {
      const next = { ...prev };
      if (bracketViewEvent.competitionFormat === 'round-robin') {
        // Generate round robin pairs from shuffled pool
        const pairs: Array<[CollegeId, CollegeId]> = [];
        for (let i = 0; i < pool.length; i++) {
          for (let j = i + 1; j < pool.length; j++) {
            pairs.push([pool[i], pool[j]]);
          }
        }
        editable.forEach((g, idx) => {
          const p = pairs[idx];
          if (p) {
            next[g.id] = { collegeA: p[0], collegeB: p[1] };
          }
        });
      } else {
        editable.forEach((g, idx) => {
          const cA = pool[idx * 2] || '';
          const cB = pool[idx * 2 + 1] || '';
          next[g.id] = { collegeA: cA, collegeB: cB };
        });
      }
      return next;
    });
    setBracketEditorError(null);
  };

  const handleSaveBracketEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !bracketViewEvent || isSavingBracket) return;

    const games = bracketViewEvent.games || [];
    for (const g of games) {
      const draft = draftMatchups[g.id];
      if (!draft) continue;
      if (draft.collegeA && draft.collegeB && draft.collegeA === draft.collegeB) {
        setBracketEditorError(
          `Game #${g.gameNumber} (${g.roundName}) cannot match ${draft.collegeA} against itself.`
        );
        return;
      }
    }

    setIsSavingBracket(true);
    setBracketEditorError(null);
    try {
      const updatedGames: GameMatch[] = games.map(g => {
        if (g.status === 'completed' || g.status === 'cancelled') return g;
        const draft = draftMatchups[g.id];
        if (!draft) return g;

        const cleanA = draft.collegeA ? draft.collegeA : undefined;
        const cleanB = draft.collegeB ? draft.collegeB : undefined;
        const prevA = g.collegeA || g.participantA?.collegeId;
        const prevB = g.collegeB || g.participantB?.collegeId;

        const fallbackDescA =
          g.sourceDescriptionA && g.sourceDescriptionA !== prevA
            ? g.sourceDescriptionA
            : g.participantA?.placeholderText && g.participantA.placeholderText !== prevA
            ? g.participantA.placeholderText
            : 'TBD';
        const fallbackDescB =
          g.sourceDescriptionB && g.sourceDescriptionB !== prevB
            ? g.sourceDescriptionB
            : g.participantB?.placeholderText && g.participantB.placeholderText !== prevB
            ? g.participantB.placeholderText
            : 'TBD';

        return {
          ...g,
          collegeA: cleanA,
          collegeB: cleanB,
          sourceDescriptionA: cleanA || fallbackDescA,
          sourceDescriptionB: cleanB || fallbackDescB,
          participantA: {
            ...g.participantA,
            collegeId: cleanA,
            placeholderText: cleanA || fallbackDescA,
          },
          participantB: {
            ...g.participantB,
            collegeId: cleanB,
            placeholderText: cleanB || fallbackDescB,
          },
          isUnlocked: Boolean(cleanA && cleanB),
        };
      });

      const res = await updateEventBracketPairings(
        activeEvent.id,
        updatedGames,
        activeEvent.participatingColleges,
        'MSUN Competition Committee',
        scopedSubCategoryId
      );
      if (!res.success) {
        setBracketEditorError(res.error || 'Failed to save bracket matchups.');
        return;
      }
      setShowBracketEditor(false);
    } catch (err: any) {
      setBracketEditorError(err?.message || 'Failed to save bracket matchups.');
    } finally {
      setIsSavingBracket(false);
    }
  };

  // Filter list of competitions
  const filteredCompetitions = competitionEvents.filter(ev => {
    if (selectedFormatFilter === 'special-multi') {
      if (!isSpecialMultiCategorySport(ev)) return false;
    } else if (
      selectedFormatFilter !== 'all' &&
      ev.competitionFormat !== selectedFormatFilter
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ev.eventName.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        (ev.subCategories || []).some(s => s.name.toLowerCase().includes(q))
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
          <button
            onClick={() => setSelectedFormatFilter('special-multi')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              selectedFormatFilter === 'special-multi'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
            }`}
          >
            Special Sports ({competitionEvents.filter(e => isSpecialMultiCategorySport(e)).length})
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
              const evIsSpecial = isSpecialMultiCategorySport(ev);
              const evSubs = ev.subCategories || [];
              const subGames = evSubs.flatMap(s => s.games || []);
              const totalGames = subGames.length > 0 ? subGames.length : ev.games?.length || 0;
              const completedGames =
                subGames.length > 0
                  ? subGames.filter(g => g.status === 'completed').length
                  : ev.games?.filter(g => g.status === 'completed').length || 0;
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
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          !ev.competitionFormat && (!ev.games || ev.games.length === 0) && !evIsSpecial
                            ? 'bg-slate-100 text-slate-600'
                            : ev.competitionFormat === 'double-elimination'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ev.competitionFormat === 'round-robin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {!ev.competitionFormat && (!ev.games || ev.games.length === 0) && !evIsSpecial
                          ? 'No Bracket'
                          : ev.competitionFormat === 'double-elimination'
                          ? 'Double Elim'
                          : ev.competitionFormat === 'round-robin'
                          ? 'Round Robin'
                          : ev.competitionFormat === 'head-to-head'
                          ? 'Head-to-Head'
                          : ev.competitionFormat || 'Tournament'}
                      </span>
                      {evIsSpecial && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                          {evSubs.length > 0 ? `${evSubs.length} Divisions` : 'Sub-Events'}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold shrink-0 ${
                        isOfficial
                          ? 'text-emerald-700'
                          : ev.status === 'completed'
                          ? 'text-blue-700'
                          : ev.status === 'paused'
                          ? 'text-amber-700'
                          : ev.status === 'ongoing'
                          ? 'text-blue-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {isOfficial
                        ? 'Certified'
                        : ev.status === 'completed'
                        ? 'Completed'
                        : ev.status === 'paused'
                        ? 'Paused'
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
                    {activeEvent.status === 'paused' ? (
                      <button
                        type="button"
                        disabled={isUpdatingPauseState}
                        onClick={handleResumeTournament}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors disabled:opacity-60"
                        title="Resume paused tournament back to Ongoing (Live)"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume Event</span>
                      </button>
                    ) : (
                      (activeEvent.status === 'ongoing' || activeEvent.status === 'upcoming') && (
                        <button
                          type="button"
                          disabled={isUpdatingPauseState}
                          onClick={handleOpenPausePrompt}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors disabled:opacity-60"
                          title="Pause event for multi-day play (e.g. Game 1-3 today, Game 4 to Finals another day)"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Event</span>
                        </button>
                      )
                    )}

                    {!isSpecialSport && canHaveSubEvents && (
                      <button
                        type="button"
                        disabled={isSubActionSaving}
                        onClick={handleEnableSubCategories}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors disabled:opacity-60"
                        title="Optional: split this event into multiple weight classes or divisions"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Add Sub-Events</span>
                      </button>
                    )}

                    {!isSpecialSport && activeGames.length > 0 && (
                      <button
                        type="button"
                        onClick={handleOpenBracketEditor}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        title="Edit bracket matchups and choose which colleges play in Game 1 or other matches"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Edit Bracket</span>
                      </button>
                    )}

                    {!isSpecialSport && (activeGames.length > 0 || Boolean(activeEvent.competitionFormat)) && (
                      <button
                        onClick={handleRegenerateBracket}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                        title="Reset and regenerate all tournament match pairings"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Regenerate Bracket</span>
                      </button>
                    )}

                    {(hasSubCategories || activeGames.length > 0 || Boolean(activeEvent.competitionFormat)) && (
                      <button
                        type="button"
                        disabled={isSubActionSaving}
                        onClick={handleDeleteAllBrackets}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-60"
                        title="Delete generated bracketing for this event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Bracket</span>
                      </button>
                    )}

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

                {/* Paused Tournament Banner */}
                {activeEvent.status === 'paused' && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Pause className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                            Tournament Paused
                          </span>
                          {activeEvent.resumeDate && (
                            <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-[11px] font-semibold text-amber-800">
                              Resumes: {activeEvent.resumeDate}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-900/90 font-medium">
                          {activeEvent.pausedReason ||
                            'Completed earlier matches; remaining matches are scheduled for another day.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isUpdatingPauseState}
                      onClick={handleResumeTournament}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors shrink-0 disabled:opacity-60"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Play Now</span>
                    </button>
                  </div>
                )}

                {/* Inline Pause Schedule Prompt */}
                {showPausePrompt && activeEvent.status !== 'paused' && (
                  <form
                    onSubmit={handleConfirmPause}
                    className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Pause className="w-4 h-4 text-amber-700" />
                        <span>Pause Tournament for Multi-Day Play</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPausePrompt(false)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-amber-900 mb-1">
                          Pause Note / Progress
                        </label>
                        <input
                          type="text"
                          value={pauseReason}
                          onChange={e => setPauseReason(e.target.value)}
                          placeholder="e.g. Games 1–3 finished today; Game 4 to Finals tomorrow"
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-amber-900 mb-1">
                          Resume Schedule (Optional)
                        </label>
                        <input
                          type="text"
                          value={pauseResumeDate}
                          onChange={e => setPauseResumeDate(e.target.value)}
                          placeholder="e.g. Tomorrow, 09:00 AM (Game 4 to Finals)"
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPausePrompt(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-amber-100/70"
                      >
                        Dismiss
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPauseState}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Confirm Pause</span>
                      </button>
                    </div>
                  </form>
                )}

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

              {/* SPECIAL SPORTS SUB-EVENT SETUP OR DIVISIONS SELECTOR */}
              {isSpecialSport && !hasSubCategories && (
                <div className="bg-white rounded-2xl border border-purple-200 shadow-2xs p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 mb-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Multi-Division Special Sport Setup</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900">
                        Generate Sub-Event Brackets for {activeEvent.eventName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Create an independent tournament bracket for each weight class or discipline. Sub-event champions automatically earn 10-8-6-4 discipline points toward the overall Special Sport winner.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-end gap-2 shrink-0">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Default Format
                        </label>
                        <select
                          value={setupDefaultFormat}
                          onChange={e => {
                            const nextFmt = e.target.value as CompetitionFormat;
                            setSetupDefaultFormat(nextFmt);
                            setSetupDraftSubs(prev =>
                              prev.map(item => ({ ...item, competitionFormat: nextFmt }))
                            );
                          }}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                        >
                          <option value="double-elimination">Double Elimination</option>
                          <option value="single-elimination">Single Elimination</option>
                          <option value="round-robin">Round Robin</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        disabled={isSubActionSaving}
                        onClick={handleDisableSubCategories}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors disabled:opacity-60"
                        title="Skip sub-events and use a single standard bracket instead"
                      >
                        No Sub-Events (Single Bracket)
                      </button>
                    </div>
                  </div>

                  {subActionError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{subActionError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {setupDraftSubs.map((sub, idx) => (
                      <div
                        key={sub.id}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <input
                          type="text"
                          value={sub.name}
                          onChange={e => {
                            const val = e.target.value;
                            setSetupDraftSubs(prev =>
                              prev.map((row, rIdx) => (rIdx === idx ? { ...row, name: val } : row))
                            );
                          }}
                          placeholder="e.g. Laban Bantamweight Men"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                        />
                        <select
                          value={sub.competitionFormat}
                          onChange={e => {
                            const val = e.target.value as CompetitionFormat;
                            setSetupDraftSubs(prev =>
                              prev.map((row, rIdx) =>
                                rIdx === idx ? { ...row, competitionFormat: val } : row
                              )
                            );
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                        >
                          <option value="double-elimination">Double Elim</option>
                          <option value="single-elimination">Single Elim</option>
                          <option value="round-robin">Round Robin</option>
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            setSetupDraftSubs(prev => prev.filter((_, rIdx) => rIdx !== idx))
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors justify-self-end"
                          title="Remove sub-event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={setupNewSubName}
                        onChange={e => setSetupNewSubName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = setupNewSubName.trim();
                            if (!trimmed) return;
                            setSetupDraftSubs(prev => [
                              ...prev,
                              {
                                id: `draft-${Date.now()}`,
                                name: trimmed,
                                competitionFormat: setupDefaultFormat,
                              },
                            ]);
                            setSetupNewSubName('');
                          }
                        }}
                        placeholder="Add custom sub-event (e.g. Laban Lightweight Men)..."
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = setupNewSubName.trim();
                          if (!trimmed) return;
                          setSetupDraftSubs(prev => [
                            ...prev,
                            {
                              id: `draft-${Date.now()}`,
                              name: trimmed,
                              competitionFormat: setupDefaultFormat,
                            },
                          ]);
                          setSetupNewSubName('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Division</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isSubActionSaving || setupDraftSubs.length === 0}
                      onClick={handleInitializeSubBrackets}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-colors disabled:opacity-60"
                    >
                      <Layers className="w-4 h-4" />
                      <span>
                        {isSubActionSaving
                          ? 'Generating Sub-Event Brackets...'
                          : `Generate Brackets (${setupDraftSubs.filter(s => s.name.trim()).length} Sub-Events)`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {hasSubCategories && (
                <div className="bg-white rounded-2xl border border-purple-200/90 shadow-2xs p-5 space-y-4">
                  {/* Top Bar: Division Header + Add Sub-Event */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-600" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                          Sub-Event Divisions & Brackets ({subCategories.length})
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Select any weight class or discipline below to edit pairings, reschedule matches, or record scores.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <form onSubmit={handleAddSingleSubCategory} className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={newSubName}
                          onChange={e => {
                            setNewSubName(e.target.value);
                            setSubActionError(null);
                          }}
                          placeholder="Add sub-event..."
                          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs w-44"
                        />
                        <select
                          value={newSubFormat}
                          onChange={e => setNewSubFormat(e.target.value as CompetitionFormat)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                        >
                          <option value="double-elimination">Double Elim</option>
                          <option value="single-elimination">Single Elim</option>
                          <option value="round-robin">Round Robin</option>
                        </select>
                        <button
                          type="submit"
                          disabled={isSubActionSaving}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-60"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </form>

                      <button
                        type="button"
                        disabled={isSubActionSaving}
                        onClick={handleDisableSubCategories}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors disabled:opacity-60"
                        title="Remove sub-events and use one single bracket instead"
                      >
                        Switch to Single Bracket
                      </button>
                    </div>
                  </div>

                  {subActionError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{subActionError}</span>
                    </div>
                  )}

                  {/* Sub-Event Selector Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {subCategories.map(sub => {
                      const isSubSelected = effectiveSubCategory?.id === sub.id;
                      const subTotal = sub.games?.length || 0;
                      const subDone =
                        sub.games?.filter(g => g.status === 'completed').length || 0;
                      const champ = sub.championCollegeId;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveSubCategoryId(sub.id)}
                          className={`px-3 py-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            isSubSelected
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-slate-50 hover:bg-purple-50 text-slate-800 border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-extrabold leading-tight">{sub.name}</div>
                            <div
                              className={`text-[10px] font-semibold mt-0.5 ${
                                isSubSelected ? 'text-purple-100' : 'text-slate-500'
                              }`}
                            >
                              {subTotal > 0 ? `${subDone}/${subTotal} matches` : 'No matches'}
                            </div>
                          </div>
                          {champ && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                isSubSelected
                                  ? 'bg-amber-300 text-slate-900'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              👑 {champ}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Accumulated Discipline Points Summary */}
                  <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900">
                      <Trophy className="w-3.5 h-3.5 text-purple-600" />
                      <span>
                        Accumulated Division Points ({subCategories.filter(s => Boolean(s.championCollegeId)).length}/{subCategories.length} divisions decided):
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeEvent.participatingColleges.map(colId => {
                        const pts = activeEvent.accumulatedScores?.[colId] || 0;
                        const badge = getCollegeBadgeStyle(colId);
                        return (
                          <div
                            key={colId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-purple-200/80"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black ${badge.bg} ${badge.text}`}
                            >
                              {colId}
                            </span>
                            <span className="font-mono font-black text-purple-900">{pts} pts</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Sub-Event Bracket Controls */}
                  {effectiveSubCategory && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          {effectiveSubCategory.name}
                        </span>
                        <span className="text-slate-300">•</span>
                        <label className="text-[11px] font-bold text-slate-500">Format:</label>
                        <select
                          value={activeFormat}
                          disabled={isSubActionSaving}
                          onChange={e =>
                            handleSwitchSubCategoryFormat(
                              effectiveSubCategory,
                              e.target.value as CompetitionFormat
                            )
                          }
                          className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                        >
                          <option value="double-elimination">Double Elimination</option>
                          <option value="single-elimination">Single Elimination</option>
                          <option value="round-robin">Round Robin</option>
                        </select>
                        {effectiveSubCategory.championCollegeId && (
                          <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-black">
                            Division Champion: {effectiveSubCategory.championCollegeId}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {activeGames.length > 0 && (
                          <button
                            type="button"
                            onClick={handleOpenBracketEditor}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Edit Bracket</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleRegenerateBracket}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Regenerate</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSubActionSaving}
                          onClick={() => handleRemoveSubCategory(effectiveSubCategory)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                          title="Delete this sub-event and its bracket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tournament Format Body */}
              {bracketViewEvent && (!isSpecialSport || hasSubCategories) && (
                activeGames.length === 0 && !hasSubCategories ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className="text-base font-black text-slate-900">
                        No Bracket Generated for {activeEvent.eventName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        This event currently has no generated matches or sub-event divisions. You can leave it as a single-result event, generate a single bracket, or optionally add sub-event divisions.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <select
                        value={quickGenerateFormat}
                        onChange={e => setQuickGenerateFormat(e.target.value as CompetitionFormat)}
                        className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="double-elimination">Double Elimination</option>
                        <option value="single-elimination">Single Elimination</option>
                        <option value="round-robin">Round Robin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          generateEventMatches(
                            activeEvent.id,
                            quickGenerateFormat,
                            'MSUN Competition Committee'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Generate Bracket</span>
                      </button>
                      {canHaveSubEvents && (
                        <button
                          type="button"
                          disabled={isSubActionSaving}
                          onClick={handleEnableSubCategories}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-colors disabled:opacity-60"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Add Sub-Events (Optional)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {activeFormat === 'double-elimination' && (
                      <DoubleEliminationBracketView
                        event={bracketViewEvent}
                        onScoreEntry={handleOpenScoreEntry}
                        onReschedule={handleOpenReschedule}
                        onEditTeams={handleOpenEditMatchTeams}
                      />
                    )}

                    {activeFormat === 'round-robin' && (
                      <RoundRobinTableView
                        event={bracketViewEvent}
                        onScoreEntry={handleOpenScoreEntry}
                        onReschedule={handleOpenReschedule}
                        onEditTeams={handleOpenEditMatchTeams}
                      />
                    )}

                    {(activeFormat === 'single-elimination' || activeFormat === 'head-to-head' || !activeFormat) && (
                      <SingleEliminationBracketView
                        event={bracketViewEvent}
                        onScoreEntry={handleOpenScoreEntry}
                        onReschedule={handleOpenReschedule}
                        onEditTeams={handleOpenEditMatchTeams}
                      />
                    )}
                  </>
                )
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
                  {effectiveSubCategory ? `${effectiveSubCategory.name} • ` : ''}
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
                {activeFormat === 'double-elimination' && (
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
                {activeFormat === 'round-robin' && (
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
                  {effectiveSubCategory ? `${effectiveSubCategory.name} • ` : ''}
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
      {/* ========================================================================= */}
      {/* PER-MATCH EDIT TEAMS MODAL */}
      {/* ========================================================================= */}
      {editingTeamsGame && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                  {effectiveSubCategory ? `${effectiveSubCategory.name} • ` : ''}
                  Game #{editingTeamsGame.gameNumber} • {editingTeamsGame.roundName}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Choose Colleges for Match #{editingTeamsGame.gameNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeamsGame(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditMatchTeams} className="p-6 space-y-4 text-xs">
              {editTeamsError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editTeamsError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                Select which colleges compete in this match, or choose{' '}
                <strong className="text-slate-700">TBD / Not Assigned</strong> to leave a slot empty.
              </p>

              {/* Team A Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Team A (Slot 1)</label>
                  {editTeamA && (
                    <button
                      type="button"
                      onClick={() => setEditTeamA('')}
                      className="text-[11px] font-semibold text-slate-400 hover:text-red-600"
                    >
                      Clear to TBD
                    </button>
                  )}
                </div>
                <select
                  value={editTeamA}
                  onChange={e => {
                    setEditTeamA(e.target.value as CollegeId | '');
                    setEditTeamsError(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                >
                  <option value="">— TBD / Not Assigned —</option>
                  {collegeList.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.acronym} — {col.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const prevA = editTeamA;
                    setEditTeamA(editTeamB);
                    setEditTeamB(prevA);
                    setEditTeamsError(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[11px] transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Swap Team A ↔ Team B</span>
                </button>
              </div>

              {/* Team B Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Team B (Slot 2)</label>
                  {editTeamB && (
                    <button
                      type="button"
                      onClick={() => setEditTeamB('')}
                      className="text-[11px] font-semibold text-slate-400 hover:text-red-600"
                    >
                      Clear to TBD
                    </button>
                  )}
                </div>
                <select
                  value={editTeamB}
                  onChange={e => {
                    setEditTeamB(e.target.value as CollegeId | '');
                    setEditTeamsError(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                >
                  <option value="">— TBD / Not Assigned —</option>
                  {collegeList.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.acronym} — {col.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSavingTeams}
                  onClick={() => setEditingTeamsGame(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTeams}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingTeams ? 'Saving...' : 'Save Match Teams'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL TOURNAMENT BRACKET & MATCHUPS EDITOR MODAL */}
      {/* ========================================================================= */}
      {showBracketEditor && activeEvent && bracketViewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full overflow-hidden animate-scaleIn my-8">
            <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                  {activeEvent.eventName}
                  {effectiveSubCategory ? ` — ${effectiveSubCategory.name}` : ''} •{' '}
                  {bracketViewEvent.competitionFormat === 'double-elimination'
                    ? 'Double Elimination'
                    : bracketViewEvent.competitionFormat === 'round-robin'
                    ? 'Round Robin'
                    : 'Single Elimination'}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Edit Bracket Matchups & Game Assignments
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBracketEditor(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBracketEditor} className="p-6 space-y-5 text-xs">
              {bracketEditorError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bracketEditorError}</span>
                </div>
              )}

              {/* Assignment Summary Strip */}
              {(() => {
                const editableGames = getEditableBracketGames(bracketViewEvent, showAllBracketGames);
                return (
                  <>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          College Bracket Placement Status
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Choose who plays in Game #1, Game #2, or leave unassigned
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {collegeList.map(col => {
                          const assignedGames = editableGames
                            .filter(g => {
                              const d = draftMatchups[g.id];
                              return d && (d.collegeA === col.id || d.collegeB === col.id);
                            })
                            .map(g => `#${g.gameNumber}`);
                          const badge = getCollegeBadgeStyle(col.id);
                          return (
                            <div
                              key={col.id}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200"
                            >
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black ${badge.bg} ${badge.text}`}
                              >
                                {col.acronym}
                              </span>
                              <span
                                className={`text-[11px] font-semibold ${
                                  assignedGames.length > 0 ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                {assignedGames.length > 0
                                  ? `Game ${assignedGames.join(', ')}`
                                  : 'Not Assigned'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Toolbar Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleShuffleDraftBracket}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold transition-colors"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                          <span>Shuffle Draw</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllDraftSlots}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                        >
                          <span>Clear All to TBD</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {bracketViewEvent.competitionFormat !== 'round-robin' && (
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-slate-600 font-semibold">
                            <input
                              type="checkbox"
                              checked={bracketAutoSwap}
                              onChange={e => setBracketAutoSwap(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Auto-swap between games</span>
                          </label>
                        )}
                        {bracketViewEvent.competitionFormat !== 'round-robin' && (
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-slate-600 font-semibold">
                            <input
                              type="checkbox"
                              checked={showAllBracketGames}
                              onChange={e => setShowAllBracketGames(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Show downstream matches</span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Editable Matches List */}
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {editableGames.length === 0 ? (
                        <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                          All matches in this tournament are already completed or cancelled.
                        </div>
                      ) : (
                        editableGames.map(g => {
                          const pair = draftMatchups[g.id] || {
                            collegeA: '',
                            collegeB: '',
                          };
                          return (
                            <div
                              key={g.id}
                              className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-black text-[11px]">
                                    Game #{g.gameNumber}
                                  </span>
                                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                    {g.roundName}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    pair.collegeA && pair.collegeB
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {pair.collegeA && pair.collegeB ? 'Ready' : 'TBD Slot'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2">
                                <select
                                  value={pair.collegeA}
                                  onChange={e =>
                                    handleChangeDraftSlot(
                                      g.id,
                                      'A',
                                      e.target.value as CollegeId | ''
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                                >
                                  <option value="">— TBD / Empty —</option>
                                  {collegeList.map(col => (
                                    <option key={col.id} value={col.id}>
                                      {col.acronym} — {col.shortName}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleSwapDraftMatch(g.id)}
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors justify-self-center"
                                  title="Swap Team A and Team B"
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5" />
                                </button>

                                <select
                                  value={pair.collegeB}
                                  onChange={e =>
                                    handleChangeDraftSlot(
                                      g.id,
                                      'B',
                                      e.target.value as CollegeId | ''
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                                >
                                  <option value="">— TBD / Empty —</option>
                                  {collegeList.map(col => (
                                    <option key={col.id} value={col.id}>
                                      {col.acronym} — {col.shortName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSavingBracket}
                  onClick={() => setShowBracketEditor(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBracket}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingBracket ? 'Saving Bracket...' : 'Save Bracket Matchups'}</span>
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
  onEditTeams: (game: GameMatch) => void;
}

const DoubleEliminationBracketView: React.FC<SubBracketProps> = ({
  event,
  onScoreEntry,
  onReschedule,
  onEditTeams,
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
                onEditTeams={onEditTeams}
              />
            )}
            {g2 && (
              <MatchCardItem
                game={g2}
                onScoreEntry={onScoreEntry}
                onReschedule={onReschedule}
                onEditTeams={onEditTeams}
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
                onEditTeams={onEditTeams}
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
                onEditTeams={onEditTeams}
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
                onEditTeams={onEditTeams}
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
                onEditTeams={onEditTeams}
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
                onEditTeams={onEditTeams}
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
  onEditTeams,
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
              onEditTeams={onEditTeams}
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
  onEditTeams,
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
            onEditTeams={onEditTeams}
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
  onEditTeams: (game: GameMatch) => void;
  note?: string;
  isConditionalReset?: boolean;
}

const MatchCardItem: React.FC<MatchCardItemProps> = ({
  game,
  onScoreEntry,
  onReschedule,
  onEditTeams,
  note,
  isConditionalReset,
}) => {
  const isCompleted = game.status === 'completed';
  const isOngoing = game.status === 'ongoing';
  const isCancelled = game.status === 'cancelled';

  const teamA = game.collegeA || game.participantA?.collegeId;
  const teamB = game.collegeB || game.participantB?.collegeId;
  const descA = game.sourceDescriptionA || game.participantA?.placeholderText || 'TBD';
  const descB = game.sourceDescriptionB || game.participantB?.placeholderText || 'TBD';
  const isUnlocked = Boolean(game.isUnlocked && teamA && teamB);

  const badgeA = teamA ? getCollegeBadgeStyle(teamA) : null;
  const badgeB = teamB ? getCollegeBadgeStyle(teamB) : null;

  const isWinnerA = Boolean(isCompleted && teamA && game.winnerCollegeId === teamA);
  const isWinnerB = Boolean(isCompleted && teamB && game.winnerCollegeId === teamB);

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

          {!isCompleted && !isCancelled && (
            <button
              type="button"
              onClick={() => onEditTeams(game)}
              className="p-1 rounded text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
              title="Choose / edit colleges in this match"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
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
            {teamA && badgeA ? (
              <span
                className={`px-2 py-0.5 rounded text-xs font-black ${badgeA.bg} ${badgeA.text}`}
              >
                {teamA}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {descA}
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
            {teamB && badgeB ? (
              <span
                className={`px-2 py-0.5 rounded text-xs font-black ${badgeB.bg} ${badgeB.text}`}
              >
                {teamB}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {descB}
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
