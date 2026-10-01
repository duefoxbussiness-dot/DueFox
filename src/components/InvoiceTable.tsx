import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Trash2,
  Send,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  RotateCcw,
  Filter,
  Pencil,
} from 'lucide-react';
import { CurrencyCode, InvoiceStatus, InvoiceWithClient } from '../types';

interface InvoiceTableProps {
  invoices: InvoiceWithClient[];
  loading: boolean;
  onMarkPaid: (id: string, newStatus: InvoiceStatus) => Promise<void>;
  onEdit: (invoice: InvoiceWithClient) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenChaseModal: (invoice: InvoiceWithClient) => void;
  onOpenAddModal: () => void;
  selectedCurrency: 'ALL' | CurrencyCode;
  onToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  loading,
  onMarkPaid,
  onEdit,
  onDelete,
  onOpenChaseModal,
  onOpenAddModal,
  selectedCurrency,
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');
  const [copiedLinkMap, setCopiedLinkMap] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter invoices based on search, status, and currency
  const filteredInvoices = invoices.filter((inv) => {
    // Currency filter
    if (selectedCurrency !== 'ALL' && inv.currency !== selectedCurrency) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'escalated' && inv.status !== 'escalated') return false;
      if (statusFilter === 'pending' && inv.status !== 'pending') return false;
      if (statusFilter === 'paid' && inv.status !== 'paid') return false;
    }

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = inv.client.name.toLowerCase().includes(q);
      const matchEmail = inv.client.email.toLowerCase().includes(q);
      const matchInvNo = inv.invoice_number.toLowerCase().includes(q);
      const matchCompany = inv.client.company?.toLowerCase().includes(q);
      const matchNotes = inv.notes?.toLowerCase().includes(q);
      return matchName || matchEmail || matchInvNo || matchCompany || matchNotes;
    }

    return true;
  });

  const handleCopyPaymentLink = (invoice: InvoiceWithClient) => {
    const link = `${window.location.origin}/pay/${invoice.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
    }

    setCopiedLinkMap((prev) => ({ ...prev, [invoice.id]: true }));
    setTimeout(() => {
      setCopiedLinkMap((prev) => ({ ...prev, [invoice.id]: false }));
    }, 2000);

    if (onToast) {
      onToast('success', 'Payment link copied to clipboard!', link);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice? This will remove all associated chase history.')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Format currency
  const formatAmount = (amount: number, currency: CurrencyCode) => {
    const localeMap: Record<CurrencyCode, string> = {
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      INR: 'en-IN',
    };
    return new Intl.NumberFormat(localeMap[currency] || 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format due date nicely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden transition-all">
      {/* Table Header Controls: Search & Segmented Filter */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-800">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by client, email, company, notes, or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900/90 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-700 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-slate-800 text-amber-500 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
            }`}
          >
            Pending ({invoices.filter((i) => i.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('escalated')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'escalated'
                ? 'bg-white dark:bg-slate-800 text-rose-500 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
            }`}
          >
            Critical (30+ Days) ({invoices.filter((i) => i.status === 'escalated').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-white dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
            }`}
          >
            Paid ({invoices.filter((i) => i.status === 'paid').length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th scope="col" className="py-3 px-3.5 lg:px-4">Client Name & Work</th>
              <th scope="col" className="py-3 px-3.5 lg:px-4">Email & Contact</th>
              <th scope="col" className="py-3 px-3.5 lg:px-4 text-right">Amount</th>
              <th scope="col" className="py-3 px-3.5 lg:px-4">Due Date & Aging</th>
              <th scope="col" className="py-3 px-3.5 lg:px-4">Status</th>
              <th scope="col" className="py-3 px-3.5 lg:px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
            {loading ? (
              // Skeleton loading states
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-3.5 lg:px-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 shrink-0" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" />
                        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-16" />
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-32 pl-8" />
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 lg:px-4">
                    <div className="flex flex-col gap-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24" />
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 lg:px-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-10" />
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 lg:px-4">
                    <div className="flex flex-col gap-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20" />
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 lg:px-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
                  </td>
                  <td className="py-3.5 px-3.5 lg:px-4 text-right">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-36 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-5 text-center">
                  <div className="max-w-sm mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                      <Filter className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      No invoices match your criteria
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Try updating your search term or filter options, or add a new invoice to start chasing.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-electric hover:bg-[#F4511E] rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Create New Invoice</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isEscalated = inv.status === 'escalated';
                const isPaid = inv.status === 'paid';
                const isPending = inv.status === 'pending';
                const isCopied = copiedLinkMap[inv.id];

                // Client initials for clean icon
                const initials = inv.client.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={inv.id}
                    className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-700/40 group ${
                      isEscalated ? 'bg-rose-50/20 dark:bg-rose-950/15' : ''
                    }`}
                  >
                    {/* 1. CLIENT NAME & WORK Column (Vertical Hierarchy) */}
                    <td className="py-3.5 px-3.5 lg:px-4 align-top">
                      <div className="flex flex-col gap-0.5 max-w-xs xl:max-w-sm">
                        {/* Line 1: Avatar + Bold Client Name + Invoice Badge */}
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isEscalated
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400'
                                : isPaid
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {initials}
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {inv.client.name}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                            {inv.invoice_number}
                          </span>
                        </div>

                        {/* Line 2: Company Name in small muted text */}
                        {inv.client.company && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 pl-8 truncate">
                            {inv.client.company}
                          </div>
                        )}

                        {/* Line 3: Work details in small muted text */}
                        {inv.notes && (
                          <div
                            className="text-xs text-slate-500 dark:text-slate-400 pl-8 truncate"
                            title={inv.notes}
                          >
                            <span className="text-slate-400 dark:text-slate-500 font-medium">Work:</span>{' '}
                            {inv.notes.replace(/^Work:\s*/i, '')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 2. EMAIL & CONTACT Column (Vertical Hierarchy) */}
                    <td className="py-3.5 px-3.5 lg:px-4 align-top">
                      <div className="flex flex-col gap-0.5">
                        {/* Line 1: Primary Email */}
                        <a
                          href={`mailto:${inv.client.email}`}
                          className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-electric dark:hover:text-electric underline-offset-2 hover:underline truncate"
                        >
                          {inv.client.email}
                        </a>
                        {/* Line 2: Phone Number in small muted text */}
                        {inv.client.phone && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {inv.client.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. AMOUNT Column (Vertical Hierarchy) */}
                    <td className="py-3.5 px-3.5 lg:px-4 text-right align-top">
                      <div className="flex flex-col items-end gap-0.5">
                        {/* Line 1: Primary Amount */}
                        <span className="font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {formatAmount(inv.amount, inv.currency)}
                        </span>
                        {/* Line 2: Currency Tag */}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-medium tracking-wider">
                          {inv.currency}
                        </span>
                      </div>
                    </td>

                    {/* 4. DUE DATE & AGING Column (Vertical Hierarchy) */}
                    <td className="py-3.5 px-3.5 lg:px-4 align-top">
                      <div className="flex flex-col gap-0.5">
                        {/* Line 1: Due Date */}
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {formatDate(inv.due_date)}
                        </span>
                        {/* Line 2: Overdue Status Tag */}
                        <span className="text-xs whitespace-nowrap">
                          {isPaid ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Settled & Closed</span>
                          ) : inv.days_overdue > 0 ? (
                            <span
                              className={`font-semibold ${
                                inv.days_overdue >= 30 ? 'text-[#EF4444]' : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {inv.days_overdue} {inv.days_overdue === 1 ? 'day' : 'days'} overdue
                            </span>
                          ) : inv.days_overdue === 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">Due Today</span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              Due in {Math.abs(inv.days_overdue)} days
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* 5. STATUS BADGE Column (Single neat pill) */}
                    <td className="py-3.5 px-3.5 lg:px-4 align-top">
                      <div className="flex flex-col items-start gap-1">
                        {isPaid && (
                          <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-[#22C55E] border border-[#22C55E]/30 dark:bg-[#22C55E]/10 dark:text-[#22C55E]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                            <span>Paid</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-[#F59E0B] border border-[#F59E0B]/30 dark:bg-[#F59E0B]/10 dark:text-[#F59E0B]">
                            <Clock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                            <span>Pending</span>
                          </span>
                        )}

                        {isEscalated && (
                          <span
                            className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 text-[#EF4444] border border-[#EF4444]/30 dark:bg-[#EF4444]/10 dark:text-[#EF4444]"
                            title="Critical (30+ Days overdue)"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                            <span>Critical (30+ Days)</span>
                          </span>
                        )}

                        {inv.chase_count > 0 && !isPaid && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap pl-1">
                            {inv.chase_count} {inv.chase_count === 1 ? 'chase' : 'chases'} sent
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. Actions Column (Strictly single horizontal row) */}
                    <td className="py-3.5 px-3.5 lg:px-4 text-right align-top whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentLink(inv)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-electric hover:bg-[#F4511E] active:bg-[#E64A19] rounded-lg transition-all shadow-xs hover:shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                          title={`Copy public payment link (https://duefox.co/pay/${inv.id})`}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-white shrink-0" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                        </button>

                        {/* Chase / Reminder Trigger Button ('Chase') */}
                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => onOpenChaseModal(inv)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                            title="Preview and dispatch automated chase reminder via Email or WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-electric transition-colors shrink-0" />
                            <span>Chase</span>
                          </button>
                        )}


                        {/* Edit Button ('Edit') */}
                        <button
                          type="button"
                          onClick={() => onEdit(inv)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg transition-all cursor-pointer group shadow-2xs whitespace-nowrap shrink-0"
                          title="Edit invoice details, client contact, or notes"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-electric transition-colors shrink-0" />
                          <span>Edit</span>
                        </button>

                        {/* Mark Paid / Reopen Button */}
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => onMarkPaid(inv.id, 'pending')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            title="Reopen invoice as pending"
                          >
                            <RotateCcw className="w-3 h-3 shrink-0" />
                            <span>Reopen</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onMarkPaid(inv.id, 'paid')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#22C55E] dark:text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            title="Mark invoice as paid and settled"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                            <span>Mark Paid</span>
                          </button>
                        )}

                        {/* Delete Invoice Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteConfirm(inv.id)}
                          disabled={deletingId === inv.id}
                          className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          title="Delete invoice record"
                          aria-label="Delete invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary Count */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="font-mono text-slate-800 dark:text-slate-200">{filteredInvoices.length}</strong> of{' '}
            <strong className="font-mono text-slate-800 dark:text-slate-200">{invoices.length}</strong> total invoices
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Overdue items automatically escalate to Critical at <strong className="font-mono text-slate-800 dark:text-slate-200">30+ days</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Green = Paid</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Yellow = Pending</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span>Red = Critical (30+ Days)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
