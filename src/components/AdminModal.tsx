import React, { useState } from 'react';
import {
  X,
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Award,
  Lock,
  LogOut,
} from 'lucide-react';
import { usePalakasan } from '../context/PalakasanContext';
import {
  CategoryId,
  CollegeId,
  EventStatus,
  PalakasanEvent,
  Placement,
  EventResultItem,
} from '../types';
import { getEventPointsForPlacement, VENUES } from '../data/initialData';
import { getCollegeBadgeStyle, getCategoryMeta } from '../utils/collegeTheme';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEventId?: string | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  preselectedEventId,
}) => {
  const {
    events,
    colleges,
    currentPalakasan,
    isAdminLoggedIn,
    currentAccount,
    loginAdmin,
    logoutAdmin,
    addEvent,
    updateEvent,
    deleteEvent,
    recordEventResults,
    resetToDefaultData,
  } = usePalakasan();

  const [activeTab, setActiveTab] = useState<'results' | 'events' | 'system'>('results');
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Result entry form state
  const [selectedEventId, setSelectedEventId] = useState<string>(preselectedEventId || '');
  const [placementsState, setPlacementsState] = useState<Record<CollegeId, Placement>>({
    'CBIT': '1st',
    'CESS-IDS': '2nd',
    'CFMS': '3rd',
    'CELS': '4th',
  });
  const [dqNotes, setDqNotes] = useState<Record<CollegeId, string>>({
    'CBIT': '',
    'CESS-IDS': '',
    'CFMS': '',
    'CELS': '',
  });
  const [resultError, setResultError] = useState<string>('');
  const [resultSuccess, setResultSuccess] = useState<string>('');

  // New/Edit Event Form State
  const [isEditingEvent, setIsEditingEvent] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState<{
    eventName: string;
    category: CategoryId;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
    personInCharge: string;
    contactNumber: string;
    description: string;
    participatingColleges: CollegeId[];
    matchup: string;
    status: EventStatus;
  }>({
    eventName: '',
    category: 'sports',
    date: '2026-09-16',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    venue: 'Basketball Court',
    personInCharge: '',
    contactNumber: '',
    description: '',
    participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
    matchup: '',
    status: 'upcoming',
  });

  // When preselectedEventId changes
  React.useEffect(() => {
    if (preselectedEventId) {
      setSelectedEventId(preselectedEventId);
      setActiveTab('results');
    }
  }, [preselectedEventId]);

  // When selectedEventId changes, load existing results if available
  React.useEffect(() => {
    if (selectedEventId) {
      const ev = events.find(e => e.id === selectedEventId);
      if (ev && ev.results && ev.results.length > 0) {
        const nextPlacements: Record<CollegeId, Placement> = { ...placementsState };
        const nextNotes: Record<CollegeId, string> = { ...dqNotes };
        ev.results.forEach(r => {
          nextPlacements[r.collegeId] = r.placement;
          if (r.note) nextNotes[r.collegeId] = r.note;
        });
        setPlacementsState(nextPlacements);
        setDqNotes(nextNotes);
      }
    }
  }, [selectedEventId]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginAdmin(passcode);
    if (!success) {
      setLoginError(
        'Invalid passcode. Official credentials: admin@2026, gamesandsports@dan, cultural@maxine, literary@jennifer, special@shiene'
      );
    }
  };

  // Submit Result Entry
  const handleSubmitResults = (e: React.FormEvent) => {
    e.preventDefault();
    setResultError('');
    setResultSuccess('');

    if (!selectedEventId) {
      setResultError('Please choose an event to score.');
      return;
    }

    const event = events.find(e => e.id === selectedEventId);
    if (!event) {
      setResultError('Selected event not found.');
      return;
    }

    const participants = event.participatingColleges;
    const resultsPayload: EventResultItem[] = participants.map(collegeId => {
      const placement = placementsState[collegeId];
      return {
        collegeId,
        placement,
        points: getEventPointsForPlacement(placement, event, currentPalakasan?.scoringRules),
        note: placement === 'DQ' ? dqNotes[collegeId] || 'Disqualified' : undefined,
      };
    });

    const res = recordEventResults(selectedEventId, resultsPayload);
    if (res.success) {
      setResultSuccess('Results successfully certified and standings recalculated!');
      setTimeout(() => setResultSuccess(''), 4000);
    } else {
      setResultError(res.error || 'Failed to submit results.');
    }
  };

  // Handle New/Edit Event Submit
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.eventName.trim()) {
      alert('Event name is required');
      return;
    }
    if (eventFormData.participatingColleges.length === 0) {
      alert('Select at least one participating college');
      return;
    }

    const normalizedPayload = {
      ...eventFormData,
      personInCharge: eventFormData.personInCharge.trim(),
      contactNumber: eventFormData.contactNumber.trim(),
    };

    if (isEditingEvent && editingEventId) {
      updateEvent(editingEventId, normalizedPayload);
    } else {
      addEvent(normalizedPayload);
    }

    // Reset form
    setIsEditingEvent(false);
    setEditingEventId(null);
    setEventFormData({
      eventName: '',
      category: 'sports',
      date: '2026-09-16',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      venue: 'Basketball Court',
      personInCharge: '',
      contactNumber: '',
      description: '',
      participatingColleges: ['CBIT', 'CESS-IDS', 'CFMS', 'CELS'],
      matchup: '',
      status: 'upcoming',
    });
  };

  const startEditEvent = (ev: PalakasanEvent) => {
    setIsEditingEvent(true);
    setEditingEventId(ev.id);
    setEventFormData({
      eventName: ev.eventName,
      category: ev.category,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      venue: ev.venue,
      personInCharge: ev.personInCharge || '',
      contactNumber: ev.contactNumber || '',
      description: ev.description,
      participatingColleges: ev.participatingColleges,
      matchup: ev.matchup || '',
      status: ev.status,
    });
    setActiveTab('events');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {currentAccount ? `${currentAccount.name} • ${currentAccount.title}` : 'Admin Committee Suite'}
              </h2>
              <p className="text-xs text-slate-500">
                Official Result Certification, Scoring Audit, and Event Timetable
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={logoutAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentAccount?.name || 'Admin'})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Gate: If not logged in */}
        {!isAdminLoggedIn ? (
          <div className="p-8 sm:p-10 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-700">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Committee Sign In</h3>
              <p className="text-xs text-slate-500">
                Enter your authorized committee passcode to certify scores, manage matches, and schedule events.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5 text-left">
              <div>
                <input
                  type="password"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter committee passcode"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                  autoFocus
                />
                {loginError && <p className="text-xs text-rose-600 mt-1">{loginError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Sign In to Committee Panel
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Admin Panel */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Admin Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2">
              <button
                onClick={() => setActiveTab('results')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'results'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Enter & Certify Results</span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'events'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Manage Events & Schedule</span>
              </button>

              <button
                onClick={() => setActiveTab('system')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'system'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tournament Controls</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* TAB 1: RESULT ENTRY */}
              {activeTab === 'results' && (
                <div className="space-y-5 max-w-2xl mx-auto">
                  {(() => {
                    const activeEvent = selectedEventId
                      ? events.find(e => e.id === selectedEventId)
                      : undefined;
                    const p1 = getEventPointsForPlacement('1st', activeEvent, currentPalakasan?.scoringRules);
                    const p2 = getEventPointsForPlacement('2nd', activeEvent, currentPalakasan?.scoringRules);
                    const p3 = getEventPointsForPlacement('3rd', activeEvent, currentPalakasan?.scoringRules);
                    const p4 = getEventPointsForPlacement('4th', activeEvent, currentPalakasan?.scoringRules);
                    return (
                      <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5">
                          {activeEvent
                            ? `Official Scoring Scale — ${activeEvent.eventName} (${activeEvent.category.toUpperCase()})`
                            : 'Official Scoring System (Select an event to preview its category scale)'}
                        </h3>
                        <div className="grid grid-cols-5 gap-2 text-center text-xs">
                          <div className="bg-white border border-amber-200 p-2 rounded-lg text-amber-900 font-bold">
                            🥇 1st: {p1} pts
                          </div>
                          <div className="bg-white border border-slate-200 p-2 rounded-lg text-slate-700 font-bold">
                            🥈 2nd: {p2} pts
                          </div>
                          <div className="bg-white border border-amber-200 p-2 rounded-lg text-amber-900 font-bold">
                            🥉 3rd: {p3} pts
                          </div>
                          <div className="bg-white border border-slate-200 p-2 rounded-lg text-slate-600 font-bold">
                            4th: {p4} pts
                          </div>
                          <div className="bg-white border border-rose-200 p-2 rounded-lg text-rose-700 font-bold">
                            🚫 DQ: 0 pts
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <form onSubmit={handleSubmitResults} className="space-y-4">
                    {/* Event Select */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Select Event to Score
                      </label>
                      <select
                        value={selectedEventId}
                        onChange={e => setSelectedEventId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                        required
                      >
                        <option value="">-- Choose an event --</option>
                        {events.map(ev => (
                          <option key={ev.id} value={ev.id}>
                            [{ev.category.toUpperCase()}] {ev.eventName} ({ev.status.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedEventId && (
                      <>
                        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3.5 shadow-xs">
                          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center justify-between">
                            <span>Assign Placements</span>
                            <span className="text-slate-500 font-normal">
                              Points automatically calculated
                            </span>
                          </div>

                          {/* Placements for participating colleges */}
                          {(() => {
                            const event = events.find(e => e.id === selectedEventId);
                            if (!event) return null;
                            const participants = event.participatingColleges;
                            const p1 = getEventPointsForPlacement('1st', event, currentPalakasan?.scoringRules);
                            const p2 = getEventPointsForPlacement('2nd', event, currentPalakasan?.scoringRules);
                            const p3 = getEventPointsForPlacement('3rd', event, currentPalakasan?.scoringRules);
                            const p4 = getEventPointsForPlacement('4th', event, currentPalakasan?.scoringRules);

                            return participants.map(collegeId => {
                              const college = colleges.find(c => c.id === collegeId);
                              const currentPlacement = placementsState[collegeId];
                              const style = getCollegeBadgeStyle(collegeId);
                              const pointsAssigned = getEventPointsForPlacement(
                                currentPlacement,
                                event,
                                currentPalakasan?.scoringRules
                              );

                              return (
                                <div
                                  key={collegeId}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${style.bg} ${style.text} ${style.border}`}
                                    >
                                      {collegeId}
                                    </span>
                                    <div>
                                      <div className="text-sm font-bold text-slate-900">
                                        {college?.name}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        Contender: {collegeId}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2.5">
                                    {/* Dropdown for placement */}
                                    <select
                                      value={currentPlacement}
                                      onChange={e =>
                                        setPlacementsState({
                                          ...placementsState,
                                          [collegeId]: e.target.value as Placement,
                                        })
                                      }
                                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                    >
                                      <option value="1st">🥇 1st Place ({p1} pts)</option>
                                      <option value="2nd">🥈 2nd Place ({p2} pts)</option>
                                      <option value="3rd">🥉 3rd Place ({p3} pts)</option>
                                      <option value="4th">4th Place ({p4} pts)</option>
                                      <option value="DQ">🚫 Disqualified / DQ (0 pts)</option>
                                    </select>

                                    {/* Automatically Assigned Points */}
                                    <div className="text-right min-w-[65px]">
                                      <span
                                        className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                          currentPlacement === 'DQ'
                                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                                            : 'bg-blue-50 text-blue-900 border-blue-100'
                                        }`}
                                      >
                                        +{pointsAssigned} pts
                                      </span>
                                    </div>
                                  </div>

                                  {/* Optional DQ reason field */}
                                  {currentPlacement === 'DQ' && (
                                    <div className="sm:col-span-2 w-full pt-1">
                                      <input
                                        type="text"
                                        value={dqNotes[collegeId] || ''}
                                        onChange={e =>
                                          setDqNotes({ ...dqNotes, [collegeId]: e.target.value })
                                        }
                                        placeholder="Optional disqualification reason / infraction note..."
                                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-rose-300 text-rose-800 placeholder-slate-400 focus:outline-none"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {resultError && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{resultError}</span>
                          </div>
                        )}

                        {resultSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{resultSuccess}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Certify Official Results & Sync Standings</span>
                        </button>
                      </>
                    )}
                  </form>
                </div>
              )}

              {/* TAB 2: MANAGE EVENTS & SCHEDULE */}
              {activeTab === 'events' && (
                <div className="space-y-5">
                  {/* Create / Edit Form */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                        {isEditingEvent ? <Edit2 className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
                        <span>{isEditingEvent ? 'Edit Tournament Event' : 'Schedule New Tournament Event'}</span>
                      </h3>
                      {isEditingEvent && (
                        <button
                          onClick={() => {
                            setIsEditingEvent(false);
                            setEditingEventId(null);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveEvent} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Event Name *
                          </label>
                          <input
                            type="text"
                            value={eventFormData.eventName}
                            onChange={e =>
                              setEventFormData({ ...eventFormData, eventName: e.target.value })
                            }
                            placeholder="e.g. Volleyball – Men, Folk Dance..."
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Category *
                          </label>
                          <select
                            value={eventFormData.category}
                            onChange={e =>
                              setEventFormData({
                                ...eventFormData,
                                category: e.target.value as CategoryId,
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                          >
                            <option value="sports">🏅 Sports</option>
                            <option value="cultural">🎭 Cultural</option>
                            <option value="literary">📚 Literary</option>
                            <option value="special">⭐ Special Events</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Date *
                          </label>
                          <input
                            type="date"
                            value={eventFormData.date}
                            onChange={e =>
                              setEventFormData({ ...eventFormData, date: e.target.value })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Venue *
                          </label>
                          <select
                            value={eventFormData.venue}
                            onChange={e =>
                              setEventFormData({ ...eventFormData, venue: e.target.value })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                          >
                            {VENUES.map(v => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Start Time *
                          </label>
                          <input
                            type="text"
                            value={eventFormData.startTime}
                            onChange={e =>
                              setEventFormData({ ...eventFormData, startTime: e.target.value })
                            }
                            placeholder="e.g. 10:00 AM"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            End Time *
                          </label>
                          <input
                            type="text"
                            value={eventFormData.endTime}
                            onChange={e =>
                              setEventFormData({ ...eventFormData, endTime: e.target.value })
                            }
                            placeholder="e.g. 11:30 AM"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Status *
                          </label>
                          <select
                            value={eventFormData.status}
                            onChange={e =>
                              setEventFormData({
                                ...eventFormData,
                                status: e.target.value as EventStatus,
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing / Live Now</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Matchup Title (Optional)
                          </label>
                          <input
                            type="text"
                            value={eventFormData.matchup}
                            onChange={e =>
                              setEventFormData({ ...eventFormData, matchup: e.target.value })
                            }
                            placeholder="e.g. CBIT vs CESS-IDS or Championship"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Person In-charge
                          </label>
                          <input
                            type="text"
                            value={eventFormData.personInCharge}
                            onChange={e =>
                              setEventFormData({ ...eventFormData, personInCharge: e.target.value })
                            }
                            placeholder="e.g. Prof. Juan Dela Cruz"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Contact Number
                          </label>
                          <input
                            type="tel"
                            value={eventFormData.contactNumber}
                            onChange={e =>
                              setEventFormData({ ...eventFormData, contactNumber: e.target.value })
                            }
                            placeholder="e.g. 0917 123 4567"
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Participating Colleges Checkboxes */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Participating Colleges *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {colleges.map(c => {
                            const isSelected = eventFormData.participatingColleges.includes(c.id);
                            return (
                              <label
                                key={c.id}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : 'bg-white text-slate-500 border-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setEventFormData({
                                        ...eventFormData,
                                        participatingColleges: [
                                          ...eventFormData.participatingColleges,
                                          c.id,
                                        ],
                                      });
                                    } else {
                                      setEventFormData({
                                        ...eventFormData,
                                        participatingColleges:
                                          eventFormData.participatingColleges.filter(
                                            id => id !== c.id
                                          ),
                                      });
                                    }
                                  }}
                                  className="hidden"
                                />
                                <span>{c.acronym}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={eventFormData.description}
                          onChange={e =>
                            setEventFormData({ ...eventFormData, description: e.target.value })
                          }
                          placeholder="Event description, rules, division guidelines..."
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                      >
                        {isEditingEvent ? 'Update Event Details' : 'Add Event to Tournament'}
                      </button>
                    </form>
                  </div>

                  {/* Existing Events List */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      All Scheduled Events ({events.length})
                    </div>
                    <div className="space-y-1.5">
                      {events.map(ev => {
                        const meta = getCategoryMeta(ev.category);
                        return (
                          <div
                            key={ev.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  {meta.name}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {ev.eventName}
                                </span>
                                <span className="text-[11px] text-slate-500">({ev.status})</span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-2">
                                <span>{ev.date}</span>
                                <span>•</span>
                                <span>{ev.startTime}</span>
                                <span>•</span>
                                <span>{ev.venue}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedEventId(ev.id);
                                  setActiveTab('results');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold"
                              >
                                Score
                              </button>
                              <button
                                onClick={() => startEditEvent(ev)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                title="Edit Event"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete ${ev.eventName}?`)) {
                                    deleteEvent(ev.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                                title="Delete Event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM CONTROLS */}
              {activeTab === 'system' && (
                <div className="space-y-4 max-w-xl mx-auto py-3">
                  <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-blue-600" />
                      <span>Reset Demonstration Data</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Restores the official initial PALAKASAN demonstration data containing the 4
                      participating colleges (CBIT, CESS-IDS, CFMS, CELS), completed matches across
                      all 4 divisions, and the initial schedule.
                    </p>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            'Are you sure you want to restore the official initial PALAKASAN demonstration data?'
                          )
                        ) {
                          resetToDefaultData();
                          alert('Official demonstration data restored successfully.');
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold text-xs transition-colors"
                    >
                      Reset to Official Demonstration Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
