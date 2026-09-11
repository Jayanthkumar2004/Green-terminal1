import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Plus, Edit2, Trash2, ShieldAlert, Check, X, DoorClosed, Wrench } from 'lucide-react';

export const RoomAdminModal = () => {
  const { rooms, addRoom, editRoom, deleteRoom, setRoomMaintenance } = useHotel();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);

  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'AC',
    rate: '1425'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setFormData({ room_number: '', room_type: 'AC', rate: '1425' });
    setError('');
    setSuccess('');
    setIsAddOpen(false);
    setEditingRoom(null);
    setDeletingRoom(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.room_number.trim()) {
      setError('Please enter a room number.');
      return;
    }

    try {
      await addRoom(formData);
      setSuccess(`Room ${formData.room_number} added successfully!`);
      setTimeout(() => resetForm(), 1200);
    } catch (err) {
      setError(err.message || 'Failed to add room.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;
    setError('');
    setSuccess('');

    try {
      await editRoom(editingRoom.id, {
        room_number: formData.room_number.trim(),
        room_type: formData.room_type,
        rate: parseFloat(formData.rate) || 1425
      });
      setSuccess(`Room ${formData.room_number} updated successfully!`);
      setTimeout(() => resetForm(), 1200);
    } catch (err) {
      setError(err.message || 'Failed to edit room.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoom) return;
    setError('');

    try {
      await deleteRoom(deletingRoom.id);
      setSuccess(`Room ${deletingRoom.room_number} deleted successfully.`);
      setTimeout(() => resetForm(), 1200);
    } catch (err) {
      setError(err.message || 'Failed to delete room.');
    }
  };

  const startEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      rate: String(room.rate)
    });
    setIsAddOpen(false);
    setDeletingRoom(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="clay-card p-6 border border-slate-300 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <DoorClosed className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ADMIN ROOM MANAGEMENT
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Create, update, or delete hotel rooms. Changes update the Room Status Board instantly.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider"
        >
          <Plus className="w-5 h-5" />
          <span>ADD NEW ROOM</span>
        </button>
      </div>

      {/* Global Notifications */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Add / Edit Form Drawer */}
      {(isAddOpen || editingRoom) && (
        <div className="clay-card p-6 border-2 border-emerald-500 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">
              {editingRoom ? `EDIT ROOM ${editingRoom.room_number}` : 'ADD NEW ROOM TO SYSTEM'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={editingRoom ? handleEditSubmit : handleAddSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                required
                className="clay-input w-full px-3 py-2 text-sm font-mono font-bold"
                placeholder="e.g. 108 or 5001"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Room Type *
              </label>
              <select
                className="clay-input w-full px-3 py-2 text-sm font-bold"
                value={formData.room_type}
                onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
              >
                <option value="AC">AC</option>
                <option value="NON_AC">NON-AC</option>
                <option value="SUITE">SUITE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Daily Rate (₹) *
              </label>
              <input
                type="number"
                required
                className="clay-input w-full px-3 py-2 text-sm font-mono font-bold"
                placeholder="1425"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs uppercase shadow-md transition-all"
              >
                {editingRoom ? 'UPDATE ROOM' : 'SAVE ROOM'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs uppercase"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">DELETE ROOM {deletingRoom.room_number}?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Are you sure you want to permanently delete Room <strong>{deletingRoom.room_number}</strong>? This operation cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingRoom(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs uppercase shadow-lg"
              >
                DELETE ROOM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Rooms Table */}
      <div className="clay-card p-6 border border-slate-300 dark:border-slate-800 overflow-hidden">
        <h3 className="text-base font-black text-slate-800 dark:text-white uppercase mb-4">
          EXISTING ROOMS REGISTRY ({rooms.length} ROOMS)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-black border-b border-slate-300 dark:border-slate-700">
                <th className="p-3">Room Number</th>
                <th className="p-3">Type</th>
                <th className="p-3">Daily Rate</th>
                <th className="p-3">Current Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {rooms.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono font-black text-sm text-slate-900 dark:text-white">{r.room_number}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      r.room_type === 'SUITE' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {r.room_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">₹{r.rate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      r.status === 'CHECKED_IN' ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300' :
                      r.status === 'BOOKED' ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300' :
                      r.status === 'YET_TO_CLEAN' || r.status === 'OUT_FOR_CLEANING' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' :
                      r.status === 'MAINTENANCE' ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300' :
                      'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {r.status === 'MAINTENANCE' ? (
                      <button
                        onClick={() => setRoomMaintenance(r.id, false)}
                        className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded font-bold text-[11px] inline-flex items-center gap-1"
                        title="Clear maintenance and make room available"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Clear Maintenance</span>
                      </button>
                    ) : r.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => setRoomMaintenance(r.id, true)}
                        className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700 rounded font-bold text-[11px] inline-flex items-center gap-1"
                        title="Set room status under maintenance"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Maintenance</span>
                      </button>
                    ) : null}
                    <button
                      onClick={() => startEdit(r)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingRoom(r)}
                      className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
