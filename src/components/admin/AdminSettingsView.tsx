import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  Database,
  Lock,
  Trash2,
  RefreshCw,
  Info,
  Calendar,
  Sparkles,
  Trophy,
  History,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { RankingsVisibilityManager } from './RankingsVisibilityManager';

type ActionType = 'reset-defaults' | 'clear-points' | 'clear-logs' | null;

export const AdminSettingsView: React.FC = () => {
  const {
    resetToDefaultData,
    clearPointHistory,
    clearActivityAuditLogs,
    getEventStats,
    currentPalakasan,
    events,
    pointTransactions,
    activityLogs,
  } = usePalakasan();

  const stats = getEventStats();

  const [activeModal, setActiveModal] = useState<ActionType>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleConfirmAction = async () => {
    if (!activeModal) return;
    setIsProcessing(true);
    try {
      if (activeModal === 'reset-defaults') {
        await resetToDefaultData();
        showToast('Tournament data restored to official demo defaults with sample events and verified scores.');
      } else if (activeModal === 'clear-points') {
        await clearPointHistory();
        showToast('All point history cleared. Leaderboard standings reset to 0; events reset to upcoming.');
      } else if (activeModal === 'clear-logs') {
        await clearActivityAuditLogs();
        showToast('Activity audit trail cleared successfully.');
      }
      setActiveModal(null);
    } catch (err) {
      console.error('Operation failed:', err);
      showToast('Action failed to complete. Please check connection.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="settings-toast-banner"
          className={`flex items-center justify-between p-4 rounded-2xl border shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Control Center</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Data Maintenance & Tournament Reset Controls
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Manage tournament lifecycle states, wipe result test data, purge audit logs, or restore the official MSUN Palakasan demonstration dataset.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Active Edition
          </span>
          <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {currentPalakasan?.name || 'PALAKASAN 2026'}
          </span>
        </div>
      </div>

      {/* Overview Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Total Events</span>
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">{stats.totalEvents}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {stats.declaredWinnersEvents} completed / {stats.upcomingEvents} upcoming
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Point Transactions</span>
          </div>
          <p className="text-xl font-black text-emerald-700 font-mono">{pointTransactions.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Official ledger entries
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <History className="w-4 h-4 text-purple-600" />
            <span>Audit Trail Logs</span>
          </div>
          <p className="text-xl font-black text-purple-700 font-mono">{activityLogs.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Recorded admin actions
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Scoring Tiers</span>
          </div>
          <p className="text-xl font-black text-amber-700 font-mono">3 Tiers</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Special, Major, Minor
          </span>
        </div>
      </div>

      {/* Final Day Thrill Mode & Rankings Visibility Controls */}
      <RankingsVisibilityManager />

      {/* Main Grid: Friendly Actions & Scoring Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Operations (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Data Reset & Tournament State Controls
                </h3>
                <p className="text-xs text-slate-500">
                  Choose the exact level of data reset you need. Confirmation is required before any changes take effect.
                </p>
              </div>
            </div>

            {/* Action 1: Reset to Official Demo Defaults */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Restore Official Demo Tournament State</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Resets the entire system back to the official MSUN Palakasan default demonstration data. Restores all standard events (Sports, Cultural, Literary, and Special), venues, official scoring rules, and initial verified results.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-blue-100">
                <span className="text-[11px] font-medium text-blue-600">
                  Recommended if test events have cluttered your dashboard.
                </span>
                <button
                  type="button"
                  id="btn-open-reset-defaults-modal"
                  onClick={() => setActiveModal('reset-defaults')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Demo State</span>
                </button>
              </div>
            </div>

            {/* Action 2: Clear Points & Results (Start Clean Tournament) */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Start Clean Tournament (Zero Leaderboard & Clear Results)</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Keeps all scheduled events, match brackets, and venues intact, but <strong>wipes all certified point transactions and winner declarations</strong>. All events return to &ldquo;upcoming&rdquo; status and all 4 colleges start at 0 points.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-amber-100">
                <span className="text-[11px] font-medium text-amber-700">
                  Perfect when opening day starts and official scoring begins.
                </span>
                <button
                  type="button"
                  id="btn-open-clear-points-modal"
                  onClick={() => setActiveModal('clear-points')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Clear Point History</span>
                </button>
              </div>
            </div>

            {/* Action 3: Clear Activity Audit Trail */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Clear Activity Audit Logs</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Purges the administrative action history and audit ledger. All scheduled events and standings remain untouched.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-[11px] font-medium text-slate-500">
                  Clears {activityLogs.length} logged administrative events.
                </span>
                <button
                  type="button"
                  id="btn-open-clear-logs-modal"
                  onClick={() => setActiveModal('clear-logs')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scoring Rulebook Quick Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Official Point Architecture
                </h3>
                <p className="text-xs text-slate-500">
                  Ternary scoring matrix: Special, Major, Minor.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Special Tier */}
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Special Events Tier
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-purple-200/60 text-purple-800 rounded">
                    High Prestige
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center text-xs font-mono font-black text-purple-950">
                  <div className="bg-white/80 py-1 rounded">1st: 60</div>
                  <div className="bg-white/80 py-1 rounded">2nd: 45</div>
                  <div className="bg-white/80 py-1 rounded">3rd: 30</div>
                  <div className="bg-white/80 py-1 rounded">4th: 20</div>
                </div>
                <p className="text-[10px] text-purple-700">
                  Applies to: Mr. & Ms. Palakasan, Cheerdance, Tough Model.
                </p>
              </div>

              {/* Major Tier */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-blue-600" />
                    Major Events Tier
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-blue-200/60 text-blue-800 rounded">
                    Standard Major
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center text-xs font-mono font-black text-blue-950">
                  <div className="bg-white/80 py-1 rounded">1st: 50</div>
                  <div className="bg-white/80 py-1 rounded">2nd: 40</div>
                  <div className="bg-white/80 py-1 rounded">3rd: 30</div>
                  <div className="bg-white/80 py-1 rounded">4th: 20</div>
                </div>
                <p className="text-[10px] text-blue-700">
                  Applies to: Major Sports, <strong>Major Cultural (Hiphop, Folk Dance)</strong>, and <strong>Major Literary (Debate, Balak)</strong>.
                </p>
              </div>

              {/* Minor Tier */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-600" />
                    Minor Events Tier
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                    Standard Minor
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center text-xs font-mono font-black text-slate-900">
                  <div className="bg-white py-1 rounded border border-slate-200">1st: 30</div>
                  <div className="bg-white py-1 rounded border border-slate-200">2nd: 20</div>
                  <div className="bg-white py-1 rounded border border-slate-200">3rd: 15</div>
                  <div className="bg-white py-1 rounded border border-slate-200">4th: 10</div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Applies to: Minor Sports, <strong>Minor Cultural (Vocal Solo)</strong>, and <strong>Minor Literary (Extemp, Essay)</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Want to change point multipliers or reassign whether an event is Major or Minor? Go to the <strong>Point System (Scoring)</strong> tab anytime.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Friendly Interactive Confirmation Modal */}
      {activeModal && (
        <div
          id="settings-confirmation-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            id="settings-confirmation-modal-card"
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeModal === 'reset-defaults'
                    ? 'bg-blue-100 text-blue-700'
                    : activeModal === 'clear-points'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {activeModal === 'reset-defaults' ? (
                  <RotateCcw className="w-5 h-5" />
                ) : activeModal === 'clear-points' ? (
                  <Trophy className="w-5 h-5" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {activeModal === 'reset-defaults' && 'Restore Demo Tournament Data?'}
                  {activeModal === 'clear-points' && 'Clear Leaderboard & Point History?'}
                  {activeModal === 'clear-logs' && 'Purge Administrative Activity Logs?'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeModal === 'reset-defaults' && 'This will reload the initial MSUN Palakasan demo dataset.'}
                  {activeModal === 'clear-points' && 'This will reset all college scores to 0 and re-open events.'}
                  {activeModal === 'clear-logs' && 'This will remove all recorded audit log records.'}
                </p>
              </div>
            </div>

            {/* Modal Body Callout */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <span className="font-bold text-slate-900 block">What happens when you confirm:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                {activeModal === 'reset-defaults' && (
                  <>
                    <li>Restores all standard colleges (Griffins, Raptors, Triton, Centaurs).</li>
                    <li>Restores all standard Sports, Cultural, Literary, and Special events.</li>
                    <li>Restores sample completed event transactions and audit history.</li>
                  </>
                )}
                {activeModal === 'clear-points' && (
                  <>
                    <li>Deletes all awarded points in the official transaction ledger.</li>
                    <li>Sets all 4 colleges to exactly <strong>0 points</strong> on the leaderboard.</li>
                    <li>Resets all completed event results back to &ldquo;upcoming&rdquo; status.</li>
                    <li>Keeps all your custom scheduled dates, times, and venues safe.</li>
                  </>
                )}
                {activeModal === 'clear-logs' && (
                  <>
                    <li>Deletes {activityLogs.length} entries from the activity log history.</li>
                    <li>Creates a clean timestamp entry indicating audit trail was cleared.</li>
                    <li>Does not affect leaderboard points or event schedules.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                id="btn-cancel-modal"
                disabled={isProcessing}
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-action"
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${
                  activeModal === 'reset-defaults'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : activeModal === 'clear-points'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-red-600 hover:bg-red-700'
                } ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Yes, Proceed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
