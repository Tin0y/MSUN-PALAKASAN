import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  FileText,
  Search,
  Menu,
  X,
  Shield,
  Home,
  Info,
  Flame,
  Award,
  BookOpen,
  Sparkles,
  Lock,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { usePalakasan } from '../context/PalakasanContext';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    isAdminLoggedIn,
    currentAccount,
    getHappeningNowEvent,
    allPalakasans,
    viewedPalakasanId,
    setViewedPalakasanId,
    currentPalakasan,
    rankingsVisibility,
  } = usePalakasan();
  const liveEvent = getHappeningNowEvent();

  const navItems: {
    tab: NavigationTab;
    label: string;
    shortLabel?: string;
    icon: React.ReactNode;
  }[] = [
    { tab: 'home', label: 'Home', shortLabel: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { tab: 'overall', label: 'Standings', shortLabel: 'Standings', icon: <Trophy className="w-3.5 h-3.5" /> },
    { tab: 'sports', label: 'Sports', shortLabel: 'Sports', icon: <Award className="w-3.5 h-3.5" /> },
    { tab: 'cultural', label: 'Cultural', shortLabel: 'Cultural', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { tab: 'literary', label: 'Literary', shortLabel: 'Literary', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { tab: 'special', label: 'Special Events', shortLabel: 'Special', icon: <Flame className="w-3.5 h-3.5" /> },
    { tab: 'schedule', label: 'Schedule', shortLabel: 'Schedule', icon: <Calendar className="w-3.5 h-3.5" /> },
    { tab: 'results', label: 'Results', shortLabel: 'Results', icon: <FileText className="w-3.5 h-3.5" /> },
    { tab: 'about', label: 'About', shortLabel: 'About', icon: <Info className="w-3.5 h-3.5" /> },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
      {/* Top Academic Sub-bar (visible on desktop/tablet, hidden on mobile to prevent clipping and save screen height) */}
      <div className="hidden md:block bg-blue-50/70 border-b border-blue-100/60 px-4 py-1 text-xs text-slate-600">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              {liveEvent ? 'Event Live Now' : 'Official Portal'}
            </span>
            <span className="text-slate-600 text-[11px] truncate">
              Mindanao State University at Naawan • University-Wide Competition
            </span>
            {rankingsVisibility.hideAllRankings && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse shrink-0">
                <Lock className="w-2.5 h-2.5 text-amber-800" />
                <span>Thrill Mode Active</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-blue-900/80 font-medium hidden xl:inline">
              Official Scoring: 1st (50) • 2nd (40) • 3rd (30) • 4th (20) • DQ (0)
            </span>
            {isAdminLoggedIn && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                <Shield className="w-3 h-3" /> {currentAccount ? `${currentAccount.name} (${currentAccount.badge})` : 'Admin Mode'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2 lg:gap-3">
          {/* Brand Name - Responsive sizing for all screen sizes */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-1.5 sm:gap-2.5 group text-left shrink-0 cursor-pointer"
              title="MSUN PALAKASAN Home"
            >
              <div className="shrink-0 select-none">
                <span className="font-extrabold tracking-tight text-sm sm:text-base xl:text-lg text-blue-950 group-hover:text-blue-600 transition-colors whitespace-nowrap block leading-tight">
                  MSUN PALAKASAN
                </span>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium whitespace-nowrap hidden sm:block">
                  MSU at Naawan
                </p>
              </div>
            </button>

            {/* Edition Selector on Ultra-Wide Desktop (Hidden on cramped screens) */}
            {allPalakasans.length > 1 ? (
              <div className="hidden 2xl:block shrink-0">
                <select
                  value={viewedPalakasanId}
                  onChange={e => setViewedPalakasanId(e.target.value)}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                  title="Select PALAKASAN Edition"
                >
                  {allPalakasans.map(ed => (
                    <option key={ed.id} value={ed.id}>
                      {ed.year} {ed.isCurrent ? '(Active)' : '(Archive)'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="hidden 2xl:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                {currentPalakasan?.year || '2026'}
              </span>
            )}
          </div>

          {/* Desktop Navigation Links - Sized responsively to fit on desktop screens without overlapping */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0" aria-label="Main Navigation">
            {navItems.map(item => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  id={`nav-${item.tab}`}
                  onClick={() => handleNavClick(item.tab)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/90 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Live Indicator Chip on Mobile */}
            {liveEvent && (
              <span className="inline-flex sm:hidden items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden xs:inline">Live</span>
              </span>
            )}

            {/* Search Trigger Button */}
            <button
              id="search-trigger-btn"
              onClick={onOpenSearch}
              className="flex items-center justify-center gap-1.5 p-1.5 sm:px-2.5 xl:px-3 sm:py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:text-blue-700 hover:bg-blue-50/60 border border-slate-200 text-xs font-medium transition-colors cursor-pointer shrink-0"
              title="Search colleges, events, venues..."
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden 2xl:inline-block px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Admin Dashboard Button (Desktop & Tablet) */}
            <button
              id="admin-dashboard-btn"
              onClick={onOpenAdmin}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                isAdminLoggedIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? (currentAccount ? `${currentAccount.name}` : 'Admin Portal') : 'Admin'}</span>
            </button>

            {/* Mobile / Tablet Menu Toggle Button (shown on screens < 1280px) */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`xl:hidden p-1.5 sm:p-2 rounded-lg border transition-colors relative cursor-pointer shrink-0 ${
                mobileMenuOpen
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {isAdminLoggedIn && !mobileMenuOpen && (
                <span className="sm:hidden absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Brand header inside mobile drawer */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                MSUN PALAKASAN
              </span>
              <span className="text-[10px] text-slate-500">Mindanao State University at Naawan</span>
            </div>
            {rankingsVisibility.hideAllRankings && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Lock className="w-2.5 h-2.5" />
                <span>Thrill Mode</span>
              </span>
            )}
          </div>

          {/* Tournament Edition Selector on Mobile */}
          {allPalakasans.length > 1 && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80">
              <label
                htmlFor="mobile-palakasan-selector"
                className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1.5"
              >
                Tournament Edition
              </label>
              <select
                id="mobile-palakasan-selector"
                value={viewedPalakasanId}
                onChange={e => {
                  setViewedPalakasanId(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-white text-blue-900 border border-blue-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {allPalakasans.map(ed => (
                  <option key={ed.id} value={ed.id}>
                    {ed.name} ({ed.year}) {ed.isCurrent ? '— Active Competition' : '— Historical Archive'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 px-1">
            Tournament Navigation
          </div>

          <div className="space-y-1">
            {navItems.map(item => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  id={`mobile-nav-${item.tab}`}
                  onClick={() => handleNavClick(item.tab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              );
            })}
          </div>

          {/* Admin Panel Access on Mobile */}
          <div className="pt-3 border-t border-slate-100">
            <button
              id="mobile-admin-panel-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                isAdminLoggedIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>
                {isAdminLoggedIn
                  ? currentAccount
                    ? `${currentAccount.title} (${currentAccount.name})`
                    : 'Open Admin Control Panel'
                  : 'Official Committee Admin Login'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
