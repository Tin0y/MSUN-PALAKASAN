import React, { useState } from 'react';
import { usePalakasan } from '../context/PalakasanContext';
import { AdminSection, PalakasanEvent } from '../types';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminEventsList } from '../components/admin/AdminEventsList';
import { AdminScheduleView } from '../components/admin/AdminScheduleView';
import { AdminResultsManagement } from '../components/admin/AdminResultsManagement';
import { AdminCompetitions } from '../components/admin/AdminCompetitions';
import { AdminStandingsView } from '../components/admin/AdminStandingsView';
import { AdminCollegesView } from '../components/admin/AdminCollegesView';
import { AdminActivityLogView } from '../components/admin/AdminActivityLogView';
import { AdminSettingsView } from '../components/admin/AdminSettingsView';
import { AdminPalakasanView } from '../components/admin/AdminPalakasanView';
import { AdminStartNewPalakasanModal } from '../components/admin/AdminStartNewPalakasanModal';
import { AdminVenuesView } from '../components/admin/AdminVenuesView';
import { AdminCategoriesView } from '../components/admin/AdminCategoriesView';
import { AdminTransactionsView } from '../components/admin/AdminTransactionsView';
import { AdminScoringView } from '../components/admin/AdminScoringView';
import { AdminCreateEditEventModal } from '../components/admin/AdminCreateEditEventModal';
import { AdminDeclareWinnerModal } from '../components/admin/AdminDeclareWinnerModal';
import { AdminEventDetailModal } from '../components/admin/AdminEventDetailModal';

interface AdminDashboardViewProps {
  onBackToPublic: () => void;
  initialEventIdToEnterResult?: string | null;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onBackToPublic,
  initialEventIdToEnterResult,
}) => {
  const { isAdminLoggedIn, events } = usePalakasan();

  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Modal States
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<PalakasanEvent | null>(null);

  const [isDeclareWinnerModalOpen, setIsDeclareWinnerModalOpen] = useState(
    Boolean(initialEventIdToEnterResult)
  );
  const [eventForResults, setEventForResults] = useState<PalakasanEvent | null>(() => {
    if (initialEventIdToEnterResult) {
      return events.find(e => e.id === initialEventIdToEnterResult) || null;
    }
    return null;
  });

  const [selectedDetailEventId, setSelectedDetailEventId] = useState<string | null>(null);
  const selectedDetailEvent = events.find(e => e.id === selectedDetailEventId) || null;
  const [isStartNewPalakasanOpen, setIsStartNewPalakasanOpen] = useState(false);

  // Handlers
  const handleOpenCreateEvent = () => {
    setEventToEdit(null);
    setIsCreateEditModalOpen(true);
  };

  const handleOpenEditEvent = (event: PalakasanEvent) => {
    setEventToEdit(event);
    setIsCreateEditModalOpen(true);
  };

  const handleOpenEnterResult = (event: PalakasanEvent) => {
    setEventForResults(event);
    setIsDeclareWinnerModalOpen(true);
  };

  const handleOpenResultById = (eventId: string) => {
    const target = events.find(e => e.id === eventId);
    if (target) {
      handleOpenEnterResult(target);
    }
  };

  // If not authenticated, display the dedicated clean Admin Login screen
  if (!isAdminLoggedIn) {
    return <AdminLogin onBackToPublic={onBackToPublic} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        onOpenCreateEvent={handleOpenCreateEvent}
        onBackToPublic={onBackToPublic}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Administrative Workplace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          currentSection={currentSection}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenCreateEvent={handleOpenCreateEvent}
          onNavigateSection={setCurrentSection}
          onBackToPublic={onBackToPublic}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === 'dashboard' && (
            <AdminOverview
              onNavigateSection={setCurrentSection}
              onOpenCreateEvent={handleOpenCreateEvent}
              onSelectEventDetail={setSelectedDetailEventId}
              onEnterResult={handleOpenResultById}
            />
          )}

          {currentSection === 'events' && (
            <AdminEventsList
              onOpenCreateEvent={handleOpenCreateEvent}
              onOpenEditEvent={handleOpenEditEvent}
              onOpenEventDetail={setSelectedDetailEventId}
              onOpenEnterResult={handleOpenEnterResult}
            />
          )}

          {currentSection === 'schedule' && (
            <AdminScheduleView
              onOpenCreateEvent={handleOpenCreateEvent}
              onOpenEventDetail={setSelectedDetailEventId}
              onOpenEnterResult={handleOpenEnterResult}
            />
          )}

          {currentSection === 'competitions' && (
            <AdminCompetitions
              onOpenDeclareWinner={handleOpenEnterResult}
              onOpenEventDetail={setSelectedDetailEventId}
            />
          )}

          {currentSection === 'results' && (
            <AdminResultsManagement
              onOpenEnterResult={handleOpenEnterResult}
              onOpenEventDetail={setSelectedDetailEventId}
            />
          )}

          {currentSection === 'palakasans' && (
            <AdminPalakasanView
              onOpenStartNewWizard={() => setIsStartNewPalakasanOpen(true)}
            />
          )}

          {currentSection === 'standings' && <AdminStandingsView />}

          {currentSection === 'transactions' && <AdminTransactionsView />}

          {currentSection === 'venues' && <AdminVenuesView />}

          {currentSection === 'categories' && <AdminCategoriesView />}

          {currentSection === 'scoring' && <AdminScoringView />}

          {currentSection === 'colleges' && <AdminCollegesView />}

          {currentSection === 'activity-log' && <AdminActivityLogView />}

          {currentSection === 'settings' && <AdminSettingsView />}
        </main>
      </div>

      {/* Modals */}
      <AdminStartNewPalakasanModal
        isOpen={isStartNewPalakasanOpen}
        onClose={() => setIsStartNewPalakasanOpen(false)}
      />

      <AdminCreateEditEventModal
        isOpen={isCreateEditModalOpen}
        onClose={() => {
          setIsCreateEditModalOpen(false);
          setEventToEdit(null);
        }}
        eventToEdit={eventToEdit}
      />

      <AdminDeclareWinnerModal
        isOpen={isDeclareWinnerModalOpen}
        onClose={() => {
          setIsDeclareWinnerModalOpen(false);
          setEventForResults(null);
        }}
        event={eventForResults}
      />

      <AdminEventDetailModal
        isOpen={Boolean(selectedDetailEventId)}
        onClose={() => setSelectedDetailEventId(null)}
        event={selectedDetailEvent}
        onOpenEdit={handleOpenEditEvent}
        onOpenEnterResult={handleOpenEnterResult}
      />
    </div>
  );
};
