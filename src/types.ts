export type CategoryId = 'sports' | 'cultural' | 'literary' | 'special' | (string & {});

export type CollegeId = 'CBIT' | 'CESS-IDS' | 'CFMS' | 'CELS' | (string & {});

export type Placement = '1st' | '2nd' | '3rd' | '4th' | 'DQ';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';

export type ResultStatus = 'pending' | 'draft' | 'official';

export type PalakasanStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'archived';

export interface PalakasanTheme {
  title: string;
  tagline: string;
  logo?: string;
  banner?: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export type DisciplinePlacement = '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | 'DQ';

export interface DisciplinePointsConfig {
  '1st': number;
  '2nd': number;
  '3rd': number;
  '4th': number;
  '5th': number;
  '6th': number;
  DQ: number;
}

export interface ScoringRulesConfig {
  majorPoints: Record<Placement, number>;
  minorPoints: Record<Placement, number>;
  specialPoints?: Record<Placement, number>;
  disciplinePoints?: DisciplinePointsConfig;
}

export type PointTier = 'major' | 'minor' | 'special';

export interface RankingsVisibilityConfig {
  hideAllRankings: boolean; // Master toggle: Final Day Thrill / Blackout Mode
  hideOverallStandings: boolean; // Hide Overall University Standings from public
  hideEventResults: boolean; // Hide individual event winners/placements from public
  hideCategoryRankings: Record<string, boolean>; // e.g. { sports: boolean, cultural: boolean, literary: boolean, special: boolean }
  thrillMessage?: string;
  adminSpectatorPreview?: boolean; // When true, admin previews the public hidden view
}

export interface PalakasanEdition {
  id: string;
  name: string;
  year: number;
  description: string;
  startDate: string;
  endDate: string;
  status: PalakasanStatus;
  isCurrent: boolean;
  theme: PalakasanTheme;
  participatingColleges: CollegeId[];
  eventCategories: CategoryId[];
  scoringRules: ScoringRulesConfig;
  competitionRules: {
    availableFormats: CompetitionFormat[];
    tieBreakers: TieBreakerRule[];
  };
  rankingsVisibility?: RankingsVisibilityConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  status: 'active' | 'maintenance' | 'disabled';
  createdAt?: string;
}

export interface PointTransaction {
  id: string;
  palakasanId: string;
  collegeId: CollegeId;
  eventId: string;
  eventName: string;
  category: CategoryId | 'overall' | 'general';
  eventType: 'Major' | 'Minor' | 'Special' | 'Deduction' | 'Penalty' | string;
  finalRank?: Placement | string;
  pointsAwarded: number; // Positive for awards (e.g. +50), negative for deductions/penalties (e.g. -10)
  dateAwarded: string;
  declaredBy: string;
  status: 'official' | 'revoked';
  reason?: string; // Reason or grievance justification
  grievanceResolutionId?: string; // Optional resolution number
  deductionScope?: 'overall' | CategoryId; // Whether deducted from overall or specific category
}

export type EventType =
  | 'Individual'
  | 'Team'
  | 'Head-to-Head / Match'
  | 'Group Performance';

export interface College {
  id: CollegeId;
  name: string;
  acronym: CollegeId;
  shortName: string;
  tagline: string;
  color: {
    primary: string;
    secondary: string;
    accent: string;
    bgBadge: string;
    textBadge: string;
    border: string;
    ring: string;
  };
  mascot?: string;
  moniker?: string;
  description: string;
  logo?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  examples: string[];
  displayOrder?: number;
  status?: 'active' | 'inactive';
}

export interface EventResultItem {
  collegeId: CollegeId;
  placement: Placement;
  points: number; // 50 for 1st, 40 for 2nd, 30 for 3rd, 20 for 4th, 0 for DQ
  note?: string;
}

export type CompetitionFormat =
  | 'double-elimination'
  | 'round-robin'
  | 'single-elimination'
  | 'individual'
  | 'head-to-head'
  | 'custom';

export type TieBreakerRule =
  | 'competition-points'
  | 'head-to-head'
  | 'score-difference'
  | 'total-score';

export type GameStatus =
  | 'scheduled'
  | 'ongoing'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export interface GameParticipant {
  collegeId?: CollegeId;
  name?: string; // For individual athletes
  placeholderText?: string; // e.g. "Winner Game 1", "Loser Game 3"
  losses?: number;
  seed?: number;
}

export interface GameMatch {
  id: string;
  eventId: string;
  gameNumber: number;
  roundName: string;
  stage:
    | 'winners'
    | 'losers'
    | 'championship'
    | 'reset'
    | 'round-robin'
    | 'semifinal'
    | 'final'
    | 'consolation'
    | 'quarterfinal';
  participantA: GameParticipant;
  participantB: GameParticipant;
  collegeA?: CollegeId;
  collegeB?: CollegeId;
  sourceDescriptionA?: string;
  sourceDescriptionB?: string;
  scoreA?: number;
  scoreB?: number;
  winnerCollegeId?: CollegeId;
  winnerName?: string;
  loserCollegeId?: CollegeId;
  loserName?: string;
  isDraw?: boolean;
  status: GameStatus;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  notes?: string;
  completedAt?: string;
  isResetGame?: boolean;
  isUnlocked?: boolean; // Whether both participants are resolved
}

export interface RoundRobinTeamStats {
  collegeId: CollegeId;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  competitionPoints: number; // 3 for win, 1 for draw, 0 for loss
  scoreFor: number;
  scoreAgainst: number;
  scoreDiff: number;
  won?: number;
  lost?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  pointDifference?: number;
  rank?: number;
}

export interface EliminatedCollege {
  collegeId: CollegeId;
  losses: number;
  eliminatedAtGameNumber: number;
  stageName: string;
  lockedPlacement?: Placement;
}

export interface SubCategoryDiscipline {
  id: string;
  name: string;
  results?: {
    collegeId: CollegeId;
    placement: DisciplinePlacement;
    points: number;
  }[];
}

export interface PalakasanEvent {
  id: string;
  palakasanId?: string; // Reference to PalakasanEdition
  eventName: string;
  category: CategoryId;
  pointTier?: PointTier; // 'major' | 'minor' | 'special'
  isMajor?: boolean; // Major Event (true) vs Minor Event (false)
  isMultiCategoryEvent?: boolean; // e.g. Arnis, Swimming with accumulated category points
  subCategories?: SubCategoryDiscipline[];
  accumulatedScores?: Record<CollegeId, number>;
  hasCustomScoring?: boolean;
  customPoints?: Record<Placement, number>;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:00 AM"
  venue: string; // e.g. "Basketball Court", "TSAC"
  description: string;
  eventType?: EventType;
  competitionFormat?: CompetitionFormat;
  tieBreakerRule?: TieBreakerRule;
  allowDraws?: boolean;
  participatingColleges: CollegeId[];
  participationStatus?: Record<string, 'registered' | 'participating' | 'withdrawn' | 'dq' | 'eliminated' | 'completed'>;
  matchup?: string; // e.g. "CBIT vs CESS-IDS"
  status: EventStatus;
  resultStatus?: ResultStatus;
  results?: EventResultItem[];
  championCollegeId?: CollegeId;
  championName?: string;
  games?: GameMatch[];
  eliminatedColleges?: EliminatedCollege[];
  roundRobinStats?: RoundRobinTeamStats[];
  declaredAt?: string; // Formatted date string
  declaredBy?: string; // Admin user who declared
  cancelledReason?: string;
  postponedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLogItem {
  id: string;
  palakasanId?: string;
  action: string;
  eventTitle?: string;
  eventId?: string;
  date: string;
  time: string;
  adminUser: string;
  description: string;
  timestamp: number;
}

export interface CollegeCategoryScore {
  categoryId: CategoryId;
  points: number;
  rank: number;
  eventsPlayed: number;
  breakdown: {
    eventId: string;
    eventName: string;
    placement: Placement;
    points: number;
    date: string;
    venue: string;
  }[];
}

export interface CollegeStanding {
  college: College;
  sports: number;
  cultural: number;
  literary: number;
  special: number;
  deductions?: number; // Total points deducted due to grievances / infractions
  overallPoints: number;
  rank: number;
  isTie?: boolean;
}

export interface CategoryStanding {
  categoryId: CategoryId;
  categoryName: string;
  standings: {
    college: College;
    points: number;
    rank: number;
    eventsCompleted: number;
  }[];
}

export type NavigationTab = 
  | 'home' 
  | 'overall' 
  | 'sports' 
  | 'cultural' 
  | 'literary' 
  | 'special' 
  | 'schedule' 
  | 'results' 
  | 'about' 
  | 'admin';

export type AdminSection =
  | 'dashboard'
  | 'palakasans'
  | 'events'
  | 'competitions'
  | 'schedule'
  | 'event-detail'
  | 'results'
  | 'standings'
  | 'transactions'
  | 'colleges'
  | 'categories'
  | 'venues'
  | 'scoring'
  | 'activity-log'
  | 'history'
  | 'settings';

export type CommitteeRole =
  | 'admin'
  | 'literary_head'
  | 'cultural_head'
  | 'special_head'
  | 'sports_head';

export interface CommitteeAccount {
  id: string;
  role: CommitteeRole;
  name: string;
  title: string;
  department: string;
  passcode: string;
  category?: CategoryId;
  badge: string;
  avatarInitials: string;
  avatarColor: string;
  badgeColor: string;
  iconName: string;
  description: string;
}

