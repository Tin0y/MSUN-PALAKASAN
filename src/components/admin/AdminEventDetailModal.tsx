import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Radio,
  CheckCircle2,
  Trophy,
  AlertCircle,
  FileCheck2,
  Trash2,
  RotateCcw,
  Shield,
  Ban,
  CalendarDays,
  TrendingUp,
  User,
  Phone,
  Pause,
  Play,
  Layers,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { CollegeId, PalakasanEvent } from '../../types';
import { COLLEGES, VENUES } from '../../data/initialData';
import { getCategoryMeta, getCollegeBadgeStyle, getPlacementBadge } from '../../utils/collegeTheme';
import { DeleteEventModal } from './DeleteEventModal';

interface AdminEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PalakasanEvent | null;
  onOpenEdit: (event: PalakasanEvent) => void;
  onOpenEnterResult: (event: PalakasanEvent) => void;
}

export const AdminEventDetailModal: React.FC<AdminEventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onOpenEdit,
  onOpenEnterResult,
}) => {
  const {
    startOngoingEvent,
    pauseEvent,
    resumeEvent,
    markEventCompleted,
    cancelEvent,
    postponeEvent,
    deleteEvent,
    rescheduleEvent,
    changeVenue,
    changeParticipants,
  } = usePalakasan();

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');

  const [isChangingVenue, setIsChangingVenue] = useState(false);
  const [selectedNewVenue, setSelectedNewVenue] = useState(VENUES[0]);

  const [isManagingParticipants, setIsManagingParticipants] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<CollegeId[]>([]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [isPostponing, setIsPostponing] = useState(false);
  const [postponeNote, setPostponeNote] = useState('');
  const [isPausing, setIsPausing] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [pauseResumeDate, setPauseResumeDate] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!isOpen || !event) return null;

  const catMeta = getCategoryMeta(event.category);
  const isOfficial = event.resultStatus === 'official';

  const handleStartOngoing = () => {
    startOngoingEvent(event.id);
  };

  const handleMarkCompleted = () => {
    markEventCompleted(event.id, true);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) return;
    rescheduleEvent(event.id, rescheduleDate, rescheduleStartTime, rescheduleEndTime);
    setIsRescheduling(false);
  };

  const handleConfirmVenue = () => {
    if (!selectedNewVenue) return;
    changeVenue(event.id, selectedNewVenue);
    setIsChangingVenue(false);
  };

  const handleConfirmParticipants = () => {
    if (selectedParticipants.length === 0) return;
    changeParticipants(event.id, selectedParticipants);
    setIsManagingParticipants(false);
  };

  const handleConfirmCancel = () => {
    cancelEvent(event.id, cancelReason);
    setIsCancelling(false);
  };

  const handleConfirmPostpone = () => {
    postponeEvent(event.id, postponeNote);
    setIsPostponing(false);
  };

  const handleConfirmPause = () => {
    pauseEvent(event.id, pauseReason, pauseResumeDate);
    setIsPausing(false);
  };

  const handleResume = () => {
    resumeEvent(event.id);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden animate-scaleIn text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                {catMeta.icon} {catMeta.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                {event.eventType || 'Competition'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  event.status === 'ongoing'
                    ? 'bg-blue-600 text-white'
                    : event.status === 'paused'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : event.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : event.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : event.status === 'postponed'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {event.status}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 line-clamp-1">{event.eventName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Controls Bar - Changes dynamically based on current status */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
              Quick Administrative Actions
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {event.status === 'upcoming' && (
                <button
                  type="button"
                  onClick={handleStartOngoing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Start / Mark Ongoing</span>
                </button>
              )}

              {event.status === 'ongoing' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPausing(true);
                      setPauseReason(
                        event.pausedReason ||
                          'Games 1–3 completed; remaining matches scheduled for another day'
                      );
                      setPauseResumeDate(event.resumeDate || '');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg shadow-2xs transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleMarkCompleted}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                </>
              )}

              {event.status === 'paused' && (
                <>
                  <button
                    type="button"
                    onClick={handleResume}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume Event (Live)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleMarkCompleted}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg shadow-2xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => onOpenEnterResult(event)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold rounded-lg shadow-2xs transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>{isOfficial ? 'Edit Official Results' : 'Enter Results / Declare Winner'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenEdit(event)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-lg shadow-2xs transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Full Event</span>
              </button>

              {event.status !== 'completed' && event.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelling(true);
                    setCancelReason('');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Event</span>
                </button>
              )}

              {event.status !== 'completed' && event.status !== 'postponed' && event.status !== 'paused' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPostponing(true);
                    setPostponeNote('');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Postpone</span>
                </button>
              )}
            </div>
          </div>

          {/* Paused Event Info Banner */}
          {event.status === 'paused' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Pause className="w-4 h-4 text-amber-700" />
                  <span>Event Paused — Multi-Day Continuation</span>
                  {event.resumeDate && (
                    <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-[11px] font-semibold text-amber-800">
                      Resumes: {event.resumeDate}
                    </span>
                  )}
                </div>
                <p className="text-amber-800 text-[11px]">
                  {event.pausedReason || 'Earlier games completed; remaining matches scheduled for another day.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResume}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume Now</span>
              </button>
            </div>
          )}

          {/* Pause Event Inline Panel */}
          {isPausing && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Pause className="w-4 h-4 text-amber-700" />
                  <span>Pause Multi-Day Event</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsPausing(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={pauseReason}
                onChange={e => setPauseReason(e.target.value)}
                placeholder="Progress note (e.g. Games 1–3 played today; Game 4 to Finals next day)..."
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg"
              />
              <input
                type="text"
                value={pauseResumeDate}
                onChange={e => setPauseResumeDate(e.target.value)}
                placeholder="Planned resume date & time (e.g. Tomorrow, 09:00 AM)..."
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPausing(false)}
                  className="px-3 py-1 rounded-lg text-slate-600"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPause}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Confirm Pause
                </button>
              </div>
            </div>
          )}

          {/* Quick Reschedule Inline Panel */}
          {isRescheduling && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900">Reschedule Event Timetable</span>
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={e => setRescheduleDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={rescheduleStartTime}
                    onChange={e => setRescheduleStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Time</label>
                  <input
                    type="text"
                    value={rescheduleEndTime}
                    onChange={e => setRescheduleEndTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          )}

          {/* Quick Change Venue Inline Panel */}
          {isChangingVenue && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900">Change Tournament Venue</span>
                <button
                  type="button"
                  onClick={() => setIsChangingVenue(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <select
                value={selectedNewVenue}
                onChange={e => setSelectedNewVenue(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                {VENUES.map(v => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangingVenue(false)}
                  className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVenue}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Update Venue
                </button>
              </div>
            </div>
          )}

          {/* Quick Manage Participants Inline Panel */}
          {isManagingParticipants && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900">Configure Participating Colleges</span>
                <button
                  type="button"
                  onClick={() => setIsManagingParticipants(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLLEGES.map(col => {
                  const isChecked = selectedParticipants.includes(col.id);
                  return (
                    <button
                      type="button"
                      key={col.id}
                      onClick={() => {
                        if (isChecked) {
                          if (selectedParticipants.length > 1) {
                            setSelectedParticipants(prev => prev.filter(c => c !== col.id));
                          }
                        } else {
                          setSelectedParticipants(prev => [...prev, col.id]);
                        }
                      }}
                      className={`p-2 rounded-lg border text-left font-semibold ${
                        isChecked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700'
                      }`}
                    >
                      {col.acronym}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManagingParticipants(false)}
                  className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmParticipants}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Save Participants
                </button>
              </div>
            </div>
          )}

          {/* Cancel Event Dialog */}
          {isCancelling && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 animate-fadeIn">
              <span className="font-bold text-red-900">Cancel Event Confirmation</span>
              <input
                type="text"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (e.g. Weather, schedule merger)..."
                className="w-full px-3 py-1.5 bg-white border border-red-300 rounded-lg"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCancelling(false)}
                  className="px-3 py-1 rounded-lg text-slate-600"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          )}

          {/* Postpone Event Dialog */}
          {isPostponing && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
              <span className="font-bold text-amber-900">Postpone Event Note</span>
              <input
                type="text"
                value={postponeNote}
                onChange={e => setPostponeNote(e.target.value)}
                placeholder="Target rescheduled date or note (e.g. Day 4, 10:00 AM)..."
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPostponing(false)}
                  className="px-3 py-1 rounded-lg text-slate-600"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPostpone}
                  className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold"
                >
                  Confirm Postponement
                </button>
              </div>
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-[10px] uppercase">Schedule</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRescheduling(true);
                    setRescheduleDate(event.date);
                    setRescheduleStartTime(event.startTime);
                    setRescheduleEndTime(event.endTime);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Reschedule
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{event.startTime} – {event.endTime}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-[10px] uppercase">Venue</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingVenue(true);
                    setSelectedNewVenue(event.venue);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{event.venue}</span>
              </div>
              <p className="text-[11px] text-slate-500">Official tournament campus location</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-[10px] uppercase">Event Coordinator / In-Charge</span>
                <button
                  type="button"
                  onClick={() => onOpenEdit(event)}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Edit Info
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-0.5">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{event.personInCharge || 'Not assigned yet'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {event.contactNumber ? (
                    <a href={`tel:${event.contactNumber.replace(/\s+/g, '')}`} className="text-blue-700 hover:underline">
                      {event.contactNumber}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-normal">No contact number provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-[10px] uppercase text-slate-400">Description</span>
              <p className="text-slate-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Participating Colleges List */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[10px] uppercase text-slate-400">
                Participating Colleges ({event.participatingColleges.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsManagingParticipants(true);
                  setSelectedParticipants([...event.participatingColleges]);
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Manage Colleges
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {event.participatingColleges.map(colId => {
                const col = COLLEGES.find(c => c.id === colId);
                const badge = getCollegeBadgeStyle(colId);
                return (
                  <div key={colId} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${badge.bg} ${badge.text}`}>
                      {colId}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{col?.shortName}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-Event Divisions & Brackets (for Special Sports like Arnis / Swimming) */}
          {event.subCategories && event.subCategories.length > 0 && (
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-extrabold text-purple-950">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Sub-Event Divisions & Brackets ({event.subCategories.length})</span>
                </div>
                <span className="text-[10px] font-bold text-purple-700">
                  {event.subCategories.filter(s => Boolean(s.championCollegeId)).length} / {event.subCategories.length} champions decided
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.subCategories.map(sub => {
                  const total = sub.games?.length || 0;
                  const done = sub.games?.filter(g => g.status === 'completed').length || 0;
                  const champBadge = sub.championCollegeId
                    ? getCollegeBadgeStyle(sub.championCollegeId)
                    : null;
                  return (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-lg bg-white border border-purple-100 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{sub.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {(sub.competitionFormat || 'double-elimination').replace('-', ' ')} • {done}/{total} matches
                        </div>
                      </div>
                      {sub.championCollegeId && champBadge ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${champBadge.bg} ${champBadge.text}`}
                        >
                          👑 {sub.championCollegeId}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          In Progress
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tournament Competition Matches & Brackets */}
          {event.games &&
            event.games.length > 0 &&
            !(event.subCategories && event.subCategories.some(s => (s.games?.length || 0) > 0)) && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>
                    Tournament Matches ({event.competitionFormat || 'Bracket'})
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {event.games.filter(g => g.status === 'completed').length} / {event.games.length} completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.games.map(g => {
                  const isDone = g.status === 'completed';
                  const isLive = g.status === 'ongoing';
                  const isCancelled = g.status === 'cancelled';
                  const teamA = g.collegeA || g.participantA?.collegeId;
                  const teamB = g.collegeB || g.participantB?.collegeId;
                  const descA = g.sourceDescriptionA || g.participantA?.placeholderText || 'TBD';
                  const descB = g.sourceDescriptionB || g.participantB?.placeholderText || 'TBD';
                  const badgeA = teamA ? getCollegeBadgeStyle(teamA) : null;
                  const badgeB = teamB ? getCollegeBadgeStyle(teamB) : null;

                  return (
                    <div
                      key={g.id}
                      className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                        isCancelled
                          ? 'bg-slate-100/60 border-slate-200 opacity-60'
                          : isDone
                          ? 'bg-white border-slate-200'
                          : isLive
                          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                          : 'bg-white border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-600">
                          #{g.gameNumber} • {g.roundName}
                        </span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isLive
                              ? 'bg-blue-600 text-white'
                              : isCancelled
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDone ? 'Done' : isLive ? 'Live' : isCancelled ? 'N/A' : 'Scheduled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          {teamA && badgeA ? (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${badgeA.bg} ${badgeA.text}`}>
                              {teamA}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">{descA}</span>
                          )}
                          <span className="text-slate-400 font-normal">vs</span>
                          {teamB && badgeB ? (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${badgeB.bg} ${badgeB.text}`}>
                              {teamB}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">{descB}</span>
                          )}
                        </div>

                        <div className="font-mono font-bold text-xs text-slate-800">
                          {g.scoreA !== undefined && g.scoreB !== undefined ? (
                            <span>{g.scoreA} – {g.scoreB}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-100">
                        <span>{g.date} • {g.startTime}</span>
                        <span className="truncate max-w-[100px]">{g.venue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Official Results (if recorded) */}
          {event.results && event.results.length > 0 && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-extrabold text-blue-950">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Recorded Event Results ({event.resultStatus || 'Official'})</span>
                </div>
                {event.declaredAt && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Declared: {event.declaredAt}
                  </span>
                )}
              </div>

              <div className="divide-y divide-blue-100 bg-white rounded-lg border border-blue-100">
                {event.results.map(r => {
                  const badge = getCollegeBadgeStyle(r.collegeId);
                  const pBadge = getPlacementBadge(r.placement);
                  return (
                    <div key={r.collegeId} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-black border ${pBadge.badgeClass}`}>
                          {r.placement}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${badge.bg} ${badge.text}`}>
                          {r.collegeId}
                        </span>
                        {r.note && <span className="text-[11px] text-slate-500 italic">({r.note})</span>}
                      </div>
                      <span className="font-mono font-bold text-xs text-blue-900">
                        {r.points} Points
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Event</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <DeleteEventModal
        event={event}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={onClose}
      />
    </div>
  );
};
