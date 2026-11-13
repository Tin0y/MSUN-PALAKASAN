import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ActivityLogItem,
  Category,
  CategoryId,
  College,
  CollegeCategoryScore,
  CollegeId,
  CollegeStanding,
  CompetitionFormat,
  EventResultItem,
  EventStatus,
  GameMatch,
  GameStatus,
  PalakasanEdition,
  PalakasanEvent,
  Placement,
  PointTransaction,
  ResultStatus,
  Venue,
  CommitteeAccount,
  RankingsVisibilityConfig,
} from '../types';
import {
  COMMITTEE_ACCOUNTS,
  findCommitteeAccountByPasscode,
  getCommitteeAccountById,
} from '../data/committeeAccounts';
import {
  DEFAULT_PALAKASAN_2026,
  DEFAULT_PALAKASAN_2025,
  INITIAL_VENUES,
  initializeFirestoreDatabase,
  subscribeToPalakasans,
  subscribeToColleges,
  subscribeToCategories,
  subscribeToVenues,
  subscribeToEvents,
  subscribeToPointTransactions,
  subscribeToActivityLogs,
  createPalakasanEdition,
  updatePalakasanEdition,
  setActivePalakasan,
  deletePalakasanEdition as deletePalakasanDoc,
  wipeAllTournamentsData,
  saveCollege,
  updateCollegeStatus,
  saveCategory,
  saveVenue,
  deleteVenue as removeVenueDoc,
  checkVenueConflict,
  saveEvent,
  saveEventsBatch,
  removeEvent,
  certifyEventResult,
  revokeEventResult,
  addDatabaseLog,
  resetDatabaseToDefaults,
  clearTournamentPointHistory,
  clearAllActivityLogs as clearAllActivityLogsFirestore,
  deletePointTransaction,
  recordGrievancePointDeduction,
} from '../services/firestoreService';
import {
  calculateRoundRobinStandings,
  generateDoubleEliminationGames,
  generateRoundRobinGames,
  generateSingleEliminationGames,
  processDoubleEliminationGameResult,
  processSingleEliminationGameResult,
} from '../utils/competitionEngine';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '../lib/firebase';
import { COLLEGES as FALLBACK_COLLEGES, CATEGORIES as FALLBACK_CATEGORIES, INITIAL_EVENTS as FALLBACK_EVENTS } from '../data/initialData';

export interface EventStatsSummary {
  totalColleges: number;
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  eventsAwaitingFinalResults: number;
  pendingResultsEvents: number;
  declaredWinnersEvents: number;
  totalGames: number;
  gamesOngoing: number;
  gamesAwaitingResults: number;
  gamesCompleted: number;
  overallLeader: CollegeStanding | null;
}

export interface CollegeAdminStat {
  college: College;
  totalPoints: number;
  sports: number;
  cultural: number;
  literary: number;
  special: number;
  eventsParticipated: number;
  winsCount: number;
  dqsCount: number;
  rank: number;
}

interface PalakasanContextType {
  // Palakasan Edition Management
  currentPalakasan: PalakasanEdition | null;
  allPalakasans: PalakasanEdition[];
  viewedPalakasanId: string;
  setViewedPalakasanId: (id: string) => void;
  createPalakasan: (
    edition: PalakasanEdition,
    initialEvents?: Omit<PalakasanEvent, 'id' | 'palakasanId'>[]
  ) => Promise<void>;
  updatePalakasan: (id: string, updates: Partial<PalakasanEdition>) => Promise<void>;
  switchActivePalakasan: (id: string) => Promise<void>;
  deletePalakasan: (id: string) => Promise<void>;
  wipeAllPalakasanData: () => Promise<void>;

  // Core collections
  events: PalakasanEvent[];
  colleges: College[];
  categories: Category[];
  venues: Venue[];
  pointTransactions: PointTransaction[];
  activityLogs: ActivityLogItem[];
  overallStandings: CollegeStanding[];

  // Standings & Stats queries
  getCategoryStandings: (categoryId: CategoryId) => {
    college: College;
    points: number;
    rank: number;
    eventsCompleted: number;
    isTie?: boolean;
  }[];
  getCategoryLeader: (categoryId: CategoryId) => {
    college: College;
    points: number;
    rank: number;
  } | null;
  getOverallLeader: () => CollegeStanding | null;
  getCollegeHistory: (collegeId: CollegeId) => {
    college: College;
    categories: Record<CategoryId, CollegeCategoryScore>;
    overallTotal: number;
    overallRank: number;
  };
  getHappeningNowEvent: () => PalakasanEvent | null;
  getNextUpcomingEvent: () => PalakasanEvent | null;
  getRecentResults: (limit?: number) => PalakasanEvent[];
  getEventStats: () => EventStatsSummary;
  getCollegeStats: (collegeId: CollegeId) => CollegeAdminStat;
  getAllCollegesStats: () => CollegeAdminStat[];

  // Event CRUD & Operations
  addEvent: (event: Omit<PalakasanEvent, 'id'>, adminUser?: string) => Promise<string>;
  updateEvent: (id: string, event: Partial<PalakasanEvent>, adminUser?: string) => Promise<void>;
  deleteEvent: (id: string, adminUser?: string) => Promise<void>;
  rescheduleEvent: (id: string, date: string, startTime: string, endTime: string, adminUser?: string) => Promise<void>;
  changeVenue: (id: string, venue: string, adminUser?: string) => Promise<void>;
  changeParticipants: (id: string, participatingColleges: CollegeId[], adminUser?: string) => Promise<void>;
  startOngoingEvent: (id: string, adminUser?: string) => Promise<void>;
  markEventCompleted: (id: string, force?: boolean, adminUser?: string) => Promise<{ success: boolean; error?: string }>;
  cancelEvent: (id: string, reason?: string, adminUser?: string) => Promise<void>;
  postponeEvent: (id: string, newDateInfo?: string, adminUser?: string) => Promise<void>;

  // Competition & Match management
  recordGameResult: (
    eventId: string,
    gameId: string,
    scoreA: number,
    scoreB: number,
    winnerCollegeId: CollegeId,
    loserCollegeId: CollegeId,
    adminUser?: string
  ) => Promise<{ success: boolean; error?: string }>;
  editGameResult: (
    eventId: string,
    gameId: string,
    scoreA: number,
    scoreB: number,
    winnerCollegeId: CollegeId,
    loserCollegeId: CollegeId,
    reason?: string,
    adminUser?: string
  ) => Promise<{ success: boolean; error?: string }>;
  rescheduleGame: (
    eventId: string,
    gameId: string,
    date: string,
    startTime: string,
    endTime: string,
    venue?: string,
    adminUser?: string
  ) => Promise<{ success: boolean; error?: string }>;
  generateEventMatches: (
    eventId: string,
    format: CompetitionFormat,
    adminUser?: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Official Results Certification & Scoring
  saveDraftResults: (eventId: string, results: EventResultItem[], adminUser?: string) => Promise<{ success: boolean; error?: string }>;
  declareOfficialResults: (eventId: string, results: EventResultItem[], adminUser?: string) => Promise<{ success: boolean; error?: string }>;
  editOfficialResult: (eventId: string, results: EventResultItem[], reason?: string, adminUser?: string) => Promise<{ success: boolean; error?: string }>;
  reopenOfficialResult: (eventId: string, reason?: string, adminUser?: string) => Promise<{ success: boolean; error?: string }>;
  recordEventResults: (eventId: string, results: EventResultItem[]) => Promise<{ success: boolean; error?: string }>;

  // College & Category & Venue mutations
  addCollege: (college: College) => Promise<void>;
  updateCollege: (id: string, updates: Partial<College>) => Promise<void>;
  toggleCollegeStatus: (id: string, status: 'active' | 'inactive') => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  addVenue: (venue: Venue) => Promise<void>;
  updateVenue: (id: string, updates: Partial<Venue>) => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;
  verifyVenueConflict: (venue: string, date: string, startTime: string, endTime: string, excludeEventId?: string) => { hasConflict: boolean; conflictingEvent?: PalakasanEvent };

  // Activity Logs & Audit
  addActivityLog: (log: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
  clearActivityLogs: () => void;
  clearActivityAuditLogs: () => Promise<void>;

  // Data Reset & Tournament Lifecycle Controls
  resetToDefaultData: () => Promise<void>;
  clearPointHistory: () => Promise<void>;
  deletePointTransactionById: (txId: string) => Promise<void>;

  // Grievance / Disciplinary Point Deductions
  applyGrievanceDeduction: (params: {
    collegeId: CollegeId;
    pointsToDeduct: number;
    reason: string;
    scope: 'overall' | CategoryId;
    eventId?: string;
    eventName?: string;
    resolutionId?: string;
    adminUser?: string;
  }) => Promise<PointTransaction>;

  // Selected state for modals
  selectedCollegeId: CollegeId | null;
  setSelectedCollegeId: (id: CollegeId | null) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  // Auth & Admin state
  isAdminLoggedIn: boolean;
  currentUser: User | null;
  currentAccount: CommitteeAccount | null;
  committeeAccounts: CommitteeAccount[];
  loginAdmin: (passcode: string) => boolean;
  loginWithGoogle: () => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  adminUserDisplay: string;

  // Simulation mode
  simulatedTimeMode: boolean;
  setSimulatedTimeMode: (enabled: boolean) => void;

  // Final Day Thrill / Rankings Visibility Controls
  rankingsVisibility: RankingsVisibilityConfig;
  updateRankingsVisibility: (updates: Partial<RankingsVisibilityConfig>) => Promise<void>;
  isRankingHidden: (scope: 'overall' | CategoryId | 'events') => boolean;
  adminSpectatorPreview: boolean;
  setAdminSpectatorPreview: (preview: boolean) => void;
}

const PalakasanContext = createContext<PalakasanContextType | undefined>(undefined);

export const PalakasanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Palakasan editions
  const [allPalakasans, setAllPalakasans] = useState<PalakasanEdition[]>([]);
  const [viewedPalakasanId, setViewedPalakasanId] = useState<string>('');

  // Core entities from Firestore
  const [colleges, setColleges] = useState<College[]>(FALLBACK_COLLEGES);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [events, setEvents] = useState<PalakasanEvent[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentAccount, setCurrentAccount] = useState<CommitteeAccount | null>(() => {
    const savedAccountId = localStorage.getItem('msun_palakasan_account_id');
    if (savedAccountId) {
      const found = getCommitteeAccountById(savedAccountId);
      if (found) return found;
    }
    if (localStorage.getItem('msun_palakasan_admin_session') === 'true') {
      return COMMITTEE_ACCOUNTS[0];
    }
    return null;
  });
  const [isPasscodeAdmin, setIsPasscodeAdmin] = useState<boolean>(() => {
    return (
      localStorage.getItem('msun_palakasan_admin_session') === 'true' ||
      !!localStorage.getItem('msun_palakasan_account_id')
    );
  });

  // Modal inspection states
  const [selectedCollegeId, setSelectedCollegeId] = useState<CollegeId | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [simulatedTimeMode, setSimulatedTimeMode] = useState<boolean>(true);

  // Initialize Firestore on mount
  useEffect(() => {
    initializeFirestoreDatabase().catch(err => {
      console.warn('Firestore initialization error:', err);
    });
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Palakasan Editions
  useEffect(() => {
    const unsub = subscribeToPalakasans(editions => {
      setAllPalakasans(editions);
      if (editions.length > 0) {
        const active = editions.find(e => e.isCurrent) || editions[0];
        if (!viewedPalakasanId || !editions.some(e => e.id === viewedPalakasanId)) {
          setViewedPalakasanId(active.id);
        }
      } else {
        setViewedPalakasanId('');
      }
    });
    return () => unsub();
  }, [viewedPalakasanId]);

  // Subscribe to Colleges
  useEffect(() => {
    const unsub = subscribeToColleges(list => {
      if (list.length > 0) setColleges(list);
    });
    return () => unsub();
  }, []);

  // Subscribe to Categories
  useEffect(() => {
    const unsub = subscribeToCategories(list => {
      if (list.length > 0) setCategories(list);
    });
    return () => unsub();
  }, []);

  // Subscribe to Venues
  useEffect(() => {
    const unsub = subscribeToVenues(list => {
      if (list.length > 0) setVenues(list);
    });
    return () => unsub();
  }, []);

  // Subscribe to Events for viewed Palakasan
  useEffect(() => {
    if (!viewedPalakasanId) {
      setEvents([]);
      return;
    }
    const unsub = subscribeToEvents(viewedPalakasanId, list => {
      setEvents(list);
    });
    return () => unsub();
  }, [viewedPalakasanId]);

  // Subscribe to Point Transactions for viewed Palakasan
  useEffect(() => {
    if (!viewedPalakasanId) {
      setPointTransactions([]);
      return;
    }
    const unsub = subscribeToPointTransactions(viewedPalakasanId, list => {
      setPointTransactions(list);
    });
    return () => unsub();
  }, [viewedPalakasanId]);

  // Subscribe to Activity Logs
  useEffect(() => {
    const unsub = subscribeToActivityLogs(list => {
      setActivityLogs(list);
    });
    return () => unsub();
  }, []);

  // Active / Current Palakasan
  const currentPalakasan = useMemo(() => {
    if (allPalakasans.length === 0) return null;
    const found = allPalakasans.find(e => e.id === viewedPalakasanId) || allPalakasans.find(e => e.isCurrent) || allPalakasans[0];
    return found || null;
  }, [allPalakasans, viewedPalakasanId]);

  // Auth computed status
  const isAdminLoggedIn = !!currentUser || !!currentAccount || isPasscodeAdmin;
  const adminUserDisplay = currentAccount
    ? `${currentAccount.name} (${currentAccount.title})`
    : currentUser?.displayName || currentUser?.email || (isPasscodeAdmin ? 'MSUN Tournament Committee' : 'Official Guest');

  const loginAdmin = (passcode: string): boolean => {
    const cleaned = passcode.trim();
    // Match against official committee accounts
    const account = findCommitteeAccountByPasscode(cleaned);
    if (account) {
      setCurrentAccount(account);
      setIsPasscodeAdmin(true);
      localStorage.setItem('msun_palakasan_admin_session', 'true');
      localStorage.setItem('msun_palakasan_account_id', account.id);
      addDatabaseLog(
        'Committee Sign In',
        `${account.name} (${account.title}) authenticated and logged into the tournament management console.`,
        `${account.name} (${account.title})`,
        undefined,
        undefined,
        viewedPalakasanId
      );
      return true;
    }

    // Graceful backward-compatible fallback for admin
    if (cleaned.toLowerCase() === 'admin' || cleaned.toLowerCase() === 'msun2026') {
      const defaultAdmin = COMMITTEE_ACCOUNTS[0];
      setCurrentAccount(defaultAdmin);
      setIsPasscodeAdmin(true);
      localStorage.setItem('msun_palakasan_admin_session', 'true');
      localStorage.setItem('msun_palakasan_account_id', defaultAdmin.id);
      addDatabaseLog(
        'Administrator Sign In',
        'Authorized administrator logged into PALAKASAN committee portal.',
        'MSUN Sports & Cultural Affairs Committee',
        undefined,
        undefined,
        viewedPalakasanId
      );
      return true;
    }

    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setIsPasscodeAdmin(true);
        localStorage.setItem('msun_palakasan_admin_session', 'true');
        addDatabaseLog(
          'Google Administrator Sign In',
          `Google account verified: ${result.user.email || result.user.displayName}`,
          result.user.displayName || result.user.email || 'Google Admin',
          undefined,
          undefined,
          viewedPalakasanId
        );
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Google sign-in popup closed or cancelled:', err);
      return false;
    }
  };

  const logoutAdmin = async () => {
    const userLabel = adminUserDisplay;
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
    setCurrentAccount(null);
    setIsPasscodeAdmin(false);
    localStorage.removeItem('msun_palakasan_admin_session');
    localStorage.removeItem('msun_palakasan_account_id');
    addDatabaseLog(
      'Committee Sign Out',
      `${userLabel} ended session safely.`,
      userLabel,
      undefined,
      undefined,
      viewedPalakasanId
    );
  };

  // -----------------------------------------------------------------
  // FINAL DAY THRILL / RANKINGS VISIBILITY CONTROLS
  // Hides live rankings/standings from public spectators for suspense
  // -----------------------------------------------------------------

  const DEFAULT_RANKINGS_VISIBILITY: RankingsVisibilityConfig = {
    hideAllRankings: false,
    hideOverallStandings: false,
    hideEventResults: false,
    hideCategoryRankings: {
      sports: false,
      cultural: false,
      literary: false,
      special: false,
    },
    thrillMessage:
      'Official tournament rankings are sealed by the Committee for the Final Day Awarding Ceremony! Champions will be unveiled live at the Grand Closing.',
  };

  const [adminSpectatorPreview, setAdminSpectatorPreview] = useState(false);
  const [rankingsVisibilityState, setRankingsVisibilityState] =
    useState<RankingsVisibilityConfig>(DEFAULT_RANKINGS_VISIBILITY);

  useEffect(() => {
    if (currentPalakasan?.rankingsVisibility) {
      setRankingsVisibilityState(prev => ({
        ...prev,
        ...currentPalakasan.rankingsVisibility,
        hideCategoryRankings: {
          ...prev.hideCategoryRankings,
          ...(currentPalakasan.rankingsVisibility?.hideCategoryRankings || {}),
        },
      }));
    }
  }, [currentPalakasan?.rankingsVisibility]);

  const isRankingHidden = (scope: 'overall' | CategoryId | 'events'): boolean => {
    // If logged-in admin is previewing normally (not testing spectator view), let them view real live rankings
    if (isAdminLoggedIn && !adminSpectatorPreview) {
      return false;
    }

    if (rankingsVisibilityState.hideAllRankings) {
      return true;
    }

    if (scope === 'overall') {
      return Boolean(rankingsVisibilityState.hideOverallStandings);
    }

    if (scope === 'events') {
      return Boolean(rankingsVisibilityState.hideEventResults);
    }

    return Boolean(rankingsVisibilityState.hideCategoryRankings?.[scope]);
  };

  const updateRankingsVisibility = async (updates: Partial<RankingsVisibilityConfig>) => {
    const palakasanId = viewedPalakasanId || currentPalakasan?.id || 'palakasan-2026';
    const nextState: RankingsVisibilityConfig = {
      ...rankingsVisibilityState,
      ...updates,
      hideCategoryRankings: {
        ...rankingsVisibilityState.hideCategoryRankings,
        ...(updates.hideCategoryRankings || {}),
      },
    };

    setRankingsVisibilityState(nextState);

    await updatePalakasanEdition(palakasanId, {
      rankingsVisibility: nextState,
    });

    await addDatabaseLog(
      'Updated Rankings Visibility',
      updates.hideAllRankings !== undefined
        ? `Final Day Thrill Mode was ${
            updates.hideAllRankings
              ? 'ACTIVATED (All Rankings & Standings are now sealed and hidden from public spectators)'
              : 'DEACTIVATED (Rankings are now visible to the public)'
          }.`
        : 'Adjusted per-category rankings visibility settings.',
      adminUserDisplay,
      undefined,
      undefined,
      viewedPalakasanId
    );
  };

  // -----------------------------------------------------------------
  // DETERMINISTIC SCORING ENGINE & OVERALL STANDINGS
  // FORMULA: Overall Points = Sports + Cultural + Literary + Special
  // Traceable back to Point Transactions
  // -----------------------------------------------------------------

  const computePointsMap = useMemo(() => {
    const map: Record<
      string,
      {
        sports: number;
        cultural: number;
        literary: number;
        special: number;
        overallDeduction: number;
        totalDeductions: number;
      }
    > = {};

    colleges.forEach(col => {
      map[col.id] = {
        sports: 0,
        cultural: 0,
        literary: 0,
        special: 0,
        overallDeduction: 0,
        totalDeductions: 0,
      };
    });

    // 1. If point transactions exist for this palakasan, compute from official transactions
    if (pointTransactions.length > 0) {
      pointTransactions
        .filter(t => t.status === 'official')
        .forEach(tx => {
          if (!map[tx.collegeId]) {
            map[tx.collegeId] = {
              sports: 0,
              cultural: 0,
              literary: 0,
              special: 0,
              overallDeduction: 0,
              totalDeductions: 0,
            };
          }
          const cat = (tx.category || '').toLowerCase();
          const pts = tx.pointsAwarded;

          // Track penalties/deductions
          if (pts < 0) {
            map[tx.collegeId].totalDeductions += Math.abs(pts);
          }

          if (cat === 'sports') {
            map[tx.collegeId].sports += pts;
          } else if (cat === 'cultural') {
            map[tx.collegeId].cultural += pts;
          } else if (cat === 'literary') {
            map[tx.collegeId].literary += pts;
          } else if (cat === 'special') {
            map[tx.collegeId].special += pts;
          } else {
            // Overall / general grievance deduction
            if (pts < 0) {
              map[tx.collegeId].overallDeduction += Math.abs(pts);
            }
          }
        });
    } else {
      // Fallback: derive directly from completed official events
      events
        .filter(e => e.status === 'completed' && e.resultStatus === 'official' && Array.isArray(e.results))
        .forEach(event => {
          event.results?.forEach(res => {
            if (!map[res.collegeId]) {
              map[res.collegeId] = {
                sports: 0,
                cultural: 0,
                literary: 0,
                special: 0,
                overallDeduction: 0,
                totalDeductions: 0,
              };
            }
            const cat = event.category.toLowerCase();
            if (cat === 'sports') map[res.collegeId].sports += res.points;
            else if (cat === 'cultural') map[res.collegeId].cultural += res.points;
            else if (cat === 'literary') map[res.collegeId].literary += res.points;
            else if (cat === 'special') map[res.collegeId].special += res.points;
          });
        });
    }

    return map;
  }, [colleges, pointTransactions, events]);

  const overallStandings = useMemo<CollegeStanding[]>(() => {
    const list: CollegeStanding[] = colleges.map(college => {
      const stats = computePointsMap[college.id] || {
        sports: 0,
        cultural: 0,
        literary: 0,
        special: 0,
        overallDeduction: 0,
        totalDeductions: 0,
      };

      const sports = Math.max(0, stats.sports);
      const cultural = Math.max(0, stats.cultural);
      const literary = Math.max(0, stats.literary);
      const special = Math.max(0, stats.special);
      const overallDeduction = stats.overallDeduction || 0;
      const totalDeductions = stats.totalDeductions || 0;

      const subtotal = sports + cultural + literary + special;
      const total = Math.max(0, subtotal - overallDeduction);

      return {
        college,
        sports,
        cultural,
        literary,
        special,
        deductions: totalDeductions,
        overallPoints: total,
        rank: 1,
      };
    });

    list.sort((a, b) => b.overallPoints - a.overallPoints);

    let currentRank = 1;
    for (let i = 0; i < list.length; i++) {
      if (i > 0 && list[i].overallPoints === list[i - 1].overallPoints) {
        list[i].rank = list[i - 1].rank;
        list[i].isTie = true;
        list[i - 1].isTie = true;
      } else {
        list[i].rank = currentRank;
      }
      currentRank++;
    }

    return list;
  }, [colleges, computePointsMap]);

  const getCategoryStandings = (categoryId: CategoryId) => {
    const cat = categoryId.toLowerCase();
    const list = colleges.map(college => {
      const rawPts = computePointsMap[college.id]
        ? (computePointsMap[college.id] as any)[cat] || 0
        : 0;
      const pts = Math.max(0, rawPts);

      const eventsCompleted = events.filter(
        e =>
          e.category.toLowerCase() === cat &&
          e.status === 'completed' &&
          e.resultStatus === 'official' &&
          e.results?.some(r => r.collegeId === college.id)
      ).length;

      return {
        college,
        points: pts,
        rank: 1,
        eventsCompleted,
        isTie: false,
      };
    });

    list.sort((a, b) => b.points - a.points);

    let currentRank = 1;
    for (let i = 0; i < list.length; i++) {
      if (i > 0 && list[i].points === list[i - 1].points) {
        list[i].rank = list[i - 1].rank;
        list[i].isTie = true;
        list[i - 1].isTie = true;
      } else {
        list[i].rank = currentRank;
      }
      currentRank++;
    }

    return list;
  };

  const getCategoryLeader = (categoryId: CategoryId) => {
    const standings = getCategoryStandings(categoryId);
    return standings.length > 0 ? standings[0] : null;
  };

  const getOverallLeader = (): CollegeStanding | null => {
    return overallStandings.length > 0 ? overallStandings[0] : null;
  };

  const getCollegeHistory = (collegeId: CollegeId) => {
    const college = colleges.find(c => c.id === collegeId) || colleges[0] || FALLBACK_COLLEGES[0];
    const standing = overallStandings.find(s => s.college.id === collegeId);

    const categoriesMap: Record<CategoryId, CollegeCategoryScore> = {
      sports: { categoryId: 'sports', points: 0, rank: 1, eventsPlayed: 0, breakdown: [] },
      cultural: { categoryId: 'cultural', points: 0, rank: 1, eventsPlayed: 0, breakdown: [] },
      literary: { categoryId: 'literary', points: 0, rank: 1, eventsPlayed: 0, breakdown: [] },
      special: { categoryId: 'special', points: 0, rank: 1, eventsPlayed: 0, breakdown: [] },
    };

    (['sports', 'cultural', 'literary', 'special'] as CategoryId[]).forEach(catId => {
      const catStanding = getCategoryStandings(catId).find(s => s.college.id === collegeId);
      if (catStanding) {
        categoriesMap[catId].rank = catStanding.rank;
      }
    });

    // Populate from official point transactions if available (deductions kept confidential from public breakdown)
    const collegeTransactions = pointTransactions.filter(
      t => t.collegeId === collegeId && t.status === 'official' && t.pointsAwarded > 0 && t.eventType !== 'Deduction' && t.eventType !== 'Penalty'
    );

    if (collegeTransactions.length > 0) {
      collegeTransactions.forEach(tx => {
        const cat = tx.category.toLowerCase() as CategoryId;
        if (categoriesMap[cat]) {
          categoriesMap[cat].points += tx.pointsAwarded;
          categoriesMap[cat].eventsPlayed += 1;
          categoriesMap[cat].breakdown.push({
            eventId: tx.eventId,
            eventName: tx.eventName,
            placement: tx.finalRank,
            points: tx.pointsAwarded,
            date: tx.dateAwarded,
            venue: 'Official Meet',
          });
        }
      });
    } else {
      // Fallback from events
      events
        .filter(e => e.status === 'completed' && e.resultStatus === 'official' && Array.isArray(e.results))
        .forEach(event => {
          const res = event.results?.find(r => r.collegeId === collegeId);
          if (res) {
            const cat = event.category.toLowerCase() as CategoryId;
            if (categoriesMap[cat]) {
              categoriesMap[cat].points += res.points;
              categoriesMap[cat].eventsPlayed += 1;
              categoriesMap[cat].breakdown.push({
                eventId: event.id,
                eventName: event.eventName,
                placement: res.placement,
                points: res.points,
                date: event.date,
                venue: event.venue,
              });
            }
          }
        });
    }

    return {
      college,
      categories: categoriesMap,
      overallTotal: standing?.overallPoints ?? 0,
      overallRank: standing?.rank ?? 4,
    };
  };

  const getHappeningNowEvent = (): PalakasanEvent | null => {
    const ongoing = events.find(e => e.status === 'ongoing');
    if (ongoing) return ongoing;
    // Or return next upcoming
    return events.find(e => e.status === 'upcoming') || null;
  };

  const getNextUpcomingEvent = (): PalakasanEvent | null => {
    const upcoming = events.filter(e => e.status === 'upcoming');
    if (upcoming.length === 0) return null;
    return upcoming.sort((a, b) => a.date.localeCompare(b.date))[0];
  };

  const getRecentResults = (limit = 4): PalakasanEvent[] => {
    return events
      .filter(e => e.status === 'completed' && e.resultStatus === 'official')
      .slice(0, limit);
  };

  const getEventStats = (): EventStatsSummary => {
    const totalColleges = colleges.length;
    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
    const ongoingEvents = events.filter(e => e.status === 'ongoing').length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const pendingResultsEvents = events.filter(
      e => e.status === 'completed' && (!e.resultStatus || e.resultStatus === 'pending' || e.resultStatus === 'draft')
    ).length;
    const declaredWinnersEvents = events.filter(
      e => e.status === 'completed' && e.resultStatus === 'official'
    ).length;

    let totalGames = 0;
    let gamesOngoing = 0;
    let gamesAwaitingResults = 0;
    let gamesCompleted = 0;

    events.forEach(ev => {
      if (ev.games && Array.isArray(ev.games)) {
        ev.games.forEach(g => {
          if (g.status !== 'cancelled') {
            totalGames++;
            if (g.status === 'ongoing') gamesOngoing++;
            if (g.status === 'scheduled' && g.isUnlocked) gamesAwaitingResults++;
            if (g.status === 'completed') gamesCompleted++;
          }
        });
      }
    });

    return {
      totalColleges,
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      eventsAwaitingFinalResults: pendingResultsEvents,
      pendingResultsEvents,
      declaredWinnersEvents,
      totalGames,
      gamesOngoing,
      gamesAwaitingResults,
      gamesCompleted,
      overallLeader: getOverallLeader(),
    };
  };

  const getCollegeStats = (collegeId: CollegeId): CollegeAdminStat => {
    const college = colleges.find(c => c.id === collegeId) || colleges[0] || FALLBACK_COLLEGES[0];
    const standing = overallStandings.find(s => s.college.id === collegeId);

    let eventsParticipated = 0;
    let winsCount = 0;
    let dqsCount = 0;

    events.forEach(e => {
      if (e.participatingColleges.includes(collegeId)) {
        eventsParticipated++;
      }
      if (e.status === 'completed' && e.resultStatus === 'official' && e.results) {
        const res = e.results.find(r => r.collegeId === collegeId);
        if (res?.placement === '1st') winsCount++;
        if (res?.placement === 'DQ') dqsCount++;
      }
    });

    return {
      college,
      totalPoints: standing?.overallPoints || 0,
      sports: standing?.sports || 0,
      cultural: standing?.cultural || 0,
      literary: standing?.literary || 0,
      special: standing?.special || 0,
      eventsParticipated,
      winsCount,
      dqsCount,
      rank: standing?.rank || 4,
    };
  };

  const getAllCollegesStats = (): CollegeAdminStat[] => {
    return colleges.map(c => getCollegeStats(c.id)).sort((a, b) => a.rank - b.rank);
  };

  // -----------------------------------------------------------------
  // PALAKASAN EDITIONS & SYSTEM MUTATIONS
  // -----------------------------------------------------------------

  const createPalakasan = async (
    edition: PalakasanEdition,
    initialEvents?: Omit<PalakasanEvent, 'id' | 'palakasanId'>[]
  ): Promise<void> => {
    await createPalakasanEdition(edition);

    let createdEventsCount = 0;
    if (initialEvents && initialEvents.length > 0) {
      const fullEvents: PalakasanEvent[] = [];
      const participatingColleges =
        edition.participatingColleges && edition.participatingColleges.length > 0
          ? edition.participatingColleges
          : colleges.map(c => c.id);

      for (let i = 0; i < initialEvents.length; i++) {
        const evData = initialEvents[i];
        const newEventId = `ev-${evData.category}-${edition.year}-${i + 1}-${Date.now()}`;
        let initialGames = evData.games;

        if (!initialGames && evData.competitionFormat) {
          const eventVenue = evData.venue || 'Campus Court';
          const eventDate = evData.date || edition.startDate;
          const eventStart = evData.startTime || '08:00 AM';

          if (evData.competitionFormat === 'double-elimination') {
            initialGames = generateDoubleEliminationGames(
              newEventId,
              participatingColleges,
              eventDate,
              eventVenue,
              eventStart
            );
          } else if (evData.competitionFormat === 'round-robin') {
            initialGames = generateRoundRobinGames(
              newEventId,
              participatingColleges,
              eventDate,
              eventVenue,
              eventStart
            );
          } else if (evData.competitionFormat === 'single-elimination') {
            initialGames = generateSingleEliminationGames(
              newEventId,
              participatingColleges,
              eventDate,
              eventVenue,
              eventStart
            );
          } else if (evData.competitionFormat === 'head-to-head') {
            initialGames = generateSingleEliminationGames(
              newEventId,
              participatingColleges,
              eventDate,
              eventVenue,
              eventStart
            );
          }
        }

        fullEvents.push({
          ...evData,
          id: newEventId,
          palakasanId: edition.id,
          games: initialGames,
          participatingColleges: evData.participatingColleges || participatingColleges,
          status: 'upcoming',
          resultStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      await saveEventsBatch(fullEvents);
      createdEventsCount = fullEvents.length;
    }

    await addDatabaseLog(
      'Created New PALAKASAN',
      `Established new edition "${edition.name}" (${edition.year}) with ${createdEventsCount} configured events. Historical records safely preserved.`,
      adminUserDisplay,
      undefined,
      undefined,
      edition.id
    );
  };

  const updatePalakasan = async (id: string, updates: Partial<PalakasanEdition>): Promise<void> => {
    await updatePalakasanEdition(id, updates);
    await addDatabaseLog(
      'Updated PALAKASAN Information',
      `Modified configuration for edition ${id}.`,
      adminUserDisplay,
      undefined,
      undefined,
      id
    );
  };

  const switchActivePalakasan = async (id: string): Promise<void> => {
    await setActivePalakasan(id, allPalakasans);
    setViewedPalakasanId(id);
    await addDatabaseLog(
      'Switched Active PALAKASAN',
      `Marked edition ${id} as current active tournament for public portal.`,
      adminUserDisplay,
      undefined,
      undefined,
      id
    );
  };

  const deletePalakasan = async (id: string): Promise<void> => {
    await deletePalakasanDoc(id);
    if (viewedPalakasanId === id) {
      const remaining = allPalakasans.filter(p => p.id !== id);
      setViewedPalakasanId(remaining[0]?.id || '');
    }
    await addDatabaseLog(
      'Deleted PALAKASAN Edition',
      `Removed edition ${id} and all associated events and transactions.`,
      adminUserDisplay,
      undefined,
      undefined,
      id
    );
  };

  const wipeAllPalakasanData = async (): Promise<void> => {
    await wipeAllTournamentsData(adminUserDisplay);
    setAllPalakasans([]);
    setViewedPalakasanId('');
    setEvents([]);
    setPointTransactions([]);
    setActivityLogs([]);
  };

  // -----------------------------------------------------------------
  // EVENT CRUD (PERSISTENT TO FIRESTORE)
  // -----------------------------------------------------------------

  const addEvent = async (eventData: Omit<PalakasanEvent, 'id'>, adminUser = adminUserDisplay): Promise<string> => {
    const newId = `ev-${eventData.category}-${Date.now()}`;
    let initialGames = eventData.games;

    if (!initialGames && eventData.competitionFormat) {
      if (eventData.competitionFormat === 'double-elimination') {
        initialGames = generateDoubleEliminationGames(
          newId,
          eventData.participatingColleges,
          eventData.date,
          eventData.venue,
          eventData.startTime
        );
      } else if (eventData.competitionFormat === 'round-robin') {
        initialGames = generateRoundRobinGames(
          newId,
          eventData.participatingColleges,
          eventData.date,
          eventData.venue,
          eventData.startTime
        );
      } else if (eventData.competitionFormat === 'single-elimination') {
        initialGames = generateSingleEliminationGames(
          newId,
          eventData.participatingColleges,
          eventData.date,
          eventData.venue,
          eventData.startTime
        );
      }
    }

    const newEvent: PalakasanEvent = {
      ...eventData,
      id: newId,
      palakasanId: viewedPalakasanId,
      games: initialGames,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveEvent(newEvent);
    await addDatabaseLog(
      'Created New Event',
      `Added "${newEvent.eventName}" under ${newEvent.category.toUpperCase()} at ${newEvent.venue}.`,
      adminUser,
      newEvent.eventName,
      newId,
      viewedPalakasanId
    );

    return newId;
  };

  const updateEvent = async (id: string, updates: Partial<PalakasanEvent>, adminUser = adminUserDisplay): Promise<void> => {
    const existing = events.find(e => e.id === id);
    if (!existing) return;

    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await saveEvent(merged);

    await addDatabaseLog(
      'Updated Event Details',
      `Modified event details for "${merged.eventName}".`,
      adminUser,
      merged.eventName,
      id,
      viewedPalakasanId
    );
  };

  const deleteEvent = async (id: string, adminUser = adminUserDisplay): Promise<void> => {
    const existing = events.find(e => e.id === id);
    if (!existing) return;

    await removeEvent(id);
    await addDatabaseLog(
      'Deleted Event',
      `Removed event "${existing.eventName}" from tournament schedule.`,
      adminUser,
      existing.eventName,
      id,
      viewedPalakasanId
    );
  };

  const rescheduleEvent = async (id: string, date: string, startTime: string, endTime: string, adminUser = adminUserDisplay) => {
    await updateEvent(id, { date, startTime, endTime }, adminUser);
  };

  const changeVenue = async (id: string, venue: string, adminUser = adminUserDisplay) => {
    await updateEvent(id, { venue }, adminUser);
  };

  const changeParticipants = async (id: string, participatingColleges: CollegeId[], adminUser = adminUserDisplay) => {
    await updateEvent(id, { participatingColleges }, adminUser);
  };

  const startOngoingEvent = async (id: string, adminUser = adminUserDisplay) => {
    await updateEvent(id, { status: 'ongoing' }, adminUser);
  };

  const markEventCompleted = async (id: string, force = false, adminUser = adminUserDisplay): Promise<{ success: boolean; error?: string }> => {
    const existing = events.find(e => e.id === id);
    if (!existing) return { success: false, error: 'Event not found' };

    if (!force && existing.games && existing.games.length > 0) {
      const unfinished = existing.games.filter(g => g.status !== 'completed' && g.status !== 'cancelled');
      if (unfinished.length > 0) {
        return {
          success: false,
          error: `Cannot complete event: ${unfinished.length} competition matches are still pending.`,
        };
      }
    }

    await updateEvent(id, { status: 'completed' }, adminUser);
    return { success: true };
  };

  const cancelEvent = async (id: string, reason?: string, adminUser = adminUserDisplay) => {
    await updateEvent(id, { status: 'cancelled', cancelledReason: reason || 'Cancelled by Committee' }, adminUser);
  };

  const postponeEvent = async (id: string, newDateInfo?: string, adminUser = adminUserDisplay) => {
    await updateEvent(id, { status: 'postponed', postponedDate: newDateInfo || 'Date TBD' }, adminUser);
  };

  // -----------------------------------------------------------------
  // COMPETITIONS & GAME RESULTS
  // -----------------------------------------------------------------

  const recordGameResult = async (
    eventId: string,
    gameId: string,
    scoreA: number,
    scoreB: number,
    winnerCollegeId: CollegeId,
    loserCollegeId: CollegeId,
    adminUser = adminUserDisplay
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return { success: false, error: 'Event not found.' };
      const games = event.games || [];
      const targetGame = games.find(g => g.id === gameId);
      if (!targetGame) return { success: false, error: 'Game match not found in event.' };

      const fmt = event.competitionFormat || 'double-elimination';
      let updatedEvent: PalakasanEvent = { ...event };
      let logDetail = '';

      if (fmt === 'double-elimination') {
        const res = processDoubleEliminationGameResult(
          event,
          gameId,
          scoreA,
          scoreB,
          winnerCollegeId,
          loserCollegeId
        );
        updatedEvent.games = res.updatedGames;
        updatedEvent.eliminatedColleges = res.eliminated;
        if (res.champion) {
          updatedEvent.championCollegeId = res.champion;
          updatedEvent.status = 'completed';
          updatedEvent.results = res.finalRankings;
          logDetail = `Game #${targetGame.gameNumber} completed (${winnerCollegeId} ${scoreA} - ${scoreB} ${loserCollegeId}). Champion crowned: ${res.champion}!`;
        } else {
          updatedEvent.status = 'ongoing';
          logDetail = `Game #${targetGame.gameNumber} completed: ${winnerCollegeId} defeated ${loserCollegeId} (${scoreA}-${scoreB}).`;
        }
      } else if (fmt === 'round-robin') {
        const updatedGames = games.map(g => {
          if (g.id === gameId) {
            return {
              ...g,
              scoreA,
              scoreB,
              winnerCollegeId,
              loserCollegeId,
              status: 'completed' as GameStatus,
              completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return g;
        });
        const rrResult = calculateRoundRobinStandings(
          event.participatingColleges,
          updatedGames,
          event.tieBreakerRule || 'competition-points'
        );
        updatedEvent.games = updatedGames;
        updatedEvent.roundRobinStats = rrResult.table;

        if (rrResult.isAllCompleted && rrResult.champion) {
          updatedEvent.championCollegeId = rrResult.champion;
          updatedEvent.status = 'completed';
          updatedEvent.results = rrResult.finalRankings;
          logDetail = `Round robin completed! Champion: ${rrResult.champion}. Placements resolved.`;
        } else {
          updatedEvent.status = 'ongoing';
          logDetail = `Match completed (${winnerCollegeId} ${scoreA} - ${scoreB} ${loserCollegeId}). Round robin table updated.`;
        }
      } else if (fmt === 'single-elimination') {
        const res = processSingleEliminationGameResult(
          event,
          gameId,
          scoreA,
          scoreB,
          winnerCollegeId,
          loserCollegeId
        );
        updatedEvent.games = res.updatedGames;
        if (res.champion) {
          updatedEvent.championCollegeId = res.champion;
          updatedEvent.status = 'completed';
          updatedEvent.results = res.finalRankings;
          logDetail = `Single elimination final completed! Champion crowned: ${res.champion}.`;
        } else {
          updatedEvent.status = 'ongoing';
          logDetail = `Match completed (${winnerCollegeId} ${scoreA} - ${scoreB} ${loserCollegeId}).`;
        }
      } else {
        const updatedGames = games.map(g => {
          if (g.id === gameId) {
            return {
              ...g,
              scoreA,
              scoreB,
              winnerCollegeId,
              loserCollegeId,
              status: 'completed' as GameStatus,
              completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return g;
        });
        updatedEvent.games = updatedGames;
        logDetail = `Match completed (${winnerCollegeId} ${scoreA} - ${scoreB} ${loserCollegeId}).`;
      }

      await saveEvent(updatedEvent);
      await addDatabaseLog(
        'Entered Game Result',
        logDetail,
        adminUser,
        event.eventName,
        eventId,
        viewedPalakasanId
      );

      return { success: true };
    } catch (err: any) {
      console.error('Error recording game result:', err);
      return { success: false, error: err?.message || 'Failed to record game score.' };
    }
  };

  const editGameResult = async (
    eventId: string,
    gameId: string,
    scoreA: number,
    scoreB: number,
    winnerCollegeId: CollegeId,
    loserCollegeId: CollegeId,
    reason?: string,
    adminUser = adminUserDisplay
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await recordGameResult(
      eventId,
      gameId,
      scoreA,
      scoreB,
      winnerCollegeId,
      loserCollegeId,
      adminUser
    );
    if (res.success) {
      await addDatabaseLog(
        'Corrected Game Result',
        `Modified score for match ${gameId}. Reason: ${reason || 'Score entry correction'}. Downstream matches updated.`,
        adminUser,
        undefined,
        eventId,
        viewedPalakasanId
      );
    }
    return res;
  };

  const rescheduleGame = async (
    eventId: string,
    gameId: string,
    date: string,
    startTime: string,
    endTime: string,
    venue?: string,
    adminUser = adminUserDisplay
  ): Promise<{ success: boolean; error?: string }> => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, error: 'Event not found.' };
    const games = event.games || [];
    const game = games.find(g => g.id === gameId);
    if (!game) return { success: false, error: 'Game not found.' };

    const updatedGames = games.map(g => {
      if (g.id === gameId) {
        return {
          ...g,
          date,
          startTime,
          endTime,
          venue: venue || g.venue,
        };
      }
      return g;
    });

    await saveEvent({ ...event, games: updatedGames });
    await addDatabaseLog(
      'Rescheduled Match',
      `Rescheduled Game #${game.gameNumber} (${game.roundName}) to ${date} ${startTime}-${endTime}.`,
      adminUser,
      event.eventName,
      eventId,
      viewedPalakasanId
    );

    return { success: true };
  };

  const generateEventMatches = async (
    eventId: string,
    format: CompetitionFormat,
    adminUser = adminUserDisplay
  ): Promise<{ success: boolean; error?: string }> => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, error: 'Event not found.' };

    let newGames: GameMatch[] = [];
    if (format === 'double-elimination') {
      newGames = generateDoubleEliminationGames(
        eventId,
        event.participatingColleges,
        event.date,
        event.venue,
        event.startTime
      );
    } else if (format === 'round-robin') {
      newGames = generateRoundRobinGames(
        eventId,
        event.participatingColleges,
        event.date,
        event.venue,
        event.startTime
      );
    } else if (format === 'single-elimination') {
      newGames = generateSingleEliminationGames(
        eventId,
        event.participatingColleges,
        event.date,
        event.venue,
        event.startTime
      );
    }

    const updated = {
      ...event,
      competitionFormat: format,
      games: newGames,
      status: 'upcoming' as EventStatus,
      resultStatus: 'pending' as ResultStatus,
      championCollegeId: undefined,
      eliminatedColleges: undefined,
      roundRobinStats: undefined,
    };

    await saveEvent(updated);
    await addDatabaseLog(
      'Generated Competition Bracket',
      `Generated ${newGames.length} matches for "${event.eventName}" under ${format} format.`,
      adminUser,
      event.eventName,
      eventId,
      viewedPalakasanId
    );

    return { success: true };
  };

  // -----------------------------------------------------------------
  // OFFICIAL RESULTS & POINT TRANSACTIONS
  // -----------------------------------------------------------------

  const saveDraftResults = async (
    eventId: string,
    results: EventResultItem[],
    adminUser = adminUserDisplay
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return { success: false, error: 'Event not found.' };

      await saveEvent({
        ...event,
        resultStatus: 'draft',
        results,
      });

      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? {
                ...e,
                resultStatus: 'draft',
                results,
              }
            : e
        )
      );

      await addDatabaseLog(
        'Saved Draft Results',
        `Saved preliminary draft results for "${event.eventName}". Standings remain unaffected until officially declared.`,
        adminUser,
        event.eventName,
        eventId,
        viewedPalakasanId
      );

      return { success: true };
    } catch (err: any) {
      console.error('Error saving draft results:', err);
      return { success: false, error: err?.message || 'Failed to save draft results.' };
    }
  };

  const declareOfficialResults = async (
    eventId: string,
    results: EventResultItem[],
    adminUser = adminUserDisplay
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return { success: false, error: 'Event not found.' };

      // Certify results and create Point Transactions in Firestore
      await certifyEventResult(event, results, adminUser);

      const championResult = results.find(r => r.placement === '1st');
      const declaredAtStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Optimistically update local events
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? {
                ...e,
                status: 'completed',
                resultStatus: 'official',
                results,
                championCollegeId: championResult?.collegeId || null,
                declaredAt: declaredAtStr,
                declaredBy: adminUser,
                updatedAt: new Date().toISOString(),
              }
            : e
        )
      );

      // Optimistically update local transactions
      const nowStr = new Date().toISOString();
      const isSpecialEvent = event.category === 'special' || event.pointTier === 'special';
      const eventType = isSpecialEvent ? 'Special' : (event.isMajor || event.pointTier === 'major' ? 'Major' : 'Minor');
      const newTrans: PointTransaction[] = results.map(res => ({
        id: `pt-${event.id}-${res.collegeId}-${Date.now()}`,
        palakasanId: event.palakasanId || viewedPalakasanId || 'palakasan-2026',
        collegeId: res.collegeId,
        eventId: event.id,
        eventName: event.eventName,
        category: event.category,
        eventType,
        finalRank: res.placement,
        pointsAwarded: res.points,
        dateAwarded: nowStr,
        declaredBy: adminUser,
        status: 'official',
      }));

      setPointTransactions(prev => [
        ...prev.filter(pt => pt.eventId !== eventId),
        ...newTrans,
      ]);

      return { success: true };
    } catch (err: any) {
      console.error('Error declaring official results:', err);
      return { success: false, error: err?.message || 'Failed to declare official results.' };
    }
  };

  const editOfficialResult = async (
    eventId: string,
    results: EventResultItem[],
    reason?: string,
    adminUser = adminUserDisplay
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return { success: false, error: 'Event not found.' };

      await revokeEventResult(event, reason || 'Recalibration', adminUser);
      await certifyEventResult(event, results, adminUser);

      const championResult = results.find(r => r.placement === '1st');
      const declaredAtStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? {
                ...e,
                status: 'completed',
                resultStatus: 'official',
                results,
                championCollegeId: championResult?.collegeId || null,
                declaredAt: declaredAtStr,
                declaredBy: adminUser,
                updatedAt: new Date().toISOString(),
              }
            : e
        )
      );

      // Update local point transactions
      const nowStr = new Date().toISOString();
      const isSpecialEvent = event.category === 'special' || event.pointTier === 'special';
      const eventType = isSpecialEvent ? 'Special' : (event.isMajor || event.pointTier === 'major' ? 'Major' : 'Minor');
      const newTrans: PointTransaction[] = results.map(res => ({
        id: `pt-${event.id}-${res.collegeId}-${Date.now()}`,
        palakasanId: event.palakasanId || viewedPalakasanId || 'palakasan-2026',
        collegeId: res.collegeId,
        eventId: event.id,
        eventName: event.eventName,
        category: event.category,
        eventType,
        finalRank: res.placement,
        pointsAwarded: res.points,
        dateAwarded: nowStr,
        declaredBy: adminUser,
        status: 'official',
      }));

      setPointTransactions(prev => [
        ...prev.filter(pt => pt.eventId !== eventId),
        ...newTrans,
      ]);

      return { success: true };
    } catch (err: any) {
      console.error('Error editing official result:', err);
      return { success: false, error: err?.message || 'Failed to update official results.' };
    }
  };

  const reopenOfficialResult = async (
    eventId: string,
    reason?: string,
    adminUser = adminUserDisplay
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return { success: false, error: 'Event not found.' };

      await revokeEventResult(event, reason || 'Reopened to draft', adminUser);

      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? {
                ...e,
                resultStatus: 'draft',
                declaredAt: undefined,
                declaredBy: undefined,
              }
            : e
        )
      );

      setPointTransactions(prev =>
        prev.map(pt => (pt.eventId === eventId ? { ...pt, status: 'revoked' } : pt))
      );

      return { success: true };
    } catch (err: any) {
      console.error('Error reopening official result:', err);
      return { success: false, error: err?.message || 'Failed to reopen official results.' };
    }
  };

  const recordEventResults = (eventId: string, results: EventResultItem[]) => {
    return declareOfficialResults(eventId, results);
  };

  // -----------------------------------------------------------------
  // COLLEGE, CATEGORY & VENUE MUTATIONS
  // -----------------------------------------------------------------

  const addCollege = async (college: College): Promise<void> => {
    await saveCollege(college);
    await addDatabaseLog(
      'Added Participating College',
      `Registered collegiate entity: ${college.name} (${college.acronym}).`,
      adminUserDisplay,
      undefined,
      undefined,
      viewedPalakasanId
    );
  };

  const updateCollege = async (id: string, updates: Partial<College>): Promise<void> => {
    const existing = colleges.find(c => c.id === id);
    if (!existing) return;
    await saveCollege({ ...existing, ...updates });
  };

  const toggleCollegeStatus = async (id: string, status: 'active' | 'inactive'): Promise<void> => {
    await updateCollegeStatus(id, status);
  };

  const addCategory = async (category: Category): Promise<void> => {
    await saveCategory(category);
    await addDatabaseLog(
      'Added Event Category',
      `Created category: ${category.name}.`,
      adminUserDisplay,
      undefined,
      undefined,
      viewedPalakasanId
    );
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    const existing = categories.find(c => c.id === id);
    if (!existing) return;
    await saveCategory({ ...existing, ...updates });
  };

  const addVenue = async (venue: Venue): Promise<void> => {
    await saveVenue(venue);
    await addDatabaseLog(
      'Added University Venue',
      `Added venue: ${venue.name} (Capacity: ${venue.capacity}).`,
      adminUserDisplay,
      undefined,
      undefined,
      viewedPalakasanId
    );
  };

  const updateVenue = async (id: string, updates: Partial<Venue>): Promise<void> => {
    const existing = venues.find(v => v.id === id);
    if (!existing) return;
    await saveVenue({ ...existing, ...updates });
  };

  const deleteVenue = async (id: string): Promise<void> => {
    await removeVenueDoc(id);
  };

  const verifyVenueConflict = (venue: string, date: string, startTime: string, endTime: string, excludeEventId?: string) => {
    return checkVenueConflict(venue, date, startTime, endTime, excludeEventId || '', events);
  };

  const addActivityLog = (log: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    addDatabaseLog(
      log.action,
      log.description,
      log.adminUser,
      log.eventTitle,
      log.eventId,
      viewedPalakasanId
    );
  };

  const clearActivityLogs = () => {
    // Local no-op for backward compatibility
  };

  const resetToDefaultData = async (): Promise<void> => {
    try {
      await resetDatabaseToDefaults(adminUserDisplay);
      // Immediately reflect fallback initial data in local state
      setColleges(FALLBACK_COLLEGES);
      setCategories(FALLBACK_CATEGORIES);
      setVenues(INITIAL_VENUES);
      setEvents(FALLBACK_EVENTS);
    } catch (err) {
      console.error('Failed to reset tournament data to defaults:', err);
      // Fallback local reset even if Firestore network fails
      setColleges(FALLBACK_COLLEGES);
      setCategories(FALLBACK_CATEGORIES);
      setVenues(INITIAL_VENUES);
      setEvents(FALLBACK_EVENTS);
    }
  };

  const clearPointHistory = async (): Promise<void> => {
    try {
      await clearTournamentPointHistory(viewedPalakasanId, adminUserDisplay);
      setPointTransactions(prev => prev.filter(pt => pt.palakasanId !== viewedPalakasanId));
      setEvents(prev =>
        prev.map(ev => ({
          ...ev,
          status: 'upcoming',
          resultStatus: 'draft',
          results: undefined,
          championCollegeId: undefined,
          declaredAt: undefined,
          declaredBy: undefined,
        }))
      );
    } catch (err) {
      console.error('Failed to clear point history:', err);
    }
  };

  const clearActivityAuditLogs = async (): Promise<void> => {
    try {
      await clearAllActivityLogsFirestore(viewedPalakasanId, adminUserDisplay);
      setActivityLogs([]);
    } catch (err) {
      console.error('Failed to clear activity audit logs:', err);
    }
  };

  const deletePointTransactionById = async (txId: string): Promise<void> => {
    try {
      await deletePointTransaction(txId, adminUserDisplay);
      setPointTransactions(prev => prev.filter(pt => pt.id !== txId));
    } catch (err) {
      console.error('Failed to delete point transaction:', err);
    }
  };

  const applyGrievanceDeduction = async (params: {
    collegeId: CollegeId;
    pointsToDeduct: number;
    reason: string;
    scope: 'overall' | CategoryId;
    eventId?: string;
    eventName?: string;
    resolutionId?: string;
    adminUser?: string;
  }): Promise<PointTransaction> => {
    const palakasanId = viewedPalakasanId || currentPalakasan?.id || 'palakasan-2026';
    const tx = await recordGrievancePointDeduction({
      palakasanId,
      collegeId: params.collegeId,
      pointsToDeduct: params.pointsToDeduct,
      reason: params.reason,
      scope: params.scope,
      eventId: params.eventId,
      eventName: params.eventName,
      resolutionId: params.resolutionId,
      adminUser: params.adminUser || adminUserDisplay,
    });
    setPointTransactions(prev => [tx, ...prev]);
    return tx;
  };

  return (
    <PalakasanContext.Provider
      value={{
        currentPalakasan,
        allPalakasans,
        viewedPalakasanId,
        setViewedPalakasanId,
        createPalakasan,
        updatePalakasan,
        switchActivePalakasan,
        deletePalakasan,
        wipeAllPalakasanData,
        events,
        colleges,
        categories,
        venues,
        pointTransactions,
        activityLogs,
        overallStandings,
        getCategoryStandings,
        getCategoryLeader,
        getOverallLeader,
        getCollegeHistory,
        getHappeningNowEvent,
        getNextUpcomingEvent,
        getRecentResults,
        getEventStats,
        getCollegeStats,
        getAllCollegesStats,
        addEvent,
        updateEvent,
        deleteEvent,
        rescheduleEvent,
        changeVenue,
        changeParticipants,
        startOngoingEvent,
        markEventCompleted,
        cancelEvent,
        postponeEvent,
        recordGameResult,
        editGameResult,
        rescheduleGame,
        generateEventMatches,
        saveDraftResults,
        declareOfficialResults,
        editOfficialResult,
        reopenOfficialResult,
        recordEventResults,
        addCollege,
        updateCollege,
        toggleCollegeStatus,
        addCategory,
        updateCategory,
        addVenue,
        updateVenue,
        deleteVenue,
        verifyVenueConflict,
        addActivityLog,
        clearActivityLogs,
        clearActivityAuditLogs,
        resetToDefaultData,
        clearPointHistory,
        deletePointTransactionById,
        applyGrievanceDeduction,
        selectedCollegeId,
        setSelectedCollegeId,
        selectedEventId,
        setSelectedEventId,
        isAdminLoggedIn,
        currentUser,
        currentAccount,
        committeeAccounts: COMMITTEE_ACCOUNTS,
        loginAdmin,
        loginWithGoogle,
        logoutAdmin,
        adminUserDisplay,
        simulatedTimeMode,
        setSimulatedTimeMode,
        rankingsVisibility: rankingsVisibilityState,
        updateRankingsVisibility,
        isRankingHidden,
        adminSpectatorPreview,
        setAdminSpectatorPreview,
      }}
    >
      {children}
    </PalakasanContext.Provider>
  );
};

export const usePalakasan = () => {
  const context = useContext(PalakasanContext);
  if (!context) {
    throw new Error('usePalakasan must be used within a PalakasanProvider');
  }
  return context;
};
