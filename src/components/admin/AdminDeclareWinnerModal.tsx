import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Award,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Star,
  Layers,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CollegeId, EventResultItem, PalakasanEvent, Placement, PointTier } from '../../types';
import { COLLEGES, getEventPointsForPlacement } from '../../data/initialData';
import { getCollegeBadgeStyle } from '../../utils/collegeTheme';

interface AdminDeclareWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PalakasanEvent | null;
}

export const AdminDeclareWinnerModal: React.FC<AdminDeclareWinnerModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const { currentPalakasan, declareOfficialResults, saveDraftResults, editOfficialResult, updateEvent } =
    usePalakasan();

  const [selectedTier, setSelectedTier] = useState<PointTier>('major');
  const [resultsMap, setResultsMap] = useState<Record<CollegeId, { placement: Placement; note: string }>>({
    'CBIT': { placement: '1st', note: '' },
    'CESS-IDS': { placement: '2nd', note: '' },
    'CFMS': { placement: '3rd', note: '' },
    'CELS': { placement: '4th', note: '' },
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirmationSummary, setShowConfirmationSummary] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [committeeUser, setCommitteeUser] = useState('MSUN Sports & Cultural Affairs Committee');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAlreadyOfficial = event?.resultStatus === 'official';

  useEffect(() => {
    if (!event) return;

    // Detect initial tier
    const initialTier: PointTier =
      event.pointTier ||
      (event.category === 'special' ? 'special' : event.isMajor || event.category === 'sports' ? 'major' : 'minor');
    setSelectedTier(initialTier);

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
      // Initial placement suggestions based on participating colleges
      const standardPlaces: Placement[] = ['1st', '2nd', '3rd', '4th'];
      event.participatingColleges.forEach((colId, idx) => {
        newMap[colId] = {
          placement: standardPlaces[idx] || '4th',
          note: '',
        };
      });
    }

    setResultsMap(newMap);
    setValidationError(null);
    setShowConfirmationSummary(false);
    setEditReason('');
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const participating = event.participatingColleges;

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

  // Resolve points for a placement based on the currently selected tier and tournament rules
  const getPoints = (placement: Placement): number => {
    return getEventPointsForPlacement(
      placement,
      { ...event, pointTier: selectedTier },
      currentPalakasan?.scoringRules
    );
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
    const check = validateForm();
    if (!check.valid) {
      setValidationError(check.error || 'Validation error');
      return;
    }
    setValidationError(null);
    setShowConfirmationSummary(true);
  };

  const handleSaveDraft = async () => {
    const check = validateForm();
    if (!check.valid) {
      setValidationError(check.error || 'Validation error');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
    try {
      if (selectedTier !== event.pointTier) {
        await updateEvent(
          event.id,
          { pointTier: selectedTier, isMajor: selectedTier === 'major' || selectedTier === 'special' },
          committeeUser
        );
      }
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
      // If tier was updated in this modal, update the event metadata first
      if (selectedTier !== event.pointTier) {
        await updateEvent(
          event.id,
          { pointTier: selectedTier, isMajor: selectedTier === 'major' || selectedTier === 'special' },
          committeeUser
        );
      }

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

  // Sort by ranking for summary
  const placementSortOrder: Record<Placement, number> = {
    '1st': 1,
    '2nd': 2,
    '3rd': 3,
    '4th': 4,
    'DQ': 5,
  };
  compiledResults.sort((a, b) => placementSortOrder[a.placement] - placementSortOrder[b.placement]);

  // Point scale values for preview
  const p1 = getPoints('1st');
  const p2 = getPoints('2nd');
  const p3 = getPoints('3rd');
  const p4 = getPoints('4th');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/50">
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
            </div>
            <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
              {isAlreadyOfficial ? 'Edit Official Results: ' : 'Enter Results & Declare Winner: '}
              {event.eventName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Official Result Warning Banner if already official */}
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

          {/* View 1: Placements Input Grid */}
          {!showConfirmationSummary ? (
            <div className="space-y-4">
              {/* Dynamic Point System Banner & Tier Selector */}
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  selectedTier === 'special'
                    ? 'bg-purple-50/80 border-purple-200 text-purple-950'
                    : selectedTier === 'major'
                    ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    {selectedTier === 'special' ? (
                      <>
                        <Star className="w-4 h-4 text-purple-700 fill-purple-700" />
                        <span className="text-purple-900">⭐ Special Events Points System Applied</span>
                      </>
                    ) : selectedTier === 'major' ? (
                      <>
                        <Award className="w-4 h-4 text-blue-700" />
                        <span className="text-blue-900">🏅 Major Events Scale Applied</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4 text-slate-700" />
                        <span className="text-slate-800">🥈 Minor Events Scale Applied</span>
                      </>
                    )}
                  </div>

                  {/* Tier Override Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-semibold">Point Tier:</span>
                    <select
                      value={selectedTier}
                      onChange={e => setSelectedTier(e.target.value as PointTier)}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-300 focus:outline-hidden cursor-pointer"
                    >
                      <option value="special">⭐ Special Tier ({getEventPointsForPlacement('1st', { pointTier: 'special' }, currentPalakasan?.scoringRules)} pts)</option>
                      <option value="major">🏅 Major Tier ({getEventPointsForPlacement('1st', { pointTier: 'major' }, currentPalakasan?.scoringRules)} pts)</option>
                      <option value="minor">🥈 Minor Tier ({getEventPointsForPlacement('1st', { pointTier: 'minor' }, currentPalakasan?.scoringRules)} pts)</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] leading-relaxed font-mono">
                  1st: <strong>{p1} pts</strong> • 2nd: <strong>{p2} pts</strong> • 3rd: <strong>{p3} pts</strong> • 4th: <strong>{p4} pts</strong> • DQ: <strong>0 pts</strong>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Participating Colleges ({participating.length})
                </h4>

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

                          {/* Points Display (Dynamic Read-Only) */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-500 font-medium">Points:</span>
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
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <span>{plc}</span>
                                <span className="text-[9px] font-normal opacity-80">
                                  {plc === 'DQ' ? '0 pts' : `${getPoints(plc)} pts`}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Disqualification / Audit Note */}
                        <input
                          type="text"
                          value={current.note}
                          onChange={e => handleNoteChange(colId, e.target.value)}
                          placeholder={
                            current.placement === 'DQ'
                              ? 'Required: Specify disqualification reason...'
                              : 'Optional: Score remarks, time or set scores...'
                          }
                          className={`w-full px-3 py-1.5 text-xs rounded-lg border ${
                            current.placement === 'DQ' && !current.note
                              ? 'border-red-300 bg-red-50/50'
                              : 'border-slate-200 bg-slate-50/50'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* View 2: Confirmation Summary */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Mindanao State University at Naawan
                  </span>
                  <h4 className="text-base font-extrabold text-blue-950">
                    Official Event Result Declaration
                  </h4>
                  <p className="text-xs text-slate-600">
                    Event: <span className="font-bold text-slate-900">{event.eventName}</span> | Tier:{' '}
                    <span className="font-bold capitalize text-purple-700">
                      {selectedTier === 'special' ? '⭐ Special Events System' : selectedTier === 'major' ? 'Major Event' : 'Minor Event'}
                    </span>
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-blue-100 divide-y divide-slate-100 p-2 text-xs">
                  {compiledResults.map(res => {
                    const badge = getCollegeBadgeStyle(res.collegeId);
                    return (
                      <div key={res.collegeId} className="py-2.5 px-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-8 text-center py-0.5 rounded text-xs font-black ${
                              res.placement === '1st'
                                ? 'bg-amber-400 text-white'
                                : res.placement === '2nd'
                                ? 'bg-slate-300 text-slate-800'
                                : res.placement === '3rd'
                                ? 'bg-amber-700 text-white'
                                : res.placement === 'DQ'
                                ? 'bg-red-500 text-white'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {res.placement}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${badge.bg} ${badge.text}`}
                          >
                            {res.collegeId}
                          </span>
                          <span className="font-semibold text-slate-700">{res.college.name}</span>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-sm text-blue-950 font-mono">
                            {res.points}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">Points</span>
                          {res.note && (
                            <p className="text-[10px] text-slate-400 max-w-xs truncate">{res.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] text-blue-900/80 bg-blue-100/50 p-2.5 rounded-lg">
                  Confirming this declaration will immediately finalize results, award authoritative points to the college ledgers, and re-rank the overall university standings.
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
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
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
                  <span>Save as Draft</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleOpenConfirmation}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>Declare Winner...</span>
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
