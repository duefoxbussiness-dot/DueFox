import React, { useState } from 'react';
import { AlertCircle, CalendarClock, Mail, Play, UserRound, X } from 'lucide-react';

interface ResumeChaseModalProps {
  isOpen: boolean;
  clientName: string;
  email: string;
  nextCadenceStep: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const getNextScheduledCadenceStep = (schedule?: string) => {
  switch (schedule?.toLowerCase()) {
    case 'gentle':
      return 'First reminder today · Gentle cadence, then every 7 days';
    case 'assertive':
      return 'First reminder today · Assertive cadence with legal escalation';
    default:
      return 'First reminder today · Standard cadence, then days 3, 7, 14 & 21';
  }
};

export const ResumeChaseModal: React.FC<ResumeChaseModalProps> = ({
  isOpen,
  clientName,
  email,
  nextCadenceStep,
  onClose,
  onConfirm,
}) => {
  const [resuming, setResuming] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError('');
    setResuming(true);
    try {
      await onConfirm();
    } catch (resumeError) {
      setError(resumeError instanceof Error ? resumeError.message : 'Could not resume invoice chasing.');
    } finally {
      setResuming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-2 py-3 sm:px-4 bg-slate-900/60 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-chase-title"
        className="w-full max-w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/50 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 p-2.5 text-orange-600">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h2 id="resume-chase-title" className="text-base font-bold text-slate-900 dark:text-white">
                Resume Invoice Chasing
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Review the next sequence before restarting it.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={resuming}
            aria-label="Close resume invoice chasing preview"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Preview Details
            </h3>
            <dl className="space-y-3">
              <div className="grid grid-cols-1 items-center gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
                <dt className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                  Client Name
                </dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-white">{clientName}</dd>
              </div>
              <div className="grid grid-cols-1 items-center gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
                <dt className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  Email Address
                </dt>
                <dd className="break-all text-sm font-semibold text-slate-900 dark:text-white">{email}</dd>
              </div>
              <div className="grid grid-cols-1 items-start gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
                <dt className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <CalendarClock className="h-4 w-4 shrink-0 text-slate-400" />
                  Next Scheduled Cadence Step
                </dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-white">{nextCadenceStep}</dd>
              </div>
            </dl>
          </div>

          <div className="flex gap-3 rounded-xl border border-amber-200/60 bg-amber-50/60 p-3.5 text-xs leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>Resuming will start a fresh chasing sequence from today and skip any past missed schedules.</p>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/30 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={resuming}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={resuming}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {resuming ? 'Resuming...' : 'Confirm & Resume'}
          </button>
        </footer>
      </section>
    </div>
  );
};
