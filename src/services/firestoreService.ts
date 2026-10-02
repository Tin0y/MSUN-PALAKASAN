import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  PalakasanEdition,
  College,
  Category,
  Venue,
  PalakasanEvent,
  PointTransaction,
  ActivityLogItem,
  EventResultItem,
  CategoryId,
  CollegeId,
  Placement,
  GameMatch,
} from '../types';
import {
  COLLEGES as INITIAL_COLLEGES,
  CATEGORIES as INITIAL_CATEGORIES,
  INITIAL_EVENTS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Deeply removes all `undefined` fields from an object or array before passing to Firestore.
 * Firestore will throw "Unsupported field value: undefined" if any object contains undefined.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return (data as unknown as any[])
      .filter(item => item !== undefined)
      .map(item => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        sanitized[key] = cleanForFirestore(value);
      }
    }
    return sanitized as T;
  }
  return data;
}

// Initial Palakasan Editions
export const DEFAULT_PALAKASAN_2026: PalakasanEdition = {
  id: 'palakasan-2026',
  name: 'MSU at Naawan PALAKASAN 2026',
  year: 2026,
  description: 'Mindanao State University at Naawan Annual University-Wide Athletic, Cultural, and Literary Meet.',
  startDate: '2026-10-18',
  endDate: '2026-10-25',
  status: 'ongoing',
  isCurrent: true,
  theme: {
    title: 'PALAKASAN 2026',
    tagline: 'United Through Excellence, Anchored in Heritage',
    primaryColor: '#0284c7', // MSUN bright blue
    secondaryColor: '#0369a1',
    accentColor: '#38bdf8',
    description: 'Celebrating student athleticism, cultural diversity, and campus spirit.',
    logo: '🏆',
  },
  participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
  eventCategories: ['sports', 'cultural', 'literary', 'special'],
  scoringRules: {
    majorPoints: { '1st': 50, '2nd': 40, '3rd': 30, '4th': 20, DQ: 0 },
    minorPoints: { '1st': 30, '2nd': 20, '3rd': 15, '4th': 10, DQ: 0 },
    specialPoints: { '1st': 60, '2nd': 45, '3rd': 30, '4th': 20, DQ: 0 },
    disciplinePoints: { '1st': 10, '2nd': 8, '3rd': 6, '4th': 4, '5th': 2, '6th': 0, DQ: 0 },
  },
  competitionRules: {
    availableFormats: [
      'double-elimination',
      'round-robin',
      'single-elimination',
      'individual',
      'head-to-head',
      'custom',
    ],
    tieBreakers: [
      'competition-points',
      'head-to-head',
      'score-difference',
      'total-score',
    ],
  },
  rankingsVisibility: {
    hideAllRankings: false,
    hideOverallStandings: false,
    hideEventResults: false,
    hideCategoryRankings: {
      sports: false,
      cultural: false,
      literary: false,
      special: false,
    },
    thrillMessage: 'Official rankings are currently sealed by the Tournament Committee. Final champions will be unveiled at the Grand Closing & Awarding Ceremony!',
  },
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-18T00:00:00.000Z',
};

export const DEFAULT_PALAKASAN_2025: PalakasanEdition = {
  id: 'palakasan-2025',
  name: 'MSU at Naawan PALAKASAN 2025',
  year: 2025,
  description: 'Mindanao State University at Naawan 2025 Inter-Collegiate Meet.',
  startDate: '2025-10-15',
  endDate: '2025-10-22',
  status: 'archived',
  isCurrent: false,
  theme: {
    title: 'PALAKASAN 2025',
    tagline: 'Rising with Passion, Soaring with Integrity',
    primaryColor: '#0284c7',
    secondaryColor: '#0369a1',
    accentColor: '#38bdf8',
    description: '2025 University Meet celebrating athletic excellence and collegiate camaraderie.',
    logo: '🎖️',
  },
  participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
  eventCategories: ['sports', 'cultural', 'literary', 'special'],
  scoringRules: {
    majorPoints: { '1st': 50, '2nd': 40, '3rd': 30, '4th': 20, DQ: 0 },
    minorPoints: { '1st': 30, '2nd': 20, '3rd': 15, '4th': 10, DQ: 0 },
    specialPoints: { '1st': 60, '2nd': 45, '3rd': 30, '4th': 20, DQ: 0 },
    disciplinePoints: { '1st': 10, '2nd': 8, '3rd': 6, '4th': 4, '5th': 2, '6th': 0, DQ: 0 },
  },
  competitionRules: {
    availableFormats: ['double-elimination', 'round-robin', 'single-elimination'],
    tieBreakers: ['competition-points', 'head-to-head'],
  },
  createdAt: '2025-09-01T00:00:00.000Z',
  updatedAt: '2025-10-25T00:00:00.000Z',
};

export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-basketball-court',
    name: 'Basketball Court',
    location: 'Main University Grounds',
    capacity: 1500,
    description: 'Outdoor standard FIBA-grade tournament basketball court with tiered seating.',
    status: 'active',
  },
  {
    id: 'venue-tsac',
    name: 'TSAC (The Student Activity Center)',
    location: 'Academic Quadrangle',
    capacity: 800,
    description: 'Indoor student activity arena for badminton, table tennis, and major ceremonies.',
    status: 'active',
  },
  {
    id: 'venue-function-hall',
    name: 'MSUN Function Hall',
    location: 'Administration Complex 2nd Floor',
    capacity: 600,
    description: 'Acoustic hall for literary symposiums, debates, and musical competitions.',
    status: 'active',
  },
  {
    id: 'venue-bandstand',
    name: 'MSUN Bandstand',
    location: 'University Freedom Park',
    capacity: 2500,
    description: 'Open-air amphitheater for grand cheerdance, coronation pageants, and closing ceremonies.',
    status: 'active',
  },
  {
    id: 'venue-gymnasium',
    name: 'MSUN Gymnasium',
    location: 'Sports & PE Complex',
    capacity: 2000,
    description: 'Multi-purpose collegiate gymnasium equipped with volleyball & basketball amenities.',
    status: 'active',
  },
  {
    id: 'venue-avr',
    name: 'Audio Visual Room (AVR)',
    location: 'University Library 3rd Floor',
    capacity: 250,
    description: 'Climate-controlled lecture and presentation room for chess and speech competitions.',
    status: 'active',
  },
];

// Seed Historical 2025 Point Transactions
export const HISTORICAL_2025_TRANSACTIONS: PointTransaction[] = [
  {
    id: 'pt-2025-01',
    palakasanId: 'palakasan-2025',
    collegeId: 'CBIT',
    eventId: 'ev-2025-sp-01',
    eventName: 'Basketball Men 2025',
    category: 'sports',
    eventType: 'Major',
    finalRank: '1st',
    pointsAwarded: 50,
    dateAwarded: '2025-10-20',
    declaredBy: 'Palakasan 2025 Committee',
    status: 'official',
  },
  {
    id: 'pt-2025-02',
    palakasanId: 'palakasan-2025',
    collegeId: 'CESS-IDS',
    eventId: 'ev-2025-sp-01',
    eventName: 'Basketball Men 2025',
    category: 'sports',
    eventType: 'Major',
    finalRank: '2nd',
    pointsAwarded: 40,
    dateAwarded: '2025-10-20',
    declaredBy: 'Palakasan 2025 Committee',
    status: 'official',
  },
  {
    id: 'pt-2025-03',
    palakasanId: 'palakasan-2025',
    collegeId: 'CFMS',
    eventId: 'ev-2025-sp-01',
    eventName: 'Basketball Men 2025',
    category: 'sports',
    eventType: 'Major',
    finalRank: '3rd',
    pointsAwarded: 30,
    dateAwarded: '2025-10-20',
    declaredBy: 'Palakasan 2025 Committee',
    status: 'official',
  },
  {
    id: 'pt-2025-04',
    palakasanId: 'palakasan-2025',
    collegeId: 'CELS',
    eventId: 'ev-2025-sp-01',
    eventName: 'Basketball Men 2025',
    category: 'sports',
    eventType: 'Major',
    finalRank: '4th',
    pointsAwarded: 20,
    dateAwarded: '2025-10-20',
    declaredBy: 'Palakasan 2025 Committee',
    status: 'official',
  },
  {
    id: 'pt-2025-05',
    palakasanId: 'palakasan-2025',
    collegeId: 'CFMS',
    eventId: 'ev-2025-cul-01',
    eventName: 'Folk Dance 2025',
    category: 'cultural',
    eventType: 'Major',
    finalRank: '1st',
    pointsAwarded: 50,
    dateAwarded: '2025-10-21',
    declaredBy: 'Cultural Jury 2025',
    status: 'official',
  },
  {
    id: 'pt-2025-06',
    palakasanId: 'palakasan-2025',
    collegeId: 'CESS-IDS',
    eventId: 'ev-2025-cul-01',
    eventName: 'Folk Dance 2025',
    category: 'cultural',
    eventType: 'Major',
    finalRank: '2nd',
    pointsAwarded: 40,
    dateAwarded: '2025-10-21',
    declaredBy: 'Cultural Jury 2025',
    status: 'official',
  },
  {
    id: 'pt-2025-07',
    palakasanId: 'palakasan-2025',
    collegeId: 'CBIT',
    eventId: 'ev-2025-cul-01',
    eventName: 'Folk Dance 2025',
    category: 'cultural',
    eventType: 'Major',
    finalRank: '3rd',
    pointsAwarded: 30,
    dateAwarded: '2025-10-21',
    declaredBy: 'Cultural Jury 2025',
    status: 'official',
  },
  {
    id: 'pt-2025-08',
    palakasanId: 'palakasan-2025',
    collegeId: 'CELS',
    eventId: 'ev-2025-cul-01',
    eventName: 'Folk Dance 2025',
    category: 'cultural',
    eventType: 'Major',
    finalRank: '4th',
    pointsAwarded: 20,
    dateAwarded: '2025-10-21',
    declaredBy: 'Cultural Jury 2025',
    status: 'official',
  },
];

/**
 * Ensures that foundational collegiate data exists in Firestore.
 * Does NOT auto-seed dummy 2025-2027 tournament editions or results,
 * providing a completely clean canvas for user-created tournaments.
 */
export async function initializeFirestoreDatabase(): Promise<void> {
  try {
    // Check if colleges collection exists (foundational university units)
    const collegesRef = collection(db, 'colleges');
    const snap = await getDocs(collegesRef);

    if (snap.empty) {
      console.log('Seeding foundational colleges, categories, and venues...');
      const batch = writeBatch(db);

      // Seed Colleges
      for (const col of INITIAL_COLLEGES) {
        const colDoc = doc(db, 'colleges', col.id);
        batch.set(
          colDoc,
          cleanForFirestore({
            ...col,
            status: 'active',
            createdAt: new Date().toISOString(),
          })
        );
      }

      // Seed Categories
      for (let i = 0; i < INITIAL_CATEGORIES.length; i++) {
        const cat = INITIAL_CATEGORIES[i];
        const catDoc = doc(db, 'categories', cat.id);
        batch.set(
          catDoc,
          cleanForFirestore({
            ...cat,
            displayOrder: i + 1,
            status: 'active',
          })
        );
      }

      // Seed Venues
      for (const ven of INITIAL_VENUES) {
        const venDoc = doc(db, 'venues', ven.id);
        batch.set(
          venDoc,
          cleanForFirestore({
            ...ven,
            createdAt: new Date().toISOString(),
          })
        );
      }

      await batch.commit();
      console.log('Foundational colleges, categories, and venues initialized.');
    } else {
      // Synchronize/ensure college monikers match updated designations
      try {
        const colSnap = await getDocs(collegesRef);
        if (!colSnap.empty) {
          const syncBatch = writeBatch(db);
          let needsSync = false;
          colSnap.forEach(docSnap => {
            const data = docSnap.data() as College;
            const refCol = INITIAL_COLLEGES.find(c => c.id === data.id);
            if (refCol && (data.moniker !== refCol.moniker || data.mascot !== refCol.mascot)) {
              syncBatch.set(
                docSnap.ref,
                cleanForFirestore({
                  ...data,
                  mascot: refCol.mascot,
                  moniker: refCol.moniker,
                }),
                { merge: true }
              );
              needsSync = true;
            }
          });
          if (needsSync) {
            await syncBatch.commit();
            console.log('College monikers synchronized in Firestore.');
          }
        }
      } catch (colSyncErr) {
        console.warn('Could not sync college monikers in Firestore:', colSyncErr);
      }
    }

    // Synchronize/ensure specialPoints exist in palakasans scoringRules
    try {
      const palakasansRef = collection(db, 'palakasans');
      const palSnap = await getDocs(palakasansRef);
      if (!palSnap.empty) {
        const palBatch = writeBatch(db);
        let needsPalSync = false;
        palSnap.forEach(docSnap => {
          const data = docSnap.data() as PalakasanEdition;
          if (!data.scoringRules?.specialPoints || !data.scoringRules?.disciplinePoints) {
            palBatch.set(
              docSnap.ref,
              cleanForFirestore({
                ...data,
                scoringRules: {
                  ...data.scoringRules,
                  specialPoints: data.scoringRules?.specialPoints || { '1st': 60, '2nd': 45, '3rd': 30, '4th': 20, DQ: 0 },
                  disciplinePoints: data.scoringRules?.disciplinePoints || { '1st': 10, '2nd': 8, '3rd': 6, '4th': 4, '5th': 2, '6th': 0, DQ: 0 },
                },
              }),
              { merge: true }
            );
            needsPalSync = true;
          }
        });
        if (needsPalSync) {
          await palBatch.commit();
          console.log('Special events scoring rules synchronized in Firestore.');
        }
      }
    } catch (palSyncErr) {
      console.warn('Could not sync specialPoints in Firestore:', palSyncErr);
    }
  } catch (err) {
    console.error('Error during Firestore initialization/seeding:', err);
  }
}

// ==========================================
// REAL-TIME SUBSCRIBERS
// ==========================================

export function subscribeToPalakasans(callback: (editions: PalakasanEdition[]) => void): () => void {
  const colRef = collection(db, 'palakasans');
  return onSnapshot(
    colRef,
    snapshot => {
      const editions: PalakasanEdition[] = [];
      snapshot.forEach(doc => {
        editions.push(doc.data() as PalakasanEdition);
      });
      // Sort newest year first
      editions.sort((a, b) => b.year - a.year);
      callback(editions);
    },
    err => {
      console.warn('subscribeToPalakasans error:', err);
    }
  );
}

export function subscribeToColleges(callback: (colleges: College[]) => void): () => void {
  const colRef = collection(db, 'colleges');
  return onSnapshot(
    colRef,
    snapshot => {
      const list: College[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as College);
      });
      callback(list);
    },
    err => {
      console.warn('subscribeToColleges error:', err);
    }
  );
}

export function subscribeToCategories(callback: (categories: Category[]) => void): () => void {
  const colRef = collection(db, 'categories');
  return onSnapshot(
    colRef,
    snapshot => {
      const list: Category[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as Category);
      });
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      callback(list);
    },
    err => {
      console.warn('subscribeToCategories error:', err);
    }
  );
}

export function subscribeToVenues(callback: (venues: Venue[]) => void): () => void {
  const colRef = collection(db, 'venues');
  return onSnapshot(
    colRef,
    snapshot => {
      const list: Venue[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as Venue);
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      callback(list);
    },
    err => {
      console.warn('subscribeToVenues error:', err);
    }
  );
}

export function subscribeToEvents(
  palakasanId: string,
  callback: (events: PalakasanEvent[]) => void
): () => void {
  const colRef = collection(db, 'events');
  // Listen to all events or filter by palakasanId
  return onSnapshot(
    colRef,
    snapshot => {
      const list: PalakasanEvent[] = [];
      snapshot.forEach(doc => {
        const item = doc.data() as PalakasanEvent;
        if (!palakasanId || item.palakasanId === palakasanId || (!item.palakasanId && palakasanId === 'palakasan-2026')) {
          list.push(item);
        }
      });
      callback(list);
    },
    err => {
      console.warn('subscribeToEvents error:', err);
    }
  );
}

export function subscribeToPointTransactions(
  palakasanId: string,
  callback: (transactions: PointTransaction[]) => void
): () => void {
  const colRef = collection(db, 'pointTransactions');
  return onSnapshot(
    colRef,
    snapshot => {
      const list: PointTransaction[] = [];
      snapshot.forEach(doc => {
        const item = doc.data() as PointTransaction;
        if (!palakasanId || item.palakasanId === palakasanId) {
          list.push(item);
        }
      });
      callback(list);
    },
    err => {
      console.warn('subscribeToPointTransactions error:', err);
    }
  );
}

export function subscribeToActivityLogs(callback: (logs: ActivityLogItem[]) => void): () => void {
  const colRef = collection(db, 'activityLogs');
  return onSnapshot(
    colRef,
    snapshot => {
      const list: ActivityLogItem[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as ActivityLogItem);
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      callback(list);
    },
    err => {
      console.warn('subscribeToActivityLogs error:', err);
    }
  );
}

// ==========================================
// MUTATION OPERATIONS (PALAKASAN MANAGEMENT)
// ==========================================

export async function createPalakasanEdition(edition: PalakasanEdition): Promise<void> {
  const docRef = doc(db, 'palakasans', edition.id);
  await setDoc(
    docRef,
    cleanForFirestore({
      ...edition,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  );
}

export async function updatePalakasanEdition(id: string, updates: Partial<PalakasanEdition>): Promise<void> {
  const docRef = doc(db, 'palakasans', id);
  await updateDoc(
    docRef,
    cleanForFirestore({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  );
}

export async function setActivePalakasan(targetId: string, allEditions: PalakasanEdition[]): Promise<void> {
  const batch = writeBatch(db);
  for (const edition of allEditions) {
    const docRef = doc(db, 'palakasans', edition.id);
    batch.update(
      docRef,
      cleanForFirestore({
        isCurrent: edition.id === targetId,
        updatedAt: new Date().toISOString(),
      })
    );
  }
  await batch.commit();
}

export async function deletePalakasanEdition(editionId: string): Promise<void> {
  const batch = writeBatch(db);
  const docRef = doc(db, 'palakasans', editionId);
  batch.delete(docRef);

  // Delete all events for this palakasan
  const eventsRef = collection(db, 'events');
  const evSnap = await getDocs(eventsRef);
  evSnap.forEach(d => {
    const data = d.data() as PalakasanEvent;
    if (data.palakasanId === editionId) {
      batch.delete(d.ref);
    }
  });

  // Delete point transactions for this palakasan
  const ptRef = collection(db, 'pointTransactions');
  const ptSnap = await getDocs(ptRef);
  ptSnap.forEach(d => {
    const data = d.data() as PointTransaction;
    if (data.palakasanId === editionId) {
      batch.delete(d.ref);
    }
  });

  // Delete activity logs for this palakasan
  const actRef = collection(db, 'activityLogs');
  const actSnap = await getDocs(actRef);
  actSnap.forEach(d => {
    const data = d.data() as ActivityLogItem;
    if (data.palakasanId === editionId) {
      batch.delete(d.ref);
    }
  });

  await batch.commit();
}

/**
 * Completely purges all tournament editions, events, point transactions,
 * and activity logs from Firestore. Foundational colleges and venues remain intact.
 */
export async function wipeAllTournamentsData(adminUser = 'Administrator'): Promise<void> {
  const collections = [
    'palakasans',
    'events',
    'pointTransactions',
    'activityLogs',
    'matches',
    'matchResults',
    'brackets',
    'standings',
    'eventRankings',
  ];

  for (const colName of collections) {
    const colRef = collection(db, colName);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  }

  // Ensure colleges and venues are intact
  const collegesRef = collection(db, 'colleges');
  const colSnap = await getDocs(collegesRef);
  if (colSnap.empty) {
    const batch = writeBatch(db);
    for (const col of INITIAL_COLLEGES) {
      batch.set(doc(db, 'colleges', col.id), cleanForFirestore(col));
    }
    for (const cat of INITIAL_CATEGORIES) {
      batch.set(doc(db, 'categories', cat.id), cleanForFirestore(cat));
    }
    for (const v of INITIAL_VENUES) {
      batch.set(doc(db, 'venues', v.id), cleanForFirestore(v));
    }
    await batch.commit();
  }
}

// ==========================================
// COLLEGE MANAGEMENT
// ==========================================

export async function saveCollege(college: College): Promise<void> {
  const docRef = doc(db, 'colleges', college.id);
  await setDoc(
    docRef,
    cleanForFirestore({
      ...college,
      status: college.status || 'active',
      createdAt: college.createdAt || new Date().toISOString(),
    }),
    { merge: true }
  );
}

export async function updateCollegeStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
  const docRef = doc(db, 'colleges', id);
  await updateDoc(docRef, cleanForFirestore({ status }));
}

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================

export async function saveCategory(category: Category): Promise<void> {
  const docRef = doc(db, 'categories', category.id);
  await setDoc(docRef, cleanForFirestore(category), { merge: true });
}

// ==========================================
// VENUE MANAGEMENT & CONFLICT DETECTION
// ==========================================

export async function saveVenue(venue: Venue): Promise<void> {
  const docRef = doc(db, 'venues', venue.id);
  await setDoc(
    docRef,
    cleanForFirestore({
      ...venue,
      createdAt: venue.createdAt || new Date().toISOString(),
    }),
    { merge: true }
  );
}

export async function deleteVenue(id: string): Promise<void> {
  const docRef = doc(db, 'venues', id);
  await deleteDoc(docRef);
}

/**
 * Checks if a venue and date/time conflict exists with another event
 */
export function checkVenueConflict(
  venue: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeEventId: string,
  existingEvents: PalakasanEvent[]
): { hasConflict: boolean; conflictingEvent?: PalakasanEvent } {
  const parseTime = (timeStr: string) => {
    // e.g. "08:00 AM", "10:30 PM"
    const [time, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + (minutes || 0);
  };

  const newStart = parseTime(startTime);
  const newEnd = parseTime(endTime);

  for (const ev of existingEvents) {
    if (ev.id === excludeEventId) continue;
    if (ev.status === 'cancelled') continue;
    if (ev.venue.toLowerCase().trim() === venue.toLowerCase().trim() && ev.date === date) {
      const evStart = parseTime(ev.startTime);
      const evEnd = parseTime(ev.endTime);

      // Check overlap
      if (newStart < evEnd && newEnd > evStart) {
        return { hasConflict: true, conflictingEvent: ev };
      }
    }
  }

  return { hasConflict: false };
}

// ==========================================
// EVENT MANAGEMENT
// ==========================================

export async function saveEvent(event: PalakasanEvent): Promise<void> {
  const docRef = doc(db, 'events', event.id);
  await setDoc(
    docRef,
    cleanForFirestore({
      ...event,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );
}

export async function saveEventsBatch(eventsList: PalakasanEvent[]): Promise<void> {
  if (!eventsList || eventsList.length === 0) return;
  const batch = writeBatch(db);
  for (const event of eventsList) {
    const docRef = doc(db, 'events', event.id);
    batch.set(
      docRef,
      cleanForFirestore({
        ...event,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  }
  await batch.commit();
}

export async function removeEvent(id: string): Promise<void> {
  const batch = writeBatch(db);
  const docRef = doc(db, 'events', id);
  batch.delete(docRef);

  // Cascade delete point transactions associated with this event
  const ptRef = collection(db, 'pointTransactions');
  const ptSnap = await getDocs(ptRef);
  ptSnap.forEach(d => {
    const data = d.data() as PointTransaction;
    if (data.eventId === id) {
      batch.delete(d.ref);
    }
  });

  // Cascade delete activity logs referencing this event
  const actRef = collection(db, 'activityLogs');
  const actSnap = await getDocs(actRef);
  actSnap.forEach(d => {
    const data = d.data() as ActivityLogItem;
    if (data.eventId === id) {
      batch.delete(d.ref);
    }
  });

  await batch.commit();
}

export interface GrievanceDeductionParams {
  palakasanId: string;
  collegeId: CollegeId;
  pointsToDeduct: number;
  reason: string;
  scope: 'overall' | CategoryId;
  eventId?: string;
  eventName?: string;
  resolutionId?: string;
  adminUser: string;
}

/**
 * Records an official grievance or disciplinary point deduction against a college.
 * Deducts points from overall standing or from a designated category (Sports, Cultural, Literary, Special).
 */
export async function recordGrievancePointDeduction(params: GrievanceDeductionParams): Promise<PointTransaction> {
  const pts = -Math.abs(params.pointsToDeduct);
  const txId = `pt-deduct-${params.collegeId}-${Date.now()}`;
  const transDoc = doc(db, 'pointTransactions', txId);
  const now = new Date();

  const transaction: PointTransaction = {
    id: txId,
    palakasanId: params.palakasanId,
    collegeId: params.collegeId,
    eventId: params.eventId || 'grievance-penalty',
    eventName: params.eventName
      ? `[Penalty] ${params.eventName}`
      : `[Grievance Deduction] ${params.scope.toUpperCase()}`,
    category: params.scope as any,
    eventType: 'Penalty / Grievance',
    finalRank: 'Penalty',
    pointsAwarded: pts,
    dateAwarded: now.toISOString().split('T')[0],
    declaredBy: params.adminUser,
    status: 'official',
    reason: params.reason,
    grievanceResolutionId: params.resolutionId || '',
    deductionScope: params.scope,
  };

  const batch = writeBatch(db);
  batch.set(transDoc, cleanForFirestore(transaction));

  // Log activity
  const logId = `log-${Date.now()}`;
  const logDoc = doc(db, 'activityLogs', logId);
  batch.set(
    logDoc,
    cleanForFirestore({
      id: logId,
      palakasanId: params.palakasanId,
      action: 'Points Deduction (Grievance)',
      eventTitle: transaction.eventName,
      eventId: transaction.eventId,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      adminUser: params.adminUser,
      description: `Deducted ${params.pointsToDeduct} pts from ${params.collegeId} (${params.scope}). Reason: ${params.reason}`,
      timestamp: Date.now(),
    })
  );

  await batch.commit();
  return transaction;
}

// ==========================================
// OFFICIAL RESULT & POINT TRANSACTIONS
// ==========================================

/**
 * Certifies event results, creates immutable point transactions, and marks event as official
 */
export async function certifyEventResult(
  event: PalakasanEvent,
  results: EventResultItem[],
  declaredBy: string,
  customScoring?: Record<Placement, number>
): Promise<void> {
  const batch = writeBatch(db);
  const nowStr = new Date().toISOString();

  // 1. Determine points based on event rules
  const championResult = results.find(r => r.placement === '1st');

  // 2. Create Point Transactions for each placing college
  for (const res of results) {
    const transId = `pt-${event.id}-${res.collegeId}-${Date.now()}`;
    const transDoc = doc(db, 'pointTransactions', transId);

    const trans: PointTransaction = {
      id: transId,
      palakasanId: event.palakasanId || 'palakasan-2026',
      collegeId: res.collegeId,
      eventId: event.id,
      eventName: event.eventName,
      category: event.category,
      eventType: (event.category === 'special' || event.pointTier === 'special')
        ? 'Special'
        : (event.isMajor || event.pointTier === 'major' ? 'Major' : 'Minor'),
      finalRank: res.placement,
      pointsAwarded: res.points,
      dateAwarded: nowStr,
      declaredBy,
      status: 'official',
    };

    batch.set(transDoc, cleanForFirestore(trans));
  }

  // 3. Update the event document (using set with merge: true to avoid NOT_FOUND if document was freshly added)
  const eventDoc = doc(db, 'events', event.id);
  batch.set(
    eventDoc,
    cleanForFirestore({
      ...event,
      status: 'completed',
      resultStatus: 'official',
      results,
      championCollegeId: championResult?.collegeId || null,
      declaredAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      declaredBy,
      updatedAt: nowStr,
    }),
    { merge: true }
  );

  // 4. Log the activity
  const logId = `log-${Date.now()}`;
  const logDoc = doc(db, 'activityLogs', logId);
  const logItem: ActivityLogItem = {
    id: logId,
    action: 'Declared Official Result',
    eventTitle: event.eventName,
    eventId: event.id,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    adminUser: declaredBy,
    description: `Official results certified for ${event.eventName}. Champion: ${championResult?.collegeId || 'N/A'}. Point transactions awarded.`,
    timestamp: Date.now(),
  };
  batch.set(logDoc, cleanForFirestore(logItem));

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `events/${event.id}`);
  }
}

/**
 * Revokes official results and reverses point transactions
 */
export async function revokeEventResult(
  event: PalakasanEvent,
  reason: string,
  adminUser: string
): Promise<void> {
  const batch = writeBatch(db);

  // 1. Fetch related transactions and mark as revoked
  const q = query(
    collection(db, 'pointTransactions'),
    where('eventId', '==', event.id),
    where('status', '==', 'official')
  );
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    batch.update(docSnap.ref, cleanForFirestore({ status: 'revoked' }));
  });

  // 2. Set event back to draft/pending
  const eventDoc = doc(db, 'events', event.id);
  batch.set(
    eventDoc,
    cleanForFirestore({
      ...event,
      resultStatus: 'draft',
      declaredAt: null,
      declaredBy: null,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );

  // 3. Log activity
  const logId = `log-${Date.now()}`;
  const logDoc = doc(db, 'activityLogs', logId);
  batch.set(
    logDoc,
    cleanForFirestore({
      id: logId,
      action: 'Revoked Official Result',
      eventTitle: event.eventName,
      eventId: event.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      adminUser,
      description: `Official result revoked for ${event.eventName}. Reason: ${reason}. Points reverted.`,
      timestamp: Date.now(),
    })
  );

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `events/${event.id}`);
  }
}

// ==========================================
// ACTIVITY LOGGING & DATA RESET
// ==========================================

export async function addDatabaseLog(
  action: string,
  description: string,
  adminUser: string,
  eventTitle?: string,
  eventId?: string,
  palakasanId?: string
): Promise<void> {
  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const logDoc = doc(db, 'activityLogs', logId);
  const now = new Date();
  await setDoc(
    logDoc,
    cleanForFirestore({
      id: logId,
      palakasanId: palakasanId || 'palakasan-2026',
      action,
      eventTitle: eventTitle || '',
      eventId: eventId || '',
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      adminUser,
      description,
      timestamp: Date.now(),
    })
  );
}

/**
 * Completely resets the tournament database back to the official default demonstration state.
 * Restores initial colleges, venues, categories, events, transactions, and scoring rules.
 */
export async function resetDatabaseToDefaults(adminUser: string): Promise<void> {
  try {
    // 1. Delete all existing pointTransactions
    const ptSnap = await getDocs(collection(db, 'pointTransactions'));
    const ptBatch = writeBatch(db);
    ptSnap.forEach(d => ptBatch.delete(d.ref));
    await ptBatch.commit();

    // 2. Delete all existing events
    const evSnap = await getDocs(collection(db, 'events'));
    const evBatch = writeBatch(db);
    evSnap.forEach(d => evBatch.delete(d.ref));
    await evBatch.commit();

    // 3. Delete all existing activity logs
    const logSnap = await getDocs(collection(db, 'activityLogs'));
    const logBatch = writeBatch(db);
    logSnap.forEach(d => logBatch.delete(d.ref));
    await logBatch.commit();

    // 4. Restore Palakasan 2026 edition
    const palakasanBatch = writeBatch(db);
    const pal2026Ref = doc(db, 'palakasans', 'palakasan-2026');
    palakasanBatch.set(
      pal2026Ref,
      cleanForFirestore({
        id: 'palakasan-2026',
        year: 2026,
        theme: 'Subaybay: Paghugpong sa Kalagsik, Pagpatunhay sa Kabilin',
        name: 'PALAKASAN 2026',
        startDate: '2026-09-15',
        endDate: '2026-09-19',
        status: 'ongoing',
        scoringRules: {
          majorPoints: { '1st': 50, '2nd': 40, '3rd': 30, '4th': 20, DQ: 0 },
          minorPoints: { '1st': 30, '2nd': 20, '3rd': 15, '4th': 10, DQ: 0 },
          specialPoints: { '1st': 60, '2nd': 45, '3rd': 30, '4th': 20, DQ: 0 },
        },
      })
    );

    // 5. Restore colleges
    for (const col of INITIAL_COLLEGES) {
      palakasanBatch.set(doc(db, 'colleges', col.id), cleanForFirestore(col));
    }

    // 6. Restore categories
    for (const cat of INITIAL_CATEGORIES) {
      palakasanBatch.set(doc(db, 'categories', cat.id), cleanForFirestore(cat));
    }

    // 7. Restore venues
    for (const v of INITIAL_VENUES) {
      palakasanBatch.set(doc(db, 'venues', v.id), cleanForFirestore(v));
    }

    await palakasanBatch.commit();

    // 8. Re-seed events and their certified point transactions
    const eventBatch = writeBatch(db);
    for (const ev of INITIAL_EVENTS) {
      eventBatch.set(
        doc(db, 'events', ev.id),
        cleanForFirestore({
          ...ev,
          palakasanId: 'palakasan-2026',
        })
      );

      // Re-seed transactions for completed events
      if (ev.status === 'completed' && ev.results) {
        for (const res of ev.results) {
          const transId = `pt-${ev.id}-${res.collegeId}`;
          const isSpecial = ev.category === 'special' || ev.pointTier === 'special';
          const isMajor = ev.pointTier === 'major' || (ev.pointTier !== 'minor' && (ev.isMajor || ev.category === 'sports'));
          const eventTypeLabel = isSpecial ? 'Special' : isMajor ? 'Major' : 'Minor';

          const trans: PointTransaction = {
            id: transId,
            palakasanId: 'palakasan-2026',
            collegeId: res.collegeId,
            eventId: ev.id,
            eventName: ev.eventName,
            category: ev.category,
            eventType: eventTypeLabel,
            finalRank: res.placement,
            pointsAwarded: res.points,
            dateAwarded: ev.date,
            declaredBy: ev.declaredBy || adminUser,
            status: 'official',
          };
          eventBatch.set(doc(db, 'pointTransactions', transId), cleanForFirestore(trans));
        }
      }
    }

    // 9. Re-seed Historical 2025 Transactions
    for (const trans of HISTORICAL_2025_TRANSACTIONS) {
      eventBatch.set(doc(db, 'pointTransactions', trans.id), cleanForFirestore(trans));
    }

    // 10. Re-seed initial activity log
    for (const log of INITIAL_ACTIVITY_LOGS) {
      eventBatch.set(
        doc(db, 'activityLogs', log.id),
        cleanForFirestore({ ...log, palakasanId: 'palakasan-2026' })
      );
    }

    // Add restoration log
    const resetLogId = `log-${Date.now()}`;
    eventBatch.set(
      doc(db, 'activityLogs', resetLogId),
      cleanForFirestore({
        id: resetLogId,
        palakasanId: 'palakasan-2026',
        action: 'Restored Default Tournament State',
        eventTitle: 'System Reset',
        eventId: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        adminUser,
        description: `Tournament state successfully restored to official MSUN Palakasan defaults by ${adminUser}.`,
        timestamp: Date.now(),
      })
    );

    await eventBatch.commit();
    console.log('Database successfully restored to defaults by', adminUser);
  } catch (err) {
    console.error('Error resetting database to defaults:', err);
    throw err;
  }
}

/**
 * Clears all certified point transactions for the current tournament and
 * sets all completed events back to upcoming with cleared results.
 * This effectively zeroes the tournament leaderboard so a tournament can start clean.
 */
export async function clearTournamentPointHistory(palakasanId: string = 'palakasan-2026', adminUser: string): Promise<void> {
  try {
    // 1. Delete all point transactions for this palakasan
    const ptQ = query(collection(db, 'pointTransactions'), where('palakasanId', '==', palakasanId));
    const ptSnap = await getDocs(ptQ);
    const ptBatch = writeBatch(db);
    ptSnap.forEach(d => ptBatch.delete(d.ref));
    await ptBatch.commit();

    // 2. Clear results and reset completed/ongoing events to 'upcoming'
    const evQ = query(collection(db, 'events'), where('palakasanId', '==', palakasanId));
    const evSnap = await getDocs(evQ);
    const evBatch = writeBatch(db);
    evSnap.forEach(d => {
      const data = d.data() as PalakasanEvent;
      evBatch.update(
        d.ref,
        cleanForFirestore({
          status: 'upcoming',
          resultStatus: 'draft',
          results: null,
          championCollegeId: null,
          declaredAt: null,
          declaredBy: null,
        })
      );
    });
    await evBatch.commit();

    // 3. Log the action
    await addDatabaseLog(
      'Cleared All Points & Results',
      `All official results and point transactions were cleared by ${adminUser}. Standings reset to 0.`,
      adminUser,
      'Point Ledger Reset',
      '',
      palakasanId
    );
  } catch (err) {
    console.error('Error clearing point history:', err);
    throw err;
  }
}

/**
 * Clears all activity log history entries.
 */
export async function clearAllActivityLogs(palakasanId: string = 'palakasan-2026', adminUser: string): Promise<void> {
  try {
    const q = query(collection(db, 'activityLogs'), where('palakasanId', '==', palakasanId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();

    // Add 1 clean entry
    await addDatabaseLog(
      'Audit Trail Cleared',
      `Activity logs were purged by ${adminUser}. Fresh audit logging initiated.`,
      adminUser,
      'Audit Trail',
      '',
      palakasanId
    );
  } catch (err) {
    console.error('Error clearing activity logs:', err);
    throw err;
  }
}

/**
 * Deletes or revokes a single point transaction from the ledger.
 */
export async function deletePointTransaction(txId: string, adminUser: string): Promise<void> {
  try {
    const docRef = doc(db, 'pointTransactions', txId);
    await deleteDoc(docRef);

    await addDatabaseLog(
      'Deleted Point Transaction',
      `Transaction ${txId} was removed from the official ledger by ${adminUser}.`,
      adminUser,
      'Ledger Adjustment',
      txId
    );
  } catch (err) {
    console.error('Error deleting point transaction:', err);
    throw err;
  }
}
