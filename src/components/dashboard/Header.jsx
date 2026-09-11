import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { Building2, LayoutDashboard, DoorClosed, History, Settings, Receipt, LogOut, Sun, Moon } from 'lucide-react';

export const Header = ({ activeTab, setActiveTab }) => {
  const { user, logout, theme, toggleTheme, isRealtimeConnected } = useHotel();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms Board', icon: DoorClosed },
    { id: 'history', label: 'History', icon: History },
    { id: 'admin', label: 'Admin', icon: Settings },
    { id: 'bills', label: 'Bills', icon: Receipt },
  ];

  return (
    <header className="clay-card mb-3 p-3 text-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-800 no-print transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand with Official Logo & WebSocket Indicator */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="Hotel Green Terminal Logo" className="h-full w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                HOTEL GREEN TERMINAL
              </h1>
              <span className={`px-2 py-0.5 text-[9px] font-black rounded-full flex items-center gap-1 border ${
                isRealtimeConnected
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isRealtimeConnected ? 'WEBSOCKET LIVE' : 'SYNC READY'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">ROOM MANAGEMENT SYSTEM</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900/90 p-1.5 rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4)] overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/40 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Theme Switcher, User Info & Logout */}
        <div className="flex items-center gap-2.5">
          {/* Explicit Light / Dark Mode Segmented Pill Toggle */}
          <div className="flex items-center bg-slate-200/90 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700 shadow-inner">
            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] uppercase">LIGHT</span>
            </button>

            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] uppercase">DARK</span>
            </button>
          </div>

          <div className="text-right hidden md:block leading-tight">
            <div className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'Manager'}</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">{user?.email}</div>
          </div>
          
          <button
            onClick={logout}
            title="Logout"
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
