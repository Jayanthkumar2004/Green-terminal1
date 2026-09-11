import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const SuiteRoomCell = ({ room, onSelectRoom }) => {
  const { getRoomActiveStay, getRoomActiveBooking, markRoomClean, now } = useHotel();

  if (!room) return null;

  const activeStay = getRoomActiveStay(room.id);
  const activeBooking = getRoomActiveBooking(room.id);

  const isCheckedIn = Boolean(activeStay);
  const isBooked = !isCheckedIn && Boolean(activeBooking);
  const isCleaning = !isCheckedIn && !isBooked && (room.status === 'OUT_FOR_CLEANING' || room.status === 'YET_TO_CLEAN');

  let bgStyle = 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-[4px_4px_10px_rgba(5,150,105,0.45),inset_1px_1px_2px_rgba(255,255,255,0.5)]';
  
  if (isCheckedIn) {
    bgStyle = 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-[4px_4px_10px_rgba(37,99,235,0.45),inset_1px_1px_2px_rgba(255,255,255,0.5)]';
  } else if (isBooked) {
    bgStyle = 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700 shadow-[4px_4px_10px_rgba(225,29,72,0.45),inset_1px_1px_2px_rgba(255,255,255,0.5)]';
  } else if (isCleaning) {
    bgStyle = 'bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-500 shadow-[4px_4px_10px_rgba(217,119,6,0.45),inset_1px_1px_2px_rgba(255,255,255,0.5)]';
  }

  // Duration timer calculation
  let durationText = '';
  if (activeStay?.check_in) {
    const checkInMs = new Date(activeStay.check_in).getTime();
    const diffMs = Math.max(0, now.getTime() - checkInMs);
    const totalMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    durationText = `${hours}h ${mins}m`;
  }

  return (
    <div
      onClick={() => onSelectRoom(room)}
      className={`cursor-pointer w-full px-3 py-2 border-2 rounded-xl ${bgStyle} transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-2 mt-2 select-none hover:-translate-y-0.5`}
    >
      <div className="flex items-center gap-2">
        <span className="bg-black/30 text-white font-mono font-black text-xs md:text-sm px-2.5 py-0.5 rounded-md shadow-inner">
          {room.room_number}
        </span>
        <div>
          <h4 className="font-black tracking-wider text-xs md:text-sm uppercase leading-tight">
            {room.room_number} SUITE ROOM
          </h4>
        </div>
      </div>

      <div className="text-center md:text-right">
        {isCheckedIn ? (
          <div className="leading-tight">
            <div className="font-black text-xs uppercase tracking-tight">
              GUEST: {activeStay.guest_name}
            </div>
            <div className="text-[10px] font-mono font-bold">
              CHECKED-IN • DURATION: {durationText}
            </div>
          </div>
        ) : isBooked ? (
          <div className="leading-tight">
            <div className="font-black text-xs uppercase tracking-tight">
              RESERVED: {activeBooking.guest_name}
            </div>
            <div className="text-[10px] font-bold uppercase">STATUS: BOOKED</div>
          </div>
        ) : isCleaning ? (
          <div className="flex items-center gap-2">
            <span className="font-black text-xs uppercase text-slate-950 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
              YET TO CLEAN
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); markRoomClean(room.id); }}
              className="text-xs font-black bg-slate-950 hover:bg-slate-900 text-white px-2.5 py-1 rounded shadow uppercase flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>MARK AVAILABLE</span>
            </button>
          </div>
        ) : (
          <div className="font-black text-xs uppercase tracking-wider bg-black/20 px-3 py-1 rounded border border-white/20">
            AVAILABLE SUITE
          </div>
        )}
      </div>
    </div>
  );
};
