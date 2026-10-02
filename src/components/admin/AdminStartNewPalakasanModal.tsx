import React, { useState } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Sparkles,
  Layers,
  Calendar,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Swords,
  Zap,
  Award,
  Flame,
  BookOpen,
  Music,
  MapPin,
  RotateCcw,
  Star,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import {
  PalakasanEdition,
  CategoryId,
  CollegeId,
  CompetitionFormat,
  PointTier,
  PalakasanEvent,
  DisciplinePointsConfig,
} from '../../types';

interface AdminStartNewPalakasanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface InitialEventConfig {
  tempId: string;
  eventName: string;
  category: CategoryId;
  competitionFormat: CompetitionFormat;
  pointTier: PointTier;
  venue: string;
  description?: string;
}

const DEFAULT_MSUN_EVENTS: Omit<InitialEventConfig, 'tempId'>[] = [
  // Sports
  {
    eventName: 'Basketball Men',
    category: 'sports',
    competitionFormat: 'double-elimination',
    pointTier: 'major',
    venue: 'Basketball Court',
    description: "Men's collegiate 5-on-5 basketball championship.",
  },
  {
    eventName: 'Basketball Women',
    category: 'sports',
    competitionFormat: 'double-elimination',
    pointTier: 'major',
    venue: 'Basketball Court',
    description: "Women's collegiate 5-on-5 basketball championship.",
  },
  {
    eventName: 'Volleyball Men',
    category: 'sports',
    competitionFormat: 'double-elimination',
    pointTier: 'major',
    venue: 'Covered Court',
    description: "Men's collegiate indoor volleyball tournament.",
  },
  {
    eventName: 'Volleyball Women',
    category: 'sports',
    competitionFormat: 'double-elimination',
    pointTier: 'major',
    venue: 'Covered Court',
    description: "Women's collegiate indoor volleyball tournament.",
  },
  {
    eventName: 'Badminton Doubles',
    category: 'sports',
    competitionFormat: 'single-elimination',
    pointTier: 'minor',
    venue: 'TSAC Gymnasium',
    description: 'Inter-collegiate badminton doubles knockout.',
  },
  {
    eventName: 'Table Tennis Singles',
    category: 'sports',
    competitionFormat: 'single-elimination',
    pointTier: 'minor',
    venue: 'TSAC Gymnasium',
    description: 'Men and women singles table tennis.',
  },
  {
    eventName: 'Chess Mixed',
    category: 'sports',
    competitionFormat: 'round-robin',
    pointTier: 'minor',
    venue: 'Student Center',
    description: 'Round-robin collegiate chess tournament.',
  },
  {
    eventName: 'Sepak Takraw',
    category: 'sports',
    competitionFormat: 'single-elimination',
    pointTier: 'minor',
    venue: 'Campus Grounds',
    description: 'Inter-collegiate sepak takraw regu championship.',
  },
  {
    eventName: 'Arnis Men & Women',
    category: 'sports',
    competitionFormat: 'custom',
    pointTier: 'special',
    venue: 'TSAC Gymnasium',
    description: 'Multi-category Arnis championship (Anyo & Laban). Category points (10-8-6-4-2-0) accumulate per college.',
  },
  {
    eventName: 'Swimming Men & Women',
    category: 'sports',
    competitionFormat: 'custom',
    pointTier: 'special',
    venue: 'University Aquatic Center',
    description: 'Multi-category Swimming meet (Freestyle, Breaststroke, Backstroke, Relay). Category points (10-8-6-4-2-0) accumulate per college.',
  },
  // Cultural
  {
    eventName: 'Vocal Solo (OPM)',
    category: 'cultural',
    competitionFormat: 'individual',
    pointTier: 'minor',
    venue: 'TSAC Gymnasium',
    description: 'Original Pilipino Music vocal solo performance.',
  },
  {
    eventName: 'Pop Solo',
    category: 'cultural',
    competitionFormat: 'individual',
    pointTier: 'minor',
    venue: 'TSAC Gymnasium',
    description: 'Contemporary pop vocal solo competition.',
  },
  {
    eventName: 'Folk Dance Competition',
    category: 'cultural',
    competitionFormat: 'individual',
    pointTier: 'major',
    venue: 'TSAC Gymnasium',
    description: 'Traditional Philippine folk dance performance.',
  },
  {
    eventName: 'Hip-Hop Dance Battle',
    category: 'cultural',
    competitionFormat: 'head-to-head',
    pointTier: 'major',
    venue: 'TSAC Gymnasium',
    description: 'Collegiate street dance and hip-hop showdown.',
  },
  // Literary
  {
    eventName: 'Oration',
    category: 'literary',
    competitionFormat: 'individual',
    pointTier: 'minor',
    venue: 'Library Amphitheater',
    description: 'Formal English and Filipino oratory speech competition.',
  },
  {
    eventName: 'Extemporaneous Speaking',
    category: 'literary',
    competitionFormat: 'individual',
    pointTier: 'minor',
    venue: 'Library Amphitheater',
    description: 'On-the-spot public speaking on university and national issues.',
  },
  {
    eventName: 'Spoken Word Poetry',
    category: 'literary',
    competitionFormat: 'individual',
    pointTier: 'minor',
    venue: 'Library Amphitheater',
    description: 'Original expressive spoken word poetry slam.',
  },
  {
    eventName: 'General Information & Science Quiz Bowl',
    category: 'literary',
    competitionFormat: 'individual',
    pointTier: 'major',
    venue: 'Audio-Visual Hall',
    description: 'Collegiate academic team quiz bowl.',
  },
  // Special
  {
    eventName: 'Cheerdance Competition',
    category: 'special',
    competitionFormat: 'individual',
    pointTier: 'major',
    venue: 'Grand Gymnasium / Oval',
    description: 'Grand collegiate pep squad routines and cheers.',
  },
  {
    eventName: 'Mr. and Ms. PALAKASAN Pageant',
    category: 'special',
    competitionFormat: 'individual',
    pointTier: 'major',
    venue: 'TSAC Gymnasium',
    description: 'Annual search for ambassadors of athletic excellence.',
  },
  {
    eventName: 'Laro ng Lahi (Traditional Games)',
    category: 'special',
    competitionFormat: 'head-to-head',
    pointTier: 'minor',
    venue: 'University Grounds',
    description: 'Heritage games including Kadang-kadang and Tug of War.',
  },
];

const PRESET_CHIPS_BY_CATEGORY: Record<
  CategoryId,
  { name: string; format: CompetitionFormat; tier: PointTier; venue: string }[]
> = {
  sports: [
    { name: 'Basketball Men', format: 'double-elimination', tier: 'major', venue: 'Basketball Court' },
    { name: 'Basketball Women', format: 'double-elimination', tier: 'major', venue: 'Basketball Court' },
    { name: 'Volleyball Men', format: 'double-elimination', tier: 'major', venue: 'Covered Court' },
    { name: 'Volleyball Women', format: 'double-elimination', tier: 'major', venue: 'Covered Court' },
    { name: 'Badminton Doubles', format: 'single-elimination', tier: 'minor', venue: 'TSAC Gymnasium' },
    { name: 'Table Tennis Singles', format: 'single-elimination', tier: 'minor', venue: 'TSAC Gymnasium' },
    { name: 'Chess Mixed', format: 'round-robin', tier: 'minor', venue: 'Student Center' },
    { name: 'Sepak Takraw', format: 'single-elimination', tier: 'minor', venue: 'Campus Grounds' },
    { name: 'Arnis Men & Women', format: 'custom', tier: 'special', venue: 'TSAC Gymnasium' },
    { name: 'Swimming Men & Women', format: 'custom', tier: 'special', venue: 'University Aquatic Center' },
  ],
  cultural: [
    { name: 'Vocal Solo (OPM)', format: 'individual', tier: 'minor', venue: 'TSAC Gymnasium' },
    { name: 'Pop Solo', format: 'individual', tier: 'minor', venue: 'TSAC Gymnasium' },
    { name: 'Folk Dance', format: 'individual', tier: 'major', venue: 'TSAC Gymnasium' },
    { name: 'Hip-Hop Dance Battle', format: 'head-to-head', tier: 'major', venue: 'TSAC Gymnasium' },
    { name: 'Acoustic Band Showcase', format: 'individual', tier: 'minor', venue: 'Library Amphitheater' },
  ],
  literary: [
    { name: 'Oration', format: 'individual', tier: 'minor', venue: 'Library Amphitheater' },
    { name: 'Extemporaneous Speaking', format: 'individual', tier: 'minor', venue: 'Library Amphitheater' },
    { name: 'Spoken Word Poetry', format: 'individual', tier: 'minor', venue: 'Library Amphitheater' },
    { name: 'Essay Writing', format: 'individual', tier: 'minor', venue: 'Library Amphitheater' },
    { name: 'Academic Quiz Bowl', format: 'individual', tier: 'major', venue: 'Audio-Visual Hall' },
  ],
  special: [
    { name: 'Cheerdance Competition', format: 'individual', tier: 'major', venue: 'Grand Gymnasium / Oval' },
    { name: 'Mr. and Ms. PALAKASAN', format: 'individual', tier: 'special', venue: 'TSAC Gymnasium' },
    { name: 'Arnis Championship Meet', format: 'custom', tier: 'special', venue: 'TSAC Gymnasium' },
    { name: 'Swimming Championship Meet', format: 'custom', tier: 'special', venue: 'University Aquatic Center' },
    { name: 'Laro ng Lahi (Tug of War)', format: 'head-to-head', tier: 'minor', venue: 'University Grounds' },
  ],
};

export const AdminStartNewPalakasanModal: React.FC<AdminStartNewPalakasanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { colleges, categories, venues, createPalakasan, switchActivePalakasan } = usePalakasan();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State - Step 1: Info
  const nextYear = new Date().getFullYear() + 1;
  const [name, setName] = useState(`MSU at Naawan PALAKASAN ${nextYear}`);
  const [year, setYear] = useState<number>(nextYear);
  const [startDate, setStartDate] = useState(`${nextYear}-10-18`);
  const [endDate, setEndDate] = useState(`${nextYear}-10-25`);
  const [description, setDescription] = useState(
    `Annual Inter-Collegiate Athletic, Cultural, and Literary Meet of Mindanao State University at Naawan.`
  );

  // Step 2: Theme
  const [themeTitle, setThemeTitle] = useState(`PALAKASAN ${nextYear}`);
  const [themeTagline, setThemeTagline] = useState('United Through Excellence, Anchored in Heritage');
  const [primaryColor, setPrimaryColor] = useState('#0284c7');
  const [secondaryColor, setSecondaryColor] = useState('#0369a1');
  const [accentColor, setAccentColor] = useState('#38bdf8');
  const [themeLogo, setThemeLogo] = useState('🏆');

  // Step 3: Selected Colleges
  const [selectedColleges, setSelectedColleges] = useState<CollegeId[]>(
    colleges.map(c => c.id)
  );

  // Step 4: Selected Categories
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([
    'sports',
    'cultural',
    'literary',
    'special',
  ]);

  // Step 5: Scoring Rules
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

  const [specialPoints, setSpecialPoints] = useState({
    '1st': 60,
    '2nd': 45,
    '3rd': 30,
    '4th': 20,
    DQ: 0,
  });

  // Multi-category sub-event points (Arnis, Swimming, Athletics, etc.)
  const [disciplinePoints, setDisciplinePoints] = useState<DisciplinePointsConfig>({
    '1st': 10,
    '2nd': 8,
    '3rd': 6,
    '4th': 4,
    '5th': 2,
    '6th': 0,
    DQ: 0,
  });

  // Step 6: Events Identification State (REQUIRED)
  // Initialize with the standard recommended events for selected categories
  const [eventsList, setEventsList] = useState<InitialEventConfig[]>(() =>
    DEFAULT_MSUN_EVENTS.map((ev, idx) => ({
      ...ev,
      tempId: `init-${idx}-${Date.now()}`,
    }))
  );

  // New Event Form Input states in Step 6
  const [newEventName, setNewEventName] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<CategoryId>('sports');
  const [newEventFormat, setNewEventFormat] = useState<CompetitionFormat>('double-elimination');
  const [newEventTier, setNewEventTier] = useState<PointTier>('major');
  const [newEventVenue, setNewEventVenue] = useState('Basketball Court');
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryId | 'all'>('sports');

  const [setAsCurrentNow, setSetAsCurrentNow] = useState(true);

  if (!isOpen) return null;

  const handleToggleCollege = (colId: CollegeId) => {
    setSelectedColleges(prev =>
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const handleToggleCategory = (catId: CategoryId) => {
    setSelectedCategories(prev => {
      const next = prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId];
      // If active tab was removed, adjust activeCategoryTab
      if (!next.includes(activeCategoryTab as CategoryId) && activeCategoryTab !== 'all') {
        setActiveCategoryTab(next[0] || 'all');
      }
      return next;
    });
  };

  // Helper to load standard events for all selected categories
  const handleLoadStandardEvents = () => {
    const filtered = DEFAULT_MSUN_EVENTS.filter(ev => selectedCategories.includes(ev.category)).map(
      (ev, idx) => ({
        ...ev,
        tempId: `msun-preset-${idx}-${Date.now()}`,
      })
    );
    setEventsList(filtered);
    setError(null);
  };

  // Helper to add custom event
  const handleAddCustomEvent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newEventName.trim()) {
      setError('Please provide an event name.');
      return;
    }

    const newEvent: InitialEventConfig = {
      tempId: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventName: newEventName.trim(),
      category: newEventCategory,
      competitionFormat: newEventFormat,
      pointTier: newEventTier,
      venue: newEventVenue.trim() || venues[0]?.name || 'Campus Grounds',
      description: `${newEventName.trim()} competition for ${name}`,
    };

    setEventsList(prev => [...prev, newEvent]);
    setNewEventName('');
    setError(null);
  };

  // Quick chip add
  const handleQuickAddChip = (chip: {
    name: string;
    format: CompetitionFormat;
    tier: PointTier;
    venue: string;
  }) => {
    // Check if already added
    if (eventsList.some(ev => ev.eventName.toLowerCase() === chip.name.toLowerCase())) {
      setError(`"${chip.name}" is already added.`);
      return;
    }

    const newEvent: InitialEventConfig = {
      tempId: `chip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventName: chip.name,
      category: activeCategoryTab === 'all' ? newEventCategory : activeCategoryTab,
      competitionFormat: chip.format,
      pointTier: chip.tier,
      venue: chip.venue,
      description: `${chip.name} competition for ${name}`,
    };

    setEventsList(prev => [...prev, newEvent]);
    setError(null);
  };

  const handleRemoveEvent = (tempId: string) => {
    setEventsList(prev => prev.filter(ev => ev.tempId !== tempId));
  };

  const handleUpdateEventFormat = (tempId: string, format: CompetitionFormat) => {
    setEventsList(prev =>
      prev.map(ev => (ev.tempId === tempId ? { ...ev, competitionFormat: format } : ev))
    );
  };

  // Validation function when advancing
  const handleStepContinue = () => {
    setError(null);

    if (step === 1) {
      if (!name.trim()) {
        setError('Please provide a name for this PALAKASAN edition.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (selectedColleges.length === 0) {
        setError('Please select at least one participating college.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (selectedCategories.length === 0) {
        setError('Please select at least one event category.');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      // MANDATORY VALIDATION: Check that each selected category has at least 1 event identified!
      const missingCategories = selectedCategories.filter(
        catId => !eventsList.some(ev => ev.category === catId)
      );

      if (missingCategories.length > 0) {
        const catNames = missingCategories
          .map(id => categories.find(c => c.id === id)?.name || id)
          .join(', ');
        setError(
          `Action Required: You must identify at least one event for each selected pillar (${catNames}) before this PALAKASAN can be created.`
        );
        return;
      }
      setStep(7);
    }
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

    // Strict validation: Every selected category MUST have at least 1 identified event
    const missingCategories = selectedCategories.filter(
      catId => !eventsList.some(ev => ev.category === catId)
    );

    if (missingCategories.length > 0) {
      const catNames = missingCategories
        .map(id => categories.find(c => c.id === id)?.name || id)
        .join(', ');
      setError(
        `Cannot create PALAKASAN: You must identify and configure at least one event for each selected category (${catNames}).`
      );
      setStep(6);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const editionId = `palakasan-${year}`;

      // Extract unique formats configured across all identified events
      const usedFormats: CompetitionFormat[] = Array.from(
        new Set([
          ...eventsList.map(e => e.competitionFormat),
          'double-elimination',
          'single-elimination',
          'round-robin',
          'head-to-head',
          'individual',
        ])
      );

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
          specialPoints,
          disciplinePoints,
        },
        competitionRules: {
          availableFormats: usedFormats,
          tieBreakers: ['competition-points', 'head-to-head', 'score-difference'],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Construct initial events with chosen tournament formats
      const initialEventsPayload: Omit<PalakasanEvent, 'id' | 'palakasanId'>[] = eventsList.map(
        ev => ({
          eventName: ev.eventName,
          category: ev.category,
          competitionFormat: ev.competitionFormat,
          pointTier: ev.pointTier,
          isMajor: ev.pointTier === 'major',
          venue: ev.venue || (venues[0]?.name || 'Campus Court'),
          date: startDate,
          startTime: '08:00 AM',
          endTime: '11:00 AM',
          description: ev.description || `${ev.eventName} competition for ${name}`,
          status: 'upcoming',
          participatingColleges: selectedColleges,
          eventType:
            ev.competitionFormat === 'head-to-head'
              ? 'Head-to-Head / Match'
              : ev.competitionFormat === 'individual'
              ? 'Individual'
              : 'Team',
        })
      );

      // Create Palakasan edition AND all its identified events in Firestore
      await createPalakasan(newEdition, initialEventsPayload);

      if (setAsCurrentNow) {
        await switchActivePalakasan(editionId);
      }

      onClose();
    } catch (err: any) {
      console.error('Error creating Palakasan edition:', err);
      setError(err?.message || 'Failed to create new PALAKASAN edition and events.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormatBadgeStyle = (format: CompetitionFormat) => {
    switch (format) {
      case 'double-elimination':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Double Elimination',
          icon: <Trophy className="w-3 h-3 text-blue-600" />,
        };
      case 'single-elimination':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Single Elimination',
          icon: <Zap className="w-3 h-3 text-purple-600" />,
        };
      case 'head-to-head':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Head-to-Head Match',
          icon: <Swords className="w-3 h-3 text-emerald-600" />,
        };
      case 'round-robin':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Round Robin',
          icon: <RotateCcw className="w-3 h-3 text-amber-600" />,
        };
      case 'individual':
      default:
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Judged / Individual',
          icon: <Award className="w-3 h-3 text-indigo-600" />,
        };
    }
  };

  const getCategoryIcon = (catId: CategoryId) => {
    switch (catId) {
      case 'sports':
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'cultural':
        return <Music className="w-3.5 h-3.5 text-purple-500" />;
      case 'literary':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-500" />;
      case 'special':
      default:
        return <Award className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const STEPS = [
    { num: 1, label: 'Info' },
    { num: 2, label: 'Theme' },
    { num: 3, label: 'Colleges' },
    { num: 4, label: 'Categories' },
    { num: 5, label: 'Scoring' },
    { num: 6, label: 'Required Events' },
    { num: 7, label: 'Review & Create' },
  ];

  // Visible events in Step 6
  const displayedEvents =
    activeCategoryTab === 'all'
      ? eventsList
      : eventsList.filter(ev => ev.category === activeCategoryTab);

  // Missing categories validation state
  const missingCategories = selectedCategories.filter(
    catId => !eventsList.some(ev => ev.category === catId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Start New PALAKASAN Edition</h2>
              <p className="text-xs text-slate-500">
                Step {step} of 7 • Events and competition formats must be identified before creation
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
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-1 overflow-x-auto">
          {STEPS.map(s => (
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
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
                        style={{ backgroundColor: col.color.primary }}
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
                        <p className="text-xs font-bold text-slate-900 capitalize flex items-center gap-1.5">
                          {getCategoryIcon(cat.id)}
                          <span>{cat.name}</span>
                        </p>
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
            <div className="space-y-6">
              {/* Special Multi-Category Explanation Banner */}
              <div className="p-4 rounded-xl bg-purple-50/90 border border-purple-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-900">
                  <Star className="w-4 h-4 text-purple-700 fill-purple-700" />
                  <span>Special & Multi-Category Point Systems Configured</span>
                </div>
                <p className="text-purple-900 leading-relaxed">
                  For complex multi-discipline competitions like <strong>Arnis</strong> and <strong>Swimming</strong>, individual categories/events award points on a <strong>10, 8, 6, 4, 2, 0</strong> scale. All category points earned per college are accumulated; the college with the highest accumulated score becomes the overall champion (1st place) and so on.
                </p>
              </div>

              {/* Special Event Championship Scale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                    <span>Special Event Championship Scale (Arnis, Swimming, Mr. & Ms. Palakasan)</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Max: {specialPoints['1st']} pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Final overall championship points awarded to colleges based on accumulated rank.
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {(['1st', '2nd', '3rd', '4th', 'DQ'] as const).map(p => (
                    <div key={p} className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-200 text-center">
                      <span className="text-[10px] font-bold text-purple-700 block uppercase">{p} Place</span>
                      <input
                        type="number"
                        value={specialPoints[p]}
                        onChange={e =>
                          setSpecialPoints(prev => ({ ...prev, [p]: Number(e.target.value) }))
                        }
                        className="w-full text-center mt-1 font-bold text-purple-900 bg-white border border-purple-300 rounded-lg py-1 text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Category Discipline Points (10-8-6-4-2-0) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Sub-Category / Discipline Point System (Arnis & Swimming Heats)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Points earned by colleges in each sub-category (Anyo, Laban weight classes, 50m Free, etc.)
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    10-8-6-4-2-0 Standard
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {(['1st', '2nd', '3rd', '4th', '5th', '6th', 'DQ'] as const).map(p => (
                    <div key={p} className="p-2 bg-white rounded-xl border border-slate-200 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">{p}</span>
                      <input
                        type="number"
                        value={disciplinePoints[p]}
                        onChange={e =>
                          setDisciplinePoints(prev => ({ ...prev, [p]: Number(e.target.value) }))
                        }
                        className="w-full text-center mt-1 font-mono font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg py-1 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Major Event Point Scale */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <span>Major Event Point Scale (e.g. Basketball, Volleyball)</span>
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

              {/* Minor Event Point Scale */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-600" />
                  <span>Minor Event Point Scale (e.g. Table Tennis, Badminton, Quiz Bowl, Oration)</span>
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

          {/* STEP 6: Identify & Configure Required Events (CORE USER REQUIREMENT) */}
          {step === 6 && (
            <div className="space-y-5">
              {/* Guidance & Requirement Banner */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Mandatory Step: Identify Events & Tournament Formats</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Before creating this new PALAKASAN edition, all official events must be identified
                  along with their game type (e.g., <strong>Double Elimination</strong>,{' '}
                  <strong>Single Elimination</strong>, <strong>Head-to-Head match</strong>,{' '}
                  <strong>Round Robin</strong>, or <strong>Judged Ranking</strong>). Every selected
                  pillar must have at least one event.
                </p>
              </div>

              {/* Requirement Checklist by Category */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Required Pillars:
                </span>
                {selectedCategories.map(catId => {
                  const count = eventsList.filter(ev => ev.category === catId).length;
                  const isSatisfied = count > 0;
                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => setActiveCategoryTab(catId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isSatisfied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-300 animate-pulse'
                      }`}
                    >
                      {getCategoryIcon(catId)}
                      <span className="capitalize">{catId}:</span>
                      <span>
                        {count} {count === 1 ? 'event' : 'events'}
                      </span>
                      {isSatisfied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
                      ) : (
                        <span className="text-[10px] bg-amber-200/70 text-amber-800 px-1 py-0.2 rounded-xs">
                          Needs Event
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Category Tab Switcher & Quick Fill Tools */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveCategoryTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeCategoryTab === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Events ({eventsList.length})
                  </button>
                  {selectedCategories.map(catId => {
                    const count = eventsList.filter(ev => ev.category === catId).length;
                    return (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => {
                          setActiveCategoryTab(catId);
                          setNewEventCategory(catId);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize flex items-center gap-1.5 transition-colors ${
                          activeCategoryTab === catId
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {getCategoryIcon(catId)}
                        <span>{catId}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            activeCategoryTab === catId ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleLoadStandardEvents}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                    title="Load standard MSU at Naawan tournament lineup"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quick Fill MSUN Events</span>
                  </button>
                  {eventsList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEventsList([])}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Clear list and add custom events"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Event Creation Form */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>
                      Add Event to{' '}
                      <span className="capitalize text-blue-600">
                        {activeCategoryTab === 'all' ? newEventCategory : activeCategoryTab}
                      </span>
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Specify event name, game format & point tier
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Event Name */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newEventName}
                      onChange={e => setNewEventName(e.target.value)}
                      placeholder="e.g. Basketball Men, Vocal Solo..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomEvent();
                        }
                      }}
                    />
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={activeCategoryTab === 'all' ? newEventCategory : activeCategoryTab}
                      onChange={e => setNewEventCategory(e.target.value as CategoryId)}
                      disabled={activeCategoryTab !== 'all'}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 capitalize focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                    >
                      {selectedCategories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Game Format / Competition Type */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Game / Competition Format
                    </label>
                    <select
                      value={newEventFormat}
                      onChange={e => setNewEventFormat(e.target.value as CompetitionFormat)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-blue-950 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="double-elimination">Double Elimination</option>
                      <option value="single-elimination">Single Elimination</option>
                      <option value="head-to-head">Head-to-Head / Match</option>
                      <option value="round-robin">Round Robin</option>
                      <option value="individual">Judged / Individual</option>
                    </select>
                  </div>

                  {/* Point Tier */}
                  <div className="sm:col-span-3 flex items-end gap-1.5">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Point Tier
                      </label>
                      <select
                        value={newEventTier}
                        onChange={e => setNewEventTier(e.target.value as PointTier)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="major">Major (50 pts)</option>
                        <option value="minor">Minor (30 pts)</option>
                        <option value="special">⭐ Special (60 pts / Multi-Cat)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddCustomEvent()}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add Preset Suggestions for the Active Category */}
                {(() => {
                  const targetCat =
                    activeCategoryTab === 'all' ? newEventCategory : activeCategoryTab;
                  const suggestions = PRESET_CHIPS_BY_CATEGORY[targetCat] || [];
                  const unadded = suggestions.filter(
                    s => !eventsList.some(ev => ev.eventName.toLowerCase() === s.name.toLowerCase())
                  );

                  if (unadded.length === 0) return null;

                  return (
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Quick-add standard {targetCat} events:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {unadded.map(chip => (
                          <button
                            key={chip.name}
                            type="button"
                            onClick={() => handleQuickAddChip(chip)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-md transition-colors"
                          >
                            <Plus className="w-3 h-3 text-slate-400" />
                            <span>{chip.name}</span>
                            <span className="text-[10px] text-slate-400">
                              ({chip.format === 'double-elimination' ? 'Double' : chip.format})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Identified Events List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span>
                    Identified Events ({displayedEvents.length}{' '}
                    {activeCategoryTab !== 'all' ? `in ${activeCategoryTab}` : 'total'})
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    You can change game format directly on any card below
                  </span>
                </div>

                {displayedEvents.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-800">
                      No events identified for{' '}
                      <span className="capitalize">{activeCategoryTab}</span> yet
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                      Use the form above or click "Quick Fill MSUN Events" to identify the events and
                      their tournament format for this pillar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {displayedEvents.map(ev => {
                      const badge = getFormatBadgeStyle(ev.competitionFormat);
                      return (
                        <div
                          key={ev.tempId}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                              {getCategoryIcon(ev.category)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-slate-900 truncate">
                                  {ev.eventName}
                                </h5>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}
                                >
                                  {badge.icon}
                                  <span>{badge.label}</span>
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                    ev.pointTier === 'major'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {ev.pointTier} ({ev.pointTier === 'major' ? '50pts' : '30pts'})
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="capitalize font-semibold text-slate-600">
                                  {ev.category}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{ev.venue}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Controls: Inline format selector & delete */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <select
                              value={ev.competitionFormat}
                              onChange={e =>
                                handleUpdateEventFormat(
                                  ev.tempId,
                                  e.target.value as CompetitionFormat
                                )
                              }
                              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                              title="Change tournament format"
                            >
                              <option value="double-elimination">Double Elimination</option>
                              <option value="single-elimination">Single Elimination</option>
                              <option value="head-to-head">Head-to-Head Match</option>
                              <option value="round-robin">Round Robin</option>
                              <option value="individual">Judged / Individual</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveEvent(ev.tempId)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  This action provisions the tournament partition and automatically initializes all{' '}
                  <strong>{eventsList.length} identified events</strong> with their designated
                  competition brackets and matches in Firebase Firestore.
                </p>
              </div>

              {/* Tournament Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Edition Name:</span>
                  <span className="font-bold text-slate-900">
                    {name} ({year})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold text-slate-900">
                    {startDate} to {endDate}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Colleges ({selectedColleges.length}):</span>
                  <span className="font-bold text-slate-900">{selectedColleges.join(', ')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Point Scales:</span>
                  <span className="font-mono font-bold text-slate-900 text-right">
                    Special 1st: {specialPoints['1st']} • Major 1st: {majorPoints['1st']} • Minor 1st: {minorPoints['1st']}
                    <span className="block text-[10px] text-amber-700 font-semibold">
                      Multi-Category Disciplines: 10-8-6-4-2-0 pts
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Configured Events:</span>
                  <span className="font-bold text-blue-600">{eventsList.length} Events</span>
                </div>
              </div>

              {/* Configured Events Breakdown by Category */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Configured Events Breakdown ({eventsList.length}):
                </h5>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedCategories.map(catId => {
                    const catEvents = eventsList.filter(ev => ev.category === catId);
                    return (
                      <div
                        key={catId}
                        className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold capitalize text-slate-900 flex items-center gap-1.5">
                            {getCategoryIcon(catId)}
                            <span>{catId}</span>
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {catEvents.length} {catEvents.length === 1 ? 'event' : 'events'}
                          </span>
                        </div>

                        {catEvents.length === 0 ? (
                          <p className="text-[11px] text-red-500 font-semibold italic">
                            ⚠️ No events identified for this category!
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {catEvents.map(ev => {
                              const badge = getFormatBadgeStyle(ev.competitionFormat);
                              return (
                                <div
                                  key={ev.tempId}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px]"
                                >
                                  <span className="font-semibold text-slate-800">{ev.eventName}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded-xs text-[9px] font-bold ${badge.bg}`}
                                  >
                                    {badge.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={setAsCurrentNow}
                  onChange={e => setSetAsCurrentNow(e.target.checked)}
                  className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
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
              onClick={() => {
                setError(null);
                setStep(prev => prev - 1);
              }}
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
              onClick={handleStepContinue}
              className="inline-flex items-center gap-1 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="wizard-create-palakasan-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || missingCategories.length > 0}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>
                {isSubmitting
                  ? 'Initializing Edition & Events in Firestore...'
                  : `Create PALAKASAN Edition (${eventsList.length} Events)`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
