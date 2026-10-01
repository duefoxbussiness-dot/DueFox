import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />,
  };

  const borderClasses = {
    success: 'border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-800 shadow-lg',
    error: 'border-rose-200 dark:border-rose-500/30 bg-white dark:bg-slate-800 shadow-lg',
    info: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg',
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border text-sm text-slate-800 dark:text-slate-100 transition-all duration-200 ${borderClasses[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-white leading-tight">{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
