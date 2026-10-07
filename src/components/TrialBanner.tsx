import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface TrialBannerProps {
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
}

export function TrialBanner({ subscriptionStatus, trialEndsAt }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setNow(Date.now());
  }, [trialEndsAt]);

  if (subscriptionStatus !== 'trialing' || !trialEndsAt || dismissed) return null;

  const trialEndTime = new Date(trialEndsAt).getTime();
  if (!Number.isFinite(trialEndTime)) return null;

  const daysRemaining = Math.ceil((trialEndTime - now) / (24 * 60 * 60 * 1000));
  if (daysRemaining <= 0) return null;

  return (
    <div
      role="status"
      className="mx-2 mt-3 flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 text-sm text-orange-950 shadow-sm dark:border-orange-400/30 dark:from-orange-500/10 dark:to-amber-500/10 dark:text-orange-100 sm:mx-4 lg:mx-10"
    >
      <p className="font-semibold leading-relaxed">
        🚀 Your Pro Trial expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}. Recovering invoices is active!
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss trial banner"
        className="shrink-0 rounded-lg p-1 text-orange-800 transition-colors hover:bg-orange-100 dark:text-orange-200 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
