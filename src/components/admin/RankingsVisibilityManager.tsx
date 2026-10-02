import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Flame,
  Trophy,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CategoryId } from '../../types';

interface RankingsVisibilityManagerProps {
  compact?: boolean;
}

export const RankingsVisibilityManager: React.FC<RankingsVisibilityManagerProps> = ({
  compact = false,
}) => {
  const {
    rankingsVisibility,
    updateRankingsVisibility,
    adminSpectatorPreview,
    setAdminSpectatorPreview,
    currentAccount,
  } = usePalakasan();

  const [customMessage, setCustomMessage] = useState(
    rankingsVisibility.thrillMessage ||
      'In anticipation of the Grand Awarding and Closing Ceremony, tournament standings have been sealed! Grand Winners and Champions will be unveiled live at the gymnasium.'
  );
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [messageSavedNotice, setMessageSavedNotice] = useState(false);

  const categories: {
    id: CategoryId;
    name: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: 'sports',
      name: 'Sports Division',
      icon: '🏅',
      description: 'Basketball, Volleyball, Badminton, Table Tennis, Sepak Takraw, etc.',
    },
    {
      id: 'cultural',
      name: 'Cultural Division',
      icon: '🎭',
      description: 'Vocal Solo, Vocal Duet, Folk Dance, Pop Dance, Musical Choir, etc.',
    },
    {
      id: 'literary',
      name: 'Literary Division',
      icon: '📚',
      description: 'Oration, Extemporaneous, Essay, Debate, Quiz Bowl, etc.',
    },
    {
      id: 'special',
      name: 'Special Events',
      icon: '⭐',
      description: 'Cheerdance, Mr & Ms Palakasan, Banner Presentation, etc.',
    },
  ];

  const handleToggleMasterThrill = async () => {
    const nextVal = !rankingsVisibility.hideAllRankings;
    await updateRankingsVisibility({
      hideAllRankings: nextVal,
      hideOverallStandings: nextVal,
      hideEventResults: nextVal,
      hideCategoryRankings: {
        sports: nextVal,
        cultural: nextVal,
        literary: nextVal,
        special: nextVal,
      },
    });
  };

  const handleToggleOverall = async () => {
    await updateRankingsVisibility({
      hideOverallStandings: !rankingsVisibility.hideOverallStandings,
    });
  };

  const handleToggleCategory = async (catId: CategoryId) => {
    const current = Boolean(rankingsVisibility.hideCategoryRankings?.[catId]);
    await updateRankingsVisibility({
      hideCategoryRankings: {
        ...rankingsVisibility.hideCategoryRankings,
        [catId]: !current,
      },
    });
  };

  const handleToggleEventResults = async () => {
    await updateRankingsVisibility({
      hideEventResults: !rankingsVisibility.hideEventResults,
    });
  };

  const handleSaveMessage = async () => {
    setIsSavingMessage(true);
    await updateRankingsVisibility({
      thrillMessage: customMessage.trim(),
    });
    setIsSavingMessage(false);
    setMessageSavedNotice(true);
    setTimeout(() => setMessageSavedNotice(false), 3000);
  };

  const applyPresetMessage = (preset: string) => {
    setCustomMessage(preset);
  };

  const isMasterActive = rankingsVisibility.hideAllRankings;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Hero Banner Header */}
      <div
        className={`p-5 sm:p-6 border-b transition-colors ${
          isMasterActive
            ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white border-amber-500'
            : 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isMasterActive
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-blue-900/80 text-blue-200 border border-blue-700'
                }`}
              >
                {isMasterActive ? <Lock className="w-3 h-3 text-amber-800" /> : <Unlock className="w-3 h-3" />}
                <span>{isMasterActive ? 'Thrill Mode Active' : 'Public Standings Live'}</span>
              </span>

              {isMasterActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white animate-pulse">
                  <Flame className="w-3 h-3 text-amber-300" />
                  <span>Grand Finale Suspense</span>
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {isMasterActive
                ? 'Final Day Thrill Mode: Standings Sealed'
                : 'Tournament Rankings Visibility Controls'}
            </h3>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {isMasterActive
                ? 'Rankings and point totals are sealed from public spectators to maximize finale excitement for the Grand Awarding Ceremony! Committee members still see live numbers.'
                : 'Control whether rankings and point totals are visible to the public or sealed for final-day suspense across all divisions or per category.'}
            </p>
          </div>

          {/* Master 1-Click Toggle Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              id="toggle-master-thrill-mode-btn"
              type="button"
              onClick={handleToggleMasterThrill}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                isMasterActive
                  ? 'bg-white hover:bg-slate-100 text-amber-900 border border-amber-200'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 ring-2 ring-amber-400/30'
              }`}
            >
              {isMasterActive ? (
                <>
                  <Unlock className="w-4 h-4 text-amber-700" />
                  <span>Turn OFF Thrill Mode (Make All Live)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>Activate Final Day Thrill Mode</span>
                </>
              )}
            </button>

            {/* Spectator Preview Switch */}
            <button
              id="toggle-spectator-preview-btn"
              type="button"
              onClick={() => setAdminSpectatorPreview(!adminSpectatorPreview)}
              className="px-3.5 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="Toggle between viewing live committee numbers and testing the public sealed curtain"
            >
              {adminSpectatorPreview ? (
                <>
                  <Eye className="w-4 h-4 text-emerald-300" />
                  <span>Previewing as Spectator</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-amber-300" />
                  <span>Preview Spectator Screen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Controls Body */}
      <div className="p-5 sm:p-6 space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>Per-Category & Standing Concealment Switches</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Independent Toggles
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                You can conceal the Overall Standings, specific categories, or all event results independently.
              </p>
            </div>
            {currentAccount && currentAccount.role !== 'admin' && (
              <div className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0 self-start sm:self-auto">
                Logged in as: <strong>{currentAccount.title}</strong>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Overall Standings */}
            <div
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isMasterActive || rankingsVisibility.hideOverallStandings
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <span className="font-extrabold text-xs text-slate-900">
                      Overall Championship
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isMasterActive || rankingsVisibility.hideOverallStandings
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isMasterActive || rankingsVisibility.hideOverallStandings ? '🔒 Sealed' : '👁️ Visible'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Total cumulative leaderboard combining all four divisions.
                </p>
              </div>

              <button
                id="toggle-overall-visibility-btn"
                type="button"
                onClick={handleToggleOverall}
                disabled={isMasterActive}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isMasterActive
                    ? 'bg-amber-100/60 text-amber-800 cursor-not-allowed border border-amber-200'
                    : rankingsVisibility.hideOverallStandings
                    ? 'bg-white hover:bg-slate-50 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {isMasterActive ? (
                  <span>Sealed by Master Thrill Mode</span>
                ) : rankingsVisibility.hideOverallStandings ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Unseal Overall Standings</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Seal Overall Standings</span>
                  </>
                )}
              </button>
            </div>

            {/* 2-5: The 4 Categories */}
            {categories.map(cat => {
              const isCatHidden =
                isMasterActive || Boolean(rankingsVisibility.hideCategoryRankings?.[cat.id]);
              const isHeadForThis =
                currentAccount?.category === cat.id || currentAccount?.role === 'admin';

              return (
                <div
                  key={cat.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isCatHidden
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-xs text-slate-900">
                            {cat.name}
                          </span>
                          {currentAccount?.category === cat.id && (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                              Your Domain
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCatHidden
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isCatHidden ? '🔒 Sealed' : '👁️ Visible'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
                  </div>

                  <button
                    id={`toggle-${cat.id}-visibility-btn`}
                    type="button"
                    onClick={() => handleToggleCategory(cat.id)}
                    disabled={isMasterActive}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isMasterActive
                        ? 'bg-amber-100/60 text-amber-800 cursor-not-allowed border border-amber-200'
                        : isCatHidden
                        ? 'bg-white hover:bg-slate-50 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isMasterActive ? (
                      <span>Sealed by Master Thrill Mode</span>
                    ) : isCatHidden ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Unseal {cat.name}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                        <span>Seal {cat.name}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}

            {/* 6. Event Concluded Results & Points */}
            <div
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isMasterActive || rankingsVisibility.hideEventResults
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <span className="font-extrabold text-xs text-slate-900">
                      Event Placements & Points
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isMasterActive || rankingsVisibility.hideEventResults
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isMasterActive || rankingsVisibility.hideEventResults ? '🔒 Sealed' : '👁️ Visible'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Individual event medal placement badges and awarded points.
                </p>
              </div>

              <button
                id="toggle-event-results-visibility-btn"
                type="button"
                onClick={handleToggleEventResults}
                disabled={isMasterActive}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isMasterActive
                    ? 'bg-amber-100/60 text-amber-800 cursor-not-allowed border border-amber-200'
                    : rankingsVisibility.hideEventResults
                    ? 'bg-white hover:bg-slate-50 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {isMasterActive ? (
                  <span>Sealed by Master Thrill Mode</span>
                ) : rankingsVisibility.hideEventResults ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Unseal Match Results</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Seal Match Results</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suspense Announcement Message Customizer */}
        {!compact && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Public Curtain Announcement Message</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  This message is shown to public spectators when visiting sealed standboards.
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <span className="text-slate-400 font-medium mr-1">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    applyPresetMessage(
                      'In anticipation of the Grand Awarding and Closing Ceremony, tournament standings have been sealed! Grand Winners and Champions will be unveiled live at the gymnasium.'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Closing Ceremony Reveal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPresetMessage(
                      'Final Day Thrill Mode: Official scores and standings are under committee lock. Who will bring home the Overall Championship Trophy? Join us live!'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Championship Thrill
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={2}
                placeholder="Enter thrilling suspense announcement message for the public..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              />

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {messageSavedNotice ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Curtain message updated!</span>
                    </span>
                  ) : (
                    <span>Updates live on the public screen immediately upon save.</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveMessage}
                  disabled={isSavingMessage}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {isSavingMessage ? 'Saving...' : 'Save Public Message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
