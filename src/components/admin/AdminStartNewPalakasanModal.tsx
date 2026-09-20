import React, { useState } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Sparkles,
  GraduationCap,
  Layers,
  Award,
  Calendar,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { PalakasanEdition, CategoryId, CollegeId } from '../../types';

interface AdminStartNewPalakasanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminStartNewPalakasanModal: React.FC<AdminStartNewPalakasanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { colleges, categories, createPalakasan, switchActivePalakasan } = usePalakasan();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const nextYear = new Date().getFullYear() + 1;
  const [name, setName] = useState(`MSU at Naawan PALAKASAN ${nextYear}`);
  const [year, setYear] = useState<number>(nextYear);
  const [startDate, setStartDate] = useState(`${nextYear}-10-18`);
  const [endDate, setEndDate] = useState(`${nextYear}-10-25`);
  const [description, setDescription] = useState(
    `Annual Inter-Collegiate Athletic, Cultural, and Literary Meet of Mindanao State University at Naawan.`
  );

  // Theme
  const [themeTitle, setThemeTitle] = useState(`PALAKASAN ${nextYear}`);
  const [themeTagline, setThemeTagline] = useState('United Through Excellence, Anchored in Heritage');
  const [primaryColor, setPrimaryColor] = useState('#0284c7');
  const [secondaryColor, setSecondaryColor] = useState('#0369a1');
  const [accentColor, setAccentColor] = useState('#38bdf8');
  const [themeLogo, setThemeLogo] = useState('🏆');

  // Selected Colleges
  const [selectedColleges, setSelectedColleges] = useState<CollegeId[]>(
    colleges.map(c => c.id)
  );

  // Selected Categories
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([
    'sports',
    'cultural',
    'literary',
    'special',
  ]);

  // Scoring
  const [majorPoints, setMajorPoints] = useState({
    '1st': 50,
    '2nd': 40,
    '3rd': 30,
    '4th': 20,
    DQ: 0,
  });

  const [minorPoints, setMinorPoints] = useState({
    '1st': 30,
    '2nd': 20,
    '3rd': 15,
    '4th': 10,
    DQ: 0,
  });

  // Competition Formats
  const [availableFormats, setAvailableFormats] = useState<string[]>([
    'double-elimination',
    'round-robin',
    'single-elimination',
    'individual',
    'head-to-head',
  ]);

  const [setAsCurrentNow, setSetAsCurrentNow] = useState(true);

  if (!isOpen) return null;

  const handleToggleCollege = (colId: CollegeId) => {
    setSelectedColleges(prev =>
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const handleToggleCategory = (catId: CategoryId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleToggleFormat = (fmt: string) => {
    setAvailableFormats(prev =>
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please provide a name for this PALAKASAN edition.');
      setStep(1);
      return;
    }
    if (selectedColleges.length === 0) {
      setError('Please select at least one participating college.');
      setStep(3);
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one event category.');
      setStep(4);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const editionId = `palakasan-${year}`;
      const newEdition: PalakasanEdition = {
        id: editionId,
        name: name.trim(),
        year: Number(year),
        description: description.trim(),
        startDate,
        endDate,
        status: 'upcoming',
        isCurrent: setAsCurrentNow,
        theme: {
          title: themeTitle.trim() || `PALAKASAN ${year}`,
          tagline: themeTagline.trim(),
          primaryColor,
          secondaryColor,
          accentColor,
          description: description.trim(),
          logo: themeLogo,
        },
        participatingColleges: selectedColleges,
        eventCategories: selectedCategories,
        scoringRules: {
          majorPoints,
          minorPoints,
        },
        competitionRules: {
          availableFormats,
          tieBreakers: ['competition-points', 'head-to-head', 'score-difference'],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createPalakasan(newEdition);
      if (setAsCurrentNow) {
        await switchActivePalakasan(editionId);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create new PALAKASAN edition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Start New PALAKASAN Edition</h2>
              <p className="text-xs text-slate-500">
                Step {step} of 7 • Initialize fresh season while preserving past editions
              </p>
            </div>
          </div>
          <button
            id="close-wizard-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-1 overflow-x-auto">
          {[
            { num: 1, label: 'Info' },
            { num: 2, label: 'Theme' },
            { num: 3, label: 'Colleges' },
            { num: 4, label: 'Categories' },
            { num: 5, label: 'Scoring' },
            { num: 6, label: 'Formats' },
            { num: 7, label: 'Review' },
          ].map(s => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                step === s.num
                  ? 'bg-blue-600 text-white shadow-xs'
                  : step > s.num
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white/20">
                {step > s.num ? <Check className="w-2.5 h-2.5" /> : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  PALAKASAN Edition Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. MSU at Naawan PALAKASAN 2027"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Meet Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Opening Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Closing Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Edition Description / Executive Note
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Theme Setup */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Theme Title
                  </label>
                  <input
                    type="text"
                    value={themeTitle}
                    onChange={e => setThemeTitle(e.target.value)}
                    placeholder="e.g. PALAKASAN 2027"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mascot / Logo Emoji
                  </label>
                  <input
                    type="text"
                    value={themeLogo}
                    onChange={e => setThemeLogo(e.target.value)}
                    placeholder="🏆 or 🎖️"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Tagline / Motto
                </label>
                <input
                  type="text"
                  value={themeTagline}
                  onChange={e => setThemeTagline(e.target.value)}
                  placeholder="e.g. United Through Excellence, Anchored in Heritage"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <span className="text-xs font-mono text-slate-600">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <span className="text-xs font-mono text-slate-600">{secondaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <span className="text-xs font-mono text-slate-600">{accentColor}</span>
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div
                className="p-4 rounded-xl border text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{themeLogo}</span>
                  <div>
                    <h4 className="font-extrabold text-base">{themeTitle}</h4>
                    <p className="text-xs opacity-90">{themeTagline}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Participating Colleges */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Select which colleges will compete in this edition of PALAKASAN:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {colleges.map(col => {
                  const isChecked = selectedColleges.includes(col.id);
                  return (
                    <div
                      key={col.id}
                      onClick={() => handleToggleCollege(col.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div
                        className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0"
                        style={{ backgroundColor: col.color }}
                      >
                        {col.acronym}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">{col.acronym}</p>
                        <p className="text-[11px] text-slate-500 truncate">{col.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Event Categories */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Choose the official event pillars included in this edition:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map(cat => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 capitalize">{cat.name}</p>
                        <p className="text-[11px] text-slate-500">{cat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Scoring Configuration */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Major Event Point Scale (e.g. Basketball, Volleyball, Cheerdance)
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
                    <div key={p} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">{p} Place</span>
                      <input
                        type="number"
                        value={majorPoints[p]}
                        onChange={e =>
                          setMajorPoints(prev => ({ ...prev, [p]: Number(e.target.value) }))
                        }
                        className="w-full text-center mt-1 font-bold text-slate-900 bg-white border border-slate-300 rounded-lg py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Minor Event Point Scale (e.g. Table Tennis, Badminton, Quiz Bowl)
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
                    <div key={p} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">{p} Place</span>
                      <input
                        type="number"
                        value={minorPoints[p]}
                        onChange={e =>
                          setMinorPoints(prev => ({ ...prev, [p]: Number(e.target.value) }))
                        }
                        className="w-full text-center mt-1 font-bold text-slate-900 bg-white border border-slate-300 rounded-lg py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Competition Formats */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Enable tournament formats available for events in this edition:
              </p>
              <div className="space-y-2">
                {[
                  { id: 'double-elimination', label: 'Double Elimination Tournament', desc: 'Winners and Losers bracket with championship rematch capability.' },
                  { id: 'round-robin', label: 'Round Robin Pool Play', desc: 'All colleges face each other, sorted by points, wins, and head-to-head.' },
                  { id: 'single-elimination', label: 'Single Elimination Knockout', desc: 'Direct knockout matches straight to final championship.' },
                  { id: 'individual', label: 'Individual / Open Ranking', desc: 'Judged placements for literary and cultural symposium events.' },
                  { id: 'head-to-head', label: 'Head-to-Head Exhibition', desc: 'Direct 1-on-1 bilateral challenge matches.' },
                ].map(fmt => {
                  const isChecked = availableFormats.includes(fmt.id);
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => handleToggleFormat(fmt.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                        isChecked ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{fmt.label}</p>
                        <p className="text-[11px] text-slate-500">{fmt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Review & Final Confirmation */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Ready to Initialize {name}</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  This action provisions a dedicated database collection partition in Firebase Firestore. All previous PALAKASAN editions (including 2026 and 2025) will remain completely intact in the historical archive.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Edition Name:</span>
                  <span className="font-bold text-slate-900">{name} ({year})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold text-slate-900">{startDate} to {endDate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Colleges:</span>
                  <span className="font-bold text-slate-900">{selectedColleges.join(', ')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Categories:</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedCategories.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Major Points:</span>
                  <span className="font-mono font-bold text-slate-900">
                    1st: {majorPoints['1st']} • 2nd: {majorPoints['2nd']} • 3rd: {majorPoints['3rd']} • 4th: {majorPoints['4th']}
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={setAsCurrentNow}
                  onChange={e => setSetAsCurrentNow(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Set this new edition as the active current tournament immediately
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              id="wizard-prev-step-btn"
              onClick={() => setStep(prev => prev - 1)}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              id="wizard-next-step-btn"
              onClick={() => setStep(prev => prev + 1)}
              className="inline-flex items-center gap-1 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="wizard-create-palakasan-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Edition in Firestore...' : 'Create PALAKASAN Edition'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
