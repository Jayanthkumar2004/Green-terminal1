import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { X, LogOut, Clock, Calendar, Receipt, Sparkles, CheckCircle2 } from 'lucide-react';

export const CheckOutModal = ({ room, onClose, onGenerateBillAfterCheckout }) => {
  const { getRoomActiveStay, checkOutGuest, now } = useHotel();
  const activeStay = getRoomActiveStay(room?.id);

  const [nextStatus, setNextStatus] = useState('YET_TO_CLEAN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!room || !activeStay) return null;

  const checkInDate = new Date(activeStay.check_in);
  const checkOutDate = now;

  const durationMs = Math.max(0, checkOutDate.getTime() - checkInDate.getTime());
  const durationHours = durationMs / (1000 * 60 * 60);

  const billableDays = Math.max(1, Math.ceil(durationHours / 24));

  const totalHoursInt = Math.floor(durationHours);
  const totalMinsInt = Math.floor((durationHours - totalHoursInt) * 60);
  const durationFormatted = `${totalHoursInt}h ${totalMinsInt}m`;

  const estimatedCharges = (parseFloat(room.rate) * billableDays).toFixed(2);

  const handleConfirmCheckout = async (andGenerateBill = false) => {
    setLoading(true);
    setError('');

    try {
      const checkoutResult = await checkOutGuest(room.id, checkOutDate.toISOString(), nextStatus);
      onClose();
      if (andGenerateBill && checkoutResult && onGenerateBillAfterCheckout) {
        onGenerateBillAfterCheckout(checkoutResult);
      }
    } catch (err) {
      setError(err.message || 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            <h3 className="font-black text-lg">CHECK-OUT ROOM {room.room_number}</h3>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Details Summary */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between items-center text-sm font-bold border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500 dark:text-slate-400 uppercase text-xs">Guest Name</span>
              <span className="text-slate-900 dark:text-white uppercase font-black">{activeStay.guest_name}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Check-in Time</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {checkInDate.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Checkout Time</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {checkOutDate.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Total Duration</span>
              <span className="font-mono font-bold text-sky-700 dark:text-sky-400">{durationFormatted}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-slate-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-300">
              <span>Billable Days (Math.ceil)</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                {billableDays} Day(s)
              </span>
            </div>
          </div>

          {/* Room Post-Checkout Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-2">
              Set Room Status After Checkout:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNextStatus('YET_TO_CLEAN')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  nextStatus === 'YET_TO_CLEAN'
                    ? 'bg-yellow-400 text-yellow-950 border-yellow-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-yellow-800" />
                <span>Yet to Clean (Yellow)</span>
              </button>

              <button
                type="button"
                onClick={() => setNextStatus('AVAILABLE')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  nextStatus === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Available (Green)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              disabled={loading}
              onClick={() => handleConfirmCheckout(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs uppercase shadow-md transition-all"
            >
              Confirm Check-Out
            </button>

            <button
              disabled={loading}
              onClick={() => handleConfirmCheckout(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Receipt className="w-4 h-4" />
              <span>Checkout & Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
