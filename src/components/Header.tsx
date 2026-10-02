import React from 'react';
import { Plus, Zap, LogOut, User as UserIcon, UserPlus } from 'lucide-react';
import { AuthUser, UserProfile } from '../types';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenUpgradePlan: () => void;
  onOpenProfileModal: () => void;
  onSignOut: () => void;
  isDemoMode?: boolean;
  onCreateAccount?: () => void;
  user: AuthUser | null;
  profile?: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenUpgradePlan,
  onOpenProfileModal,
  onSignOut,
  isDemoMode = false,
  onCreateAccount,
  user,
  profile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        {/* Left: Clean Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              {/* Fox silhouette minimalist geometric icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-white"
              >
                <polygon points="12 2 19 8 19 19 5 19 5 8 12 2" fill="currentColor" fillOpacity="0.25" />
                <path d="M5 8l7 4 7-4" />
                <path d="M12 12v7" />
                <path d="M9 5l3 3 3-3" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
                dueFox<span className="text-electric font-semibold">.co</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                Automated Invoice Chaser
              </span>
            </div>
          </div>
        </div>

        {/* Right: invoice actions, subscription, user profile, and sign out */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 whitespace-nowrap">
          {/* 1. + Add Invoice Primary Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-electric hover:bg-[#F4511E] active:bg-[#E64A19] rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer whitespace-nowrap"
            title="Create and register a new invoice"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Invoice</span>
          </button>

          {/* 2. "⚡ Upgrade Plan" / "Subscription" CTA Button */}
          <button
            type="button"
            onClick={onOpenUpgradePlan}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer whitespace-nowrap"
            title="View subscription tiers and upgrade plan"
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
            <span>⚡ Upgrade Plan</span>
          </button>

          {/* 3. User Profile Section */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer group whitespace-nowrap"
            title="Company & Payment Settings"
          >
            <div className="w-8 h-8 rounded-lg bg-electric/15 text-electric flex items-center justify-center font-bold text-xs group-hover:bg-electric group-hover:text-white transition-colors shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[170px] group-hover:text-electric transition-colors">
                {isDemoMode ? 'Demo Account' : profile?.company_name || 'Your Company'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-tight truncate max-w-[170px]">
                {isDemoMode ? 'demo@duefox.co' : profile?.business_email || user?.email || 'Guest User'}
              </span>
            </div>
          </button>

          {isDemoMode && onCreateAccount && (
            <button
              type="button"
              onClick={onCreateAccount}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-electric hover:bg-[#F4511E] active:bg-[#E64A19] rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
              title="Create an account or sign in"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>
                <span className="hidden sm:inline">Create Account / Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </span>
            </button>
          )}

          {/* 4. "Sign Out" Button */}
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            title="Sign out of dueFox"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
