import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Info,
  CheckCircle2,
  ShieldCheck,
  Scale,
  MinusCircle,
  AlertTriangle,
  Trash2,
  FileText,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CategoryId, CollegeId } from '../../types';
import { CATEGORIES } from '../../data/initialData';
import { getCategoryMeta, getCollegeBadgeStyle } from '../../utils/collegeTheme';
import { GrievanceDeductionModal } from './GrievanceDeductionModal';
import { RankingsVisibilityManager } from './RankingsVisibilityManager';

export const AdminStandingsView: React.FC = () => {
  const {
    overallStandings,
    getCategoryStandings,
    getEventStats,
    pointTransactions,
    deletePointTransactionById,
  } = usePalakasan();
  const [activeTab, setActiveTab] = useState<'overall' | CategoryId>('overall');
  const [isGrievanceModalOpen, setIsGrievanceModalOpen] = useState(false);
  const [targetCollegeForDeduction, setTargetCollegeForDeduction] = useState<CollegeId | undefined>(undefined);
  const stats = getEventStats();

  const currentCategoryStandings = activeTab !== 'overall' ? getCategoryStandings(activeTab) : null;

  // Active deductions
  const activePenalties = pointTransactions.filter(
    pt => pt.pointsAwarded < 0 && pt.status === 'official'
  );

  const handleOpenDeduction = (collegeId?: CollegeId) => {
    setTargetCollegeForDeduction(collegeId);
    setIsGrievanceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Final Day Thrill Mode & Rankings Visibility Controls */}
      <RankingsVisibilityManager />

      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                University Standings Ledger
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                System Auto-Calculated
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Standings are derived strictly from {stats.declaredWinnersEvents} certified official results. Standings cannot be manually edited, but committee grievance deductions can be applied.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="admin-apply-grievance-btn"
              onClick={() => handleOpenDeduction()}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 text-xs shadow-xs transition-all"
            >
              <Scale className="w-4 h-4" />
              <span>Apply Grievance Deduction</span>
            </button>
            <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-600">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>1st = 50 pts • 2nd = 40 pts • 3rd = 30 pts • 4th = 20 pts</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('overall')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'overall'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            🏆 Overall University Standings
          </button>

          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-900">
            {activeTab === 'overall' ? 'MSUN Overall Championship Leaderboard' : `${getCategoryMeta(activeTab).name} Division Standings`}
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Based on {stats.declaredWinnersEvents} official events
          </span>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'overall' ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/30">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">College & Color</th>
                  <th className="py-3 px-3 text-center">Sports</th>
                  <th className="py-3 px-3 text-center">Cultural</th>
                  <th className="py-3 px-3 text-center">Literary</th>
                  <th className="py-3 px-3 text-center">Special</th>
                  <th className="py-3 px-3 text-center text-red-600 font-extrabold">Deductions</th>
                  <th className="py-3 px-4 text-right">Championship Total</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overallStandings.map(item => {
                  const badge = getCollegeBadgeStyle(item.college.id);
                  const isTop = item.rank === 1;
                  return (
                    <tr
                      key={item.college.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTop ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold">
                        {isTop ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-white font-black text-xs shadow-2xs">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-1.5 font-mono">{item.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-black ${badge.badge}`}
                          >
                            {item.college.acronym}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900">{item.college.name}</p>
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full ring-1 ring-slate-300"
                                style={{ backgroundColor: badge.hex }}
                                title={`${item.college.acronym} Official Color: ${badge.colorName}`}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">
                              Designated Color: <strong style={{ color: badge.hex }}>{badge.colorName}</strong>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.sports}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.cultural}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.literary}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.special}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium">
                        {item.deductions && item.deductions > 0 ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">
                            -{item.deductions} pts
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-base text-blue-950 font-mono">
                          {item.overallPoints}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">pts</span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          id={`deduct-points-btn-${item.college.id}`}
                          onClick={() => handleOpenDeduction(item.college.id)}
                          className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                          title={`Apply grievance deduction to ${item.college.acronym}`}
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>Deduct</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/30">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">College & Color</th>
                  <th className="py-3 px-3 text-center">Gold (1st)</th>
                  <th className="py-3 px-3 text-center">Silver (2nd)</th>
                  <th className="py-3 px-3 text-center">Bronze (3rd)</th>
                  <th className="py-3 px-3 text-center">4th Place</th>
                  <th className="py-3 px-4 text-right">Category Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentCategoryStandings?.map(item => {
                  const badge = getCollegeBadgeStyle(item.college.id);
                  const isTop = item.rank === 1;
                  return (
                    <tr
                      key={item.college.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTop ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold">
                        {isTop ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-white font-black text-xs shadow-2xs">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-1.5 font-mono">{item.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-black ${badge.badge}`}
                          >
                            {item.college.acronym}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{item.college.name}</span>
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full ring-1 ring-slate-300"
                                style={{ backgroundColor: badge.hex }}
                                title={`${item.college.acronym} Official Color: ${badge.colorName}`}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Color: <strong style={{ color: badge.hex }}>{badge.colorName}</strong>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-amber-600 font-bold">
                        {item.gold}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.silver}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-amber-800">
                        {item.bronze}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-600">
                        {item.fourth}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-base text-blue-950 font-mono">
                          {item.points}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Disciplinary & Grievance Penalties Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-red-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-red-600" />
            <h4 className="font-extrabold text-sm text-slate-900">
              Official Grievance & Disciplinary Penalties Ledger
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
              {activePenalties.length} Active
            </span>
          </div>
          <button
            onClick={() => handleOpenDeduction()}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Record New Grievance Deduction</span>
          </button>
        </div>

        {activePenalties.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No active penalties or grievance deductions on record. If a college violates tournament rules or committee grievances are filed, deduct points using the action above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {activePenalties.map(tx => {
              const badge = getCollegeBadgeStyle(tx.collegeId);
              return (
                <div
                  key={tx.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-black shrink-0 ${badge.badge}`}
                    >
                      {tx.collegeId}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-red-600 text-sm">
                          {tx.pointsAwarded} pts
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                          {tx.category === 'overall' ? 'Overall Standing' : `${tx.category.toUpperCase()} Division`}
                        </span>
                        {tx.grievanceResolutionId && (
                          <span className="text-[10px] font-mono text-slate-500">
                            #{tx.grievanceResolutionId}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {tx.dateAwarded}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">
                        {tx.reason || tx.eventName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Sanctioned by: <strong>{tx.declaredBy}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deletePointTransactionById(tx.id)}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                    title="Revoke sanction and restore points"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Penalty</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grievance Deduction Modal */}
      <GrievanceDeductionModal
        isOpen={isGrievanceModalOpen}
        onClose={() => setIsGrievanceModalOpen(false)}
        preselectedCollegeId={targetCollegeForDeduction}
      />
    </div>
  );
};
