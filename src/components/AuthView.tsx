import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, AlertCircle, Eye, EyeOff, Send } from 'lucide-react';
import { AuthUser, ThemeMode, SupabaseConfig } from '../types';
import { supabaseService, DEMO_USER } from '../lib/supabase';

interface AuthViewProps {
  onAuthenticated: (user: AuthUser) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthenticated,
  theme,
  onToggleTheme,
  supabaseConfig,
  onOpenSupabaseModal,
}) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupConfirmation, setSignupConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid business email address.');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await supabaseService.signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else if (res.user) {
          onAuthenticated(res.user);
          navigate('/dashboard');
        }
      } else {
        const res = await supabaseService.signUp(email, password, fullName);
        if (res.error) {
          setError(res.error);
        } else {
          // Display prominent confirmation alert message
          setSignupConfirmation(true);
          setSuccessMsg('Confirmation email sent! Please check your inbox and click the verification link before logging in.');
          setTab('login');
          if (res.user && !res.requiresConfirmation) {
            onAuthenticated(res.user);
            navigate('/dashboard');
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setError(null);
    onAuthenticated(DEMO_USER);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-200 overflow-hidden">
      {/* Subtle ambient brand glow in dark mode */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#FF5722]/10 via-[#FF5722]/5 to-transparent blur-3xl pointer-events-none rounded-full dark:opacity-60 opacity-20" />

      {/* Top Bar inside Auth */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-electric flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <polygon points="12 2 19 8 19 19 5 19 5 8 12 2" fill="currentColor" fillOpacity="0.25" />
              <path d="M5 8l7 4 7-4" />
              <path d="M12 12v7" />
              <path d="M9 5l3 3 3-3" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              dueFox<span className="text-electric font-semibold">.co</span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider block text-slate-500 dark:text-slate-400">
              Automated Invoice Chasing
            </span>
          </div>
        </div>

      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="relative rounded-2xl bg-white/95 dark:bg-[#1E293B]/90 backdrop-blur-xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 shadow-2xl transition-all">
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-[#FF5722] to-amber-500 rounded-t-2xl" />

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {tab === 'login' ? 'Welcome Back' : 'Create dueFox Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {tab === 'login'
                ? 'Sign in to access your invoice chasing engine and ledger'
                : 'Get started recovering overdue accounts with automated workflows'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Signup Confirmation Alert - Prominent Display */}
          {signupConfirmation && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-950 dark:text-emerald-100 shadow-md animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/25 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Check Your Inbox
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
                      Action Required
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100 leading-snug">
                    Confirmation email sent! Please check your inbox and click the verification link before logging in.
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-1">
                    Sent to <span className="font-mono font-medium underline">{email}</span>. Click the verification link in the email, then enter your password to sign in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Standard Error Feedback */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* General Success Feedback if not confirmation */}
          {successMsg && !signupConfirmation && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name / Company Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan or Apex Systems"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="demo@gmail.com"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{showPassword ? 'Hide' : 'Preview'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show entered password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-electric hover:bg-[#F4511E] active:bg-[#E64A19] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
              <span className="bg-white dark:bg-slate-800 px-3 text-slate-400">
                Or quick test with
              </span>
            </div>
          </div>

          {/* Quick 1-Click Demo Login */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Login</span>
          </button>

          {/* Footer security note */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Secured via Supabase Auth & PostgreSQL Row-Level Security</span>
          </div>
        </div>
      </div>

      {/* Auth View Footer */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-500 z-10 pb-2">
        <span>dueFox.co · Modern Automated Invoice Chasing Platform</span>
      </footer>
    </div>
  );
};
