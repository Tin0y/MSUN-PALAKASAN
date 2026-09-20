import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  Settings2,
  ExternalLink,
  Users,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { PalakasanEdition } from '../../types';

interface AdminPalakasanViewProps {
  onOpenStartNewWizard: () => void;
}

export const AdminPalakasanView: React.FC<AdminPalakasanViewProps> = ({
  onOpenStartNewWizard,
}) => {
  const {
    allPalakasans,
    currentPalakasan,
    viewedPalakasanId,
    setViewedPalakasanId,
    switchActivePalakasan,
    updatePalakasan,
    events,
    colleges,
  } = usePalakasan();

  const [editingEdition, setEditingEdition] = useState<PalakasanEdition | null>(null);
  const [editStatus, setEditStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'archived'>('ongoing');
  const [editTagline, setEditTagline] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = (edition: PalakasanEdition) => {
    setEditingEdition(edition);
    setEditStatus(edition.status);
    setEditTagline(edition.theme?.tagline || '');
  };

  const handleSaveEdit = async () => {
    if (!editingEdition) return;
    setIsSaving(true);
    try {
      await updatePalakasan(editingEdition.id, {
        status: editStatus,
        theme: {
          ...editingEdition.theme,
          tagline: editTagline,
        },
      });
      setEditingEdition(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Multi-Edition Tournament Architecture</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            PALAKASAN Management & Editions
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mt-1">
            Manage current and historical editions of the university meet. When a new PALAKASAN is initialized, past tournament results and standings are safely preserved.
          </p>
        </div>

        <button
          id="admin-start-new-palakasan-btn"
          onClick={onOpenStartNewWizard}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Start New PALAKASAN</span>
        </button>
      </div>

      {/* Current Active Edition Showcase Card */}
      {currentPalakasan && (
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Active Public PALAKASAN</span>
                <span className="text-blue-100">• Year {currentPalakasan.year}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                <span>{currentPalakasan.theme?.logo || '🏆'}</span>
                <span>{currentPalakasan.name}</span>
              </h3>

              <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
                {currentPalakasan.theme?.tagline || currentPalakasan.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100 pt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {currentPalakasan.startDate} to {currentPalakasan.endDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {currentPalakasan.participatingColleges?.length || colleges.length} Colleges Competing
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  {events.length} Events Scheduled
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                onClick={() => handleStartEdit(currentPalakasan)}
                className="px-4 py-2 text-xs font-bold bg-white text-blue-900 rounded-xl hover:bg-blue-50 transition-colors shadow-xs"
              >
                Configure Current Edition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editions Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            All PALAKASAN Editions Archive ({allPalakasans.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click to inspect or switch active</span>
        </div>

        <div className="divide-y divide-slate-100">
          {allPalakasans.map(edition => {
            const isCurrentlyActive = edition.isCurrent;
            const isCurrentlyViewed = edition.id === viewedPalakasanId;

            return (
              <div
                key={edition.id}
                className={`p-4 sm:p-6 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCurrentlyActive ? 'bg-blue-50/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-xs"
                    style={{ backgroundColor: edition.theme?.primaryColor || '#0284c7' }}
                  >
                    {edition.theme?.logo || '🏆'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {edition.name}
                      </h4>
                      {isCurrentlyActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Public
                        </span>
                      )}
                      {isCurrentlyViewed && !isCurrentlyActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Viewing in Admin
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {edition.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 max-w-xl">
                      {edition.theme?.tagline || edition.description}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Dates: {edition.startDate} – {edition.endDate} • {edition.participatingColleges?.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Switch Viewing */}
                  <button
                    onClick={() => setViewedPalakasanId(edition.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      isCurrentlyViewed
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isCurrentlyViewed ? 'Active in View' : 'Inspect Records'}
                  </button>

                  {/* Set as Active Public */}
                  {!isCurrentlyActive && (
                    <button
                      onClick={() => switchActivePalakasan(edition.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      title="Set this edition as the active current tournament for public users"
                    >
                      Set as Active
                    </button>
                  )}

                  {/* Edit Info */}
                  <button
                    onClick={() => handleStartEdit(edition)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 border border-slate-200"
                    title="Edit Edition Settings"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Edition Modal */}
      {editingEdition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Configure {editingEdition.name}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tournament Status
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing (Active Tournament)</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tagline / Theme
                </label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={e => setEditTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingEdition(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
