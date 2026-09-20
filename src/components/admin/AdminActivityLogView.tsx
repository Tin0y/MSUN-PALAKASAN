import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Shield,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';

export const AdminActivityLogView: React.FC = () => {
  const { activityLogs, clearActivityAuditLogs } = usePalakasan();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter logs
  const filteredLogs = activityLogs.filter(log => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      log.action.toLowerCase().includes(q) ||
      (log.eventTitle && log.eventTitle.toLowerCase().includes(q)) ||
      log.description.toLowerCase().includes(q) ||
      log.adminUser.toLowerCase().includes(q);

    const matchAction =
      selectedActionFilter === 'all' || log.action.toLowerCase().includes(selectedActionFilter.toLowerCase());

    return matchSearch && matchAction;
  });

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      await clearActivityAuditLogs();
      setShowConfirmModal(false);
      setToastMessage('Activity audit trail history was cleared successfully.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to clear activity logs:', err);
      setToastMessage('Failed to clear logs. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsClearing(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('declare') || a.includes('winner')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (a.includes('create')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (a.includes('edit') || a.includes('reschedule') || a.includes('change')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (a.includes('cancel') || a.includes('delete') || a.includes('clear') || a.includes('reset')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-sm text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Administrative Activity Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Complete chronological audit trail of all tournament operations, timetable adjustments, and official declarations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-clear-history-logs"
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History ({activityLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Action filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by event name, admin, or keyword..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Create', 'Declare', 'Reschedule', 'Edit', 'Cancel'].map(filterName => (
              <button
                key={filterName}
                onClick={() => setSelectedActionFilter(filterName)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedActionFilter === filterName
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {filterName === 'all' ? 'All Actions' : filterName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No activity logs found</p>
            <p className="text-xs">Any tournament administrative operation will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-3">Admin Authority</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => {
                  const badgeColor = getActionBadgeColor(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {log.eventTitle || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-md">
                        {log.description}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-medium">
                        {log.adminUser}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.date} • {log.time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Friendly Clear Confirmation Modal */}
      {showConfirmModal && (
        <div
          id="confirm-clear-logs-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Clear Activity Audit History?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to purge all {activityLogs.length} activity audit log records?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Please note:</p>
              <p>This action removes past administrative audit notes. All tournament events, match schedules, official results, and points on the leaderboard will remain completely safe and untouched.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isClearing}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearing}
                onClick={handleConfirmClear}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors cursor-pointer"
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Clear History</span>
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
