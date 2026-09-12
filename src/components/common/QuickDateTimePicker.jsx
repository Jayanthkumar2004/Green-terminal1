import React from 'react';
import { Clock, Calendar, Zap } from 'lucide-react';

/**
 * Reusable QuickDateTimePicker component.
 * Replaces cumbersome wheel-scrolling datetime-local with separate Date + Time controls
 * and instant quick action shortcut buttons (NOW, -1h, +1h, -1d, +1d).
 * 
 * @param {string} value - ISO or Local string (e.g., "2026-09-12T10:30")
 * @param {function} onChange - Returns updated ISO/Local datetime string "YYYY-MM-DDTHH:mm"
 */
export const QuickDateTimePicker = ({ value, onChange, label = "Check-in Timestamp" }) => {
  // Parse value string into date (YYYY-MM-DD) and time (HH:mm)
  let datePart = '';
  let timePart = '';

  try {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } else if (typeof value === 'string' && value.includes('T')) {
        const parts = value.split('T');
        datePart = parts[0];
        timePart = parts[1].slice(0, 5);
      }
    }
  } catch (e) {
    console.warn('QuickDateTimePicker parse error:', e);
  }

  // Fallback defaults if empty
  if (!datePart || !timePart) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    timePart = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  const emitChange = (newDateStr, newTimeStr) => {
    onChange(`${newDateStr}T${newTimeStr}`);
  };

  const handleDateChange = (e) => {
    emitChange(e.target.value, timePart);
  };

  const handleTimeChange = (e) => {
    emitChange(datePart, e.target.value);
  };

  const setNow = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const tStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    emitChange(dStr, tStr);
  };

  const addHours = (hoursToAdd) => {
    const current = new Date(`${datePart}T${timePart}`);
    if (isNaN(current.getTime())) return;
    current.setHours(current.getHours() + hoursToAdd);
    const pad = (n) => String(n).padStart(2, '0');
    const dStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`;
    const tStr = `${pad(current.getHours())}:${pad(current.getMinutes())}`;
    emitChange(dStr, tStr);
  };

  const addDays = (daysToAdd) => {
    const current = new Date(`${datePart}T${timePart}`);
    if (isNaN(current.getTime())) return;
    current.setDate(current.getDate() + daysToAdd);
    const pad = (n) => String(n).padStart(2, '0');
    const dStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`;
    const tStr = `${pad(current.getHours())}:${pad(current.getMinutes())}`;
    emitChange(dStr, tStr);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <button
            type="button"
            onClick={setNow}
            className="text-[10px] font-black text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1 uppercase bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 transition-all"
            title="Set to current date and time right now"
          >
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>SET NOW</span>
          </button>
        </div>
      )}

      {/* Date and Time Inputs Side-by-Side */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="date"
            required
            className="clay-input w-full pl-8 pr-2 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
            value={datePart}
            onChange={handleDateChange}
          />
        </div>

        <div className="relative">
          <Clock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="time"
            required
            className="clay-input w-full pl-8 pr-2 py-1.5 text-xs font-semibold font-mono text-slate-900 dark:text-white"
            value={timePart}
            onChange={handleTimeChange}
          />
        </div>
      </div>

      {/* Quick Action Preset Buttons */}
      <div className="flex flex-wrap items-center gap-1 pt-0.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase mr-0.5">Quick Adjust:</span>
        <button
          type="button"
          onClick={() => addHours(-1)}
          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold font-mono border border-slate-200 dark:border-slate-700"
          title="Subtract 1 hour"
        >
          -1h
        </button>
        <button
          type="button"
          onClick={() => addHours(1)}
          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold font-mono border border-slate-200 dark:border-slate-700"
          title="Add 1 hour"
        >
          +1h
        </button>
        <button
          type="button"
          onClick={() => addDays(-1)}
          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold font-mono border border-slate-200 dark:border-slate-700"
          title="Yesterday / -1 Day"
        >
          -1d
        </button>
        <button
          type="button"
          onClick={() => addDays(1)}
          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold font-mono border border-slate-200 dark:border-slate-700"
          title="Tomorrow / +1 Day"
        >
          +1d
        </button>
      </div>
    </div>
  );
};
