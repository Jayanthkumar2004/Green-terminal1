import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { Sparkles, CheckCircle2, Clock, Wrench } from 'lucide-react';

export const RoomCell = ({ room, onSelectRoom }) => {
  const { getRoomActiveStay, getRoomActiveBooking, markRoomClean, setRoomMaintenance, now } = useHotel();

  const activeStay = getRoomActiveStay(room.id);
  const activeBooking = getRoomActiveBooking(room.id);

  const isCheckedIn = Boolean(activeStay);
  const isBooked = !isCheckedIn && Boolean(activeBooking);
  const isCleaning = !isCheckedIn && !isBooked && (room.status === 'OUT_FOR_CLEANING' || room.status === 'YET_TO_CLEAN');
  const isMaintenance = !isCheckedIn && !isBooked && room.status === 'MAINTENANCE';

  // Deep Bold 3D Claymorphic Color Scheme
  let bgStyle = 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-[4px_4px_10px_rgba(5,150,105,0.45),inset_1px_1px_2px_rgba(255,255,255,0.5)]'; // GREEN for AVAILABLE

  if (isCheckedIn) {
    bgStyle = 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-[4px_4px_10px_rgba(37,99,235,0.45),inset_1px_1px_2px_rgba(255,255,255,0.5)]'; // BLUE for CHECKED-IN
  } else if (isBooked) {
    bgStyle = 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700 shadow-[4px_4px_10px_rgba(225,29,72,0.45),inset_1px_1px_2px_rgba(255,255,255,0.5)]'; // RED for BOOKED
  } else if (isCleaning) {
    bgStyle = 'bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-500 shadow-[4px_4px_10px_rgba(217,119,6,0.45),inset_1px_1px_2px_rgba(255,255,255,0.5)]'; // YELLOW for YET TO CLEAN
  } else if (isMaintenance) {
    bgStyle = 'bg-orange-600 text-white border-orange-700 hover:bg-orange-700 shadow-[4px_4px_10px_rgba(234,88,12,0.45),inset_1px_1px_2px_rgba(255,255,255,0.5)]'; // ORANGE for MAINTENANCE
  }

  // Format Room Type
  const formatType = (type) => {
    if (type === 'AC') return 'A/C';
    if (type === 'NON_AC') return 'N/C';
    if (type === 'SUITE') return 'SUITE';
    return type;
  };

  // Live Count Time with seconds + Check-in Date/Time
  let durationText = '';
  let checkInDisplay = '';
  if (activeStay?.check_in) {
    const checkInDate = new Date(activeStay.check_in);
    
    // Check-in date time display format: "11-Sep 01:51 PM"
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(checkInDate.getDate()).padStart(2, '0');
    const month = months[checkInDate.getMonth()];
    const timeStr = checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    checkInDisplay = `${day}-${month} ${timeStr}`;

    // Live count duration timer format: "00h 01m 15s"
    const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    durationText = `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  }

  return (
    <div
      onClick={() => onSelectRoom(room)}
      className={`relative cursor-pointer p-1.5 flex flex-col justify-between h-20 min-h-[78px] max-h-[84px] border-2 rounded-lg ${bgStyle} transition-all duration-200 select-none overflow-hidden group hover:-translate-y-0.5`}
    >
      {/* Header: Room # & Type */}
      <div className="flex items-center justify-between border-b border-white/20 pb-0.5">
        <span className="font-mono font-black text-xs md:text-sm tracking-wider leading-none">
          {room.room_number}
        </span>
        <span className="text-[9px] font-extrabold tracking-tight bg-black/20 px-1 py-0.2 rounded leading-none">
          {formatType(room.room_type)}
        </span>
      </div>

      {/* Center Content */}
      <div className="my-auto py-0.5 leading-tight">
        {isCheckedIn ? (
          <div>
            <div className="font-black text-[11px] md:text-xs tracking-tight uppercase line-clamp-1 leading-snug">
              {activeStay.guest_name}
            </div>
            <div className="text-[9px] font-bold opacity-90 tracking-tight flex items-center gap-1 leading-none mt-0.5">
              <span>in: {checkInDisplay}</span>
            </div>
          </div>
        ) : isBooked ? (
          <div>
            <div className="font-black text-[11px] tracking-tight uppercase line-clamp-1">
              {activeBooking.guest_name}
            </div>
            <div className="text-[8px] font-black tracking-wider uppercase opacity-90">
              RESERVED
            </div>
          </div>
        ) : isCleaning ? (
          <div className="flex items-center justify-between gap-1">
            <div className="text-[10px] font-black text-slate-950 uppercase tracking-tight flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-slate-950 animate-pulse" />
              YET TO CLEAN
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); markRoomClean(room.id); }}
              className="text-[8px] font-black bg-slate-950 hover:bg-slate-900 text-white px-1.5 py-0.5 rounded shadow uppercase flex items-center gap-0.5"
              title="Click after cleaning to mark AVAILABLE (GREEN)"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              <span>AVAILABLE</span>
            </button>
          </div>
        ) : isMaintenance ? (
          <div className="flex items-center justify-between gap-1">
            <div className="text-[10px] font-black text-white uppercase tracking-tight flex items-center gap-0.5">
              <Wrench className="w-3 h-3 text-white animate-pulse" />
              MAINTENANCE
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setRoomMaintenance(room.id, false); }}
              className="text-[8px] font-black bg-black/40 hover:bg-black/60 text-white px-1.5 py-0.5 rounded shadow uppercase flex items-center gap-0.5"
              title="Click to clear maintenance and mark AVAILABLE (GREEN)"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              <span>AVAILABLE</span>
            </button>
          </div>
        ) : (
          <div className="text-[11px] font-black tracking-wider uppercase text-center opacity-95">
            AVAILABLE
          </div>
        )}
      </div>

      {/* Footer: Live Seconds Duration Timer / Info */}
      <div className="flex items-center justify-between text-[9px] font-mono border-t border-white/20 pt-0.5 leading-none">
        {isCheckedIn ? (
          <>
            <span className="font-black text-[9px] tracking-tighter flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 opacity-80" />
              {durationText}
            </span>
            <span className="text-[8px] font-sans font-extrabold uppercase bg-black/30 px-1 rounded">
              IN
            </span>
          </>
        ) : isBooked ? (
          <span className="font-black text-[8px] opacity-90">RESERVED</span>
        ) : isCleaning ? (
          <span className="font-black text-[8px] text-slate-950">CLEANING REQUIRED</span>
        ) : isMaintenance ? (
          <span className="font-black text-[8px] text-white">UNDER REPAIR</span>
        ) : (
          <span className="font-black text-[8px] opacity-90">READY</span>
        )}
      </div>
    </div>
  );
};
