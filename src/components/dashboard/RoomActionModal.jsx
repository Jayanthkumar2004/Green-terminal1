import React, { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { X, CalendarCheck, UserCheck, LogOut, Receipt, Printer, Sparkles, CheckCircle2, User, Building, Phone, Hash, Edit3, Save, Wrench, Clock } from 'lucide-react';
import { QuickDateTimePicker } from '../common/QuickDateTimePicker';

export const RoomActionModal = ({ 
  room, 
  onClose, 
  onOpenBooking, 
  onOpenCheckIn, 
  onOpenCheckOut, 
  onGenerateBill,
  onPrintReceipt
}) => {
  const { getRoomActiveStay, getRoomActiveBooking, isStayReadyToCheckout, continueStayCycle, markRoomClean, markRoomCleaning, setRoomMaintenance, editActiveStay, now } = useHotel();

  if (!room) return null;

  const activeStay = getRoomActiveStay(room.id);
  const activeBooking = getRoomActiveBooking(room.id);

  const isMaintenance = room.status === 'MAINTENANCE';
  const isCheckedIn = !isMaintenance && Boolean(activeStay);
  const isBooked = !isMaintenance && !isCheckedIn && Boolean(activeBooking);
  const isCleaning = !isMaintenance && !isCheckedIn && !isBooked && (room.status === 'OUT_FOR_CLEANING' || room.status === 'YET_TO_CLEAN');
  const isReadyToCheckout = isCheckedIn && isStayReadyToCheckout ? isStayReadyToCheckout(activeStay) : false;

  // Helper for local datetime string
  const getNowLocalStr = () => {
    const d = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getLocalISOFromDate = (d) => {
    if (!d || isNaN(d.getTime())) return getNowLocalStr();
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Edit Active Stay Form State - room_rate fetched from fixed room.rate
  const [isEditingStay, setIsEditingStay] = useState(false);
  const [editFormData, setEditFormData] = useState({
    receipt_number: activeStay?.receipt_number || String(Math.floor(8000 + Math.random() * 900)),
    guest_name: activeStay?.guest_name || '',
    phone: activeStay?.phone || '',
    company_name: activeStay?.company_name || '',
    gst_number: activeStay?.gst_number || '',
    check_in: activeStay?.check_in ? getLocalISOFromDate(new Date(activeStay.check_in)) : getNowLocalStr(),
    room_rate: activeStay?.room_rate || room.rate || 1425,
    category: activeStay?.category || room.room_type || 'AC'
  });

  useEffect(() => {
    if (room) {
      setEditFormData({
        receipt_number: activeStay?.receipt_number || String(Math.floor(8000 + Math.random() * 900)),
        guest_name: activeStay?.guest_name || '',
        phone: activeStay?.phone || '',
        company_name: activeStay?.company_name || '',
        gst_number: activeStay?.gst_number || '',
        check_in: activeStay?.check_in ? getLocalISOFromDate(new Date(activeStay.check_in)) : getNowLocalStr(),
        room_rate: activeStay?.room_rate || room.rate || 1425,
        category: activeStay?.category || room.room_type || 'AC'
      });
    }
  }, [room?.id, activeStay?.id]);

  // Live timer calculation
  let durationText = 'N/A';
  let next24hText = 'N/A';
  if (activeStay?.check_in) {
    const checkInDate = new Date(activeStay.check_in);
    const checkInMs = checkInDate.getTime();
    const diffMs = Math.max(0, now.getTime() - checkInMs);
    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    durationText = `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;

    const next24hMs = checkInMs + (Math.floor(hours / 24) + 1) * 24 * 60 * 60 * 1000;
    next24hText = new Date(next24hMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const formatStatusBadge = () => {
    if (isReadyToCheckout) return <span className="bg-pink-600 text-white font-black px-3 py-1 rounded-full text-xs shadow-sm animate-pulse">READY TO CHECKOUT (PINK)</span>;
    if (isCheckedIn) return <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-full text-xs shadow-sm">CHECKED-IN (BLUE)</span>;
    if (isBooked) return <span className="bg-rose-600 text-white font-black px-3 py-1 rounded-full text-xs shadow-sm">BOOKED (RED)</span>;
    if (isCleaning) return <span className="bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-full text-xs shadow-sm flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> YET TO CLEAN (YELLOW)</span>;
    if (isMaintenance) return <span className="bg-orange-600 text-white font-black px-3 py-1 rounded-full text-xs shadow-sm flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> MAINTENANCE (ORANGE)</span>;
    return <span className="bg-emerald-600 text-white font-black px-3 py-1 rounded-full text-xs shadow-sm">AVAILABLE (GREEN)</span>;
  };

  const handleMarkCleaned = () => {
    markRoomClean(room.id);
    onClose();
  };

  const handleMarkCleaning = () => {
    markRoomCleaning(room.id);
    onClose();
  };

  const handleSaveStayEdit = async (e, shouldPrint = false) => {
    if (e) e.preventDefault();
    if (!activeStay) return;
    try {
      const updatedFields = {
        guest_name: editFormData.guest_name.toUpperCase(),
        phone: editFormData.phone,
        company_name: editFormData.company_name,
        gst_number: editFormData.gst_number,
        check_in: new Date(editFormData.check_in).toISOString(),
        room_rate: parseFloat(editFormData.room_rate) || room.rate,
        category: editFormData.category || room.room_type || 'AC',
        receipt_number: editFormData.receipt_number
      };

      await editActiveStay(activeStay.id, updatedFields);
      setIsEditingStay(false);

      if (shouldPrint && onPrintReceipt) {
        onClose();
        onPrintReceipt({
          ...room,
          room_type: updatedFields.category,
          rate: updatedFields.room_rate
        });
      }
    } catch (err) {
      console.error('Failed to edit stay:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-mono font-black text-lg text-white">
              {room.room_number}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-white">ROOM {room.room_number}</h3>
              <p className="text-xs text-slate-300 font-mono">TYPE: {room.room_type} • RATE: ₹{room.rate}/DAY</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body / Status Info */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Current Room Status</span>
            {formatStatusBadge()}
          </div>

          {/* Special Ready to Checkout Banner if room is READY TO CHECKOUT */}
          {isReadyToCheckout && activeStay && (
            <div className="bg-pink-100 dark:bg-pink-950/60 p-4 rounded-xl border-2 border-pink-500 dark:border-pink-600 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-pink-950 dark:text-pink-100 font-black text-sm uppercase">
                <Clock className="w-5 h-5 text-pink-600 dark:text-pink-400 animate-bounce" />
                <span>Room is Ready to Checkout (Pink Status)</span>
              </div>
              <p className="text-xs text-pink-900 dark:text-pink-200 font-medium">
                Guest 24-hour cycle threshold reached. Click Continue Stay to extend stay and return room card to original BLUE color.
              </p>
              <button
                onClick={() => {
                  const checkInMs = new Date(activeStay.check_in).getTime();
                  const diffMs = Math.max(0, now.getTime() - checkInMs);
                  const durationHours = diffMs / (1000 * 60 * 60);
                  const highestReachedCycle = Math.floor((durationHours + 4) / 24);
                  continueStayCycle(activeStay.id, highestReachedCycle);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONTINUE STAY (RESTORE BLUE COLOR)</span>
              </button>
            </div>
          )}

          {/* Special Cleaning Banner if room is YET_TO_CLEAN */}
          {isCleaning && (
            <div className="bg-amber-100 dark:bg-amber-950/60 p-4 rounded-xl border-2 border-amber-400 dark:border-amber-600 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-950 dark:text-amber-100 font-black text-sm uppercase">
                <Sparkles className="w-5 h-5 text-amber-700 dark:text-amber-400 animate-bounce" />
                <span>Room is currently Yet to Clean</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                Has house-keeping finished cleaning this room? Click below to make it Available.
              </p>
              <button
                onClick={handleMarkCleaned}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>MARK CLEANED (MAKE AVAILABLE / GREEN)</span>
              </button>
            </div>
          )}

          {/* Special Maintenance Banner if room is MAINTENANCE */}
          {isMaintenance && (
            <div className="bg-orange-100 dark:bg-orange-950/60 p-4 rounded-xl border-2 border-orange-400 dark:border-orange-600 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-orange-950 dark:text-orange-100 font-black text-sm uppercase">
                <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400 animate-bounce" />
                <span>Room is currently Under Maintenance</span>
              </div>
              <p className="text-xs text-orange-900 dark:text-orange-200 font-medium">
                Is room maintenance/repair complete? Click below to restore to Available.
              </p>
              <button
                onClick={() => { setRoomMaintenance(room.id, false); onClose(); }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CLEAR MAINTENANCE (MAKE AVAILABLE / GREEN)</span>
              </button>
            </div>
          )}

          {activeStay && !isEditingStay ? (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 relative">
              
              {/* EDIT STAY / RECEIPT BUTTON IN ROOM ACTION MODAL */}
              <button
                onClick={() => setIsEditingStay(true)}
                className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Guest</span>
              </button>

              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Guest:</span>
                <span className="text-sm font-black uppercase text-slate-900 dark:text-white">{activeStay.guest_name}</span>
              </div>

              {activeStay.phone && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono font-semibold">{activeStay.phone}</span>
                </div>
              )}

              {activeStay.company_name && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{activeStay.company_name}</span>
                </div>
              )}

              {activeStay.gst_number && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <span className="font-mono font-semibold">GST: {activeStay.gst_number}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Check-in Time</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(activeStay.check_in).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Live Duration Timer</span>
                  <span className="font-mono font-black text-blue-700 dark:text-blue-400 text-sm">{durationText}</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                Next 24H Cycle completion: <strong className="text-slate-800 dark:text-slate-200">{next24hText}</strong>
              </div>
            </div>
          ) : activeStay && isEditingStay ? (
            /* EDIT ACTIVE STAY & RECEIPT DETAILS FORM */
            <form onSubmit={(e) => handleSaveStayEdit(e, false)} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border-2 border-emerald-500 space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between">
                <span>EDIT GUEST & RECEIPT DETAILS</span>
                <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400">ROOM {room.room_number}</span>
              </h4>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Receipt #</label>
                  <input
                    type="text"
                    required
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-mono font-bold"
                    value={editFormData.receipt_number}
                    onChange={(e) => setEditFormData({ ...editFormData, receipt_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-bold uppercase"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  >
                    <option value="AC">AC ROOM</option>
                    <option value="NON AC">NON AC ROOM</option>
                    <option value="DELUXE AC">DELUXE AC</option>
                    <option value="SUITE">SUITE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    required
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-mono font-black"
                    value={editFormData.room_rate}
                    onChange={(e) => setEditFormData({ ...editFormData, room_rate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  className="clay-input w-full px-2.5 py-1.5 text-xs font-bold uppercase"
                  value={editFormData.guest_name}
                  onChange={(e) => setEditFormData({ ...editFormData, guest_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    className="clay-input w-full px-2.5 py-1.5 text-xs font-semibold"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Company</label>
                  <input
                    type="text"
                    className="clay-input w-full px-2.5 py-1.5 text-xs uppercase font-semibold"
                    value={editFormData.company_name}
                    onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">GST Number</label>
                  <input
                    type="text"
                    className="clay-input w-full px-2.5 py-1.5 text-xs uppercase font-semibold"
                    value={editFormData.gst_number}
                    onChange={(e) => setEditFormData({ ...editFormData, gst_number: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <QuickDateTimePicker
                    label="Check-in Timestamp"
                    value={editFormData.check_in}
                    onChange={(val) => setEditFormData({ ...editFormData, check_in: val })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingStay(false)}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs uppercase flex items-center justify-center gap-1 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveStayEdit(e, true)}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-lg text-xs uppercase flex items-center justify-center gap-1 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Save & Print</span>
                </button>
              </div>
            </form>
          ) : activeBooking ? (
            <div className="bg-rose-50 dark:bg-rose-950/60 p-4 rounded-xl border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
                <User className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">Reserved Guest:</span>
                <span className="text-sm font-black uppercase text-rose-950 dark:text-white">{activeBooking.guest_name}</span>
              </div>
              {activeBooking.phone && <p className="text-xs text-rose-800 dark:text-rose-300 font-mono">Phone: {activeBooking.phone}</p>}
              <p className="text-xs text-rose-700 dark:text-rose-300 font-bold">
                Check-in Date: {new Date(activeBooking.check_in).toLocaleDateString()}
              </p>
            </div>
          ) : !isCleaning ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center text-emerald-900 dark:text-emerald-200 font-bold text-sm">
              Room is currently available (Green) for instant check-in or booking.
            </div>
          ) : null}

          {/* Action Buttons Grid */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
            <button
              onClick={() => { onClose(); onOpenBooking(room); }}
              className="flex items-center justify-center gap-2 p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>BOOKING (RED)</span>
            </button>

            <button
              onClick={() => { onClose(); onOpenCheckIn(room); }}
              className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>CHECK-IN (BLUE)</span>
            </button>

            <button
              disabled={!activeStay}
              onClick={() => { onClose(); onOpenCheckOut(room); }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                activeStay 
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>CHECK-OUT</span>
            </button>

            <button
              disabled={!activeStay}
              onClick={() => { onClose(); onGenerateBill(room); }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                activeStay 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>GENERATE BILL</span>
            </button>

            {/* BUTTON PRINT CHECK-IN RECEIPT */}
            <button
              disabled={!activeStay}
              onClick={() => { onClose(); onPrintReceipt(room); }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-black transition-all shadow-sm ${
                activeStay 
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>PRINT CHECK-IN RECEIPT (SLIP)</span>
            </button>

            {/* BUTTON EDIT & PRINT RECEIPT */}
            <button
              disabled={!activeStay}
              onClick={() => setIsEditingStay(true)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-black transition-all shadow-sm ${
                activeStay 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>EDIT & PRINT RECEIPT</span>
            </button>

            {/* BUTTON YET TO CLEAN */}
            <button
              onClick={handleMarkCleaning}
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>SET ROOM AS YET TO CLEAN (YELLOW)</span>
            </button>

            {/* BUTTON MAINTENANCE */}
            {isMaintenance ? (
              <button
                onClick={() => { setRoomMaintenance(room.id, false); onClose(); }}
                className="col-span-2 flex items-center justify-center gap-2 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CLEAR MAINTENANCE (MAKE AVAILABLE / GREEN)</span>
              </button>
            ) : (
              <button
                onClick={() => { setRoomMaintenance(room.id, true); onClose(); }}
                className="col-span-2 flex items-center justify-center gap-2 p-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-md transition-all"
              >
                <Wrench className="w-4 h-4" />
                <span>SET ROOM UNDER MAINTENANCE (ORANGE)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
