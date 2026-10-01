import React, { useState } from 'react';
import { 
  AlertCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';
import { Currency, Invoice } from '../types';
import { INITIAL_INVOICES } from '../data/mockInvoices';
import { SampleEmailWhatsAppModal } from './SampleEmailWhatsAppModal';

interface InteractiveDashboardPreviewProps {
  onGoToDashboard: () => void;
}

export const InteractiveDashboardPreview: React.FC<InteractiveDashboardPreviewProps> = ({
  onGoToDashboard,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'critical' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // Filter invoices based on currency, status, search
  const filteredInvoices = invoices.filter((inv) => {
    if (selectedCurrency !== 'All' && inv.currency !== selectedCurrency) {
      return false;
    }
    if (activeTab === 'pending' && inv.status !== 'Pending') return false;
    if (activeTab === 'critical' && inv.status !== 'Critical') return false;
    if (activeTab === 'paid' && inv.status !== 'Paid') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.clientName.toLowerCase().includes(q) ||
        inv.company.toLowerCase().includes(q) ||
        inv.email.toLowerCase().includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.workDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (id: string, link?: string) => {
    const textToCopy = link || `https://duefox.co/pay/${id}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const nextStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
          return {
            ...inv,
            status: nextStatus,
            agingDays: nextStatus === 'Paid' ? undefined : 14,
          };
        }
        return inv;
      })
    );
  };

  return (
    <div className="relative w-full rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden transition-all text-slate-800">
      {/* Interactive Top Banner / Notification */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#FF5722] animate-pulse" />
          <span className="font-semibold text-white">Live Interactive Dashboard Simulator</span>
          <span className="hidden sm:inline text-slate-400">· Click filters, copy payment links, or test chase triggers below</span>
        </div>
        <button
          onClick={onGoToDashboard}
          className="flex items-center gap-1.5 bg-[#FF5722] hover:bg-[#F4511E] text-white px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
        >
          Launch Full App <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Dashboard Preview Container */}
      <div className="p-4 sm:p-6 lg:p-7 space-y-6 bg-[#F8FAFC]">
        {/* Section Header: Invoice Chasing Overview */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Invoice Chasing Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Automated tracking and escalation schedule for outstanding client accounts.
            </p>
          </div>

          {/* Currency Switcher Tabs */}
          <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
            {(['All', 'USD', 'EUR', 'GBP', 'INR'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCurrency === curr
                    ? 'bg-[#FF5722] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {curr === 'All' ? 'All' : curr === 'USD' ? 'USD ($)' : curr === 'EUR' ? 'EUR (€)' : curr === 'GBP' ? 'GBP (£)' : 'INR (₹)'}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Metric Cards matching Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: TOTAL OVERDUE AMOUNT */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                TOTAL OVERDUE AMOUNT
              </span>
              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">$7,700</span>
                <span className="text-sm font-bold text-slate-500">+ ₹68,000</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Uncollected balance across pending and escalated invoices</span>
            </div>
          </div>

          {/* Card 2: PENDING INVOICES */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                PENDING INVOICES
              </span>
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">1</span>
                <span className="text-xs font-semibold text-slate-500">invoice awaiting payment</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Active automatic email & WhatsApp chase queue</span>
            </div>
          </div>

          {/* Card 3: CRITICAL (30+ DAYS) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-rose-500 uppercase">
                CRITICAL (30+ DAYS)
              </span>
              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-600 tracking-tight">2</span>
                <span className="text-xs font-semibold text-rose-600">severe delinquent accounts</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Overdue &gt; 30 days; prioritized firm reminder cadence</span>
            </div>
          </div>
        </div>

        {/* Section: Invoice Accounts & Chase Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Invoice Accounts &amp; Chase Queue
              </h3>
              <p className="text-xs text-slate-500">
                Track overdue balances, automate collection cadence, and escalate past-due client accounts.
              </p>
            </div>

            {/* Status Legend */}
            <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Paid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical (30+ Days)
              </span>
            </div>
          </div>

          {/* Search & Filter Tabs */}
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by client, email, company, notes, or invoice #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF5722] text-slate-800 placeholder-slate-400 shadow-2xs"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: `All Invoices (${invoices.length})` },
                { id: 'pending', label: `Pending (${invoices.filter(i => i.status === 'Pending').length})` },
                { id: 'critical', label: `Critical (30+ Days) (${invoices.filter(i => i.status === 'Critical').length})` },
                { id: 'paid', label: `Paid (${invoices.filter(i => i.status === 'Paid').length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10.5px] font-bold tracking-wider text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Client Name &amp; Work</th>
                  <th className="py-3 px-4">Email &amp; Contact</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date &amp; Aging</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'Paid';
                  const isCritical = inv.status === 'Critical';
                  const isPending = inv.status === 'Pending';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Client Name & Work */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                            isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            isCritical ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {inv.clientAvatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{inv.clientName}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {inv.invoiceNumber}
                              </span>
                            </div>
                            <div className="text-slate-600 font-medium text-[11px]">{inv.company}</div>
                            <div className="text-slate-400 text-[10px] truncate max-w-[220px]">{inv.workDescription}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Contact */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{inv.email}</div>
                        <div className="text-[11px] text-slate-400">{inv.phone}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {inv.currency === 'USD' ? `$${inv.amount.toLocaleString()}` :
                           inv.currency === 'EUR' ? `€${inv.amount.toLocaleString()}` :
                           inv.currency === 'GBP' ? `£${inv.amount.toLocaleString()}` :
                           `₹${inv.amount.toLocaleString()}`}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{inv.currency}</span>
                      </td>

                      {/* Due Date & Aging */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{inv.dueDate}</div>
                        <div className="text-[11px]">
                          {isPaid ? (
                            <span className="text-emerald-600 font-semibold">Settled &amp; Closed</span>
                          ) : isCritical ? (
                            <span className="text-rose-600 font-bold">Overdue {inv.agingDays}d (Urgent)</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Overdue {inv.agingDays}d</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                          </span>
                        )}
                        {isCritical && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Critical (30+ Days)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Copy Link Button (Primary Orange #FF5722) */}
                          <button
                            onClick={() => handleCopy(inv.id, inv.paymentLink)}
                            title="Copy instant client payment checkout link"
                            className="bg-[#FF5722] hover:bg-[#F4511E] text-white px-2.5 py-1 rounded-lg font-semibold text-xs inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            {copiedId === inv.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          {/* Preview Escalation Notice */}
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            title="Preview automated WhatsApp / Email chase notice"
                            className="border border-slate-200 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-medium text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-[#FF5722]" />
                            <span className="hidden sm:inline">Preview Chase</span>
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() => handleToggleStatus(inv.id)}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded-md text-[10px] font-semibold border border-transparent hover:border-slate-200 transition-colors"
                          >
                            {isPaid ? 'Reopen' : 'Mark Paid'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              Showing <span className="font-semibold text-slate-800">{filteredInvoices.length}</span> of{' '}
              <span className="font-semibold text-slate-800">{invoices.length}</span> total invoices · Overdue items automatically escalate to Critical at <strong>30+ days</strong>
            </div>
            <button
              onClick={onGoToDashboard}
              className="text-[#FF5722] hover:text-[#E64A19] font-bold flex items-center gap-1 cursor-pointer"
            >
              Open Complete Dashboard Workspace <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Previewing WhatsApp / Email Chase Message */}
      <SampleEmailWhatsAppModal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice || undefined}
      />
    </div>
  );
};
