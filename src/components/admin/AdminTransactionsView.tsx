import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Trophy,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  UserCheck,
  Building2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CategoryId, CollegeId } from '../../types';

export const AdminTransactionsView: React.FC = () => {
  const { pointTransactions, colleges, viewedPalakasanId, currentPalakasan, overallStandings } = usePalakasan();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return pointTransactions.filter(tx => {
      if (selectedCollege !== 'all' && tx.collegeId !== selectedCollege) return false;
      if (selectedCategory !== 'all' && tx.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = tx.eventName.toLowerCase().includes(q);
        const matchCol = tx.collegeId.toLowerCase().includes(q);
        const matchDecl = tx.declaredBy.toLowerCase().includes(q);
        if (!matchName && !matchCol && !matchDecl) return false;
      }
      return true;
    });
  }, [pointTransactions, selectedCollege, selectedCategory, selectedStatus, searchQuery]);

  const totalPointsInLedger = useMemo(() => {
    return filteredTransactions
      .filter(t => t.status === 'official')
      .reduce((sum, t) => sum + t.pointsAwarded, 0);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Authoritative Point Ledger</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Point Transaction Audit Trail
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mt-1">
            Official immutable transactions driving tournament standings for{' '}
            <strong className="text-blue-700 font-semibold">{currentPalakasan?.name || 'PALAKASAN'}</strong>. Every point on the leaderboard corresponds to an official certified transaction below.
          </p>
        </div>

        {/* Total Metric Box */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-3 text-right shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Official Points Certified
          </span>
          <span className="text-2xl font-black text-blue-700 font-mono">
            {totalPointsInLedger} pts
          </span>
        </div>
      </div>

      {/* College Standings Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {overallStandings.map(st => (
          <div
            key={st.college.id}
            className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0"
              style={{ backgroundColor: st.college.color }}
            >
              {st.college.acronym}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">{st.college.acronym}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                  Rank #{st.rank}
                </span>
              </div>
              <p className="text-xs font-black text-blue-700 font-mono mt-0.5">
                {st.overallPoints} pts
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by event, college, or official..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCollege}
              onChange={e => setSelectedCollege(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="all">All Colleges</option>
              {colleges.map(c => (
                <option key={c.id} value={c.id}>
                  {c.acronym} ({c.name})
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 capitalize"
            >
              <option value="all">All Categories</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="literary">Literary</option>
              <option value="special">Special</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="official">Official</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">College</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4 text-right">Points Awarded</th>
                <th className="py-3 px-4">Certified By</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No point transactions match your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const col = colleges.find(c => c.id === tx.collegeId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* College */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-md text-white font-bold flex items-center justify-center text-[10px] shrink-0"
                            style={{ backgroundColor: col?.color || '#0284c7' }}
                          >
                            {tx.collegeId}
                          </span>
                          <span className="font-bold text-slate-900">{tx.collegeId}</span>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {tx.eventName}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {tx.category}
                        </span>
                      </td>

                      {/* Event Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.eventType === 'Special'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : tx.eventType === 'Major'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tx.eventType === 'Special' ? '⭐ Special' : tx.eventType}
                        </span>
                      </td>

                      {/* Rank */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-extrabold ${
                            tx.finalRank === '1st'
                              ? 'text-amber-600'
                              : tx.finalRank === '2nd'
                              ? 'text-slate-600'
                              : tx.finalRank === '3rd'
                              ? 'text-amber-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {tx.finalRank}
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3 px-4 text-right">
                        <strong className="text-sm font-black text-blue-700 font-mono">
                          +{tx.pointsAwarded} pts
                        </strong>
                      </td>

                      {/* Certified By */}
                      <td className="py-3 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{tx.declaredBy}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'official'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="capitalize">{tx.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
