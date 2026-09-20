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
    getHappeningNowEvent,
    allPalakasans,
    viewedPalakasanId,
    setViewedPalakasanId,
    currentPalakasan,
  } = usePalakasan();
  const liveEvent = getHappeningNowEvent();

  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { tab: 'overall', label: 'Standings', icon: <Trophy className="w-4 h-4" /> },
    { tab: 'sports', label: 'Sports', icon: <Award className="w-4 h-4" /> },
    { tab: 'cultural', label: 'Cultural', icon: <Sparkles className="w-4 h-4" /> },
    { tab: 'literary', label: 'Literary', icon: <BookOpen className="w-4 h-4" /> },
    { tab: 'special', label: 'Special Events', icon: <Flame className="w-4 h-4" /> },
    { tab: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'results', label: 'Results', icon: <FileText className="w-4 h-4" /> },
    { tab: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Academic Sub-bar */}
      <div className="bg-blue-50/70 border-b border-blue-100/60 px-4 py-1 text-xs text-slate-600">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              {liveEvent ? 'Event Live' : 'Official Portal'}
            </span>
            <span className="text-slate-600 text-[11px] hidden sm:inline">
              Mindanao State University at Naawan • University-Wide Competition
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-blue-900/80 font-medium hidden md:inline">
              Official Scoring: 1st (50) • 2nd (40) • 3rd (30) • 4th (20) • DQ (0)
            </span>
            {isAdminLoggedIn && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Shield className="w-3 h-3" /> Admin Mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-blue-950 group-hover:text-blue-600 transition-colors">
                  MSUN PALAKASAN
                </span>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5">MSU at Naawan</p>
              </div>
            </button>

            {/* Edition Selector */}
            {allPalakasans.length > 1 ? (
              <select
                value={viewedPalakasanId}
                onChange={e => setViewedPalakasanId(e.target.value)}
                className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                title="Select PALAKASAN Edition"
              >
                {allPalakasans.map(ed => (
                  <option key={ed.id} value={ed.id}>
                    {ed.year} {ed.isCurrent ? '(Active)' : '(Archive)'}
                  </option>
                ))}
              </select>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                {currentPalakasan?.year || '2026'}
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map(item => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  id={`nav-${item.tab}`}
                  onClick={() => handleNavClick(item.tab)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold'
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
          <div className="flex items-center gap-2">
            <button
              id="search-trigger-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:text-blue-700 hover:bg-blue-50/60 border border-slate-200 text-xs font-medium transition-colors"
              title="Search colleges, events, venues..."
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            <button
              id="admin-dashboard-btn"
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isAdminLoggedIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? 'Admin' : 'Admin'}</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 animate-fadeIn shadow-lg">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 px-3 py-1">
            Tournament Menu
          </div>
          {navItems.map(item => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                id={`mobile-nav-${item.tab}`}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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

          <div className="pt-3 border-t border-slate-100 mt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? 'Admin Panel' : 'Official Committee Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
