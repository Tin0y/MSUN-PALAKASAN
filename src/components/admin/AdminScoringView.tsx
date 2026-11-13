import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Save,
  Info,
  Star,
  Layers,
  Zap,
  Swords,
  Flame,
  Music,
  BookOpen,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import {
  CategoryId,
  CategoryScoringRulesMap,
  Placement,
  PointTier,
  ScoringRulesConfig,
} from '../../types';
import {
  getAllowedTiersForCategory,
  getEffectivePointTier,
  getNormalizedScoringRules,
} from '../../data/initialData';

export const AdminScoringView: React.FC = () => {
  const { currentPalakasan, updatePalakasan, events, updateEvent } = usePalakasan();

  const normalizedInitial = useMemo(
    () => getNormalizedScoringRules(currentPalakasan?.scoringRules),
    [currentPalakasan?.scoringRules]
  );

  const [byCategory, setByCategory] = useState<CategoryScoringRulesMap>(() =>
    JSON.parse(JSON.stringify(normalizedInitial.byCategory))
  );
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryId>('sports');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filterTier, setFilterTier] = useState<'all' | 'special' | 'major' | 'minor'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'sports' | 'cultural' | 'literary' | 'special'>('all');

  useEffect(() => {
    setByCategory(JSON.parse(JSON.stringify(normalizedInitial.byCategory)));
  }, [currentPalakasan?.id, normalizedInitial]);

  const draftRules: ScoringRulesConfig = useMemo(
    () => ({
      majorPoints: byCategory.sports.majorPoints,
      minorPoints: byCategory.sports.minorPoints,
      specialPoints: byCategory.sports.specialPoints,
      disciplinePoints: byCategory.sports.disciplinePoints,
      byCategory,
    }),
    [byCategory]
  );

  const handleSave = async () => {
    if (!currentPalakasan) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updatePalakasan(currentPalakasan.id, {
        scoringRules: draftRules,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to update scoring rules:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Sports Preset Handlers
  const applySportsMajorPreset = (p1: number, p2: number, p3: number, p4: number) => {
    setByCategory(prev => ({
      ...prev,
      sports: { ...prev.sports, majorPoints: { '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, DQ: 0 } },
    }));
  };

  const applySportsMinorPreset = (p1: number, p2: number, p3: number, p4: number) => {
    setByCategory(prev => ({
      ...prev,
      sports: { ...prev.sports, minorPoints: { '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, DQ: 0 } },
    }));
  };

  const applySportsSpecialPreset = (p1: number, p2: number, p3: number, p4: number) => {
    setByCategory(prev => ({
      ...prev,
      sports: { ...prev.sports, specialPoints: { '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, DQ: 0 } },
    }));
  };

  const applySportsDisciplinePreset = (
    p1: number,
    p2: number,
    p3: number,
    p4: number,
    p5: number,
    p6: number
  ) => {
    setByCategory(prev => ({
      ...prev,
      sports: {
        ...prev.sports,
        disciplinePoints: { '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, '5th': p5, '6th': p6, DQ: 0 },
      },
    }));
  };

  // Cultural / Literary / Special Events Preset Handlers
  const applyStandardCatMajorPreset = (
    catKey: 'cultural' | 'literary' | 'special',
    p1: number,
    p2: number,
    p3: number,
    p4: number
  ) => {
    setByCategory(prev => ({
      ...prev,
      [catKey]: {
        ...prev[catKey],
        majorPoints: { '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, DQ: 0 },
      },
    }));
  };

  const applyStandardCatMinorPreset = (
    catKey: 'cultural' | 'literary' | 'special',
    p1: number,
    p2: number,
    p3: number,
    p4: number
  ) => {
    setByCategory(prev => ({
      ...prev,
      [catKey]: {
        ...prev[catKey],
        minorPoints: { '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, DQ: 0 },
      },
    }));
  };

  const handleToggleEventTier = async (eventId: string, newTier: PointTier) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    await updateEvent(
      eventId,
      {
        pointTier: newTier,
        isMajor: newTier !== 'minor',
      },
      'Scoring Admin'
    );
  };

  const filteredEvents = events.filter(ev => {
    const tier = getEffectivePointTier(ev, draftRules);
    const matchesTier = filterTier === 'all' || tier === filterTier;
    const matchesCategory = filterCategory === 'all' || ev.category === filterCategory;
    return matchesTier && matchesCategory;
  });

  const renderCategoryTabBadge = (catId: CategoryId) => {
    switch (catId) {
      case 'sports':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'cultural':
        return <Music className="w-4 h-4 text-emerald-600" />;
      case 'literary':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case 'special':
      default:
        return <Star className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Per-Category Separated Scoring Architecture</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Scoring Rules & Category Point Systems
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-1 leading-relaxed">
            Each competition pillar maintains its own independent point system. <strong>Sports Events</strong> has 3 tiers (Major Sports, Minor Sports, and Special Sports like Arnis/Swimming), while <strong>Cultural & Arts</strong>, <strong>Literary</strong>, and <strong>Special Events</strong> can each use Major & Minor tiers or Major Points Only.
          </p>
        </div>

        <button
          id="admin-save-scoring-rules-btn"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Update Scoring Rules'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Separated point systems for Sports, Cultural & Arts, Literary, and Special Events updated successfully.
          </span>
        </div>
      )}

      {/* Formula Explanation Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3 border border-slate-800">
        <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>University Standing Formula (Separated Category Pillars)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-orange-300 font-bold mb-1">Sports Events (3 Tiers)</div>
            <div className="text-slate-200">
              Major: {byCategory.sports.majorPoints['1st']} • Minor: {byCategory.sports.minorPoints['1st']} • Special Sports: {byCategory.sports.specialPoints['1st']}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-emerald-300 font-bold mb-1">Cultural & Arts</div>
            <div className="text-slate-200">
              Major: {byCategory.cultural.majorPoints['1st']}
              {byCategory.cultural.useMinorTier !== false ? ` • Minor: ${byCategory.cultural.minorPoints['1st']}` : ' (Major Only)'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-indigo-300 font-bold mb-1">Literary Events</div>
            <div className="text-slate-200">
              Major: {byCategory.literary.majorPoints['1st']}
              {byCategory.literary.useMinorTier !== false ? ` • Minor: ${byCategory.literary.minorPoints['1st']}` : ' (Major Only)'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-purple-300 font-bold mb-1">Special Events</div>
            <div className="text-slate-200">
              Major: {byCategory.special.majorPoints['1st']}
              {byCategory.special.useMinorTier !== false ? ` • Minor: ${byCategory.special.minorPoints['1st']}` : ' (Major Only)'}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Special Sports (Arnis, Swimming, Athletics) stay strictly inside the Sports pillar and do not share scales with Special Events (Mr. & Ms. PALAKASAN, Cheerdance, Tough Model, Laro ng Lahi).
        </p>
      </div>

      {/* Category Switcher Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(
          [
            {
              id: 'sports' as CategoryId,
              title: 'Sports Events',
              desc: '3 Tiers: Major, Minor & Special Sports',
            },
            {
              id: 'cultural' as CategoryId,
              title: 'Cultural & Arts Events',
              desc: byCategory.cultural.useMinorTier !== false ? 'Major & Minor Tiers' : 'Major Points Only',
            },
            {
              id: 'literary' as CategoryId,
              title: 'Literary Events',
              desc: byCategory.literary.useMinorTier !== false ? 'Major & Minor Tiers' : 'Major Points Only',
            },
            {
              id: 'special' as CategoryId,
              title: 'Special Events',
              desc: byCategory.special.useMinorTier !== false ? 'Major & Minor Tiers' : 'Major Points Only',
            },
          ] as const
        ).map(tab => {
          const isActive = activeCategoryTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategoryTab(tab.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-sm">
                {renderCategoryTabBadge(tab.id)}
                <span>{tab.title}</span>
              </div>
              <div className={`text-xs mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                {tab.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* ACTIVE CATEGORY EDITOR: SPORTS EVENTS (3 TIERS + SUB-DISCIPLINES) */}
      {/* ===================================================================== */}
      {activeCategoryTab === 'sports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sports Tier 1: Major Sports */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    <Award className="w-3 h-3" />
                    Sports Tier 1
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-700">
                    Max: {byCategory.sports.majorPoints['1st']} pts
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Major Sports Points</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Team sports like Basketball Men/Women and Volleyball Men/Women.
                </p>
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                  <button
                    type="button"
                    onClick={() => applySportsMajorPreset(50, 40, 30, 20)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                  >
                    50-40-30-20
                  </button>
                  <button
                    type="button"
                    onClick={() => applySportsMajorPreset(60, 45, 30, 15)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                  >
                    60-45-30-15
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
                  <div
                    key={p}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <span className="font-extrabold text-xs text-slate-900">
                      {p === 'DQ' ? 'Disqualification (DQ)' : `${p} Place`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={byCategory.sports.majorPoints[p]}
                        onChange={e =>
                          setByCategory(prev => ({
                            ...prev,
                            sports: {
                              ...prev.sports,
                              majorPoints: { ...prev.sports.majorPoints, [p]: Number(e.target.value) },
                            },
                          }))
                        }
                        className="w-16 text-right px-2 py-1 font-mono font-extrabold text-sm text-blue-700 bg-white border border-slate-300 rounded-lg"
                      />
                      <span className="text-xs font-bold text-slate-500">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sports Tier 2: Minor Sports */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    <Layers className="w-3 h-3" />
                    Sports Tier 2
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-700">
                    Max: {byCategory.sports.minorPoints['1st']} pts
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Minor Sports Points</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Badminton, Table Tennis, Chess, Sepak Takraw, and single-division sports.
                </p>
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                  <button
                    type="button"
                    onClick={() => applySportsMinorPreset(30, 20, 15, 10)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    30-20-15-10
                  </button>
                  <button
                    type="button"
                    onClick={() => applySportsMinorPreset(25, 20, 15, 10)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    25-20-15-10
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
                  <div
                    key={p}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <span className="font-extrabold text-xs text-slate-900">
                      {p === 'DQ' ? 'Disqualification (DQ)' : `${p} Place`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={byCategory.sports.minorPoints[p]}
                        onChange={e =>
                          setByCategory(prev => ({
                            ...prev,
                            sports: {
                              ...prev.sports,
                              minorPoints: { ...prev.sports.minorPoints, [p]: Number(e.target.value) },
                            },
                          }))
                        }
                        className="w-16 text-right px-2 py-1 font-mono font-extrabold text-sm text-slate-800 bg-white border border-slate-300 rounded-lg"
                      />
                      <span className="text-xs font-bold text-slate-500">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sports Tier 3: Special Sports */}
            <div className="bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                    <Swords className="w-3 h-3" />
                    Sports Tier 3 (Special Sports)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-800">
                    Max: {byCategory.sports.specialPoints['1st']} pts
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Special Sports Points</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Multi-discipline athletic meets like <strong>Arnis</strong>, <strong>Swimming</strong>, and <strong>Athletics</strong> (separate from Special Events).
                </p>
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                  <button
                    type="button"
                    onClick={() => applySportsSpecialPreset(60, 45, 30, 20)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                  >
                    60-45-30-20
                  </button>
                  <button
                    type="button"
                    onClick={() => applySportsSpecialPreset(50, 40, 30, 20)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                  >
                    50-40-30-20
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
                  <div
                    key={p}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/40 border border-amber-100"
                  >
                    <span className="font-extrabold text-xs text-slate-900">
                      {p === 'DQ' ? 'Disqualification (DQ)' : `${p} Place`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={byCategory.sports.specialPoints[p]}
                        onChange={e =>
                          setByCategory(prev => ({
                            ...prev,
                            sports: {
                              ...prev.sports,
                              specialPoints: { ...prev.sports.specialPoints, [p]: Number(e.target.value) },
                            },
                          }))
                        }
                        className="w-16 text-right px-2 py-1 font-mono font-extrabold text-sm text-amber-900 bg-white border border-amber-200 rounded-lg"
                      />
                      <span className="text-xs font-bold text-slate-500">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Multi-Category Sports Disciplines Scoring Rule (Arnis, Swimming, Athletics) */}
          <div className="bg-white rounded-2xl border-2 border-amber-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                    <Zap className="w-3 h-3 text-amber-700" />
                    Special Sports Sub-Discipline Scale
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-800">
                    {byCategory.sports.disciplinePoints['1st']}-{byCategory.sports.disciplinePoints['2nd']}-{byCategory.sports.disciplinePoints['3rd']}-{byCategory.sports.disciplinePoints['4th']}-{byCategory.sports.disciplinePoints['5th']}-{byCategory.sports.disciplinePoints['6th']} Scale
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-amber-600" />
                  <span>Multi-Category Sports Accumulated Points (Arnis, Swimming, Athletics)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                  For multi-discipline sports like Arnis (Anyo, Laban) and Swimming (heats, relays), each sub-category awards these points. Accumulated totals determine the overall 1st–4th rank under Special Sports ({byCategory.sports.specialPoints['1st']} pts).
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                <button
                  type="button"
                  onClick={() => applySportsDisciplinePreset(10, 8, 6, 4, 2, 0)}
                  className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                >
                  10-8-6-4-2-0 (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => applySportsDisciplinePreset(12, 10, 8, 6, 4, 2)}
                  className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                >
                  12-10-8-6-4-2 (Extended)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {(['1st', '2nd', '3rd', '4th', '5th', '6th', 'DQ'] as const).map(p => (
                <div
                  key={p}
                  className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/80 text-center space-y-1"
                >
                  <span className="text-[11px] font-extrabold text-amber-950 block uppercase">
                    {p} {p === 'DQ' ? '' : 'Place'}
                  </span>
                  <div className="flex items-center justify-center gap-1 pt-1">
                    <input
                      type="number"
                      value={byCategory.sports.disciplinePoints[p]}
                      onChange={e =>
                        setByCategory(prev => ({
                          ...prev,
                          sports: {
                            ...prev.sports,
                            disciplinePoints: {
                              ...prev.sports.disciplinePoints,
                              [p]: Number(e.target.value),
                            },
                          },
                        }))
                      }
                      className="w-14 text-center px-1.5 py-1 font-mono font-extrabold text-sm text-amber-950 bg-white border border-amber-300 rounded-lg"
                    />
                    <span className="text-[10px] font-bold text-amber-800">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ACTIVE CATEGORY EDITOR: CULTURAL, LITERARY, OR SPECIAL EVENTS */}
      {/* ===================================================================== */}
      {activeCategoryTab !== 'sports' && (() => {
        const catKey = activeCategoryTab as 'cultural' | 'literary' | 'special';
        const rule = byCategory[catKey];
        const useMinor = rule.useMinorTier !== false;

        const meta =
          catKey === 'cultural'
            ? {
                title: 'Cultural & Arts Events Point System',
                subtitle: 'Configure scoring independently for Folk Dance, Hip-Hop Dance, Vocal Solo, Pop Solo, and Acoustic Showcase.',
                badge: 'Cultural & Arts Pillar',
                majorDesc: 'High-weight stage productions (e.g. Folk Dance Competition, Hip-Hop Dance Battle).',
                minorDesc: 'Individual and smaller cultural showcases (e.g. OPM Vocal Solo, Pop Solo).',
              }
            : catKey === 'literary'
            ? {
                title: 'Literary Events Point System',
                subtitle: 'Configure scoring independently for Academic Quiz Bowl, Debate, Oration, Extemporaneous Speaking, and Poetry.',
                badge: 'Literary Pillar',
                majorDesc: 'Flagship academic and oratorical contests (e.g. Quiz Bowl, Parliamentary Debate).',
                minorDesc: 'Individual literary contests (e.g. Oration, Spoken Word Poetry, Essay Writing).',
              }
            : {
                title: 'Special Events Point System (Distinct from Special Sports)',
                subtitle: 'Dedicated point configuration for university-wide showcases (Mr. & Ms. PALAKASAN, Cheerdance, Tough Model, Laro ng Lahi). Can use Major & Minor tiers or Major Points Only.',
                badge: 'Special Events Pillar',
                majorDesc: 'Flagship spectacles (e.g. Mr. & Ms. PALAKASAN Pageant, Cheerdance Competition, Tough Model).',
                minorDesc: 'Secondary special contests (e.g. Laro ng Lahi, Opening Saludo & Parade).',
              };

        return (
          <div className="space-y-6">
            {/* Tier Structure Mode Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 uppercase mb-1.5">
                    {meta.badge}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">{meta.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">{meta.subtitle}</p>
                </div>

                {/* Toggle: Major & Minor vs Major Points Only */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() =>
                      setByCategory(prev => ({
                        ...prev,
                        [catKey]: { ...prev[catKey], useMinorTier: true },
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      useMinor
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Major & Minor Tiers
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setByCategory(prev => ({
                        ...prev,
                        [catKey]: { ...prev[catKey], useMinorTier: false },
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      !useMinor
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Major Points Only
                  </button>
                </div>
              </div>
            </div>

            {/* Scales Grid */}
            <div className={`grid grid-cols-1 ${useMinor ? 'lg:grid-cols-2' : ''} gap-6`}>
              {/* Major Scale Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      <Star className="w-3 h-3" />
                      {useMinor ? 'Major Tier' : 'Unified Major Points Only'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-700">
                      Max: {rule.majorPoints['1st']} pts
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {useMinor ? `Major ${catKey.charAt(0).toUpperCase() + catKey.slice(1)} Points` : `All ${catKey.charAt(0).toUpperCase() + catKey.slice(1)} Events (Major Points)`}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{meta.majorDesc}</p>
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyStandardCatMajorPreset(catKey, 60, 45, 30, 20)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 cursor-pointer"
                    >
                      60-45-30-20
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStandardCatMajorPreset(catKey, 50, 40, 30, 20)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                    >
                      50-40-30-20
                    </button>
                    <button
                      type="button"
                      onClick={() => applyStandardCatMajorPreset(catKey, 75, 55, 40, 25)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                    >
                      75-55-40-25
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
                    <div
                      key={p}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <span className="font-extrabold text-xs text-slate-900">
                        {p === 'DQ' ? 'Disqualification (DQ)' : `${p} Place`}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={rule.majorPoints[p]}
                          onChange={e =>
                            setByCategory(prev => ({
                              ...prev,
                              [catKey]: {
                                ...prev[catKey],
                                majorPoints: { ...prev[catKey].majorPoints, [p]: Number(e.target.value) },
                              },
                            }))
                          }
                          className="w-16 text-right px-2 py-1 font-mono font-extrabold text-sm text-blue-700 bg-white border border-slate-300 rounded-lg"
                        />
                        <span className="text-xs font-bold text-slate-500">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minor Scale Card (when enabled) */}
              {useMinor && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        <Layers className="w-3 h-3" />
                        Minor Tier
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-700">
                        Max: {rule.minorPoints['1st']} pts
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      Minor {catKey.charAt(0).toUpperCase() + catKey.slice(1)} Points
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{meta.minorDesc}</p>
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                      <button
                        type="button"
                        onClick={() => applyStandardCatMinorPreset(catKey, 30, 20, 15, 10)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                      >
                        30-20-15-10
                      </button>
                      <button
                        type="button"
                        onClick={() => applyStandardCatMinorPreset(catKey, 25, 20, 15, 10)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                      >
                        25-20-15-10
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
                      <div
                        key={p}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <span className="font-extrabold text-xs text-slate-900">
                          {p === 'DQ' ? 'Disqualification (DQ)' : `${p} Place`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={rule.minorPoints[p]}
                            onChange={e =>
                              setByCategory(prev => ({
                                ...prev,
                                [catKey]: {
                                  ...prev[catKey],
                                  minorPoints: { ...prev[catKey].minorPoints, [p]: Number(e.target.value) },
                                },
                              }))
                            }
                            className="w-16 text-right px-2 py-1 font-mono font-extrabold text-sm text-slate-800 bg-white border border-slate-300 rounded-lg"
                          />
                          <span className="text-xs font-bold text-slate-500">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Events Inspection & Tier Assignment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>Category-Scoped Tier Assignment:</strong> Each event only offers point tiers belonging to its own category (Sports offers Major/Minor/Special Sports; Cultural, Literary, and Special Events offer Major/Minor or Major Only depending on your toggle above).
          </span>
        </div>

        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Event Point Tier Mapping ({filteredEvents.length} of {events.length} Events)
            </h3>
            <p className="text-xs text-slate-500">
              Review and designate point tiers per event. Changes take effect on next certification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {(['all', 'sports', 'cultural', 'literary', 'special'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat === 'special' ? 'Special Events' : cat}
                </button>
              ))}
            </div>

            {/* Tier Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {(
                [
                  { id: 'all', label: 'All Tiers' },
                  { id: 'major', label: 'Major' },
                  { id: 'minor', label: 'Minor' },
                  { id: 'special', label: 'Special Sports' },
                ] as const
              ).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilterTier(t.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterTier === t.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No events found matching the selected filters.
            </div>
          ) : (
            filteredEvents.map(ev => {
              const allowedTiers = getAllowedTiersForCategory(ev.category, draftRules);
              const currentTier = getEffectivePointTier(ev, draftRules);
              const activeTierOption =
                allowedTiers.find(opt => opt.value === currentTier) || allowedTiers[0];
              const pts = activeTierOption.points;

              return (
                <div
                  key={ev.id}
                  className="p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 text-xs transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ev.eventName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                        {ev.category === 'special' ? 'Special Events' : ev.category}
                      </span>
                    </div>
                    <span className="text-slate-400 block mt-0.5">
                      {ev.venue} • {ev.eventType || 'Standard'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono text-slate-500 hidden md:inline-block">
                      {`1st: ${pts['1st']} • 2nd: ${pts['2nd']} • 3rd: ${pts['3rd']} • 4th: ${pts['4th']} pts`}
                    </span>

                    <select
                      value={currentTier}
                      onChange={e => handleToggleEventTier(ev.id, e.target.value as PointTier)}
                      disabled={allowedTiers.length <= 1}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border focus:outline-hidden cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                        currentTier === 'special'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : currentTier === 'major'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {allowedTiers.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
