import { CollegeId, Placement } from '../types';

export const getCollegeBadgeStyle = (acronym: CollegeId | string) => {
  switch (acronym) {
    case 'CBIT':
      // Yellow
      return {
        colorName: 'Yellow',
        hex: '#ca8a04',
        accentHex: '#eab308',
        bg: 'bg-amber-50',
        lightBg: 'bg-amber-100/70',
        text: 'text-amber-900 font-bold',
        border: 'border-amber-300',
        hoverBorder: 'hover:border-amber-400',
        accentBg: 'bg-amber-500',
        barBg: 'bg-amber-500',
        dot: 'bg-amber-500',
        borderLeft: 'border-l-amber-500',
        ring: 'ring-amber-400/30',
        glow: 'shadow-amber-500/15',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        pill: 'bg-amber-500 text-slate-950 font-bold',
        rankHighlight: 'bg-amber-50/70 border-amber-200',
      };
    case 'CELS':
      // Green
      return {
        colorName: 'Green',
        hex: '#16a34a',
        accentHex: '#22c55e',
        bg: 'bg-emerald-50',
        lightBg: 'bg-emerald-100/70',
        text: 'text-emerald-900 font-bold',
        border: 'border-emerald-300',
        hoverBorder: 'hover:border-emerald-400',
        accentBg: 'bg-emerald-600',
        barBg: 'bg-emerald-600',
        dot: 'bg-emerald-500',
        borderLeft: 'border-l-emerald-600',
        ring: 'ring-emerald-400/30',
        glow: 'shadow-emerald-500/15',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        pill: 'bg-emerald-600 text-white font-bold',
        rankHighlight: 'bg-emerald-50/70 border-emerald-200',
      };
    case 'CESS-IDS':
      // Purple
      return {
        colorName: 'Purple',
        hex: '#9333ea',
        accentHex: '#a855f7',
        bg: 'bg-purple-50',
        lightBg: 'bg-purple-100/70',
        text: 'text-purple-900 font-bold',
        border: 'border-purple-300',
        hoverBorder: 'hover:border-purple-400',
        accentBg: 'bg-purple-600',
        barBg: 'bg-purple-600',
        dot: 'bg-purple-500',
        borderLeft: 'border-l-purple-600',
        ring: 'ring-purple-400/30',
        glow: 'shadow-purple-500/15',
        badge: 'bg-purple-100 text-purple-900 border-purple-300',
        pill: 'bg-purple-600 text-white font-bold',
        rankHighlight: 'bg-purple-50/70 border-purple-200',
      };
    case 'CFMS':
      // Blue
      return {
        colorName: 'Blue',
        hex: '#2563eb',
        accentHex: '#3b82f6',
        bg: 'bg-blue-50',
        lightBg: 'bg-blue-100/70',
        text: 'text-blue-900 font-bold',
        border: 'border-blue-300',
        hoverBorder: 'hover:border-blue-400',
        accentBg: 'bg-blue-600',
        barBg: 'bg-blue-600',
        dot: 'bg-blue-500',
        borderLeft: 'border-l-blue-600',
        ring: 'ring-blue-400/30',
        glow: 'shadow-blue-500/15',
        badge: 'bg-blue-100 text-blue-900 border-blue-300',
        pill: 'bg-blue-600 text-white font-bold',
        rankHighlight: 'bg-blue-50/70 border-blue-200',
      };
    default:
      return {
        colorName: 'Slate',
        hex: '#64748b',
        accentHex: '#94a3b8',
        bg: 'bg-slate-100',
        lightBg: 'bg-slate-100',
        text: 'text-slate-700 font-bold',
        border: 'border-slate-200',
        hoverBorder: 'hover:border-slate-400',
        accentBg: 'bg-slate-600',
        barBg: 'bg-slate-600',
        dot: 'bg-slate-400',
        borderLeft: 'border-l-slate-400',
        ring: 'ring-slate-400/20',
        glow: 'shadow-none',
        badge: 'bg-slate-100 text-slate-800 border-slate-300',
        pill: 'bg-slate-600 text-white font-bold',
        rankHighlight: 'bg-slate-50 border-slate-200',
      };
  }
};

export const getPlacementBadge = (placement: Placement) => {
  switch (placement) {
    case '1st':
      return {
        label: '1st Place',
        icon: '🥇',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
        pts: 50,
      };
    case '2nd':
      return {
        label: '2nd Place',
        icon: '🥈',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 font-semibold',
        pts: 40,
      };
    case '3rd':
      return {
        label: '3rd Place',
        icon: '🥉',
        badgeClass: 'bg-amber-100/60 text-amber-900 border-amber-200 font-semibold',
        pts: 30,
      };
    case '4th':
      return {
        label: '4th Place',
        icon: '4th',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 font-medium',
        pts: 20,
      };
    case 'DQ':
      return {
        label: 'DISQUALIFIED (DQ)',
        icon: '🚫',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
        pts: 0,
      };
  }
};

export const getCategoryMeta = (cat: string) => {
  switch (cat) {
    case 'sports':
      return { name: 'Sports', icon: '🏅', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    case 'cultural':
      return { name: 'Cultural', icon: '🎭', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    case 'literary':
      return { name: 'Literary', icon: '📚', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    case 'special':
      return { name: 'Special Events', icon: '⭐', color: 'text-sky-800 bg-sky-50 border-sky-200' };
    default:
      return { name: 'Event', icon: '🏆', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  }
};
