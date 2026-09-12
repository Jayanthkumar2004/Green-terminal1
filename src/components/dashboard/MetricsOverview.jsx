import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { DoorClosed, CheckCircle2, BookmarkCheck, UserCheck, Sparkles, Wrench } from 'lucide-react';

export const MetricsOverview = () => {
  const { rooms, stays, bookings } = useHotel();

  const totalRooms = rooms.length;

  const checkedInCount = stays.filter(s => s.status === 'CHECKED_IN').length;
  const yetToCleanCount = rooms.filter(r => 
    r.status === 'OUT_FOR_CLEANING' || r.status === 'YET_TO_CLEAN'
  ).length;
  const maintenanceCount = rooms.filter(r => r.status === 'MAINTENANCE').length;

  const bookedCount = rooms.filter(r => {
    const isStay = stays.some(s => (s.room_id === r.id || s.room_number === r.room_number) && s.status === 'CHECKED_IN');
    const isBooked = bookings.some(b => (b.room_id === r.id || b.room_number === r.room_number) && b.status === 'ACTIVE');
    return r.status !== 'MAINTENANCE' && !isStay && (r.status === 'BOOKED' || isBooked);
  }).length;

  // Available rooms are strictly those without active check-in, booking, cleaning, or maintenance requirement
  const availableCount = rooms.filter(r => {
    const isStay = stays.some(s => (s.room_id === r.id || s.room_number === r.room_number) && s.status === 'CHECKED_IN');
    const isBooked = bookings.some(b => (b.room_id === r.id || b.room_number === r.room_number) && b.status === 'ACTIVE');
    const isCleaning = r.status === 'OUT_FOR_CLEANING' || r.status === 'YET_TO_CLEAN';
    const isMaintenance = r.status === 'MAINTENANCE';
    return !isStay && !isBooked && !isCleaning && !isMaintenance && r.status !== 'BOOKED';
  }).length;

  const stats = [
    {
      title: 'TOTAL ROOMS',
      value: totalRooms,
      icon: DoorClosed,
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      textColor: 'text-slate-900 dark:text-white',
      borderColor: 'border-slate-300 dark:border-slate-700'
    },
    {
      title: 'AVAILABLE',
      value: availableCount,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
      textColor: 'text-emerald-800 dark:text-emerald-300',
      borderColor: 'border-emerald-300 dark:border-emerald-700'
    },
    {
      title: 'BOOKED',
      value: bookedCount,
      icon: BookmarkCheck,
      bgColor: 'bg-rose-50 dark:bg-rose-950/60',
      textColor: 'text-rose-800 dark:text-rose-300',
      borderColor: 'border-rose-300 dark:border-rose-700'
    },
    {
      title: 'CHECKED-IN',
      value: checkedInCount,
      icon: UserCheck,
      bgColor: 'bg-sky-50 dark:bg-sky-950/60',
      textColor: 'text-sky-800 dark:text-sky-300',
      borderColor: 'border-sky-300 dark:border-sky-700'
    },
    {
      title: 'YET TO CLEAN',
      value: yetToCleanCount,
      icon: Sparkles,
      bgColor: 'bg-amber-50 dark:bg-amber-950/60',
      textColor: 'text-amber-800 dark:text-amber-300',
      borderColor: 'border-amber-300 dark:border-amber-700'
    },
    {
      title: 'MAINTENANCE',
      value: maintenanceCount,
      icon: Wrench,
      bgColor: 'bg-orange-50 dark:bg-orange-950/60',
      textColor: 'text-orange-800 dark:text-orange-300',
      borderColor: 'border-orange-300 dark:border-orange-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3.5 no-print">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`clay-card p-3 border ${stat.borderColor} flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5`}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.title}</p>
              <h3 className={`text-xl md:text-2xl font-black mt-0.5 ${stat.textColor}`}>{stat.value}</h3>
            </div>
            <div className={`p-2.5 rounded-xl ${stat.bgColor} border ${stat.borderColor} ${stat.textColor} shadow-xs`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
