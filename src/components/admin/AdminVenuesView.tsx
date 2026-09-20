import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';
import { Venue, PalakasanEvent } from '../../types';

export const AdminVenuesView: React.FC = () => {
  const { venues, addVenue, updateVenue, deleteVenue, events } = usePalakasan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number>(500);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'maintenance' | 'inactive'>('active');
  const [selectedVenueForEvents, setSelectedVenueForEvents] = useState<Venue | null>(null);

  const handleOpenAdd = () => {
    setEditingVenue(null);
    setName('');
    setLocation('');
    setCapacity(500);
    setDescription('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Venue) => {
    setEditingVenue(v);
    setName(v.name);
    setLocation(v.location);
    setCapacity(v.capacity);
    setDescription(v.description || '');
    setStatus(v.status || 'active');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingVenue) {
      await updateVenue(editingVenue.id, {
        name: name.trim(),
        location: location.trim(),
        capacity: Number(capacity),
        description: description.trim(),
        status,
      });
    } else {
      const newId = `venue-${Date.now()}`;
      await addVenue({
        id: newId,
        name: name.trim(),
        location: location.trim(),
        capacity: Number(capacity),
        description: description.trim(),
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const hasEvents = events.some(e => e.venue.toLowerCase() === venues.find(v => v.id === id)?.name.toLowerCase());
    if (hasEvents) {
      if (!confirm('This venue has events scheduled. Are you sure you want to delete this venue record?')) {
        return;
      }
    }
    await deleteVenue(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Campus Logistics & Infrastructure</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Venue Management
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mt-1">
            Registered tournament arenas, sports courts, and literary halls. Schedule conflict detection actively monitors double-bookings.
          </p>
        </div>

        <button
          id="admin-add-venue-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Venue</span>
        </button>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map(venue => {
          const scheduled = events.filter(
            e => e.venue.toLowerCase().trim() === venue.name.toLowerCase().trim() && e.status !== 'cancelled'
          );

          return (
            <div
              key={venue.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{venue.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {venue.location}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      venue.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : venue.status === 'maintenance'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {venue.status || 'active'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {venue.description || 'University facility used for PALAKASAN matches.'}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Capacity: <strong className="text-slate-800">{venue.capacity}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedVenueForEvents(venue)}
                    className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {scheduled.length} Events
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(venue)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-slate-200"
                  title="Edit Venue"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(venue.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 border border-red-200"
                  title="Delete Venue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingVenue ? 'Edit Venue' : 'Add University Venue'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. MSUN Gymnasium"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location / Zone
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Sports & PE Complex"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Features
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. FIBA standard court with scoreboards..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-xs"
                >
                  {editingVenue ? 'Save Updates' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheduled Events Inspection Modal */}
      {selectedVenueForEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedVenueForEvents.name}
                </h3>
                <p className="text-xs text-slate-500">Scheduled tournament events at this venue</p>
              </div>
              <button
                onClick={() => setSelectedVenueForEvents(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {events
                .filter(
                  e =>
                    e.venue.toLowerCase().trim() ===
                    selectedVenueForEvents.name.toLowerCase().trim()
                )
                .map(ev => (
                  <div key={ev.id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ev.eventName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                        {ev.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ev.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ev.startTime} - {ev.endTime}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
