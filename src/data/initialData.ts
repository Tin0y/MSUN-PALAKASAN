import { ActivityLogItem, Category, College, PalakasanEvent, Placement, ScoringRulesConfig, DisciplinePointsConfig } from '../types';

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

// Backward compatibility alias default to Major scale
export const OFFICIAL_POINTS: Record<Placement, number> = MAJOR_POINTS;

/**
 * Resolves the championship points awarded for a given placement based on
 * event point tier (Special, Major, Minor), custom scoring overrides, and tournament rules.
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

  // 2. Special Events Points System
  const isSpecial =
    event?.pointTier === 'special' ||
    (!event?.pointTier && event?.category?.toLowerCase() === 'special');
  if (isSpecial) {
    return scoringRules?.specialPoints?.[placement] ?? SPECIAL_POINTS[placement] ?? 0;
  }

  // 3. Major Event Tier
  const isMajor =
    event?.pointTier === 'major' ||
    (!event?.pointTier && event?.isMajor) ||
    (!event?.pointTier && event?.category?.toLowerCase() === 'sports');
  if (isMajor) {
    return scoringRules?.majorPoints?.[placement] ?? MAJOR_POINTS[placement] ?? 50;
  }

  // 4. Minor Event Tier
  return scoringRules?.minorPoints?.[placement] ?? MINOR_POINTS[placement] ?? 30;
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
