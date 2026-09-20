import { CollegeId, Placement } from '../types';

export const getCollegeBadgeStyle = (acronym: CollegeId) => {
  switch (acronym) {
    case 'CBIT':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700 font-bold',
        border: 'border-blue-200',
        hoverBorder: 'hover:border-blue-400',
        accentBg: 'bg-blue-600',
        ring: 'ring-blue-400/20',
        glow: 'shadow-blue-500/5',
      };
    case 'CESS-IDS':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700 font-bold',
        border: 'border-emerald-200',
        hoverBorder: 'hover:border-emerald-400',
        accentBg: 'bg-emerald-600',
        ring: 'ring-emerald-400/20',
        glow: 'shadow-emerald-500/5',
      };
    case 'CFMS':
      return {
        bg: 'bg-cyan-50',
        text: 'text-cyan-800 font-bold',
        border: 'border-cyan-200',
        hoverBorder: 'hover:border-cyan-400',
        accentBg: 'bg-cyan-600',
        ring: 'ring-cyan-400/20',
        glow: 'shadow-cyan-500/5',
      };
    case 'CELS':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800 font-bold',
        border: 'border-amber-200',
        hoverBorder: 'hover:border-amber-400',
        accentBg: 'bg-amber-600',
        ring: 'ring-amber-400/20',
        glow: 'shadow-amber-500/5',
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700 font-bold',
        border: 'border-slate-200',
        hoverBorder: 'hover:border-slate-400',
        accentBg: 'bg-slate-600',
        ring: 'ring-slate-400/20',
        glow: 'shadow-none',
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
