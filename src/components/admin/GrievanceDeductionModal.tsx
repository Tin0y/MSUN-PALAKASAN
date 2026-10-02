import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Scale,
  MinusCircle,
  Trash2,
  CheckCircle,
  FileText,
  ShieldAlert,
  ArrowDownRight,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CollegeId, CategoryId, PointTransaction } from '../../types';
import { getCollegeBadgeStyle } from '../../utils/collegeTheme';
import { CATEGORIES } from '../../data/initialData';

interface GrievanceDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCollegeId?: CollegeId;
  preselectedEventId?: string;
}

const COMMON_GRIEVANCE_REASONS = [
  'Ineligible / Unregistered Athlete Participation',
  'Unsportsmanlike Conduct / Referee Harassment',
  'Forfeiture / Failure to Appear at Scheduled Venue',
  'Uniform / Equipment / Technical Violation',
  'Breach of Palakasan Code of Conduct',
  'Official Grievance Committee Resolution Ruling',
];

const PRESET_POINTS = [5, 10, 15, 20, 25, 50];

export const GrievanceDeductionModal: React.FC<GrievanceDeductionModalProps> = ({
  isOpen,
  onClose,
  preselectedCollegeId,
  preselectedEventId,
}) => {
  const {
    colleges,
    events,
    pointTransactions,
    overallStandings,
    applyGrievanceDeduction,
    deletePointTransactionById,
  } = usePalakasan();

  const [selectedCollege, setSelectedCollege] = useState<CollegeId>(
    preselectedCollegeId || 'CBIT'
  );
  const [scope, setScope] = useState<'overall' | CategoryId>('overall');
  const [pointsDeducted, setPointsDeducted] = useState<number>(10);
  const [customPoints, setCustomPoints] = useState<string>('10');
  const [reasonCategory, setReasonCategory] = useState<string>(
    COMMON_GRIEVANCE_REASONS[0]
  );
  const [customDetails, setCustomDetails] = useState<string>('');
  const [resolutionId, setResolutionId] = useState<string>(
    `GRV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [relatedEventId, setRelatedEventId] = useState<string>(
    preselectedEventId || ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'apply' | 'ledger'>('apply');

  if (!isOpen) return null;

  // Filter only deduction transactions (pointsAwarded < 0)
  const deductionTransactions = pointTransactions.filter(
    pt => pt.pointsAwarded < 0 && pt.status === 'official'
  );

  const currentStanding = overallStandings.find(
    s => s.college.id === selectedCollege
  );
  const collegeBadge = getCollegeBadgeStyle(selectedCollege);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPoints = Number(customPoints) || pointsDeducted;
    if (!finalPoints || finalPoints <= 0) return;

    const fullReason = customDetails.trim()
      ? `${reasonCategory}: ${customDetails.trim()}`
      : reasonCategory;

    const selectedEv = events.find(ev => ev.id === relatedEventId);

    setIsSubmitting(true);
    try {
      await applyGrievanceDeduction({
        collegeId: selectedCollege,
        pointsToDeduct: finalPoints,
        reason: fullReason,
        scope,
        eventId: selectedEv?.id,
        eventName: selectedEv?.eventName,
        resolutionId: resolutionId.trim() || undefined,
      });

      setSuccessMessage(
        `Successfully deducted ${finalPoints} pts from ${selectedCollege} (${scope === 'overall' ? 'Overall Standing' : scope.toUpperCase()}).`
      );
      setCustomDetails('');
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab('ledger');
      }, 1200);
    } catch (err) {
      console.error('Failed to apply grievance deduction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (txId: string) => {
    try {
      await deletePointTransactionById(txId);
    } catch (err) {
      console.error('Failed to revoke deduction:', err);
    }
  };

  return (
    <div
      id="grievance-deduction-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-scaleIn text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-red-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Grievance & Disciplinary Points Deduction
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">
                  Penalty Action
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Deduct standing points from overall rank or per category based on grievances and committee sanctions.
              </p>
            </div>
          </div>
          <button
            id="close-grievance-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'apply'
                ? 'border-red-600 text-red-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Apply Deduction</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'border-red-600 text-red-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Active Penalties ({deductionTransactions.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'apply' ? (
            <form onSubmit={handleApply} className="space-y-4">
              {/* 1. College Selection with Official Designated Colors */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  1. Select College to Penalize (Designated Color Assigned):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {colleges.map(col => {
                    const badge = getCollegeBadgeStyle(col.id);
                    const isSelected = selectedCollege === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setSelectedCollege(col.id as CollegeId)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? `${badge.bg} ${badge.border} ring-2 ${badge.ring} shadow-xs`
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black ${badge.badge}`}
                          >
                            {col.acronym}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: badge.hex }}
                            title={`${col.acronym} Official Color: ${badge.colorName}`}
                          />
                        </div>
                        <p className="font-bold text-slate-800 text-[11px] truncate">
                          {col.shortName || col.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Color: <strong style={{ color: badge.hex }}>{badge.colorName}</strong>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Scope of Deduction: Overall vs Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  2. Deduction Scope (Where to deduct points):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScope('overall')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      scope === 'overall'
                        ? 'bg-red-50/70 border-red-300 ring-2 ring-red-400/20 text-red-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-xs">
                      <Scale className="w-3.5 h-3.5 text-red-600" />
                      <span>Overall Standing Points</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Direct deduction from the college's Championship Overall Total (recommended for institution-level infractions).
                    </p>
                  </button>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-600 mb-1">
                      Or Specific Category Division:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setScope(cat.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-left text-xs transition-all ${
                            scope === cat.id
                              ? 'bg-red-50 border-red-400 text-red-900 font-bold ring-1 ring-red-400'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{cat.icon} {cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Points to Deduct */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    3. Points to Deduct:
                  </label>
                  <span className="text-red-700 font-black text-sm">
                    -{Number(customPoints) || 0} pts
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {PRESET_POINTS.map(pts => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => {
                        setPointsDeducted(pts);
                        setCustomPoints(pts.toString());
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                        customPoints === pts.toString()
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      -{pts} pts
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium text-xs">Custom Points:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={customPoints}
                    onChange={e => setCustomPoints(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-red-700 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <span className="text-[11px] text-slate-400">points will be recorded as negative in ledger</span>
                </div>
              </div>

              {/* 4. Grievance Reason & Problem Details */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  4. Reason / Grievance Ground:
                </label>
                <select
                  value={reasonCategory}
                  onChange={e => setReasonCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  {COMMON_GRIEVANCE_REASONS.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <textarea
                  rows={2}
                  value={customDetails}
                  onChange={e => setCustomDetails(e.target.value)}
                  placeholder="Additional explanation or problem description (e.g., Ineligible varsity player fielded in Match #4 vs CFMS)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* 5. Additional references: Resolution ID and Event */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Grievance Resolution # / Reference:
                  </label>
                  <input
                    type="text"
                    value={resolutionId}
                    onChange={e => setResolutionId(e.target.value)}
                    placeholder="e.g. RES-2026-004"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Related Event (Optional):
                  </label>
                  <select
                    value={relatedEventId}
                    onChange={e => setRelatedEventId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                  >
                    <option value="">None (Tournament-Wide Infraction)</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.eventName} ({ev.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Impact Preview */}
              {currentStanding && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Current Score Impact Preview:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {currentStanding.college.acronym} Current Total: {currentStanding.overallPoints} pts
                      </span>
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                      <span className="font-extrabold text-red-700">
                        New Total: {Math.max(0, currentStanding.overallPoints - (Number(customPoints) || 0))} pts
                      </span>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold border"
                    style={{
                      backgroundColor: collegeBadge.bg,
                      color: collegeBadge.hex,
                      borderColor: collegeBadge.border,
                    }}
                  >
                    {collegeBadge.colorName}
                  </span>
                </div>
              )}

              {/* Submit button */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-grievance-deduction-btn"
                  type="submit"
                  disabled={isSubmitting || !Number(customPoints)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting ? 'Recording Penalty...' : `Confirm -${customPoints} Pts Deduction`}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* Active Penalties Ledger */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Recorded Disciplinary & Grievance Deductions</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  {deductionTransactions.length} active penalty transactions
                </span>
              </div>

              {deductionTransactions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Scale className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-xs">No Points Deducted Yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    There are currently no active disciplinary penalties or grievance deductions applied to any college.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
                  {deductionTransactions.map(tx => {
                    const badge = getCollegeBadgeStyle(tx.collegeId);
                    return (
                      <div
                        key={tx.id}
                        className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.badge}`}
                            >
                              {tx.collegeId}
                            </span>
                            <span className="font-extrabold text-red-600 text-xs">
                              {tx.pointsAwarded} pts
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                              {tx.category === 'overall' ? 'Overall Standing' : `${tx.category.toUpperCase()} Division`}
                            </span>
                            {tx.grievanceResolutionId && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                #{tx.grievanceResolutionId}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 font-medium">
                            {tx.reason || tx.eventName}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>Declared by: {tx.declaredBy}</span>
                            <span>•</span>
                            <span>Date: {tx.dateAwarded}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRevoke(tx.id)}
                          className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-[11px] flex items-center gap-1 transition-colors shrink-0"
                          title="Revoke and restore deducted points"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Revoke</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
