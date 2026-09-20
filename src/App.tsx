import React, { useState } from 'react';
import { PalakasanProvider, usePalakasan } from './context/PalakasanContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { OverallStandingView } from './views/OverallStandingView';
import { CategoryStandingView } from './views/CategoryStandingView';
import { ScheduleView } from './views/ScheduleView';
import { ResultsView } from './views/ResultsView';
import { AboutView } from './views/AboutView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { CollegePointHistoryModal } from './components/CollegePointHistoryModal';
import { EventDetailModal } from './components/EventDetailModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NavigationTab } from './types';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [adminPreselectedEventId, setAdminPreselectedEventId] = useState<string | null>(null);

  const {
    selectedCollegeId,
    setSelectedCollegeId,
    selectedEventId,
    setSelectedEventId,
  } = usePalakasan();

  const handleOpenAdminWithEvent = (eventId: string) => {
    setSelectedEventId(null);
    setAdminPreselectedEventId(eventId);
    setCurrentTab('admin');
  };

  const handleOpenAdmin = () => {
    setAdminPreselectedEventId(null);
    setCurrentTab('admin');
  };

  // If viewing the Admin side, render the full, dedicated Admin Dashboard View
  if (currentTab === 'admin') {
    return (
      <AdminDashboardView
        onBackToPublic={() => {
          setCurrentTab('home');
          setAdminPreselectedEventId(null);
        }}
        initialEventIdToEnterResult={adminPreselectedEventId}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Primary Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            onSelectTab={setCurrentTab}
            onOpenCollegeModal={setSelectedCollegeId}
            onOpenEventModal={setSelectedEventId}
          />
        )}

        {currentTab === 'overall' && (
          <OverallStandingView
            onOpenCollegeModal={setSelectedCollegeId}
            onOpenEventModal={setSelectedEventId}
          />
        )}

        {currentTab === 'sports' && (
          <CategoryStandingView
            categoryId="sports"
            onOpenCollegeModal={setSelectedCollegeId}
            onOpenEventModal={setSelectedEventId}
          />
        )}

        {currentTab === 'cultural' && (
          <CategoryStandingView
            categoryId="cultural"
            onOpenCollegeModal={setSelectedCollegeId}
            onOpenEventModal={setSelectedEventId}
          />
        )}

        {currentTab === 'literary' && (
          <CategoryStandingView
            categoryId="literary"
            onOpenCollegeModal={setSelectedCollegeId}
            onOpenEventModal={setSelectedEventId}
          />
        )}

        {currentTab === 'special' && (
          <CategoryStandingView
            categoryId="special"
            onOpenCollegeModal={setSelectedCollegeId}
            onOpenEventModal={setSelectedEventId}
          />
        )}

        {currentTab === 'schedule' && (
          <ScheduleView
            onOpenEventModal={setSelectedEventId}
            onOpenCollegeModal={setSelectedCollegeId}
          />
        )}

        {currentTab === 'results' && (
          <ResultsView
            onOpenEventModal={setSelectedEventId}
            onOpenCollegeModal={setSelectedCollegeId}
          />
        )}

        {currentTab === 'about' && (
          <AboutView onOpenCollegeModal={setSelectedCollegeId} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={setCurrentTab}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenCollegeModal={setSelectedCollegeId}
        onOpenEventModal={setSelectedEventId}
      />

      <CollegePointHistoryModal
        collegeId={selectedCollegeId}
        onClose={() => setSelectedCollegeId(null)}
        onOpenEventModal={setSelectedEventId}
      />

      <EventDetailModal
        eventId={selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onOpenCollegeModal={setSelectedCollegeId}
        onEnterResultClick={handleOpenAdminWithEvent}
      />
    </div>
  );
}

export default function App() {
  return (
    <PalakasanProvider>
      <MainLayout />
    </PalakasanProvider>
  );
}
