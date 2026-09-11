import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Lock, Mail, User, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export const AuthModal = () => {
  const { login, register, resetPassword } = useHotel();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register(formData.name, formData.email, formData.password);
      } else if (authMode === 'login') {
        await login(formData.email, formData.password);
      } else if (authMode === 'forgot') {
        if (!formData.email.trim()) {
          throw new Error('Please enter your registered email address');
        }
        await resetPassword(formData.email);
        setSuccessMsg(`Password reset link sent to ${formData.email}. Please check your inbox.`);
      }
    } catch (err) {
      setError(err.message || 'Authentication operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md clay-card p-8 border border-slate-200/50 dark:border-slate-800">
        
        {/* Official Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-md border border-slate-200 mb-3">
            <img src="/logo.png" alt="Hotel Green Terminal Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">HOTEL GREEN TERMINAL</h1>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mt-0.5">ROOM MANAGEMENT SYSTEM</p>
        </div>

        {/* Tab Switcher */}
        {authMode !== 'forgot' ? (
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl mb-6 shadow-inner">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                authMode === 'login' ? 'bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                authMode === 'register' ? 'bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
            >
              Register
            </button>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
            <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">Forgot Password</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  className="clay-input w-full pl-9 pr-4 py-2 text-xs font-bold"
                  placeholder="Manager / Admin Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                className="clay-input w-full pl-9 pr-4 py-2 text-xs font-semibold"
                placeholder="admin@greenterminal.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Password</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setError(''); setSuccessMsg(''); }}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  className="clay-input w-full pl-9 pr-4 py-2 text-xs font-semibold"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          )}

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  className="clay-input w-full pl-9 pr-4 py-2 text-xs font-semibold"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : authMode === 'register' ? (
              <>Register Credentials to Supabase</>
            ) : authMode === 'forgot' ? (
              <>Send Reset Password Link</>
            ) : (
              <>Login to Dashboard</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
