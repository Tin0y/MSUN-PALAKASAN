import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Save,
  Sparkles,
  Star,
  Layers,
  Filter,
  RefreshCw,
  Zap,
  Swords,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { Placement, PointTier, DisciplinePointsConfig } from '../../types';

export const AdminScoringView: React.FC = () => {
  const { currentPalakasan, updatePalakasan, events, updateEvent } = usePalakasan();

  const currentMajor = currentPalakasan?.scoringRules?.majorPoints || {
    '1st': 50,
    '2nd': 40,
    '3rd': 30,
    '4th': 20,
    DQ: 0,
  };

  const currentMinor = currentPalakasan?.scoringRules?.minorPoints || {
    '1st': 30,
    '2nd': 20,
    '3rd': 15,
    '4th': 10,
    DQ: 0,
  };

  const currentSpecial = currentPalakasan?.scoringRules?.specialPoints || {
    '1st': 60,
    '2nd': 45,
    '3rd': 30,
    '4th': 20,
    DQ: 0,
  };

  const currentDiscipline = currentPalakasan?.scoringRules?.disciplinePoints || {
    '1st': 10,
    '2nd': 8,
    '3rd': 6,
    '4th': 4,
    '5th': 2,
    '6th': 0,
    DQ: 0,
  };

  const [majorPoints, setMajorPoints] = useState(currentMajor);
  const [minorPoints, setMinorPoints] = useState(currentMinor);
  const [specialPoints, setSpecialPoints] = useState(currentSpecial);
  const [disciplinePoints, setDisciplinePoints] = useState<DisciplinePointsConfig>(currentDiscipline);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filterTier, setFilterTier] = useState<'all' | 'special' | 'major' | 'minor'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'sports' | 'cultural' | 'literary' | 'special'>('all');

  const handleSave = async () => {
    if (!currentPalakasan) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updatePalakasan(currentPalakasan.id, {
        scoringRules: {
          majorPoints,
          minorPoints,
          specialPoints,
          disciplinePoints,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to update scoring rules:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Preset Handlers
  const applySpecialPreset = (p1: number, p2: number, p3: number, p4: number) => {
    setSpecialPoints({ '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, DQ: 0 });
  };

  const applyMajorPreset = (p1: number, p2: number, p3: number, p4: number) => {
    setMajorPoints({ '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, DQ: 0 });
  };

  const applyMinorPreset = (p1: number, p2: number, p3: number, p4: number) => {
    setMinorPoints({ '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, DQ: 0 });
  };

  const applyDisciplinePreset = (p1: number, p2: number, p3: number, p4: number, p5: number, p6: number) => {
    setDisciplinePoints({ '1st': p1, '2nd': p2, '3rd': p3, '4th': p4, '5th': p5, '6th': p6, DQ: 0 });
  };

  const handleToggleEventTier = async (eventId: string, newTier: PointTier) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    await updateEvent(
      eventId,
      {
        pointTier: newTier,
        isMajor: newTier === 'major' || newTier === 'special',
      },
      'Scoring Admin'
    );
  };

  const filteredEvents = events.filter(ev => {
    const tier =
      ev.pointTier ||
      (ev.category === 'special' ? 'special' : ev.isMajor || ev.category === 'sports' ? 'major' : 'minor');
    const matchesTier = filterTier === 'all' || tier === filterTier;
    const matchesCategory = filterCategory === 'all' || ev.category === filterCategory;
    return matchesTier && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Three-Tier Championship Architecture</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Scoring Rules & Event Point Tiers
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mt-1">
            Configure standardized point matrices for Special Events, Major Tournaments, and Minor Competitions. Both Cultural and Literary events can be flexibly designated as Major or Minor points based on festival committee guidelines.
          </p>
        </div>

        <button
          id="admin-save-scoring-rules-btn"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Update Scoring Rules'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            All 3 Point Systems (Special Events, Major Events, and Minor Events) updated successfully in the tournament database.
          </span>
        </div>
      )}

      {/* Formula Explanation Card */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 sm:p-7 shadow-md space-y-3 border border-indigo-900/50">
        <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>University Standing Formula</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-lg sm:text-xl font-black">
          <span className="text-slate-200">Overall Points =</span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300">
            Sports ({majorPoints['1st']}/{minorPoints['1st']})
          </span>
          <span>+</span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300">
            Cultural ({minorPoints['1st']})
          </span>
          <span>+</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
            Literary ({minorPoints['1st']})
          </span>
          <span>+</span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/30 border border-purple-400/40 text-purple-200">
            ⭐ Special Events ({specialPoints['1st']})
          </span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          The overall standings are purely additive and directly computed from certified point transactions. No manual score override is permitted on the leaderboard — every point must be certified through its respective event.
        </p>
      </div>

      {/* Point Matrices: 3-Tier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier 1: Special Events Points System */}
        <div className="bg-white rounded-2xl border-2 border-purple-200 p-5 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                <Star className="w-3 h-3 fill-purple-700" />
                Premier Tier
              </span>
              <span className="text-[10px] font-mono font-bold text-purple-700">
                Max: {specialPoints['1st']} pts
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Special Events Points System
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Applied to University Cheerdance, Mr. & Ms. Palakasan Coronation, Tough Model, and Saludo/Opening Demonstrations.
            </p>

            {/* Quick Presets */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
              <button
                type="button"
                onClick={() => applySpecialPreset(60, 45, 30, 20)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
              >
                60-45-30-20 (Standard)
              </button>
              <button
                type="button"
                onClick={() => applySpecialPreset(75, 55, 40, 25)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
              >
                75-55-40-25 (Grand)
              </button>
              <button
                type="button"
                onClick={() => applySpecialPreset(100, 75, 50, 25)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
              >
                100-75-50-25 (Max)
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
              <div
                key={p}
                className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/40 border border-purple-100"
              >
                <div>
                  <span className="font-extrabold text-xs text-slate-900 block">
                    {p === 'DQ'
                      ? 'Disqualification (DQ)'
                      : `${p} Place / ${p === '1st' ? 'Champion' : p === '2nd' ? '1st Runner-Up' : p === '3rd' ? '2nd Runner-Up' : '3rd Runner-Up'}`}
                  </span>
                  <span className="text-[10px] text-purple-700 font-medium">
                    {p === 'DQ' ? '0 pts certified' : 'Premier allocation'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={specialPoints[p]}
                    onChange={e =>
                      setSpecialPoints(prev => ({ ...prev, [p]: Number(e.target.value) }))
                    }
                    className="w-16 text-right px-2 py-1 font-mono font-extrabold text-sm text-purple-800 bg-white border border-purple-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-slate-500">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Major Events Scale */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                <Award className="w-3 h-3" />
                Tier 1 Tournaments
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-700">
                Max: {majorPoints['1st']} pts
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Major Event Points
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Applied to high-weight team athletic tournaments like Basketball Men/Women and Volleyball.
            </p>

            {/* Quick Presets */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
              <button
                type="button"
                onClick={() => applyMajorPreset(50, 40, 30, 20)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                50-40-30-20 (Standard)
              </button>
              <button
                type="button"
                onClick={() => applyMajorPreset(60, 45, 30, 15)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                60-45-30-15 (Tiered)
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
              <div
                key={p}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div>
                  <span className="font-extrabold text-xs text-slate-900 block">
                    {p === 'DQ'
                      ? 'Disqualification (DQ)'
                      : `${p} Place / ${p === '1st' ? 'Champion' : p === '2nd' ? '1st Runner-Up' : p === '3rd' ? '2nd Runner-Up' : '3rd Runner-Up'}`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Standard tournament placement</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={majorPoints[p]}
                    onChange={e =>
                      setMajorPoints(prev => ({ ...prev, [p]: Number(e.target.value) }))
                    }
                    className="w-16 text-right px-2 py-1 font-mono font-extrabold text-sm text-blue-700 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-500">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Minor Events Scale */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                <Layers className="w-3 h-3" />
                Tier 2 Standard
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-700">
                Max: {minorPoints['1st']} pts
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Minor Event Points
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Applied to badminton, table tennis, chess, extemporaneous speech, essay writing, and vocal solos.
            </p>

            {/* Quick Presets */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
              <button
                type="button"
                onClick={() => applyMinorPreset(30, 20, 15, 10)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                30-20-15-10 (Standard)
              </button>
              <button
                type="button"
                onClick={() => applyMinorPreset(25, 20, 15, 10)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                25-20-15-10 (Compact)
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
              <div
                key={p}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div>
                  <span className="font-extrabold text-xs text-slate-900 block">
                    {p === 'DQ'
                      ? 'Disqualification (DQ)'
                      : `${p} Place / ${p === '1st' ? 'Champion' : p === '2nd' ? '1st Runner-Up' : p === '3rd' ? '2nd Runner-Up' : '3rd Runner-Up'}`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Standard placement scale</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={minorPoints[p]}
                    onChange={e =>
                      setMinorPoints(prev => ({ ...prev, [p]: Number(e.target.value) }))
                    }
                    className="w-16 text-right px-2 py-1 font-mono font-extrabold text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-500"
                  />
                  <span className="text-xs font-bold text-slate-500">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Category Disciplines Scoring Rule (Arnis, Swimming, Athletics) */}
      <div className="bg-white rounded-2xl border-2 border-amber-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                <Zap className="w-3 h-3 text-amber-700" />
                Multi-Category Point System
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-800">
                10-8-6-4-2-0 Scale
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-600" />
              <span>Special Events Accumulated Points (e.g. Arnis, Swimming)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Arnis and Swimming competitions feature multiple categories (Anyo forms, Laban weight classes, 50m Free, Relay heats, etc.). Each category awards points to colleges. At the conclusion, all points won per college are <strong>accumulated</strong>, and the college with the highest score is declared the 1st Place overall champion.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
            <button
              type="button"
              onClick={() => applyDisciplinePreset(10, 8, 6, 4, 2, 0)}
              className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              10-8-6-4-2-0 (Standard)
            </button>
            <button
              type="button"
              onClick={() => applyDisciplinePreset(12, 10, 8, 6, 4, 2)}
              className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              12-10-8-6-4-2 (Extended)
            </button>
          </div>
        </div>

        {/* Inputs for Category Placements */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {(['1st', '2nd', '3rd', '4th', '5th', '6th', 'DQ'] as const).map(p => (
            <div
              key={p}
              className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/80 text-center space-y-1"
            >
              <span className="text-[11px] font-extrabold text-amber-950 block uppercase">
                {p} {p === 'DQ' ? '' : 'Place'}
              </span>
              <span className="text-[9px] text-amber-700/80 block font-medium">
                {p === '1st' ? 'Category Gold' : p === '2nd' ? 'Category Silver' : p === '3rd' ? 'Category Bronze' : p === 'DQ' ? 'Disqualified' : 'Placement'}
              </span>
              <div className="flex items-center justify-center gap-1 pt-1">
                <input
                  type="number"
                  value={disciplinePoints[p]}
                  onChange={e =>
                    setDisciplinePoints(prev => ({ ...prev, [p]: Number(e.target.value) }))
                  }
                  className="w-14 text-center px-1.5 py-1 font-mono font-extrabold text-sm text-amber-950 bg-white border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] font-bold text-amber-800">pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Informative Walkthrough */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 block">Accumulated Score Example (Arnis Tournament):</span>
            <p className="text-[11px] text-slate-600">
              If CBIT wins 3 golds (30 pts) and 2 silvers (16 pts) = <strong>46 accumulated pts</strong>. If CESS-IDS accumulates 38 pts, CFMS 24 pts, and CELS 14 pts, CBIT is awarded <strong>1st Place ({specialPoints['1st']} Championship Points)</strong>, CESS-IDS <strong>2nd Place ({specialPoints['2nd']} pts)</strong>, CFMS <strong>3rd Place ({specialPoints['3rd']} pts)</strong>, and CELS <strong>4th Place ({specialPoints['4th']} pts)</strong>.
            </p>
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automatic Accumulator in Results Console</span>
          </div>
        </div>
      </div>

      {/* Events Inspection & Tier Assignment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Friendly Cultural & Literary Note */}
        <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>Flexible Cultural & Literary Points:</strong> Cultural events (e.g. Hiphop Dance, Folk Dance Festival) and Literary competitions (e.g. Parliamentary Debate, Balak) can be assigned to either <strong>Major Tier ({majorPoints['1st']} pts)</strong> or <strong>Minor Tier ({minorPoints['1st']} pts)</strong> below.
          </span>
        </div>

        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Event Point Tier Mapping ({filteredEvents.length} of {events.length} Events)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Review and designate point tiers for each event. Changes take effect on next certification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterCategory === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('cultural')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterCategory === 'cultural'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Cultural
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('literary')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterCategory === 'literary'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                Literary
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('sports')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterCategory === 'sports'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                Sports
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('special')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterCategory === 'special'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                Special
              </button>
            </div>

            {/* Tier Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterTier('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterTier === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Tiers
              </button>
              <button
                type="button"
                onClick={() => setFilterTier('special')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  filterTier === 'special'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                Special
              </button>
              <button
                type="button"
                onClick={() => setFilterTier('major')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterTier === 'major'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:bg-blue-100'
                }`}
              >
                Major
              </button>
              <button
                type="button"
                onClick={() => setFilterTier('minor')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterTier === 'minor'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Minor
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {filteredEvents.map(ev => {
            const currentTier: PointTier =
              ev.pointTier ||
              (ev.category === 'special' ? 'special' : ev.isMajor || ev.category === 'sports' ? 'major' : 'minor');

            return (
              <div
                key={ev.id}
                className="p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 text-xs transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ev.eventName}</span>
                    {ev.category === 'special' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                        Official Special Event
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 block capitalize mt-0.5">
                    {ev.category} • {ev.venue} • {ev.eventType || 'Standard'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Point Breakdown Indicator */}
                  <span className="text-[11px] font-mono text-slate-500 hidden md:inline-block">
                    {currentTier === 'special' &&
                      `1st: ${specialPoints['1st']} • 2nd: ${specialPoints['2nd']} • 3rd: ${specialPoints['3rd']} • 4th: ${specialPoints['4th']} pts`}
                    {currentTier === 'major' &&
                      `1st: ${majorPoints['1st']} • 2nd: ${majorPoints['2nd']} • 3rd: ${majorPoints['3rd']} • 4th: ${majorPoints['4th']} pts`}
                    {currentTier === 'minor' &&
                      `1st: ${minorPoints['1st']} • 2nd: ${minorPoints['2nd']} • 3rd: ${minorPoints['3rd']} • 4th: ${minorPoints['4th']} pts`}
                  </span>

                  {/* Tier Switcher Dropdown */}
                  <select
                    value={currentTier}
                    onChange={e => handleToggleEventTier(ev.id, e.target.value as PointTier)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border focus:outline-hidden cursor-pointer ${
                      currentTier === 'special'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : currentTier === 'major'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="special">⭐ Special Tier ({specialPoints['1st']} pts)</option>
                    <option value="major">🏅 Major Tier ({majorPoints['1st']} pts)</option>
                    <option value="minor">🥈 Minor Tier ({minorPoints['1st']} pts)</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
