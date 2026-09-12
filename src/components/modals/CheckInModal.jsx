import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { X, UserCheck, User, Phone, Building, Hash, Calendar } from 'lucide-react';

export const CheckInModal = ({ room, onClose, onPrintReceipt }) => {
  const { checkInGuest, getRoomActiveBooking } = useHotel();
  const activeBooking = getRoomActiveBooking(room?.id);

  // Helper to format Date to local ISO for datetime-local input
  const getNowLocalStr = () => {
    const d = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    guest_name: activeBooking?.guest_name || '',
    phone: activeBooking?.phone || '',
    company_name: activeBooking?.company_name || '',
    gst_number: activeBooking?.gst_number || '',
    check_in: getNowLocalStr(),
    rate: room?.rate || 1425
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!room) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guest_name.trim()) {
      setError('Guest Name is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const selectedCheckInDate = new Date(formData.check_in);

      const checkInData = {
        room_id: room.id,
        guest_name: formData.guest_name.toUpperCase(),
        phone: formData.phone,
        company_name: formData.company_name,
        gst_number: formData.gst_number,
        check_in: selectedCheckInDate.toISOString(),
        room_rate: parseFloat(formData.rate) || room.rate
      };

      await checkInGuest(checkInData);
      onClose();
      if (onPrintReceipt) {
        onPrintReceipt(checkInData);
      }
    } catch (err) {
      setError(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-sky-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            <h3 className="font-black text-lg">ROOM {room.room_number} CHECK-IN</h3>
          </div>
          <button onClick={onClose} className="text-sky-200 hover:text-white">
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

          <div className="bg-sky-50 dark:bg-sky-950/60 p-3 rounded-lg border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-900 dark:text-sky-200 flex justify-between">
            <span>SELECTED ROOM: {room.room_number} ({room.room_type})</span>
            <span>STANDARD RATE: ₹{room.rate}</span>
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
                placeholder="Full Guest Name"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                className="clay-input w-full pl-9 pr-3 py-2 text-sm font-semibold"
                placeholder="Guest Contact Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Company Name (Optional)
              </label>
              <input
                type="text"
                className="clay-input w-full px-3 py-2 text-sm uppercase font-semibold"
                placeholder="e.g. AUTO MECH"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                GST Number (Optional)
              </label>
              <input
                type="text"
                className="clay-input w-full px-3 py-2 text-sm uppercase font-semibold"
                placeholder="27AATCA4196R1ZJ"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Check-in Timestamp
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
                Daily Room Rate (₹)
              </label>
              <input
                type="number"
                required
                className="clay-input w-full px-3 py-2 text-sm font-bold"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl shadow-lg transition-all text-sm uppercase"
          >
            {loading ? 'Processing Check-in...' : 'CONFIRM CHECK-IN'}
          </button>
        </form>
      </div>
    </div>
  );
};
