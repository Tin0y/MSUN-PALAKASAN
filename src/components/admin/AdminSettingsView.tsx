import React from 'react';
import {
  Settings,
  RotateCcw,
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  Database,
  Lock,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';

export const AdminSettingsView: React.FC = () => {
  const { resetToDefaultData, getEventStats } = usePalakasan();
  const stats = getEventStats();

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the tournament data to default demo state? All customized events and result drafts will be reset to initial defaults.'
      )
    ) {
      resetToDefaultData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-1">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Tournament Configuration & System Controls
        </h3>
        <p className="text-xs text-slate-500">
          Tournament data maintenance, evaluation presets, and administrative parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Point System Architecture */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="w-5 h-5 text-blue-600" />
            <h4 className="font-extrabold text-sm text-slate-900">
              Official Scoring Rulebook & Multipliers
            </h4>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Points are automatically computed and assigned upon result declaration. Administrative committee members are restricted from overriding points arbitrarily to maintain competitive integrity.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
              <span className="font-bold text-amber-900">1st Place (Gold / Champion)</span>
              <span className="font-mono font-black text-amber-950 text-sm">50 Points</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 border border-slate-200">
              <span className="font-bold text-slate-800">2nd Place (Silver / Runner-Up)</span>
              <span className="font-mono font-black text-slate-900 text-sm">40 Points</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-100/50 border border-amber-300/60">
              <span className="font-bold text-amber-900">3rd Place (Bronze / 2nd Runner-Up)</span>
              <span className="font-mono font-black text-amber-950 text-sm">30 Points</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200/60">
              <span className="font-bold text-blue-900">4th Place (Consolation)</span>
              <span className="font-mono font-black text-blue-950 text-sm">20 Points</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-200/60">
              <span className="font-bold text-red-900">Disqualification (DQ)</span>
              <span className="font-mono font-black text-red-950 text-sm">0 Points</span>
            </div>
          </div>
        </div>

        {/* Database & Demo Management */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-5 h-5 text-blue-600" />
            <h4 className="font-extrabold text-sm text-slate-900">
              Tournament Data Management
            </h4>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <span className="font-bold text-slate-700">Current Storage Statistics:</span>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Total Events: <strong>{stats.totalEvents}</strong></div>
              <div>Official Results: <strong>{stats.declaredWinnersEvents}</strong></div>
              <div>Upcoming: <strong>{stats.upcomingEvents}</strong></div>
              <div>Live Ongoing: <strong>{stats.ongoingEvents}</strong></div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Reset to Clean Default State</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Restores the system to the initial pre-configured MSUN PALAKASAN dataset with all initial events and authentic historical logs.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Default Tournament Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
