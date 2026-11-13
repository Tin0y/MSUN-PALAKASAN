import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle2, ShieldAlert, Star, User, Phone } from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CategoryId, CollegeId, EventStatus, EventType, PalakasanEvent, PointTier } from '../../types';
import { CATEGORIES, COLLEGES, VENUES } from '../../data/initialData';

interface AdminCreateEditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: PalakasanEvent | null;
}

export const AdminCreateEditEventModal: React.FC<AdminCreateEditEventModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
}) => {
  const { addEvent, updateEvent, currentAccount } = usePalakasan();

  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState<CategoryId>(() => currentAccount?.category || 'sports');
  const [eventType, setEventType] = useState<EventType>('Team');
  const [pointTier, setPointTier] = useState<PointTier>('major');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-09-16');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [venue, setVenue] = useState(VENUES[0]);
  const [customVenue, setCustomVenue] = useState('');
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [personInCharge, setPersonInCharge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [participatingColleges, setParticipatingColleges] = useState<CollegeId[]>([
    'CBIT',
    'CESS-IDS',
    'CFMS',
    'CELS',
  ]);
  const [status, setStatus] = useState<EventStatus>('upcoming');
  const [matchup, setMatchup] = useState('');
  const [cancelledReason, setCancelledReason] = useState('');
  const [postponedDate, setPostponedDate] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [showEarlyCompleteWarning, setShowEarlyCompleteWarning] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setEventName(eventToEdit.eventName);
      setCategory(eventToEdit.category);
      setEventType(eventToEdit.eventType || 'Team');
      setPointTier(
        eventToEdit.pointTier ||
        (eventToEdit.category === 'special' ? 'special' : eventToEdit.isMajor || eventToEdit.category === 'sports' ? 'major' : 'minor')
      );
      setDescription(eventToEdit.description);
      setDate(eventToEdit.date);
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      if (VENUES.includes(eventToEdit.venue)) {
        setVenue(eventToEdit.venue);
        setIsCustomVenue(false);
      } else {
        setIsCustomVenue(true);
        setCustomVenue(eventToEdit.venue);
      }
      setParticipatingColleges(eventToEdit.participatingColleges);
      setPersonInCharge(eventToEdit.personInCharge || '');
      setContactNumber(eventToEdit.contactNumber || '');
      setStatus(eventToEdit.status);
      setMatchup(eventToEdit.matchup || '');
      setCancelledReason(eventToEdit.cancelledReason || '');
      setPostponedDate(eventToEdit.postponedDate || '');
    } else {
      // Default reset for new event
      setEventName('');
      setCategory(currentAccount?.category || 'sports');
      setEventType('Team');
      setPointTier('major');
      setDescription('');
      setDate('2026-09-16');
      setStartTime('09:00 AM');
      setEndTime('10:30 AM');
      setVenue(VENUES[0]);
      setIsCustomVenue(false);
      setCustomVenue('');
      setPersonInCharge('');
      setContactNumber('');
      setParticipatingColleges(['CBIT', 'CESS-IDS', 'CFMS', 'CELS']);
      setStatus('upcoming');
      setMatchup('');
      setCancelledReason('');
      setPostponedDate('');
    }
    setError(null);
    setShowEarlyCompleteWarning(false);
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleCollege = (colId: CollegeId) => {
    if (participatingColleges.includes(colId)) {
      if (participatingColleges.length === 1) {
        setError('At least one college must participate in the event.');
        return;
      }
      setParticipatingColleges(prev => prev.filter(c => c !== colId));
    } else {
      setParticipatingColleges(prev => [...prev, colId]);
    }
    setError(null);
  };

  const handleSelectAllColleges = () => {
    setParticipatingColleges(['CBIT', 'CESS-IDS', 'CFMS', 'CELS']);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      setError('Event Name is required.');
      return;
    }

    const finalVenue = isCustomVenue ? customVenue.trim() : venue;
    if (!finalVenue) {
      setError('Venue is required.');
      return;
    }

    if (participatingColleges.length === 0) {
      setError('Please select at least one participating college.');
      return;
    }

    // Guard: Do not allow an event to be marked Completed before its scheduled start unless admin explicitly confirms it
    const today = new Date().toISOString().split('T')[0];
    if (status === 'completed' && date > today && !showEarlyCompleteWarning) {
      setShowEarlyCompleteWarning(true);
      return;
    }

    const eventPayload: Partial<PalakasanEvent> & {
      eventName: string;
      category: CategoryId;
      eventType: EventType;
      pointTier: PointTier;
      isMajor: boolean;
      description: string;
      date: string;
      startTime: string;
      endTime: string;
      venue: string;
      participatingColleges: CollegeId[];
      status: EventStatus;
    } = {
      eventName: eventName.trim(),
      category,
      eventType,
      pointTier,
      isMajor: pointTier === 'major' || pointTier === 'special',
      description: description.trim(),
      date,
      startTime,
      endTime,
      venue: finalVenue,
      personInCharge: personInCharge.trim(),
      contactNumber: contactNumber.trim(),
      participatingColleges,
      status,
    };

    if (matchup.trim()) {
      eventPayload.matchup = matchup.trim();
    }
    if (status === 'cancelled' && cancelledReason.trim()) {
      eventPayload.cancelledReason = cancelledReason.trim();
    }
    if (status === 'postponed' && postponedDate.trim()) {
      eventPayload.postponedDate = postponedDate.trim();
    }

    if (eventToEdit) {
      updateEvent(eventToEdit.id, eventPayload, 'MSUN Admin Committee');
    } else {
      addEvent(eventPayload, 'MSUN Admin Committee');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {eventToEdit ? 'Edit Event Details' : 'Create New PALAKASAN Event'}
            </h3>
            <p className="text-xs text-slate-500">
              Configure event parameters, participant rosters, and tournament scheduling.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {showEarlyCompleteWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div className="space-y-1">
                <p className="font-bold">Confirmation Required: Marking Future Event as Completed</p>
                <p className="text-[11px] text-amber-800">
                  This event is scheduled for a future date ({date}). Are you sure you want to officially mark it as Completed now?
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                >
                  Yes, Confirm Early Completion
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] border-b border-slate-100 pb-1">
              1. Basic Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  placeholder="e.g. Basketball – Men, Hiphop Dance, Balak"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => {
                    const newCat = e.target.value as CategoryId;
                    setCategory(newCat);
                    if (newCat === 'special') setPointTier('special');
                    else if (newCat === 'sports') setPointTier('major');
                    else setPointTier('minor');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Point Tier / Scoring System</label>
                <select
                  value={pointTier}
                  onChange={e => setPointTier(e.target.value as PointTier)}
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-600/20 ${
                    pointTier === 'special'
                      ? 'bg-purple-50 text-purple-900 border-purple-300'
                      : pointTier === 'major'
                      ? 'bg-blue-50 text-blue-900 border-blue-300'
                      : 'bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="special">⭐ Special Events System (Showcase/Premier)</option>
                  <option value="major">🏅 Major Events Scale (50-40-30-20)</option>
                  <option value="minor">🥈 Minor Events Scale (30-20-15-10)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value as EventType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="Individual">Individual Competition</option>
                  <option value="Team">Team Competition</option>
                  <option value="Head-to-Head / Match">Head-to-Head / Match</option>
                  <option value="Group Performance">Group Performance</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Matchup / Sub-bracket (Optional)</label>
                <input
                  type="text"
                  value={matchup}
                  onChange={e => setMatchup(e.target.value)}
                  placeholder="e.g. CBIT vs CESS-IDS, Championship Finals, Open Division"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Event Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief summary of event guidelines, tournament format, or scoring criteria..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Schedule & Venue */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] border-b border-slate-100 pb-1">
              2. Schedule & Venue
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  placeholder="e.g. 08:00 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">End Time</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">Venue</label>
                <div className="flex gap-2 mb-2">
                  <select
                    disabled={isCustomVenue}
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs disabled:opacity-50"
                  >
                    {VENUES.map(v => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomVenue}
                      onChange={e => setIsCustomVenue(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Custom Venue</span>
                  </label>
                </div>
                {isCustomVenue && (
                  <input
                    type="text"
                    value={customVenue}
                    onChange={e => setCustomVenue(e.target.value)}
                    placeholder="Enter custom campus venue..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                    required
                  />
                )}
              </div>

              {/* Person In-charge & Contact Number */}
              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Person In-charge</span>
                  </label>
                  <input
                    type="text"
                    value={personInCharge}
                    onChange={e => setPersonInCharge(e.target.value)}
                    placeholder="e.g. Prof. Juan Dela Cruz"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Contact Number</span>
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    placeholder="e.g. 0917 123 4567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Participating Colleges */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                3. Participating Colleges ({participatingColleges.length} selected)
              </h4>
              <button
                type="button"
                onClick={handleSelectAllColleges}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
              >
                Select All 4 Colleges
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {COLLEGES.map(col => {
                const isChecked = participatingColleges.includes(col.id);
                return (
                  <button
                    type="button"
                    key={col.id}
                    onClick={() => handleToggleCollege(col.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{col.acronym}</span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isChecked && '✓'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{col.shortName}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Event Status Controls */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] border-b border-slate-100 pb-1">
              4. Event Status
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'] as EventStatus[]).map(
                st => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setStatus(st)}
                    className={`py-2 px-2.5 rounded-lg border text-center capitalize text-xs font-bold transition-all ${
                      status === st
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'ongoing' ? 'Ongoing (Live)' : st}
                  </button>
                )
              )}
            </div>

            {status === 'cancelled' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <label className="block font-bold text-red-800 text-xs">Reason for Cancellation</label>
                <input
                  type="text"
                  value={cancelledReason}
                  onChange={e => setCancelledReason(e.target.value)}
                  placeholder="e.g. Inclement weather, committee schedule consolidation"
                  className="w-full px-3 py-1.5 bg-white border border-red-300 rounded-lg text-xs"
                />
              </div>
            )}

            {status === 'postponed' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <label className="block font-bold text-amber-800 text-xs">Postponed Note / Target Date</label>
                <input
                  type="text"
                  value={postponedDate}
                  onChange={e => setPostponedDate(e.target.value)}
                  placeholder="e.g. Rescheduled to Day 3, 02:00 PM at MSUN Oval"
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                />
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-xs transition-colors"
          >
            {eventToEdit ? 'Save Changes' : 'Create & Schedule Event'}
          </button>
        </div>
      </div>
    </div>
  );
};
