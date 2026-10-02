import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  Scale,
  MinusCircle,
  Calendar,
  MapPin,
  Award,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { PalakasanEvent, CollegeId, CategoryId } from '../../types';
import { getCollegeBadgeStyle } from '../../utils/collegeTheme';
import { CATEGORIES } from '../../data/initialData';

interface DeleteEventModalProps {
  event: PalakasanEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const {
    deleteEvent,
    applyGrievanceDeduction,
    colleges,
  } = usePalakasan();

  const [includeGrievanceDeduction, setIncludeGrievanceDeduction] = useState(false);
  const [penalizedCollege, setPenalizedCollege] = useState<CollegeId>('CBIT');
  const [deductionScope, setDeductionScope] = useState<'overall' | CategoryId>('overall');
  const [deductionPoints, setDeductionPoints] = useState<number>(10);
  const [grievanceReason, setGrievanceReason] = useState<string>('Event Forfeiture / Grievance Consequence');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !event) return null;

  const hasCertifiedResults = event.resultStatus === 'official' && Array.isArray(event.results) && event.results.length > 0;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // 1. If grievance deduction consequence is requested, record it
      if (includeGrievanceDeduction && deductionPoints > 0) {
        await applyGrievanceDeduction({
          collegeId: penalizedCollege,
          pointsToDeduct: deductionPoints,
          reason: `[Event Cancellation Consequence: ${event.eventName}] ${grievanceReason}`,
          scope: deductionScope === 'overall' ? 'overall' : (event.category || 'sports'),
          eventId: event.id,
          eventName: event.eventName,
        });
      }

      // 2. Delete the event and cascade remove any certified points for this event
      await deleteEvent(event.id);

      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="delete-event-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-auto animate-scaleIn text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 bg-red-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Delete Event</h3>
              <p className="text-[11px] text-slate-600">
                Remove competition from schedule and ledger.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Event Card Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">{event.eventName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                {event.category}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {event.date} {event.startTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {event.venue}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Status: <strong className="capitalize text-slate-700">{event.status}</strong>
              </span>
            </div>

            {hasCertifiedResults && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> This event has certified official results. Deleting it will automatically cascade and remove all points awarded for this event from the university standings ledger.
                </span>
              </div>
            )}
          </div>

          {/* Optional Grievance Penalty Consequence Section */}
          <div className="rounded-xl border border-slate-200 p-3.5 space-y-3 bg-white">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeGrievanceDeduction}
                onChange={e => setIncludeGrievanceDeduction(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
              />
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-red-600" />
                <span>Apply Point Deduction as consequence for a grievance/problem?</span>
              </span>
            </label>

            {includeGrievanceDeduction && (
              <div className="space-y-3 pt-2 border-t border-slate-100 animate-fadeIn">
                <p className="text-[11px] text-slate-500">
                  If this event is being cancelled or deleted due to an unresolved grievance, walkout, or forfeiture, you can penalize the offending college directly:
                </p>

                {/* Select College */}
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Offending College to Penalize:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {colleges.map(col => {
                      const badge = getCollegeBadgeStyle(col.id);
                      const isSelected = penalizedCollege === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setPenalizedCollege(col.id as CollegeId)}
                          className={`p-2 rounded-lg border text-left text-xs transition-all ${
                            isSelected
                              ? `${badge.bg} ${badge.border} ring-2 ${badge.ring} font-bold`
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{col.acronym}</span>
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: badge.hex }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {badge.colorName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Deduction Scope */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Deduction Scope:
                    </label>
                    <select
                      value={deductionScope}
                      onChange={e => setDeductionScope(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="overall">Overall Standing Points</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} Division
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Points to Deduct:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={deductionPoints}
                        onChange={e => setDeductionPoints(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-red-700"
                      />
                      <span className="text-red-600 font-bold shrink-0">pts</span>
                    </div>
                  </div>
                </div>

                {/* Grievance reason */}
                <div>
                  <label className="block font-bold text-slate-700 text-[11px] mb-1">
                    Grievance Problem / Consequence Reason:
                  </label>
                  <input
                    type="text"
                    value={grievanceReason}
                    onChange={e => setGrievanceReason(e.target.value)}
                    placeholder="e.g. Failure to appear / walkout protest / eligibility dispute"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold transition-colors"
          >
            Keep Event
          </button>
          <button
            id="confirm-delete-event-btn"
            type="button"
            disabled={isDeleting}
            onClick={handleDeleteConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Event'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
