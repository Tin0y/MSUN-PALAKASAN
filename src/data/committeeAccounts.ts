import { CommitteeAccount } from '../types';

export const COMMITTEE_ACCOUNTS: CommitteeAccount[] = [
  {
    id: 'admin',
    role: 'admin',
    name: 'Administrator',
    title: 'Tournament Administrator',
    department: 'Tournament Executive Committee',
    passcode: 'admin@2026',
    badge: 'Tournament Admin',
    avatarInitials: 'AD',
    avatarColor: 'bg-blue-600 text-white',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconName: 'Shield',
    description: 'Full tournament control across all categories, schedules, settings, and official certifications.',
  },
  {
    id: 'sports_head',
    role: 'sports_head',
    name: 'Dan',
    title: 'Games & Sports Committee Head',
    department: 'Games and Sports Committee',
    passcode: 'gamesandsports@dan',
    category: 'sports',
    badge: 'Games & Sports Head',
    avatarInitials: 'DH',
    avatarColor: 'bg-indigo-600 text-white',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconName: 'Trophy',
    description: 'Committee Head managing Basketball, Volleyball, Badminton, Sepak Takraw, Football, and athletics.',
  },
  {
    id: 'cultural_head',
    role: 'cultural_head',
    name: 'Maxine',
    title: 'Cultural Committee Head',
    department: 'Cultural Affairs Committee',
    passcode: 'cultural@maxine',
    category: 'cultural',
    badge: 'Cultural Head',
    avatarInitials: 'MH',
    avatarColor: 'bg-purple-600 text-white',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconName: 'Sparkles',
    description: 'Committee Head managing Vocal Solo, Vocal Duet, Folk Dance, Modern Hip-Hop, Acoustic Band, and Cultural Show.',
  },
  {
    id: 'literary_head',
    role: 'literary_head',
    name: 'Jennifer',
    title: 'Literary Committee Head',
    department: 'Literary Affairs Committee',
    passcode: 'literary@jennifer',
    category: 'literary',
    badge: 'Literary Head',
    avatarInitials: 'JH',
    avatarColor: 'bg-amber-600 text-white',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    iconName: 'BookOpen',
    description: 'Committee Head managing Oration, Extemporaneous Speaking, Declamation, Storytelling, Essay Writing, and Quiz Bowl.',
  },
  {
    id: 'special_head',
    role: 'special_head',
    name: 'Shiene',
    title: 'Special Events Committee Head',
    department: 'Special Events Committee',
    passcode: 'special@shiene',
    category: 'special',
    badge: 'Special Events Head',
    avatarInitials: 'SH',
    avatarColor: 'bg-emerald-600 text-white',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconName: 'Flame',
    description: 'Committee Head managing Arnis, Swimming, Mr. & Ms. PALAKASAN, Cheerdance Competition, and Laro ng Lahi.',
  },
];

export const findCommitteeAccountByPasscode = (passcode: string): CommitteeAccount | undefined => {
  if (!passcode) return undefined;
  const cleaned = passcode.trim();
  // Support both exact matching and case-insensitive matching
  return COMMITTEE_ACCOUNTS.find(
    acc => acc.passcode === cleaned || acc.passcode.toLowerCase() === cleaned.toLowerCase()
  );
};

export const getCommitteeAccountById = (id: string): CommitteeAccount | undefined => {
  return COMMITTEE_ACCOUNTS.find(acc => acc.id === id);
};
