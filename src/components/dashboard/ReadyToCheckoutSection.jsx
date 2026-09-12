import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { Clock, LogOut, CheckCircle, AlertTriangle, ChevronRight, User } from 'lucide-react';

export const ReadyToCheckoutSection = ({ onOpenCheckOut }) => {
  const { rooms, stays, now, continueStayCycle } = useHotel();

  // Find all active stays that have reached or passed a 24h cycle threshold (20h+, 44h+, 68h+...)
  // and have NOT been dismissed for that cycle. Rooms stay inside this section continuously until
  // either "CONTINUE STAY" or "CHECKOUT & BILL" is clicked.
  const readyStays = stays.filter(s => {
    if (s.status !== 'CHECKED_IN' || !s.check_in) return false;

    const checkInMs = new Date(s.check_in).getTime();
    const diffMs = Math.max(0, now.getTime() - checkInMs);
    const durationHours = diffMs / (1000 * 60 * 60);

    // Highest 24-hour cycle threshold reached (Threshold 1: >=20h, Threshold 2: >=44h, Threshold 3: >=68h...)
    const highestReachedCycle = Math.floor((durationHours + 4) / 24);
    const dismissedCycle = s.dismissed_checkout_cycle || 0;

    // Room is ready to checkout if it reached at least Threshold 1 (>=20h)
    // AND has NOT been dismissed for the highest reached cycle
    return highestReachedCycle >= 1 && highestReachedCycle > dismissedCycle;
  });

  if (readyStays.length === 0) return null;

  return (
    <div className="clay-card p-4 border-2 border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/40 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-sm animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm md:text-base text-amber-950 dark:text-amber-100 uppercase tracking-tight flex items-center gap-2">
              <span>ROOMS READY TO CHECKOUT ({readyStays.length})</span>
            </h3>
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              Rooms approaching or past 24-hour stay cycle (20h+, 44h+, 68h+ threshold)
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 rounded-lg">
          Action Needed
        </span>
      </div>

      {/* Grid of Ready to Checkout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {readyStays.map(stay => {
          const roomObj = rooms.find(r => r.id === stay.room_id || r.room_number === stay.room_number);
          const roomNumber = roomObj ? roomObj.room_number : (stay.room_number || 'N/A');

          const checkInMs = new Date(stay.check_in).getTime();
          const diffMs = Math.max(0, now.getTime() - checkInMs);
          const durationHours = diffMs / (1000 * 60 * 60);

          const highestReachedCycle = Math.floor((durationHours + 4) / 24);
          const hoursInt = Math.floor(durationHours);
          const minsInt = Math.floor((durationHours - hoursInt) * 60);
          const durationStr = `${hoursInt}h ${minsInt}m`;

          return (
            <div
              key={stay.id}
              className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-amber-300 dark:border-amber-700 shadow-md flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-sky-600 text-white font-mono font-black flex items-center justify-center text-sm shadow">
                    {roomNumber}
                  </div>
                  <div>
                    <h4 className="font-black text-xs md:text-sm text-slate-900 dark:text-white uppercase leading-snug">
                      ROOM {roomNumber}
                    </h4>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-600" />
                      <span>{stay.guest_name}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 rounded border border-amber-300 dark:border-amber-700">
                  Day {highestReachedCycle} Cycle
                </span>
              </div>

              {/* Elapsed time banner */}
              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">Stay Duration:</span>
                <span className="font-black text-sky-700 dark:text-sky-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {durationStr}
                </span>
              </div>

              {/* Action Buttons: 1. Continue Stay | 2. Checkout & Bill */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => continueStayCycle(stay.id, highestReachedCycle)}
                  className="py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] uppercase shadow transition-all flex items-center justify-center gap-1"
                  title="Guest wants to continue stay for another day. Removes from this section until next 24h threshold."
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>CONTINUE STAY</span>
                </button>

                <button
                  onClick={() => roomObj && onOpenCheckOut(roomObj)}
                  className="py-2 px-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-[10px] uppercase shadow transition-all flex items-center justify-center gap-1"
                  title="Proceed to checkout and generate bill for this room"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>CHECKOUT & BILL</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
