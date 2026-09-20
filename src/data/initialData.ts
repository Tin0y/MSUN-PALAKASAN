import { ActivityLogItem, Category, College, PalakasanEvent, Placement, ScoringRulesConfig } from '../types';
import {
  generateDoubleEliminationGames,
  generateRoundRobinGames,
  generateSingleEliminationGames,
} from '../utils/competitionEngine';

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
      primary: '#2563eb', // Blue-600
      secondary: '#1d4ed8',
      accent: '#60a5fa',
      bgBadge: 'bg-blue-950/70',
      textBadge: 'text-blue-400',
      border: 'border-blue-500/30',
      ring: 'ring-blue-500/30',
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
      primary: '#10b981', // Emerald-500
      secondary: '#059669',
      accent: '#34d399',
      bgBadge: 'bg-emerald-950/70',
      textBadge: 'text-emerald-400',
      border: 'border-emerald-500/30',
      ring: 'ring-emerald-500/30',
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
      primary: '#06b6d4', // Cyan-500
      secondary: '#0891b2',
      accent: '#22d3ee',
      bgBadge: 'bg-cyan-950/70',
      textBadge: 'text-cyan-400',
      border: 'border-cyan-500/30',
      ring: 'ring-cyan-500/30',
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
      primary: '#f59e0b', // Amber-500
      secondary: '#d97706',
      accent: '#fbbf24',
      bgBadge: 'bg-amber-950/70',
      textBadge: 'text-amber-400',
      border: 'border-amber-500/30',
      ring: 'ring-amber-500/30',
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

// Rich demonstration events representing actual Palakasan schedule and official results
export const INITIAL_EVENTS: PalakasanEvent[] = [
  // 1. Completed Event: Basketball - Women
  {
    id: 'ev-sports-01',
    eventName: 'Basketball – Women',
    category: 'sports',
    eventType: 'Head-to-Head / Match',
    competitionFormat: 'double-elimination',
    championCollegeId: 'CBIT',
    date: '2026-09-15',
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    venue: 'Basketball Court',
    description: 'Championship bracket for Women\'s Basketball tournament.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Championship Finals',
    status: 'completed',
    resultStatus: 'official',
    declaredAt: '2026-09-15 10:00 AM',
    declaredBy: 'MSUN Sports Committee',
    results: [
      { collegeId: 'CBIT', placement: '1st', points: 50 },
      { collegeId: 'CESS-IDS', placement: '2nd', points: 40 },
      { collegeId: 'CFMS', placement: '3rd', points: 30 },
      { collegeId: 'CELS', placement: 'DQ', points: 0, note: 'Late team reporting / roster infraction' },
    ],
    games: [
      {
        id: 'ev-sports-01-g1',
        eventId: 'ev-sports-01',
        gameNumber: 1,
        roundName: 'Winners Bracket — Round 1',
        stage: 'winners',
        participantA: { collegeId: 'CBIT', losses: 0 },
        participantB: { collegeId: 'CESS-IDS', losses: 0 },
        scoreA: 64,
        scoreB: 58,
        winnerCollegeId: 'CBIT',
        loserCollegeId: 'CESS-IDS',
        status: 'completed',
        date: '2026-09-15',
        startTime: '08:00 AM',
        endTime: '09:00 AM',
        venue: 'Basketball Court',
        isUnlocked: true,
      },
      {
        id: 'ev-sports-01-g2',
        eventId: 'ev-sports-01',
        gameNumber: 2,
        roundName: 'Winners Bracket — Round 1',
        stage: 'winners',
        participantA: { collegeId: 'CFMS', losses: 0 },
        participantB: { collegeId: 'CELS', losses: 0 },
        scoreA: 52,
        scoreB: 48,
        winnerCollegeId: 'CFMS',
        loserCollegeId: 'CELS',
        status: 'completed',
        date: '2026-09-15',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        venue: 'Basketball Court',
        isUnlocked: true,
      },
      {
        id: 'ev-sports-01-g3',
        eventId: 'ev-sports-01',
        gameNumber: 3,
        roundName: 'Winners Bracket Final',
        stage: 'winners',
        participantA: { collegeId: 'CBIT', losses: 0 },
        participantB: { collegeId: 'CFMS', losses: 0 },
        scoreA: 70,
        scoreB: 61,
        winnerCollegeId: 'CBIT',
        loserCollegeId: 'CFMS',
        status: 'completed',
        date: '2026-09-15',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
        venue: 'Basketball Court',
        isUnlocked: true,
      },
      {
        id: 'ev-sports-01-g4',
        eventId: 'ev-sports-01',
        gameNumber: 4,
        roundName: 'Losers Bracket — Round 1',
        stage: 'losers',
        participantA: { collegeId: 'CESS-IDS', losses: 1 },
        participantB: { collegeId: 'CELS', losses: 1 },
        scoreA: 59,
        scoreB: 45,
        winnerCollegeId: 'CESS-IDS',
        loserCollegeId: 'CELS',
        status: 'completed',
        date: '2026-09-15',
        startTime: '11:30 AM',
        endTime: '12:30 PM',
        venue: 'Basketball Court',
        isUnlocked: true,
      },
      {
        id: 'ev-sports-01-g5',
        eventId: 'ev-sports-01',
        gameNumber: 5,
        roundName: 'Losers Bracket Final (3rd Place Decider)',
        stage: 'losers',
        participantA: { collegeId: 'CESS-IDS', losses: 1 },
        participantB: { collegeId: 'CFMS', losses: 1 },
        scoreA: 68,
        scoreB: 63,
        winnerCollegeId: 'CESS-IDS',
        loserCollegeId: 'CFMS',
        status: 'completed',
        date: '2026-09-15',
        startTime: '01:30 PM',
        endTime: '02:30 PM',
        venue: 'Basketball Court',
        isUnlocked: true,
      },
      {
        id: 'ev-sports-01-g6',
        eventId: 'ev-sports-01',
        gameNumber: 6,
        roundName: 'Championship Grand Final',
        stage: 'championship',
        participantA: { collegeId: 'CBIT', losses: 0 },
        participantB: { collegeId: 'CESS-IDS', losses: 1 },
        scoreA: 75,
        scoreB: 69,
        winnerCollegeId: 'CBIT',
        loserCollegeId: 'CESS-IDS',
        status: 'completed',
        date: '2026-09-15',
        startTime: '03:00 PM',
        endTime: '04:15 PM',
        venue: 'Basketball Court',
        isUnlocked: true,
      },
    ],
  },

  // 2. Completed Event: Hiphop Dance
  {
    id: 'ev-cultural-01',
    eventName: 'Hiphop Dance Competition',
    category: 'cultural',
    eventType: 'Group Performance',
    date: '2026-09-15',
    startTime: '07:00 PM',
    endTime: '09:00 PM',
    venue: 'TSAC',
    description: 'Group choreography competition highlighting urban rhythms, stunts, and street dance culture.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Open Group Showdown',
    status: 'completed',
    resultStatus: 'official',
    declaredAt: '2026-09-15 09:30 PM',
    declaredBy: 'Cultural Affairs Jury',
    results: [
      { collegeId: 'CESS-IDS', placement: '1st', points: 50 },
      { collegeId: 'CBIT', placement: '2nd', points: 40 },
      { collegeId: 'CELS', placement: '3rd', points: 30 },
      { collegeId: 'CFMS', placement: 'DQ', points: 0, note: 'Exceeded allotted routine duration limit' },
    ],
  },

  // 3. Completed Event: Balak Performance
  {
    id: 'ev-literary-01',
    eventName: 'Balak Performance',
    category: 'literary',
    eventType: 'Individual',
    date: '2026-09-15',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    venue: 'MSUN Function Hall',
    description: 'Traditional Bisaya poetic oratory celebrating regional identity, history, and values.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Solo Oratory Division',
    status: 'completed',
    resultStatus: 'official',
    declaredAt: '2026-09-15 12:00 PM',
    declaredBy: 'Literary Board of Judges',
    results: [
      { collegeId: 'CBIT', placement: '1st', points: 50 },
      { collegeId: 'CFMS', placement: '2nd', points: 40 },
      { collegeId: 'CESS-IDS', placement: '3rd', points: 30 },
      { collegeId: 'CELS', placement: '4th', points: 20 },
    ],
  },

  // 4. Completed Event: Tough Model
  {
    id: 'ev-special-01',
    eventName: 'Tough Model Competition',
    category: 'special',
    pointTier: 'special',
    eventType: 'Individual',
    date: '2026-09-15',
    startTime: '01:00 PM',
    endTime: '04:00 PM',
    venue: 'MSUN Bandstand',
    description: 'Physical fitness, charisma, poise, and athletic physique runway showcase.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'College Representatives',
    status: 'completed',
    resultStatus: 'official',
    declaredAt: '2026-09-15 04:45 PM',
    declaredBy: 'Special Events Board',
    results: [
      { collegeId: 'CBIT', placement: '1st', points: 60 },
      { collegeId: 'CESS-IDS', placement: '2nd', points: 45 },
      { collegeId: 'CFMS', placement: '3rd', points: 30 },
      { collegeId: 'CELS', placement: 'DQ', points: 0, note: 'Missed mandatory preliminary weigh-in' },
    ],
  },

  // 5. Completed Event: Volleyball – Men
  {
    id: 'ev-sports-02',
    eventName: 'Volleyball – Men',
    category: 'sports',
    eventType: 'Team',
    date: '2026-09-15',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    venue: 'MSUN Gymnasium',
    description: 'Men\'s Volleyball placement tournament and medal matches.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Tournament Finals',
    status: 'completed',
    resultStatus: 'official',
    declaredAt: '2026-09-15 05:00 PM',
    declaredBy: 'MSUN Sports Committee',
    results: [
      { collegeId: 'CFMS', placement: '1st', points: 50 },
      { collegeId: 'CESS-IDS', placement: '2nd', points: 40 },
      { collegeId: 'CBIT', placement: '3rd', points: 30 },
      { collegeId: 'CELS', placement: '4th', points: 20 },
    ],
  },

  // 6. Ongoing Event: Basketball - Men (Live Tournament)
  {
    id: 'ev-sports-03',
    eventName: 'Basketball – Men Tournament',
    category: 'sports',
    eventType: 'Head-to-Head / Match',
    competitionFormat: 'double-elimination',
    date: '2026-09-16',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    venue: 'Basketball Court',
    description: 'Official Double Elimination Championship tournament for Men\'s Basketball across all four constituent colleges.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Double Elimination Championship',
    status: 'ongoing',
    resultStatus: 'pending',
    games: (() => {
      const g = generateDoubleEliminationGames(
        'ev-sports-03',
        ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
        '2026-09-16',
        'Basketball Court',
        '10:00 AM'
      );
      if (g[0]) g[0].status = 'ongoing';
      return g;
    })(),
  },

  // 7. Upcoming: Extemporaneous Speech
  {
    id: 'ev-literary-02',
    eventName: 'Extemporaneous Speech',
    category: 'literary',
    eventType: 'Individual',
    competitionFormat: 'individual',
    date: '2026-09-16',
    startTime: '01:30 PM',
    endTime: '03:00 PM',
    venue: 'MSUN Function Hall',
    description: 'Spontaneous oration on contemporary national socioeconomic and environmental issues with 5-minute prep time.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Four-Way Speech Duel',
    status: 'upcoming',
    resultStatus: 'pending',
  },

  // 8. Upcoming: Badminton – Mixed Doubles
  {
    id: 'ev-sports-04',
    eventName: 'Badminton – Mixed Doubles',
    category: 'sports',
    eventType: 'Team',
    competitionFormat: 'single-elimination',
    date: '2026-09-16',
    startTime: '03:30 PM',
    endTime: '06:00 PM',
    venue: 'Badminton Complex',
    description: 'Single-elimination mixed doubles racquet tournament featuring semifinal knockout matches and medal finals.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Semifinals & Medal Finals',
    status: 'upcoming',
    resultStatus: 'pending',
    games: generateSingleEliminationGames(
      'ev-sports-04',
      ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
      '2026-09-16',
      'Badminton Complex',
      '03:30 PM'
    ),
  },

  // 8b. Upcoming: Volleyball – Women (Round Robin)
  {
    id: 'ev-sports-06',
    eventName: 'Volleyball – Women Round Robin',
    category: 'sports',
    eventType: 'Team',
    competitionFormat: 'round-robin',
    tieBreakerRule: 'competition-points',
    date: '2026-09-17',
    startTime: '08:00 AM',
    endTime: '04:00 PM',
    venue: 'MSUN Gymnasium',
    description: 'Single Round Robin series for Women\'s Volleyball with 6 official matches and live standing computation.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Round Robin Group Series',
    status: 'upcoming',
    resultStatus: 'pending',
    games: generateRoundRobinGames(
      'ev-sports-06',
      ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
      '2026-09-17',
      'MSUN Gymnasium',
      '08:00 AM'
    ),
  },

  // 9. Upcoming: Vocal Solo Showdown
  {
    id: 'ev-cultural-02',
    eventName: 'Vocal Solo Showdown',
    category: 'cultural',
    eventType: 'Individual',
    date: '2026-09-16',
    startTime: '06:00 PM',
    endTime: '08:00 PM',
    venue: 'MSUN Bandstand',
    description: 'Solo ballad and OPM vocal competition judged on tonal quality, pitch accuracy, stage presence, and interpretation.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Inter-College Vocal Fest',
    status: 'upcoming',
    resultStatus: 'pending',
  },

  // 10. Upcoming: Table Tennis – Men
  {
    id: 'ev-sports-05',
    eventName: 'Table Tennis – Men\'s Singles',
    category: 'sports',
    eventType: 'Individual',
    date: '2026-09-17',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    venue: 'MSUN Gymnasium',
    description: 'Fast-paced ping pong round-robin preliminary bouts.',
    participatingColleges: ['CBIT', 'CELS'],
    matchup: 'CBIT vs CELS',
    status: 'upcoming',
    resultStatus: 'pending',
  },

  // 11. Upcoming: Essay Writing Contest
  {
    id: 'ev-literary-03',
    eventName: 'Essay Writing Contest (English & Filipino)',
    category: 'literary',
    eventType: 'Individual',
    date: '2026-09-17',
    startTime: '01:00 PM',
    endTime: '03:00 PM',
    venue: 'MSUN Function Hall',
    description: 'On-the-spot expository essay writing focusing on sustainable development and academic stewardship.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Open Division',
    status: 'upcoming',
    resultStatus: 'pending',
  },

  // 12. Upcoming: Mr. & Ms. Palakasan Coronation Night
  {
    id: 'ev-special-02',
    eventName: 'Mr. & Ms. Palakasan Coronation Night',
    category: 'special',
    pointTier: 'special',
    eventType: 'Group Performance',
    date: '2026-09-17',
    startTime: '07:00 PM',
    endTime: '11:00 PM',
    venue: 'TSAC',
    description: 'Grand university coronation night honoring poise, intelligence, advocacy, and campus representation.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'All Colleges Showcase',
    status: 'upcoming',
    resultStatus: 'pending',
  },

  // 13. Upcoming: University Cheerdance & Field Demonstration Spectacular
  {
    id: 'ev-special-03',
    eventName: 'Cheerdance Spectacular & Field Demo',
    category: 'special',
    pointTier: 'special',
    eventType: 'Group Performance',
    date: '2026-09-18',
    startTime: '02:00 PM',
    endTime: '05:30 PM',
    venue: 'TSAC',
    description: 'Premier university-wide cheerdance spectacle, stunt routines, formations, and collegiate spirit showdown.',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: 'Championship Showcase',
    status: 'upcoming',
    resultStatus: 'pending',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    action: 'Declared Official Result',
    eventTitle: 'Volleyball – Men',
    eventId: 'ev-sports-02',
    date: '2026-09-15',
    time: '05:00 PM',
    adminUser: 'MSUN Sports Committee',
    description: 'Official results certified: CFMS 1st (50 pts), CESS-IDS 2nd (40 pts), CBIT 3rd (30 pts), CELS 4th (20 pts).',
    timestamp: 1726419600000,
  },
  {
    id: 'log-2',
    action: 'Declared Official Result',
    eventTitle: 'Tough Model Competition',
    eventId: 'ev-special-01',
    date: '2026-09-15',
    time: '04:45 PM',
    adminUser: 'Special Events Board',
    description: 'Official results certified: CBIT 1st (50 pts), CESS-IDS 2nd (40 pts), CFMS 3rd (30 pts), CELS DQ (0 pts).',
    timestamp: 1726418700000,
  },
  {
    id: 'log-3',
    action: 'Declared Official Result',
    eventTitle: 'Balak Performance',
    eventId: 'ev-literary-01',
    date: '2026-09-15',
    time: '12:00 PM',
    adminUser: 'Literary Board of Judges',
    description: 'Official results certified: CBIT 1st (50 pts), CFMS 2nd (40 pts), CESS-IDS 3rd (30 pts), CELS 4th (20 pts).',
    timestamp: 1726401600000,
  },
  {
    id: 'log-4',
    action: 'Declared Official Result',
    eventTitle: 'Basketball – Women',
    eventId: 'ev-sports-01',
    date: '2026-09-15',
    time: '10:00 AM',
    adminUser: 'MSUN Sports Committee',
    description: 'Official results certified: CBIT 1st (50 pts), CESS-IDS 2nd (40 pts), CFMS 3rd (30 pts), CELS DQ (0 pts).',
    timestamp: 1726394400000,
  },
  {
    id: 'log-5',
    action: 'Approved Tournament Schedule',
    date: '2026-09-14',
    time: '08:00 AM',
    adminUser: 'Tournament Director',
    description: 'Official master timetable verified and published for 4 participating colleges.',
    timestamp: 1726272000000,
  },
];
