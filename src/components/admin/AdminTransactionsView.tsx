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
  Trash2,
  AlertTriangle,
  RotateCcw,
  X,
  RefreshCw,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CategoryId, CollegeId, PointTransaction } from '../../types';

export const AdminTransactionsView: React.FC = () => {
  const {
    pointTransactions,
    colleges,
    viewedPalakasanId,
    currentPalakasan,
    overallStandings,
    deletePointTransactionById,
    clearPointHistory,
  } = usePalakasan();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [txToDelete, setTxToDelete] = useState<PointTransaction | null>(null);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleDeleteSingleTx = async () => {
    if (!txToDelete) return;
    setIsProcessing(true);
    try {
      await deletePointTransactionById(txToDelete.id);
      setToastMessage(`Transaction for ${txToDelete.eventName} (${txToDelete.collegeId}) deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
      setTxToDelete(null);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setToastMessage('Failed to delete transaction. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAllHistory = async () => {
    setIsProcessing(true);
    try {
      await clearPointHistory();
      setToastMessage('Point history cleared. Leaderboard reset to 0 points.');
      setTimeout(() => setToastMessage(null), 4000);
      setShowClearHistoryModal(false);
    } catch (err) {
      console.error('Failed to clear point history:', err);
      setToastMessage('Failed to clear point history.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsProcessing(false);
    }
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

        {/* Total Metric Box & Clear Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-3 text-right">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Official Points Certified
            </span>
            <span className="text-2xl font-black text-blue-700 font-mono">
              {totalPointsInLedger} pts
            </span>
          </div>

          <button
            id="btn-clear-point-history-header"
            onClick={() => setShowClearHistoryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
            title="Clear all points and reset tournament to 0 points"
          >
            <Trash2 className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Clear Point History</span>
          </button>
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
              className="w-10 h-10 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs"
              style={{ backgroundColor: st.college.color.primary }}
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

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by event, college, or judge..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* College Filter */}
            <select
              value={selectedCollege}
              onChange={e => setSelectedCollege(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Colleges</option>
              {colleges.map(c => (
                <option key={c.id} value={c.id}>
                  {c.acronym} ({c.shortName})
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="literary">Literary</option>
              <option value="special">Special Events</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="official">Official</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">College</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Tier / Type</th>
                <th className="py-3.5 px-4 text-center">Placement</th>
                <th className="py-3.5 px-4 text-right">Points</th>
                <th className="py-3.5 px-4">Certified By</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No point transactions found</p>
                    <p className="text-xs">Certifying official event results will generate transactions here.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const col = colleges.find(c => c.id === tx.collegeId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {tx.id}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {tx.dateAwarded}
                      </td>

                      {/* College */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md text-white font-bold flex items-center justify-center text-[10px] shrink-0"
                            style={{ backgroundColor: col?.color.primary || '#3b82f6' }}
                          >
                            {tx.collegeId}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {col?.shortName || tx.collegeId}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{col?.moniker}</span>
                          </div>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{tx.eventName}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{tx.category}</span>
                      </td>

                      {/* Tier */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.eventType === 'Special'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : tx.eventType === 'Major'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {tx.eventType || 'Standard'}
                        </span>
                      </td>

                      {/* Placement */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs ${
                            tx.finalRank === '1st'
                              ? 'bg-amber-100 text-amber-900'
                              : tx.finalRank === '2nd'
                              ? 'bg-slate-100 text-slate-700'
                              : tx.finalRank === '3rd'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-50 text-slate-500'
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

                      {/* Delete Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setTxToDelete(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Single Transaction Modal */}
      {txToDelete && (
        <div
          id="delete-transaction-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Delete Point Transaction?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to remove this transaction from the official ledger?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Event:</strong> {txToDelete.eventName}</p>
              <p><strong>College:</strong> {txToDelete.collegeId}</p>
              <p><strong>Points:</strong> +{txToDelete.pointsAwarded} pts ({txToDelete.finalRank})</p>
              <p className="text-red-700 pt-1 text-[11px]">
                Deleting this transaction will immediately deduct {txToDelete.pointsAwarded} points from {txToDelete.collegeId} on the leaderboard.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDeleteSingleTx}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Transaction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Points Modal */}
      {showClearHistoryModal && (
        <div
          id="clear-all-points-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Clear All Point History?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reset tournament standings back to 0 points across all 4 colleges.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <p className="font-semibold text-slate-900">What will happen:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>All {pointTransactions.length} point transactions in the ledger will be deleted.</li>
                <li>All 4 colleges will be reset to exactly <strong>0 points</strong>.</li>
                <li>Completed events will be reset back to upcoming status.</li>
                <li>Your scheduled events, dates, venues, and games will not be deleted.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setShowClearHistoryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleClearAllHistory}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Yes, Clear Points</span>
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
