import {
  ActivityLogItem,
  Category,
  CategoryId,
  CategoryScoringRulesMap,
  College,
  PalakasanEvent,
  Placement,
  PointTier,
  ScoringRulesConfig,
  DisciplinePointsConfig,
} from '../types';

export const MAJOR_POINTS: Record<Placement, number> = {
  '1st': 50,
  '2nd': 40,
  '3rd': 30,
  '4th': 20,
  'DQ': 0,
};

export const MINOR_POINTS: Record<Placement, number> = {
  '1st': 30,
  '2nd': 20,
  '3rd': 15,
  '4th': 10,
  'DQ': 0,
};

export const SPECIAL_POINTS: Record<Placement, number> = {
  '1st': 60,
  '2nd': 45,
  '3rd': 30,
  '4th': 20,
  'DQ': 0,
};

// Points system for multi-category sports disciplines (Arnis, Swimming, etc.)
export const DEFAULT_DISCIPLINE_POINTS: DisciplinePointsConfig = {
  '1st': 10,
  '2nd': 8,
  '3rd': 6,
  '4th': 4,
  '5th': 2,
  '6th': 0,
  'DQ': 0,
};

// Separated default point systems per category
export const DEFAULT_BY_CATEGORY_SCORING: CategoryScoringRulesMap = {
  sports: {
    majorPoints: { ...MAJOR_POINTS },
    minorPoints: { ...MINOR_POINTS },
    specialPoints: { ...SPECIAL_POINTS },
    disciplinePoints: { ...DEFAULT_DISCIPLINE_POINTS },
  },
  cultural: {
    majorPoints: { ...MAJOR_POINTS },
    minorPoints: { ...MINOR_POINTS },
    useMinorTier: true,
  },
  literary: {
    majorPoints: { ...MAJOR_POINTS },
    minorPoints: { ...MINOR_POINTS },
    useMinorTier: true,
  },
  special: {
    majorPoints: { ...SPECIAL_POINTS },
    minorPoints: { ...MINOR_POINTS },
    useMinorTier: true,
  },
};

// Backward compatibility alias default to Major scale
export const OFFICIAL_POINTS: Record<Placement, number> = MAJOR_POINTS;

/**
 * Hydrates a complete, separated per-category ScoringRulesConfig from either
 * modern `byCategory` rules or legacy global rules.
 */
export function getNormalizedScoringRules(
  scoringRules?: ScoringRulesConfig | null
): Required<Pick<ScoringRulesConfig, 'majorPoints' | 'minorPoints' | 'specialPoints' | 'disciplinePoints' | 'byCategory'>> {
  const legacyMajor = scoringRules?.majorPoints || MAJOR_POINTS;
  const legacyMinor = scoringRules?.minorPoints || MINOR_POINTS;
  const legacySpecial = scoringRules?.specialPoints || SPECIAL_POINTS;
  const legacyDiscipline = scoringRules?.disciplinePoints || DEFAULT_DISCIPLINE_POINTS;
  const bc = scoringRules?.byCategory;

  return {
    majorPoints: { ...MAJOR_POINTS, ...legacyMajor },
    minorPoints: { ...MINOR_POINTS, ...legacyMinor },
    specialPoints: { ...SPECIAL_POINTS, ...legacySpecial },
    disciplinePoints: { ...DEFAULT_DISCIPLINE_POINTS, ...legacyDiscipline },
    byCategory: {
      sports: {
        majorPoints: { ...MAJOR_POINTS, ...legacyMajor, ...(bc?.sports?.majorPoints || {}) },
        minorPoints: { ...MINOR_POINTS, ...legacyMinor, ...(bc?.sports?.minorPoints || {}) },
        specialPoints: { ...SPECIAL_POINTS, ...legacySpecial, ...(bc?.sports?.specialPoints || {}) },
        disciplinePoints: { ...DEFAULT_DISCIPLINE_POINTS, ...legacyDiscipline, ...(bc?.sports?.disciplinePoints || {}) },
      },
      cultural: {
        majorPoints: { ...MAJOR_POINTS, ...legacyMajor, ...(bc?.cultural?.majorPoints || {}) },
        minorPoints: { ...MINOR_POINTS, ...legacyMinor, ...(bc?.cultural?.minorPoints || {}) },
        useMinorTier: bc?.cultural?.useMinorTier !== false,
      },
      literary: {
        majorPoints: { ...MAJOR_POINTS, ...legacyMajor, ...(bc?.literary?.majorPoints || {}) },
        minorPoints: { ...MINOR_POINTS, ...legacyMinor, ...(bc?.literary?.minorPoints || {}) },
        useMinorTier: bc?.literary?.useMinorTier !== false,
      },
      special: {
        majorPoints: { ...SPECIAL_POINTS, ...legacySpecial, ...(bc?.special?.majorPoints || {}) },
        minorPoints: { ...MINOR_POINTS, ...legacyMinor, ...(bc?.special?.minorPoints || {}) },
        useMinorTier: bc?.special?.useMinorTier !== false,
      },
    },
  };
}

/**
 * Resolves the effective PointTier for an event respecting its category's allowed tiers.
 * - Sports: 'major' | 'minor' | 'special' (Special Sports like Arnis/Swimming)
 * - Cultural & Literary: 'major' | 'minor' (or 'major' only if useMinorTier is false)
 * - Special Events: 'major' | 'minor' (or 'major' only if useMinorTier is false; legacy 'special' maps to 'major')
 */
export function getEffectivePointTier(
  event?: {
    category?: CategoryId;
    pointTier?: string;
    isMajor?: boolean;
  } | null,
  scoringRules?: ScoringRulesConfig | null
): PointTier {
  const cat = (event?.category || '').toLowerCase();
  const normalized = getNormalizedScoringRules(scoringRules);

  if (cat === 'sports') {
    if (event?.pointTier === 'special') return 'special';
    if (event?.pointTier === 'minor') return 'minor';
    if (event?.pointTier === 'major') return 'major';
    return event?.isMajor === false ? 'minor' : 'major';
  }

  if (cat === 'special') {
    if (normalized.byCategory.special.useMinorTier === false) return 'major';
    if (event?.pointTier === 'minor') return 'minor';
    return 'major';
  }

  if (cat === 'cultural') {
    if (normalized.byCategory.cultural.useMinorTier === false) return 'major';
    if (event?.pointTier === 'major' || (!event?.pointTier && event?.isMajor)) return 'major';
    return 'minor';
  }

  if (cat === 'literary') {
    if (normalized.byCategory.literary.useMinorTier === false) return 'major';
    if (event?.pointTier === 'major' || (!event?.pointTier && event?.isMajor)) return 'major';
    return 'minor';
  }

  if (event?.pointTier === 'special') return 'special';
  if (event?.pointTier === 'major' || (!event?.pointTier && event?.isMajor)) return 'major';
  return 'minor';
}

export interface CategoryTierOption {
  value: PointTier;
  label: string;
  shortLabel: string;
  points: Record<Placement, number>;
}

/**
 * Returns the valid tier choices and exact placement point scales for a given category.
 */
export function getAllowedTiersForCategory(
  category: CategoryId,
  scoringRules?: ScoringRulesConfig | null
): CategoryTierOption[] {
  const cat = (category || 'sports').toLowerCase();
  const normalized = getNormalizedScoringRules(scoringRules);

  if (cat === 'sports') {
    const s = normalized.byCategory.sports;
    return [
      { value: 'major', label: `Major Sports (${s.majorPoints['1st']} pts)`, shortLabel: 'Major Sports', points: s.majorPoints },
      { value: 'minor', label: `Minor Sports (${s.minorPoints['1st']} pts)`, shortLabel: 'Minor Sports', points: s.minorPoints },
      { value: 'special', label: `Special Sports (${s.specialPoints['1st']} pts)`, shortLabel: 'Special Sports', points: s.specialPoints },
    ];
  }

  if (cat === 'special') {
    const sp = normalized.byCategory.special;
    const opts: CategoryTierOption[] = [
      {
        value: 'major',
        label: sp.useMinorTier === false ? `Major Special Events (${sp.majorPoints['1st']} pts)` : `Major Special Event (${sp.majorPoints['1st']} pts)`,
        shortLabel: 'Major',
        points: sp.majorPoints,
      },
    ];
    if (sp.useMinorTier !== false) {
      opts.push({
        value: 'minor',
        label: `Minor Special Event (${sp.minorPoints['1st']} pts)`,
        shortLabel: 'Minor',
        points: sp.minorPoints,
      });
    }
    return opts;
  }

  if (cat === 'cultural') {
    const cu = normalized.byCategory.cultural;
    const opts: CategoryTierOption[] = [
      { value: 'major', label: `Major Cultural (${cu.majorPoints['1st']} pts)`, shortLabel: 'Major', points: cu.majorPoints },
    ];
    if (cu.useMinorTier !== false) {
      opts.push({ value: 'minor', label: `Minor Cultural (${cu.minorPoints['1st']} pts)`, shortLabel: 'Minor', points: cu.minorPoints });
    }
    return opts;
  }

  if (cat === 'literary') {
    const li = normalized.byCategory.literary;
    const opts: CategoryTierOption[] = [
      { value: 'major', label: `Major Literary (${li.majorPoints['1st']} pts)`, shortLabel: 'Major', points: li.majorPoints },
    ];
    if (li.useMinorTier !== false) {
      opts.push({ value: 'minor', label: `Minor Literary (${li.minorPoints['1st']} pts)`, shortLabel: 'Minor', points: li.minorPoints });
    }
    return opts;
  }

  return [
    { value: 'major', label: `Major (${normalized.majorPoints['1st']} pts)`, shortLabel: 'Major', points: normalized.majorPoints },
    { value: 'minor', label: `Minor (${normalized.minorPoints['1st']} pts)`, shortLabel: 'Minor', points: normalized.minorPoints },
  ];
}

/**
 * Resolves the championship points awarded for a given placement based on
 * the event's category-specific point system, tier, custom overrides, and tournament rules.
 */
export function getEventPointsForPlacement(
  placement: Placement,
  event?: {
    category?: string;
    pointTier?: string;
    isMajor?: boolean;
    customPoints?: Record<Placement, number>;
    hasCustomScoring?: boolean;
  } | null,
  scoringRules?: ScoringRulesConfig | null
): number {
  if (placement === 'DQ') return 0;

  // 1. Custom scoring override on the event
  if (event?.hasCustomScoring && event.customPoints && event.customPoints[placement] !== undefined) {
    return event.customPoints[placement];
  }

  const normalized = getNormalizedScoringRules(scoringRules);
  const cat = (event?.category || '').toLowerCase();
  const effectiveTier = getEffectivePointTier(event, normalized);

  if (cat === 'sports') {
    if (effectiveTier === 'special') {
      return normalized.byCategory.sports.specialPoints[placement] ?? SPECIAL_POINTS[placement] ?? 0;
    }
    if (effectiveTier === 'major') {
      return normalized.byCategory.sports.majorPoints[placement] ?? MAJOR_POINTS[placement] ?? 50;
    }
    return normalized.byCategory.sports.minorPoints[placement] ?? MINOR_POINTS[placement] ?? 30;
  }

  if (cat === 'special') {
    if (effectiveTier === 'minor' && normalized.byCategory.special.useMinorTier !== false) {
      return normalized.byCategory.special.minorPoints[placement] ?? MINOR_POINTS[placement] ?? 30;
    }
    return normalized.byCategory.special.majorPoints[placement] ?? SPECIAL_POINTS[placement] ?? 60;
  }

  if (cat === 'cultural') {
    if (effectiveTier === 'major' || normalized.byCategory.cultural.useMinorTier === false) {
      return normalized.byCategory.cultural.majorPoints[placement] ?? MAJOR_POINTS[placement] ?? 50;
    }
    return normalized.byCategory.cultural.minorPoints[placement] ?? MINOR_POINTS[placement] ?? 30;
  }

  if (cat === 'literary') {
    if (effectiveTier === 'major' || normalized.byCategory.literary.useMinorTier === false) {
      return normalized.byCategory.literary.majorPoints[placement] ?? MAJOR_POINTS[placement] ?? 50;
    }
    return normalized.byCategory.literary.minorPoints[placement] ?? MINOR_POINTS[placement] ?? 30;
  }

  // Fallback when category is unspecified
  if (effectiveTier === 'special') {
    return normalized.specialPoints[placement] ?? SPECIAL_POINTS[placement] ?? 60;
  }
  if (effectiveTier === 'major') {
    return normalized.majorPoints[placement] ?? MAJOR_POINTS[placement] ?? 50;
  }
  return normalized.minorPoints[placement] ?? MINOR_POINTS[placement] ?? 30;
}

export const COLLEGES: College[] = [
  {
    id: 'CBIT',
    acronym: 'CBIT',
    name: 'College of Business and Information Technology',
    shortName: 'Business & IT',
    tagline: 'Innovators of Technology & Commerce',
    color: {
      primary: '#ca8a04', // Yellow / Gold
      secondary: '#a16207',
      accent: '#facc15',
      bgBadge: 'bg-amber-100',
      textBadge: 'text-amber-900',
      border: 'border-amber-300',
      ring: 'ring-amber-400/40',
    },
    mascot: 'Griffins',
    moniker: 'Griffins',
    description: 'Home to the technological and business leaders of Mindanao State University at Naawan.',
  },
  {
    id: 'CESS-IDS',
    acronym: 'CESS-IDS',
    name: 'College of Education and Social Sciences - Integrated Developmental School',
    shortName: 'Education & Social Sciences',
    tagline: 'Molding Minds, Shaping Futures',
    color: {
      primary: '#9333ea', // Purple
      secondary: '#7e22ce',
      accent: '#c084fc',
      bgBadge: 'bg-purple-100',
      textBadge: 'text-purple-900',
      border: 'border-purple-300',
      ring: 'ring-purple-400/40',
    },
    mascot: 'Raptors',
    moniker: 'Raptors',
    description: 'Dedicated to educational excellence, pedagogical advancement, and cultural preservation.',
  },
  {
    id: 'CFMS',
    acronym: 'CFMS',
    name: 'College of Fisheries and Marine Sciences',
    shortName: 'Fisheries & Marine Sciences',
    tagline: 'Guardians of Marine Heritage',
    color: {
      primary: '#2563eb', // Blue
      secondary: '#1d4ed8',
      accent: '#60a5fa',
      bgBadge: 'bg-blue-100',
      textBadge: 'text-blue-900',
      border: 'border-blue-300',
      ring: 'ring-blue-400/40',
    },
    mascot: 'Triton',
    moniker: 'Triton',
    description: 'Pioneering marine science, sustainable fisheries, and aquatic biodiversity exploration.',
  },
  {
    id: 'CELS',
    acronym: 'CELS',
    name: 'College of Environment and Life Sciences',
    shortName: 'Environment & Life Sciences',
    tagline: 'Stewards of Ecological Balance',
    color: {
      primary: '#16a34a', // Green
      secondary: '#15803d',
      accent: '#4ade80',
      bgBadge: 'bg-emerald-100',
      textBadge: 'text-emerald-900',
      border: 'border-emerald-300',
      ring: 'ring-emerald-400/40',
    },
    mascot: 'Centaurs',
    moniker: 'Centaurs',
    description: 'Nurturing biological scientific exploration, forestry conservation, and ecological sustainability.',
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'sports',
    name: 'Sports',
    icon: '🏅',
    description: 'Athletic competitions showcasing endurance, agility, and sportsmanship across track and field, ball games, and racquet sports.',
    examples: ['Basketball', 'Volleyball', 'Badminton', 'Table Tennis', 'Chess', 'Athletics'],
  },
  {
    id: 'cultural',
    name: 'Cultural',
    icon: '🎭',
    description: 'Artistic expressions of Philippine heritage, modern choreography, musical virtuosity, and vocal prowess.',
    examples: ['Hiphop Dance', 'Folk Dance', 'Vocal Solo & Duet', 'Acoustic Band', 'Musical Showdown'],
  },
  {
    id: 'literary',
    name: 'Literary',
    icon: '📚',
    description: 'Intellectual mastery, eloquent speech, and literary artistry honoring regional dialects and national discourse.',
    examples: ['Balak Performance', 'Extemporaneous Speech', 'Essay Writing', 'Parliamentary Debate', 'Poetry Reading'],
  },
  {
    id: 'special',
    name: 'Special Events',
    icon: '⭐',
    description: 'Premier university-wide showcases, pageantry, strength, and iconic campus spectacles.',
    examples: ['Tough Model', 'Mr. & Ms. Palakasan', 'Cheerdance', 'Band Spectacular'],
  },
];

export const VENUES = [
  'Basketball Court',
  'TSAC (The Student Activity Center)',
  'MSUN Function Hall',
  'MSUN Bandstand',
  'University Oval',
  'Badminton Complex',
  'MSUN Gymnasium',
];

// Clean initial state: zero sample events so administrators create their own custom Palakasan tournament
export const INITIAL_EVENTS: PalakasanEvent[] = [];

// Clean initial state: zero sample activity logs
export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [];
