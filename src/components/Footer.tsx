import React from 'react';
import { Trophy, Shield } from 'lucide-react';
import { NavigationTab } from '../types';

interface FooterProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenAdmin }) => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-2.5 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-blue-950 text-base">MSUN PALAKASAN 2026</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-md">
              Mindanao State University at Naawan (MSUN) official competition portal. Providing certified overall standings, category leaderboards, schedule listings, and transparent score audits.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">
              Unity • Excellence • Sportsmanship • Naawan, Misamis Oriental
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <div className="text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
              Tournament Links
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onSelectTab('home')}
                  className="hover:text-blue-700 transition-colors"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('overall')}
                  className="hover:text-blue-700 transition-colors"
                >
                  Overall Standings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('schedule')}
                  className="hover:text-blue-700 transition-colors"
                >
                  Match Schedules & Venues
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('results')}
                  className="hover:text-blue-700 transition-colors"
                >
                  Official Match Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('about')}
                  className="hover:text-blue-700 transition-colors"
                >
                  About & Scoring System
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Participating Colleges & Admin */}
          <div className="space-y-2">
            <div className="text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
              Participating Colleges
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600">
              <li>• CBIT (Business & Information Tech)</li>
              <li>• CESS-IDS (Education & Social Sciences)</li>
              <li>• CFMS (Fisheries & Marine Sciences)</li>
              <li>• CELS (Environment & Life Sciences)</li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 font-semibold bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 shadow-xs transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Committee Login</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            © 2026 Mindanao State University at Naawan (MSUN). All rights reserved.
          </div>
          <div>
            Official Palakasan Information Portal
          </div>
        </div>
      </div>
    </footer>
  );
};
