import React, { useState } from 'react';
import { 
  Plus, 
  Zap, 
  User, 
  LogOut, 
  AlertCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Copy, 
  Check, 
  Edit3, 
  RotateCcw, 
  Trash2, 
  ArrowLeft,
  Pause,
  Play,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { Currency, Invoice, BusinessProfile, InvoiceStatus } from './types';
import { INITIAL_INVOICES } from './data/mockInvoices';
import { AddInvoiceModal } from './components/AddInvoiceModal';
import { SettingsModal } from './components/SettingsModal';
import { getNextScheduledCadenceStep, ResumeChaseModal } from '../../components/ResumeChaseModal';

interface DashboardProps {
  onBackToLanding: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBackToLanding }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'critical' | 'paid' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<'profile' | 'payment' | 'plan'>('profile');
  const [resumeInvoice, setResumeInvoice] = useState<Invoice | null>(null);

  // User & Business profile
  const [profile, setProfile] = useState<BusinessProfile>({
    companyName: '',
    representativeName: '',
    email: '',
    phone: '',
    defaultCurrency: 'USD',
    address: '',
    taxId: '',
    directGatewayLink: '',
    currentPlan: 'Starter',
    bankDetails: {
      accountHolder: '',
      bankName: '',
      accountNumber: '',
      swiftCode: '',
      routingOrIfsc: '',
    },
  });

  // Calculate totals
  const uncollectedInvoices = invoices.filter((i) => i.status !== 'Paid');
  const overdueUSD = uncollectedInvoices
    .filter((i) => i.currency === 'USD')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const overdueINR = uncollectedInvoices
    .filter((i) => i.currency === 'INR')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCount = invoices.filter((i) => i.status === 'Pending').length;
  const criticalCount = invoices.filter((i) => i.status === 'Critical').length;
  const paidCount = invoices.filter((i) => i.status === 'Paid').length;
  const pausedCount = invoices.filter((i) => i.status === 'Paused').length;

  // Filter list
  const filteredInvoices = invoices.filter((inv) => {
    if (selectedCurrency !== 'All' && inv.currency !== selectedCurrency) return false;
    if (activeTab === 'pending' && inv.status !== 'Pending') return false;
    if (activeTab === 'critical' && inv.status !== 'Critical') return false;
    if (activeTab === 'paid' && inv.status !== 'Paid') return false;
    if (activeTab === 'paused' && inv.status !== 'Paused') return false;

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

  const handleCopyLink = (id: string, link?: string) => {
    const textToCopy = link || `https://duefox.co/pay/${id}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const isCurrentlyPaid = inv.status === 'Paid';
          return {
            ...inv,
            status: isCurrentlyPaid ? 'Pending' : 'Paid',
            agingDays: isCurrentlyPaid ? 14 : undefined,
          };
        }
        return inv;
      })
    );
  };

  const handlePauseChase = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => inv.id === id && inv.status !== 'Paid' ? { ...inv, status: 'Paused' } : inv)
    );
  };

  const handleResumeChase = async () => {
    if (!resumeInvoice) return;
    setInvoices((prev) =>
      prev.map((inv) => inv.id === resumeInvoice.id ? { ...inv, status: 'Pending' } : inv)
    );
    setResumeInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const handleAddInvoice = (newInv: Invoice) => {
    setInvoices((prev) => [newInv, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Top Bar Navigation matching Screenshot 1 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Back Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              title="Return to dueFox Marketing Landing Page"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FF5722]" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>

            <BrandLogo size="md" onClick={onBackToLanding} />
          </div>

          {/* Right Header Controls matching Screenshot 1 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Add Invoice Primary Button (Orange) */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#FF5722] hover:bg-[#F4511E] text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Invoice</span>
            </button>

            {/* Upgrade Plan Button (Amber) */}
            <button
              onClick={() => {
                setSettingsDefaultTab('plan');
                setIsSettingsModalOpen(true);
              }}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Upgrade Plan</span>
            </button>

            {/* Profile Pill */}
            <button
              onClick={() => {
                setSettingsDefaultTab('profile');
                setIsSettingsModalOpen(true);
              }}
              className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-left transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF5722] flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-slate-800">{profile.companyName || 'Your Company'}</div>
                <div className="text-[10px] text-slate-400">{profile.email || 'Guest User'}</div>
              </div>
            </button>

            {/* Sign Out */}
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Section 1: Invoice Chasing Overview */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Invoice Chasing Overview
              </h1>
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
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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

          {/* 3 Metric Cards matching Screenshot 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: TOTAL OVERDUE AMOUNT */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  TOTAL OVERDUE AMOUNT
                </span>
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {selectedCurrency === 'INR' ? '₹0' : `$${overdueUSD.toLocaleString()}`}
                  </span>
                  {selectedCurrency === 'All' && overdueINR > 0 && (
                    <span className="text-sm font-bold text-slate-500">
                      + ₹{overdueINR.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>Uncollected balance across pending and escalated invoices</span>
              </div>
            </div>

            {/* Card 2: PENDING INVOICES */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  PENDING INVOICES
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {pendingCount}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {pendingCount === 1 ? 'invoice awaiting payment' : 'invoices awaiting payment'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>Active automatic email &amp; WhatsApp chase queue</span>
              </div>
            </div>

            {/* Card 3: CRITICAL (30+ DAYS) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-rose-500 uppercase">
                  CRITICAL (30+ DAYS)
                </span>
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight">
                    {criticalCount}
                  </span>
                  <span className="text-xs font-semibold text-rose-600">
                    {criticalCount === 1 ? 'severe delinquent account' : 'severe delinquent accounts'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>Overdue &gt; 30 days; prioritized firm reminder cadence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Invoice Accounts & Chase Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header & Legend */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Invoice Accounts &amp; Chase Queue</h2>
              <p className="text-xs text-slate-500">
                Track overdue balances, automate collection cadence, and escalate past-due client accounts.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Paid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical (30+ Days)
              </span>
            </div>
          </div>

          {/* Search bar & Tabs */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by client, email, company, notes, or invoice #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FF5722] text-slate-800 placeholder-slate-400 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: `All Invoices (${invoices.length})` },
                { id: 'pending', label: `Pending (${pendingCount})` },
                { id: 'critical', label: `Critical (30+ Days) (${criticalCount})` },
                { id: 'paid', label: `Paid (${paidCount})` },
                { id: 'paused', label: `Paused (${pausedCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
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

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Client Name &amp; Work</th>
                  <th className="py-3 px-5">Email &amp; Contact</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Due Date &amp; Aging</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'Paid';
                  const isCritical = inv.status === 'Critical';
                  const isPending = inv.status === 'Pending';
                  const isPaused = inv.status === 'Paused';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Client Name & Work */}
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isCritical
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isPaused
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inv.clientAvatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{inv.clientName}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {inv.invoiceNumber}
                              </span>
                            </div>
                            <div className="text-slate-600 font-medium text-xs">{inv.company}</div>
                            <div className="text-slate-400 text-[11px]">{inv.workDescription}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Contact */}
                      <td className="py-4 px-5 text-slate-600">
                        <div className="font-semibold text-slate-800">{inv.email}</div>
                        <div className="text-xs text-slate-400">{inv.phone}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {inv.currency === 'USD'
                            ? `$${inv.amount.toLocaleString()}`
                            : inv.currency === 'EUR'
                            ? `€${inv.amount.toLocaleString()}`
                            : inv.currency === 'GBP'
                            ? `£${inv.amount.toLocaleString()}`
                            : `₹${inv.amount.toLocaleString()}`}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{inv.currency}</span>
                      </td>

                      {/* Due Date & Aging */}
                      <td className="py-4 px-5">
                        <div className="font-medium text-slate-800">{inv.dueDate}</div>
                        <div className="text-xs">
                          {isPaid ? (
                            <span className="text-emerald-600 font-semibold">Settled &amp; Closed</span>
                          ) : isCritical ? (
                            <span className="text-rose-600 font-bold">Overdue {inv.agingDays}d (Urgent)</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Overdue {inv.agingDays}d</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                          </span>
                        )}
                        {isCritical && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Critical (30+ Days)
                          </span>
                        )}
                        {isPaused && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Pause className="w-3.5 h-3.5" /> Paused
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Copy Link */}
                          <button
                            onClick={() => handleCopyLink(inv.id, inv.paymentLink)}
                            className="bg-[#FF5722] hover:bg-[#F4511E] text-white px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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

                          {!isPaid && !isPaused && (
                            <button
                              onClick={() => handlePauseChase(inv.id)}
                              title="Pause automated invoice chasing"
                              className="border border-slate-200 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Pause className="w-3 h-3" />
                              <span className="hidden sm:inline">Pause Chase</span>
                            </button>
                          )}
                          {!isPaid && isPaused && (
                            <button
                              onClick={() => setResumeInvoice(inv)}
                              className="bg-[#FF5722] hover:bg-[#F4511E] text-white px-2.5 py-1.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              <span className="hidden sm:inline">Resume Chase</span>
                            </button>
                          )}

                          {/* Reopen / Mark as Paid */}
                          <button
                            onClick={() => handleToggleStatus(inv.id)}
                            className="border border-slate-200 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-400" />
                            <span>{isPaid ? 'Reopen' : 'Paid'}</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              Showing <span className="font-semibold text-slate-800">{filteredInvoices.length}</span> of{' '}
              <span className="font-semibold text-slate-800">{invoices.length}</span> total invoices · Overdue items automatically escalate to Critical at <strong>30+ days</strong>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Green = Paid</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Yellow = Pending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Red = Critical (30+ Days)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Add Invoice Modal */}
      <AddInvoiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddInvoice={handleAddInvoice}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
        defaultTab={settingsDefaultTab}
      />

      <ResumeChaseModal
        isOpen={Boolean(resumeInvoice)}
        clientName={resumeInvoice?.clientName || ''}
        email={resumeInvoice?.email || ''}
        nextCadenceStep={getNextScheduledCadenceStep(resumeInvoice?.chaseSchedule)}
        onClose={() => setResumeInvoice(null)}
        onConfirm={handleResumeChase}
      />
    </div>
  );
};
