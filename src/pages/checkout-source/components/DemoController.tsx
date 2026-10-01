import React from 'react';
import { Invoice, InvoiceStatus } from '../types/invoice';
import { MOCK_INVOICES } from '../data/mockInvoices';
import { SlidersHorizontal, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

interface DemoControllerProps {
  currentInvoice: Invoice;
  onSelectInvoice: (invoice: Invoice) => void;
  statusOverride: InvoiceStatus;
  onChangeStatusOverride: (status: InvoiceStatus) => void;
  isPaidSuccessView: boolean;
  onToggleSuccessView: (value: boolean) => void;
}

export const DemoController: React.FC<DemoControllerProps> = ({
  currentInvoice,
  onSelectInvoice,
  statusOverride,
  onChangeStatusOverride,
  isPaidSuccessView,
  onToggleSuccessView,
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#/pay/${currentInvoice.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <aside
      aria-label="Payment link controls"
      className="no-print bg-slate-900 text-slate-200 text-xs px-4 py-2.5 border-b border-slate-800"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse"></span>
            /pay/{currentInvoice.id}
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Interactive Client Checkout Preview
          </span>
        </div>

        {/* Center / Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Invoice Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 hidden md:inline text-[11px]">Client:</span>
            <select
              aria-label="Select client invoice"
              value={currentInvoice.id}
              onChange={(e) => {
                const found = MOCK_INVOICES.find((inv) => inv.id === e.target.value);
                if (found) onSelectInvoice(found);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
            >
              {MOCK_INVOICES.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} - {inv.client.name} ({inv.currencySymbol}{inv.totalAmount.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Status Preview Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onChangeStatusOverride('overdue')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusOverride === 'overdue'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => onChangeStatusOverride('due_soon')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusOverride === 'due_soon'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Due Soon
            </button>
            <button
              onClick={() => onChangeStatusOverride('paid')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusOverride === 'paid'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Settled / Paid
            </button>
          </div>

          {/* Success Screen Toggle */}
          <button
            onClick={() => onToggleSuccessView(!isPaidSuccessView)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              isPaidSuccessView
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#FF5722]" />
            {isPaidSuccessView ? 'Viewing Settled State' : 'Simulate Paid State'}
          </button>

          {/* Copy Pay Link */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors cursor-pointer"
            title="Copy client checkout URL"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
