import React, { useState } from 'react';
import { History, Search, Filter, Trash2, Shield, Calendar, Clock, FileText } from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';

export const AdminActivityLogView: React.FC = () => {
  const { activityLogs, clearActivityLogs } = usePalakasan();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');

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

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear historical activity logs?')) {
      clearActivityLogs();
    }
  };

  const getActionBadgeColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('declare') || a.includes('winner')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (a.includes('create')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (a.includes('edit') || a.includes('reschedule') || a.includes('change')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (a.includes('cancel') || a.includes('delete')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
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
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
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
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Create', 'Declare', 'Reschedule', 'Edit', 'Cancel'].map(filterName => (
              <button
                key={filterName}
                onClick={() => setSelectedActionFilter(filterName)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
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
    </div>
  );
};
