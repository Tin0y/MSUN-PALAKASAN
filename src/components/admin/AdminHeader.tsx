import React from 'react';
import { Menu, Plus, Calendar, FileCheck2, Trophy, ExternalLink, ShieldCheck, LogOut, Lock } from 'lucide-react';
import { AdminSection } from '../../types';
import { usePalakasan } from '../../context/PalakasanContext';

interface AdminHeaderProps {
  currentSection: AdminSection;
  onOpenMobileMenu: () => void;
  onOpenCreateEvent: () => void;
  onNavigateSection: (section: AdminSection) => void;
  onBackToPublic: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentSection,
  onOpenMobileMenu,
  onOpenCreateEvent,
  onNavigateSection,
  onBackToPublic,
}) => {
  const {
    currentAccount,
    logoutAdmin,
    rankingsVisibility,
    adminSpectatorPreview,
    setAdminSpectatorPreview,
  } = usePalakasan();
  const getSectionTitle = (sec: AdminSection): { title: string; subtitle: string } => {
    switch (sec) {
      case 'dashboard':
        return {
          title: 'Admin Dashboard',
          subtitle: 'PALAKASAN tournament overview, current status, and quick management controls.',
        };
      case 'palakasans':
        return {
          title: 'PALAKASAN Editions & Archive',
          subtitle: 'Multi-season management, edition configuration, and historical records preservation.',
        };
      case 'events':
        return {
          title: 'Event Management',
          subtitle: 'Create, modify, monitor, and configure all tournament events and brackets.',
        };
      case 'competitions':
        return {
          title: 'Competitions & Brackets',
          subtitle: 'Manage tournaments, double elimination brackets, round robin groups, and individual match scoring.',
        };
      case 'schedule':
        return {
          title: 'Schedule Management',
          subtitle: 'Chronological master timeline, venue management, and session timing controls.',
        };
      case 'results':
        return {
          title: 'Result Management',
          subtitle: 'Enter match scores, review pending results, and declare certified official winners.',
        };
      case 'standings':
        return {
          title: 'Standings Ledger',
          subtitle: 'Real-time category point allocations and overall university championship rankings.',
        };
      case 'transactions':
        return {
          title: 'Point Transaction Ledger',
          subtitle: 'Audit trail of certified point transactions linking events to college totals.',
        };
      case 'colleges':
        return {
          title: 'Participating Colleges',
          subtitle: 'Comprehensive performance profiles, event participation, and medal counts.',
        };
      case 'venues':
        return {
          title: 'Venue Management',
          subtitle: 'Campus sports courts, arenas, and halls with schedule conflict detection.',
        };
      case 'categories':
        return {
          title: 'Event Categories',
          subtitle: 'Competitive pillars: Sports, Cultural, Literary, and Special Events.',
        };
      case 'scoring':
        return {
          title: 'Scoring Rules',
          subtitle: 'Championship point scales for Major and Minor tournament events.',
        };
      case 'activity-log':
        return {
          title: 'Activity Log & Audit Trail',
          subtitle: 'Full historical log of administrative actions, schedule changes, and result declarations.',
        };
      case 'settings':
        return {
          title: 'Tournament Controls & Settings',
          subtitle: 'Configuration options, simulated live clock, and data restoration tools.',
        };
      default:
        return {
          title: 'Admin Management',
          subtitle: 'MSUN PALAKASAN administrative portal.',
        };
    }
  };

  const { title, subtitle } = getSectionTitle(currentSection);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              id="admin-mobile-menu-btn"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {title}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${currentAccount?.badgeColor || 'bg-blue-50 text-blue-700 border-blue-200/80'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{currentAccount ? `${currentAccount.name} • ${currentAccount.badge}` : 'Official Admin'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block line-clamp-1">{subtitle}</p>
            </div>
          </div>

          {/* Right: Quick Action Buttons & Public Switch */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="admin-header-create-event-btn"
              onClick={onOpenCreateEvent}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </button>

            <button
              id="admin-header-results-btn"
              onClick={() => onNavigateSection('results')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Enter Results</span>
            </button>

            <button
              id="admin-header-schedule-btn"
              onClick={() => onNavigateSection('schedule')}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Schedule</span>
            </button>

            <button
              id="admin-header-standings-btn"
              onClick={() => onNavigateSection('standings')}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Standings</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {rankingsVisibility.hideAllRankings && (
              <button
                type="button"
                onClick={() => setAdminSpectatorPreview(!adminSpectatorPreview)}
                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  adminSpectatorPreview
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300/30'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
                title={adminSpectatorPreview ? 'Currently previewing public sealed curtain. Click for Live Committee view.' : 'Rankings sealed from public. Click to preview sealed spectator screen.'}
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Thrill Mode:</span>
                <span>{adminSpectatorPreview ? 'Spectator View' : 'Committee View'}</span>
              </button>
            )}

            <button
              id="admin-header-public-btn"
              onClick={onBackToPublic}
              className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50/60 border border-slate-200 sm:border-transparent text-xs font-medium transition-colors cursor-pointer"
              title="Return to public MSUN PALAKASAN portal"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Site</span>
            </button>

            <button
              id="admin-header-logout-btn"
              onClick={() => {
                logoutAdmin();
                onBackToPublic();
              }}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-medium transition-colors cursor-pointer"
              title="Sign out of administrative session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
