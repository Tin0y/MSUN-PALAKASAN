import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trophy,
  Award,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Star,
  Layers,
  Zap,
  Swords,
  Plus,
  Trash2,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import {
  CollegeId,
  EventResultItem,
  PalakasanEvent,
  Placement,
  PointTier,
  DisciplinePlacement,
  SubCategoryDiscipline,
  DisciplinePointsConfig,
} from '../../types';
import {
  COLLEGES,
  getAllowedTiersForCategory,
  getEffectivePointTier,
  getEventPointsForPlacement,
  getNormalizedScoringRules,
} from '../../data/initialData';
import { getCollegeBadgeStyle } from '../../utils/collegeTheme';

interface AdminDeclareWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PalakasanEvent | null;
}

interface CategoryResultDraft {
  id: string;
  name: string;
  placements: Record<CollegeId, DisciplinePlacement | ''>;
}

const DEFAULT_ARNIS_CATEGORIES = [
  'Anyo Individual Men (Traditional)',
  'Anyo Individual Women (Traditional)',
  'Anyo Team Men (Synchronized)',
  'Anyo Team Women (Synchronized)',
  'Laban (Sparring) Bantamweight',
  'Laban (Sparring) Featherweight',
  'Laban (Sparring) Lightweight',
  'Laban (Sparring) Open Weight',
];

const DEFAULT_SWIMMING_CATEGORIES = [
  '50m Freestyle Men',
  '50m Freestyle Women',
  '100m Breaststroke Men',
  '100m Breaststroke Women',
  '50m Backstroke Men',
  '50m Backstroke Women',
  '50m Butterfly Men & Women',
  '4x50m Medley / Freestyle Relay',
];

export const AdminDeclareWinnerModal: React.FC<AdminDeclareWinnerModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const {
    currentPalakasan,
    declareOfficialResults,
    saveDraftResults,
    editOfficialResult,
    updateEvent,
    currentAccount,
    adminUserDisplay,
  } = usePalakasan();

  const [selectedTier, setSelectedTier] = useState<PointTier>('major');
  const [activeTab, setActiveTab] = useState<'standard' | 'multiCategory'>('standard');
  const [resultsMap, setResultsMap] = useState<Record<CollegeId, { placement: Placement; note: string }>>({
    'CBIT': { placement: '1st', note: '' },
    'CESS-IDS': { placement: '2nd', note: '' },
    'CFMS': { placement: '3rd', note: '' },
    'CELS': { placement: '4th', note: '' },
  });

  // Multi-Category State (Arnis, Swimming, Athletics, etc.)
  const [categoryDrafts, setCategoryDrafts] = useState<CategoryResultDraft[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirmationSummary, setShowConfirmationSummary] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [committeeUser, setCommitteeUser] = useState(() => adminUserDisplay || 'MSUN Tournament Committee');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ALL HOOKS UNCONDITIONALLY CALLED AT COMPONENT ROOT BEFORE ANY EARLY RETURN
  const participating = useMemo(() => {
    return event?.participatingColleges || ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'];
  }, [event?.participatingColleges]);

  const disciplinePointsConfig: DisciplinePointsConfig = useMemo(() => {
    return getNormalizedScoringRules(currentPalakasan?.scoringRules).byCategory.sports.disciplinePoints;
  }, [currentPalakasan?.scoringRules]);

  // Calculate accumulated score per college from categories
  const accumulatedScores = useMemo(() => {
    const scores: Record<CollegeId, number> = {
      'CBIT': 0,
      'CESS-IDS': 0,
      'CFMS': 0,
      'CELS': 0,
    };

    const goldCounts: Record<CollegeId, number> = {
      'CBIT': 0,
      'CESS-IDS': 0,
      'CFMS': 0,
      'CELS': 0,
    };

    categoryDrafts.forEach(cat => {
      participating.forEach(colId => {
        const plc = cat.placements[colId];
        if (plc) {
          const pts = disciplinePointsConfig[plc] ?? 0;
          scores[colId] = (scores[colId] || 0) + pts;
          if (plc === '1st') {
            goldCounts[colId] = (goldCounts[colId] || 0) + 1;
          }
        }
      });
    });

    return { scores, goldCounts };
  }, [categoryDrafts, participating, disciplinePointsConfig]);

  // Ranked colleges by accumulated points (with gold count as tie-breaker)
  const rankedColleges = useMemo(() => {
    return [...participating].sort((a, b) => {
      const scoreA = accumulatedScores.scores[a] || 0;
      const scoreB = accumulatedScores.scores[b] || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      // Tie breaker: golds
      const goldsA = accumulatedScores.goldCounts[a] || 0;
      const goldsB = accumulatedScores.goldCounts[b] || 0;
      return goldsB - goldsA;
    });
  }, [participating, accumulatedScores]);

  useEffect(() => {
    if (!event) return;

    // Detect initial tier scoped by category
    const initialTier: PointTier = getEffectivePointTier(event, currentPalakasan?.scoringRules);
    setSelectedTier(initialTier);

    // Initial Tab Selection: Default to multiCategory for Arnis and Swimming
    const shouldBeMulti =
      event.isMultiCategoryEvent ||
      event.eventName.toLowerCase().includes('arnis') ||
      event.eventName.toLowerCase().includes('swimming') ||
      Boolean(event.subCategories && event.subCategories.length > 0);

    setActiveTab(shouldBeMulti ? 'multiCategory' : 'standard');

    // Pre-populate if results already exist
    const newMap: Record<CollegeId, { placement: Placement; note: string }> = {
      'CBIT': { placement: '1st', note: '' },
      'CESS-IDS': { placement: '2nd', note: '' },
      'CFMS': { placement: '3rd', note: '' },
      'CELS': { placement: '4th', note: '' },
    };

    if (event.results && event.results.length > 0) {
      event.results.forEach(r => {
        newMap[r.collegeId] = {
          placement: r.placement,
          note: r.note || '',
        };
      });
    } else {
      const standardPlaces: Placement[] = ['1st', '2nd', '3rd', '4th'];
      event.participatingColleges.forEach((colId, idx) => {
        newMap[colId] = {
          placement: standardPlaces[idx] || '4th',
          note: '',
        };
      });
    }
    setResultsMap(newMap);

    // Load or generate sub-category drafts
    if (event.subCategories && event.subCategories.length > 0) {
      const loaded: CategoryResultDraft[] = event.subCategories.map((sub, idx) => {
        const plcMap: Record<CollegeId, DisciplinePlacement | ''> = {
          'CBIT': '',
          'CESS-IDS': '',
          'CFMS': '',
          'CELS': '',
        };
        sub.results?.forEach(r => {
          plcMap[r.collegeId] = r.placement;
        });
        return {
          id: sub.id || `sub-${idx}-${Date.now()}`,
          name: sub.name,
          placements: plcMap,
        };
      });
      setCategoryDrafts(loaded);
    } else if (event.eventName.toLowerCase().includes('arnis')) {
      const defaults: CategoryResultDraft[] = DEFAULT_ARNIS_CATEGORIES.map((name, idx) => ({
        id: `arnis-cat-${idx}`,
        name,
        placements: {
          'CBIT': '',
          'CESS-IDS': '',
          'CFMS': '',
          'CELS': '',
        },
      }));
      setCategoryDrafts(defaults);
    } else if (event.eventName.toLowerCase().includes('swimming')) {
      const defaults: CategoryResultDraft[] = DEFAULT_SWIMMING_CATEGORIES.map((name, idx) => ({
        id: `swim-cat-${idx}`,
        name,
        placements: {
          'CBIT': '',
          'CESS-IDS': '',
          'CFMS': '',
          'CELS': '',
        },
      }));
      setCategoryDrafts(defaults);
    } else {
      setCategoryDrafts([]);
    }

    setValidationError(null);
    setShowConfirmationSummary(false);
    setEditReason('');
    if (adminUserDisplay) {
      setCommitteeUser(adminUserDisplay);
    }
  }, [event, isOpen, adminUserDisplay]);

  // ALL HOOKS EXECUTED; SAFE TO RETURN NULL IF MODAL IS NOT OPEN
  if (!isOpen || !event) return null;

  const isAlreadyOfficial = event.resultStatus === 'official';

  const isArnisOrSwimming = Boolean(
    event.eventName.toLowerCase().includes('arnis') ||
      event.eventName.toLowerCase().includes('swimming') ||
      event.isMultiCategoryEvent ||
      (event.subCategories && event.subCategories.length > 0)
  );

  const handlePlacementChange = (colId: CollegeId, placement: Placement) => {
    setResultsMap(prev => ({
      ...prev,
      [colId]: { ...prev[colId], placement },
    }));
    setValidationError(null);
  };

  const handleNoteChange = (colId: CollegeId, note: string) => {
    setResultsMap(prev => ({
      ...prev,
      [colId]: { ...prev[colId], note },
    }));
  };

  // Resolve championship points for a placement
  const getPoints = (placement: Placement): number => {
    return getEventPointsForPlacement(
      placement,
      { ...event, pointTier: selectedTier },
      currentPalakasan?.scoringRules
    );
  };

  // Sub-Category handlers
  const handleCategoryPlacementChange = (
    catId: string,
    colId: CollegeId,
    placement: DisciplinePlacement | ''
  ) => {
    setCategoryDrafts(prev =>
      prev.map(cat =>
        cat.id === catId
          ? {
              ...cat,
              placements: {
                ...cat.placements,
                [colId]: placement,
              },
            }
          : cat
      )
    );
    setValidationError(null);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const newDraft: CategoryResultDraft = {
      id: `custom-cat-${Date.now()}`,
      name: trimmed,
      placements: {
        'CBIT': '',
        'CESS-IDS': '',
        'CFMS': '',
        'CELS': '',
      },
    };
    setCategoryDrafts(prev => [...prev, newDraft]);
    setNewCategoryName('');
  };

  const handleRemoveCategory = (catId: string) => {
    setCategoryDrafts(prev => prev.filter(c => c.id !== catId));
  };

  // Apply the accumulated rankings to final championship placements
  const handleApplyAccumulatedRankings = () => {
    const standardPlaces: Placement[] = ['1st', '2nd', '3rd', '4th'];
    const updatedMap = { ...resultsMap };

    rankedColleges.forEach((colId, idx) => {
      const plc = standardPlaces[idx] || '4th';
      const pts = accumulatedScores.scores[colId] || 0;
      const golds = accumulatedScores.goldCounts[colId] || 0;
      updatedMap[colId] = {
        placement: plc,
        note: `Accumulated ${pts} category pts (${golds} 1st Places) across ${categoryDrafts.length} categories.`,
      };
    });

    setResultsMap(updatedMap);
    setSelectedTier(
      event.category === 'sports'
        ? 'special'
        : getEffectivePointTier(event, currentPalakasan?.scoringRules)
    );
    setActiveTab('standard');
  };

  // Compile subCategories for Firestore persistence
  const getCompiledSubCategories = (): SubCategoryDiscipline[] => {
    return categoryDrafts.map(cat => ({
      id: cat.id,
      name: cat.name,
      results: participating.map(colId => {
        const plc = cat.placements[colId] || ('6th' as DisciplinePlacement);
        return {
          collegeId: colId,
          placement: plc as DisciplinePlacement,
          points: plc ? (disciplinePointsConfig[plc] ?? 0) : 0,
        };
      }),
    }));
  };

  // Strict Validation Rules Check
  const validateForm = (): { valid: boolean; results: EventResultItem[]; error?: string } => {
    const list: EventResultItem[] = participating.map(colId => {
      const data = resultsMap[colId] || { placement: '4th', note: '' };
      return {
        collegeId: colId,
        placement: data.placement,
        points: getPoints(data.placement),
        note: data.note.trim() || undefined,
      };
    });

    // Check unique placement for 1st, 2nd, 3rd, 4th
    const standardPlaces: Placement[] = ['1st', '2nd', '3rd', '4th'];
    for (const place of standardPlaces) {
      const count = list.filter(r => r.placement === place).length;
      if (count > 1) {
        return {
          valid: false,
          results: [],
          error: `Multiple colleges have been assigned ${place} Place. Each placement (1st, 2nd, 3rd, 4th) must be uniquely held by only one college.`,
        };
      }
    }

    // Check if 1st place is assigned
    const hasFirst = list.some(r => r.placement === '1st');
    if (!hasFirst) {
      return {
        valid: false,
        results: [],
        error: 'A 1st Place champion must be designated for this event.',
      };
    }

    return { valid: true, results: list };
  };

  const handleOpenConfirmation = () => {
    // If user is currently in multiCategory tab, apply rankings first before opening
    if (activeTab === 'multiCategory' && categoryDrafts.length > 0) {
      handleApplyAccumulatedRankings();
    }

    const check = validateForm();
    if (!check.valid) {
      setValidationError(check.error || 'Validation error');
      return;
    }
    setValidationError(null);
    setShowConfirmationSummary(true);
  };

  const handleSaveDraft = async () => {
    if (activeTab === 'multiCategory' && categoryDrafts.length > 0) {
      handleApplyAccumulatedRankings();
    }

    const check = validateForm();
    if (!check.valid) {
      setValidationError(check.error || 'Validation error');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
    try {
      const compiledSubs = getCompiledSubCategories();
      await updateEvent(
        event.id,
        {
          pointTier: selectedTier,
          isMajor: selectedTier !== 'minor',
          isMultiCategoryEvent: categoryDrafts.length > 0 || isArnisOrSwimming,
          subCategories: compiledSubs,
          accumulatedScores: accumulatedScores.scores,
        },
        committeeUser
      );

      const res = await saveDraftResults(event.id, check.results, committeeUser);
      if (!res.success) {
        setValidationError(res.error || 'Failed to save draft.');
        return;
      }
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to save draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeclare = async () => {
    const check = validateForm();
    if (!check.valid) {
      setValidationError(check.error || 'Validation error');
      setShowConfirmationSummary(false);
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
    try {
      const compiledSubs = getCompiledSubCategories();

      // Update event with subCategories and accumulated scores metadata
      await updateEvent(
        event.id,
        {
          pointTier: selectedTier,
          isMajor: selectedTier !== 'minor',
          isMultiCategoryEvent: categoryDrafts.length > 0 || isArnisOrSwimming,
          subCategories: compiledSubs,
          accumulatedScores: accumulatedScores.scores,
        },
        committeeUser
      );

      let res: { success: boolean; error?: string };
      if (isAlreadyOfficial) {
        res = await editOfficialResult(event.id, check.results, editReason, committeeUser);
      } else {
        res = await declareOfficialResults(event.id, check.results, committeeUser);
      }

      if (!res.success) {
        setValidationError(res.error || 'Failed to declare official results.');
        setShowConfirmationSummary(false);
        return;
      }

      onClose();
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to declare official results.');
      setShowConfirmationSummary(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const compiledResults = participating.map(colId => {
    const data = resultsMap[colId] || { placement: '4th', note: '' };
    return {
      collegeId: colId,
      college: COLLEGES.find(c => c.id === colId)!,
      placement: data.placement,
      points: getPoints(data.placement),
      note: data.note,
    };
  });

  const placementSortOrder: Record<Placement, number> = {
    '1st': 1,
    '2nd': 2,
    '3rd': 3,
    '4th': 4,
    'DQ': 5,
  };
  compiledResults.sort((a, b) => placementSortOrder[a.placement] - placementSortOrder[b.placement]);

  const p1 = getPoints('1st');
  const p2 = getPoints('2nd');
  const p3 = getPoints('3rd');
  const p4 = getPoints('4th');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-purple-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {event.category}
              </span>
              <span className="text-slate-300">•</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isAlreadyOfficial
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isAlreadyOfficial ? 'Official Certified' : 'Uncertified Event'}
              </span>
              {isArnisOrSwimming && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Star className="w-3 h-3 text-purple-600 fill-purple-600" />
                  <span>Special Multi-Category Meet</span>
                </span>
              )}
            </div>
            <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 mt-0.5">
              {isAlreadyOfficial ? 'Edit Official Results: ' : 'Enter Results & Declare Winner: '}
              {event.eventName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Tabs (Standard vs Multi-Category Accumulator) */}
        {!showConfirmationSummary && (
          <div className="flex items-center gap-1 px-6 pt-3 pb-1 border-b border-slate-100 bg-slate-50/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('multiCategory')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'multiCategory'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-50 font-semibold'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Multi-Category Accumulator (10-8-6-4-2-0)</span>
              {categoryDrafts.length > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === 'multiCategory' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {categoryDrafts.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('standard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'standard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 font-semibold'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Final Championship Placements</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Official Result Warning Banner */}
          {isAlreadyOfficial && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Caution: Official Results Recorded</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  This result is already official. Changing it will recalculate category point allocations and overall university standings. Please provide an audit justification.
                </p>
                <input
                  type="text"
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  placeholder="Justification for amendment (e.g. Scorer recount, official jury protest)..."
                  className="w-full mt-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Result Validation Error</p>
                <p className="text-[11px]">{validationError}</p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: MULTI-CATEGORY ACCUMULATOR (ARNIS / SWIMMING / ATHLETICS) */}
          {/* ========================================================================= */}
          {!showConfirmationSummary && activeTab === 'multiCategory' && (
            <div className="space-y-5">
              {/* Scoring Logic Explainer Banner */}
              <div className="p-4 rounded-xl bg-purple-50/90 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-purple-950">
                    <Zap className="w-4 h-4 text-purple-700" />
                    <span>Special Multi-Category Point Accumulator</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    10-8-6-4-2-0 Scale
                  </span>
                </div>
                <p className="text-[11px] text-purple-900 leading-relaxed">
                  Competitions like <strong>Arnis</strong> and <strong>Swimming</strong> have many categories (weight classes, strokes, and relays). In each category, colleges earn points: <strong>1st: 10 pts, 2nd: 8 pts, 3rd: 6 pts, 4th: 4 pts, 5th: 2 pts, 6th: 0 pts</strong>. All points won per college are accumulated; the college with the highest total is awarded <strong>1st Place Champion ({p1} pts)</strong>, second highest <strong>2nd Place ({p2} pts)</strong>, and so on.
                </p>
              </div>

              {/* LIVE ACCUMULATED SCOREBOARD CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-900/60 pb-2">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-purple-300">
                    <Calculator className="w-4 h-4 text-amber-400" />
                    <span>Live Accumulated College Standings</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyAccumulatedRankings}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-black shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>Apply to Championship Results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {rankedColleges.map((colId, index) => {
                    const score = accumulatedScores.scores[colId] || 0;
                    const golds = accumulatedScores.goldCounts[colId] || 0;
                    const placeName = index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : '4th';
                    const col = COLLEGES.find(c => c.id === colId);

                    return (
                      <div
                        key={colId}
                        className={`p-3 rounded-xl border flex flex-col justify-between ${
                          index === 0
                            ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                            : index === 1
                            ? 'bg-slate-300/10 border-slate-300/30 text-slate-200'
                            : index === 2
                            ? 'bg-amber-700/15 border-amber-600/30 text-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[11px] px-1.5 py-0.5 rounded bg-black/30">
                            {placeName} Place
                          </span>
                          <span className="font-bold text-xs text-white">{col?.acronym}</span>
                        </div>
                        <div className="mt-2">
                          <div className="text-2xl font-black font-mono text-white">
                            {score} <span className="text-xs font-normal text-slate-300">pts</span>
                          </div>
                          <div className="text-[10px] text-slate-300 mt-0.5">
                            {golds} Golds • {getPoints(placeName as Placement)} Champ Pts
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Categories Management & Input */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <span>Event Categories & Disciplines ({categoryDrafts.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Select college placements for each heat or weight class. Points update instantly.
                    </p>
                  </div>

                  {/* Add New Category Quick Input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                      placeholder="Add sub-category / event..."
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 w-48 sm:w-56"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Category Cards */}
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {categoryDrafts.map((cat, catIdx) => (
                    <div
                      key={cat.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-mono text-[10px]">
                            {catIdx + 1}
                          </span>
                          <span>{cat.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                          title="Remove category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* College Placements Grid for this Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                        {participating.map(colId => {
                          const col = COLLEGES.find(c => c.id === colId);
                          const currentPlc = cat.placements[colId] || '';
                          const earnedPts = currentPlc ? disciplinePointsConfig[currentPlc] ?? 0 : 0;
                          const badge = getCollegeBadgeStyle(colId);

                          return (
                            <div
                              key={colId}
                              className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-1.5 shadow-2xs"
                            >
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}
                                >
                                  {col?.acronym}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <select
                                  value={currentPlc}
                                  onChange={e =>
                                    handleCategoryPlacementChange(
                                      cat.id,
                                      colId,
                                      e.target.value as DisciplinePlacement | ''
                                    )
                                  }
                                  className="text-[11px] font-semibold py-1 px-1.5 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-purple-500 cursor-pointer"
                                >
                                  <option value="">Unplaced (0)</option>
                                  <option value="1st">1st ({disciplinePointsConfig['1st']} pts)</option>
                                  <option value="2nd">2nd ({disciplinePointsConfig['2nd']} pts)</option>
                                  <option value="3rd">3rd ({disciplinePointsConfig['3rd']} pts)</option>
                                  <option value="4th">4th ({disciplinePointsConfig['4th']} pts)</option>
                                  <option value="5th">5th ({disciplinePointsConfig['5th']} pts)</option>
                                  <option value="6th">6th ({disciplinePointsConfig['6th']} pts)</option>
                                  <option value="DQ">DQ (0 pts)</option>
                                </select>

                                <span
                                  className={`font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                    earnedPts > 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  +{earnedPts}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {categoryDrafts.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
                      <p className="font-semibold text-xs text-slate-700">No Categories Added Yet</p>
                      <p className="text-[11px]">
                        Add sub-categories (e.g. Anyo Traditional, Laban Bantamweight, 50m Free) using the input above.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: STANDARD PLACEMENTS VIEW */}
          {/* ========================================================================= */}
          {!showConfirmationSummary && activeTab === 'standard' && (
            <div className="space-y-4">
              {/* Dynamic Point System Banner & Category-Scoped Tier Selector */}
              {(() => {
                const allowedTiers = getAllowedTiersForCategory(
                  event.category,
                  currentPalakasan?.scoringRules
                );
                const categoryTitle =
                  event.category === 'sports'
                    ? 'Sports'
                    : event.category === 'cultural'
                    ? 'Cultural & Arts'
                    : event.category === 'literary'
                    ? 'Literary'
                    : 'Special Events';

                return (
                  <div
                    className={`p-3.5 rounded-xl border space-y-2 ${
                      selectedTier === 'special'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : selectedTier === 'major'
                        ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        {selectedTier === 'special' ? (
                          <>
                            <Swords className="w-4 h-4 text-amber-700" />
                            <span className="text-amber-950">Special Sports Championship Scale Applied</span>
                          </>
                        ) : selectedTier === 'major' ? (
                          <>
                            <Award className="w-4 h-4 text-blue-700" />
                            <span className="text-blue-900">
                              Major {categoryTitle} Scale Applied
                            </span>
                          </>
                        ) : (
                          <>
                            <Layers className="w-4 h-4 text-slate-700" />
                            <span className="text-slate-800">
                              Minor {categoryTitle} Scale Applied
                            </span>
                          </>
                        )}
                      </div>

                      {/* Category-Scoped Tier Override Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold">Category Tier:</span>
                        <select
                          value={selectedTier}
                          disabled={allowedTiers.length <= 1}
                          onChange={e => setSelectedTier(e.target.value as PointTier)}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-300 focus:outline-hidden cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
                        >
                          {allowedTiers.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-[11px] leading-relaxed font-mono">
                      1st: <strong>{p1} pts</strong> • 2nd: <strong>{p2} pts</strong> • 3rd: <strong>{p3} pts</strong> • 4th: <strong>{p4} pts</strong> • DQ: <strong>0 pts</strong>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Participating Colleges & Final Placements ({participating.length})
                  </h4>
                  {categoryDrafts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('multiCategory')}
                      className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Re-calculate from Category Points</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {participating.map(colId => {
                    const col = COLLEGES.find(c => c.id === colId)!;
                    const badge = getCollegeBadgeStyle(colId);
                    const current = resultsMap[colId] || { placement: '4th', note: '' };
                    const pts = getPoints(current.placement);

                    return (
                      <div
                        key={colId}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${badge.bg} ${badge.text}`}
                            >
                              {col.acronym}
                            </span>
                            <span className="font-semibold text-slate-800 text-xs hidden sm:inline">
                              {col.shortName}
                            </span>
                          </div>

                          {/* Championship Points Display */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-500 font-medium">Championship Points:</span>
                            <span
                              className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded border ${
                                selectedTier === 'special'
                                  ? 'bg-purple-50 text-purple-900 border-purple-200'
                                  : 'bg-blue-50 text-blue-800 border-blue-200/60'
                              }`}
                            >
                              {pts} pts
                            </span>
                          </div>
                        </div>

                        {/* Placements Selector Buttons */}
                        <div className="grid grid-cols-5 gap-1.5 pt-1">
                          {(['1st', '2nd', '3rd', '4th', 'DQ'] as Placement[]).map(plc => {
                            const isSelected = current.placement === plc;
                            return (
                              <button
                                key={plc}
                                type="button"
                                onClick={() => handlePlacementChange(colId, plc)}
                                className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all flex flex-col items-center justify-center cursor-pointer ${
                                  isSelected
                                    ? plc === '1st'
                                      ? 'bg-amber-400 text-slate-900 shadow-xs ring-2 ring-amber-300'
                                      : plc === '2nd'
                                      ? 'bg-slate-300 text-slate-900 shadow-xs ring-2 ring-slate-300'
                                      : plc === '3rd'
                                      ? 'bg-amber-700 text-white shadow-xs ring-2 ring-amber-600'
                                      : plc === 'DQ'
                                      ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-400'
                                      : 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                <span>{plc}</span>
                                <span className="text-[10px] font-normal opacity-85">
                                  {plc === '1st'
                                    ? 'Gold'
                                    : plc === '2nd'
                                    ? 'Silver'
                                    : plc === '3rd'
                                    ? 'Bronze'
                                    : plc === 'DQ'
                                    ? 'DQ'
                                    : '4th'}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Note Input */}
                        <input
                          type="text"
                          value={current.note}
                          onChange={e => handleNoteChange(colId, e.target.value)}
                          placeholder="Optional audit note or accumulated category score record..."
                          className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] focus:bg-white"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CONFIRMATION SUMMARY STEP */}
          {/* ========================================================================= */}
          {showConfirmationSummary && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Review Final Official Results & Point Allocation</span>
                </div>
                <p className="text-emerald-800 text-xs">
                  Upon confirmation, official point transactions will be immutably recorded for this PALAKASAN edition.
                </p>
              </div>

              {categoryDrafts.length > 0 && (
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-purple-900">
                    <span>Multi-Category Accumulator Summary:</span>
                    <span>{categoryDrafts.length} Categories Scored</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    {rankedColleges.map(colId => (
                      <div key={colId} className="p-1.5 bg-white rounded border border-purple-200 text-center">
                        <span className="font-bold text-slate-900 block">{colId}</span>
                        <span className="text-purple-700 font-bold">{accumulatedScores.scores[colId] || 0} category pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Placement</th>
                      <th className="py-2.5 px-3">College</th>
                      <th className="py-2.5 px-3 text-right">Championship Points</th>
                      <th className="py-2.5 px-3">Remarks / Score Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {compiledResults.map(r => {
                      const badge = getCollegeBadgeStyle(r.collegeId);
                      return (
                        <tr key={r.collegeId} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-extrabold text-slate-900">
                            {r.placement === '1st' && '🥇 1st Place (Champion)'}
                            {r.placement === '2nd' && '🥈 2nd Place'}
                            {r.placement === '3rd' && '🥉 3rd Place'}
                            {r.placement === '4th' && '🎖️ 4th Place'}
                            {r.placement === 'DQ' && '❌ Disqualified'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${badge.bg} ${badge.text}`}
                            >
                              {r.college.acronym}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 text-sm">
                            +{r.points} pts
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {r.note || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Committee Sign-Off */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Authorizing Official / Sign-Off
                </label>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <input
                    type="text"
                    value={committeeUser}
                    onChange={e => setCommitteeUser(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {!showConfirmationSummary ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveDraft}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleOpenConfirmation}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {activeTab === 'multiCategory'
                      ? 'Calculate & Certify Placements...'
                      : 'Declare Winner...'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmationSummary(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-50 rounded-lg flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Back to Edit</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDeclare}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Certifying Official Result...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Declare Official Result</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
