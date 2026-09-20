import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  FileCheck2,
  Trophy,
  GraduationCap,
  History,
  Settings,
  LogOut,
  ExternalLink,
  PlusCircle,
  Clock,
  Radio,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Layers,
  Award,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { AdminSection } from '../../types';
import { usePalakasan } from '../../context/PalakasanContext';

interface AdminSidebarProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onOpenCreateEvent: () => void;
  onBackToPublic: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSection,
  onSelectSection,
  onOpenCreateEvent,
  onBackToPublic,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { logoutAdmin, getEventStats, allPalakasans, venues, colleges } = usePalakasan();
  const stats = getEventStats();

  const navItems = [
    {
      id: 'dashboard' as AdminSection,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'palakasans' as AdminSection,
      label: 'PALAKASAN Editions',
      icon: <Sparkles className="w-4 h-4" />,
      badge: `${allPalakasans.length}`,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'events' as AdminSection,
      label: 'Event Management',
      icon: <Calendar className="w-4 h-4" />,
      badge: stats.totalEvents,
    },
    {
      id: 'competitions' as AdminSection,
      label: 'Competitions & Brackets',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: stats.gamesOngoing > 0 ? `${stats.gamesOngoing} live` : (stats.totalGames > 0 ? `${stats.totalGames} matches` : null),
      badgeColor: stats.gamesOngoing > 0 ? 'bg-blue-100 text-blue-800 animate-pulse' : undefined,
    },
    {
      id: 'schedule' as AdminSection,
      label: 'Schedule Management',
      icon: <CalendarDays className="w-4 h-4" />,
      badge: stats.upcomingEvents > 0 ? `${stats.upcomingEvents} upcoming` : null,
    },
    {
      id: 'results' as AdminSection,
      label: 'Result Management',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: stats.pendingResultsEvents > 0 ? `${stats.pendingResultsEvents} pending` : null,
      badgeColor: stats.pendingResultsEvents > 0 ? 'bg-amber-100 text-amber-800' : undefined,
    },
    {
      id: 'standings' as AdminSection,
      label: 'Standings Ledger',
      icon: <Trophy className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'transactions' as AdminSection,
      label: 'Point Transactions',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'colleges' as AdminSection,
      label: 'Participating Colleges',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: `${colleges.length}`,
    },
    {
      id: 'venues' as AdminSection,
      label: 'Venue Management',
      icon: <MapPin className="w-4 h-4" />,
      badge: `${venues.length}`,
    },
    {
      id: 'categories' as AdminSection,
      label: 'Event Categories',
      icon: <Layers className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'scoring' as AdminSection,
      label: 'Scoring Rules',
      icon: <Award className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'activity-log' as AdminSection,
      label: 'Activity Log',
      icon: <History className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'settings' as AdminSection,
      label: 'Tournament Controls',
      icon: <Settings className="w-4 h-4" />,
      badge: null,
    },
  ];

  const handleNavClick = (section: AdminSection) => {
    onSelectSection(section);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    logoutAdmin();
    onBackToPublic();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-700 w-64 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 bg-blue-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-blue-950 tracking-tight">PALAKASAN</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">MSU at Naawan</p>
          </div>
        </div>
      </div>

      {/* Quick Action Button: Create Event */}
      <div className="p-3 border-b border-slate-100">
        <button
          id="admin-sidebar-create-event-btn"
          onClick={() => {
            onOpenCreateEvent();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create Event</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
          Management
        </div>

        {navItems.map(item => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              id={`admin-nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    item.badgeColor || (isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Status Pill */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 m-3 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> Live System
          </span>
          <span className="text-[10px] text-blue-700 font-bold">Auto-Scoring</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Official results update standings dynamically across the public website.
        </p>
      </div>

      {/* Footer / Switch to Public & Logout */}
      <div className="p-3 border-t border-slate-200 space-y-1 bg-white">
        <button
          id="admin-sidebar-public-site-btn"
          onClick={onBackToPublic}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Public Website</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">View</span>
        </button>

        <button
          id="admin-sidebar-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
