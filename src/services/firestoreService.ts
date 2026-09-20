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
 * Ensures that initial seed data exists in Firestore.
 * If collections are empty, it seeds Palakasans, Colleges, Categories, Venues, Events,
 * Point Transactions, and Activity Logs.
 */
export async function initializeFirestoreDatabase(): Promise<void> {
  try {
    // 1. Check if palakasans collection exists
    const palakasansRef = collection(db, 'palakasans');
    const snap = await getDocs(palakasansRef);

    if (snap.empty) {
      console.log('Seeding initial Firestore database...');
      const batch = writeBatch(db);

      // Seed Palakasan Editions
      const p2026Doc = doc(db, 'palakasans', DEFAULT_PALAKASAN_2026.id);
      batch.set(p2026Doc, cleanForFirestore(DEFAULT_PALAKASAN_2026));

      const p2025Doc = doc(db, 'palakasans', DEFAULT_PALAKASAN_2025.id);
      batch.set(p2025Doc, cleanForFirestore(DEFAULT_PALAKASAN_2025));

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

      // Seed Initial Events linked to palakasan-2026
      const initialTransactions: PointTransaction[] = [];
      for (const ev of INITIAL_EVENTS) {
        const evDoc = doc(db, 'events', ev.id);
        const eventWithPalakasan: PalakasanEvent = {
          ...ev,
          palakasanId: 'palakasan-2026',
          isMajor: ev.category === 'sports' || ev.category === 'special',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        batch.set(evDoc, cleanForFirestore(eventWithPalakasan));

        // If event is already completed and official, create its point transactions
        if (ev.status === 'completed' && ev.resultStatus === 'official' && ev.results) {
          for (const res of ev.results) {
            const transId = `pt-${ev.id}-${res.collegeId}`;
            const trans: PointTransaction = {
              id: transId,
              palakasanId: 'palakasan-2026',
              collegeId: res.collegeId,
              eventId: ev.id,
              eventName: ev.eventName,
              category: ev.category,
              eventType: (ev.category === 'special' || ev.pointTier === 'special') ? 'Special' : (eventWithPalakasan.isMajor ? 'Major' : 'Minor'),
              finalRank: res.placement,
              pointsAwarded: res.points,
              dateAwarded: ev.declaredAt || '2026-09-15',
              declaredBy: ev.declaredBy || 'Official Committee',
              status: 'official',
            };
            initialTransactions.push(trans);
            const transDoc = doc(db, 'pointTransactions', transId);
            batch.set(transDoc, cleanForFirestore(trans));
          }
        }
      }

      // Seed Historical 2025 Transactions
      for (const trans of HISTORICAL_2025_TRANSACTIONS) {
        const transDoc = doc(db, 'pointTransactions', trans.id);
        batch.set(transDoc, cleanForFirestore(trans));
      }

      // Seed Activity Logs
      for (const log of INITIAL_ACTIVITY_LOGS) {
        const logDoc = doc(db, 'activityLogs', log.id);
        batch.set(
          logDoc,
          cleanForFirestore({
            ...log,
            palakasanId: 'palakasan-2026',
          })
        );
      }

      await batch.commit();
      console.log('Initial Firestore database seeded successfully!');
    } else {
      // Synchronize/ensure college monikers match updated designations
      try {
        const collegesRef = collection(db, 'colleges');
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

      // Synchronize/ensure specialPoints exist in palakasans scoringRules
      try {
        const palakasansRef = collection(db, 'palakasans');
        const palSnap = await getDocs(palakasansRef);
        if (!palSnap.empty) {
          const palBatch = writeBatch(db);
          let needsPalSync = false;
          palSnap.forEach(docSnap => {
            const data = docSnap.data() as PalakasanEdition;
            if (!data.scoringRules?.specialPoints) {
              palBatch.set(
                docSnap.ref,
                cleanForFirestore({
                  ...data,
                  scoringRules: {
                    ...data.scoringRules,
                    specialPoints: { '1st': 60, '2nd': 45, '3rd': 30, '4th': 20, DQ: 0 },
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

export async function removeEvent(id: string): Promise<void> {
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);
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
// ACTIVITY LOGGING
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
