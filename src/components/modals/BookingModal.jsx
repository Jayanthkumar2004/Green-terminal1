import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { X, CalendarCheck, User, Phone, Building, Hash, Clock } from 'lucide-react';

export const BookingModal = ({ room, onClose }) => {
  const { createBooking } = useHotel();
  
  const nowStr = new Date().toISOString().slice(0, 16);
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    guest_name: '',
    phone: '',
    company_name: '',
    gst_number: '',
    check_in: nowStr,
    expected_checkout: tomorrowStr
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!room) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guest_name.trim()) {
      setError('Guest name is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await createBooking({
        room_id: room.id,
        ...formData
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save room booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            <h3 className="font-black text-lg">ROOM {room.room_number} BOOKING</h3>
          </div>
          <button onClick={onClose} className="text-amber-200 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-950/60 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 flex justify-between">
            <span>SELECTED ROOM: {room.room_number} ({room.room_type})</span>
            <span>RATE: ₹{room.rate}</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Guest Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                className="clay-input w-full pl-9 pr-3 py-2 text-sm uppercase font-bold"
                placeholder="Full Name"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                className="clay-input w-full pl-9 pr-3 py-2 text-sm font-semibold"
                placeholder="Mobile Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                className="clay-input w-full px-3 py-2 text-sm uppercase font-semibold"
                placeholder="Optional"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                GST Number
              </label>
              <input
                type="text"
                className="clay-input w-full px-3 py-2 text-sm uppercase font-semibold"
                placeholder="Optional"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Check-in Date & Time
              </label>
              <input
                type="datetime-local"
                required
                className="clay-input w-full px-2 py-2 text-xs font-semibold"
                value={formData.check_in}
                onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Expected Checkout
              </label>
              <input
                type="datetime-local"
                className="clay-input w-full px-2 py-2 text-xs font-semibold"
                value={formData.expected_checkout}
                onChange={(e) => setFormData({ ...formData, expected_checkout: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-lg transition-all text-sm uppercase"
          >
            {loading ? 'Processing...' : 'BOOK ROOM NOW'}
          </button>
        </form>
      </div>
    </div>
  );
};
