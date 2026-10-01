import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Mail, Phone, User, Link as LinkIcon, Building2, Clock, Sparkles, FileText, Pencil } from 'lucide-react';
import { CurrencyCode, InvoiceWithClient, NewInvoiceInput, UserProfile } from '../types';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewInvoiceInput) => Promise<void>;
  initialInvoice?: InvoiceWithClient | null;
  defaultCurrency?: CurrencyCode;
  profile?: UserProfile | null;
}

export const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialInvoice,
  defaultCurrency = 'USD',
  profile,
}) => {
  const isEditing = Boolean(initialInvoice);
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [paymentLink, setPaymentLink] = useState('');
  const [chaseSchedule, setChaseSchedule] = useState<'gentle' | 'standard' | 'assertive'>('standard');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialInvoice) {
        setClientName(initialInvoice.client.name || '');
        setEmail(initialInvoice.client.email || '');
        setPhone(initialInvoice.client.phone || '');
        setCompany(initialInvoice.client.company || '');
        setAmount(String(initialInvoice.amount));
        setCurrency(initialInvoice.currency);
        setDueDate(initialInvoice.due_date);
        setPaymentLink(initialInvoice.payment_link || '');
        setChaseSchedule(initialInvoice.chase_schedule || 'standard');
        setNotes(initialInvoice.notes || '');
      } else {
        setClientName('');
        setEmail('');
        setPhone('');
        setCompany('');
        setAmount('');
        setCurrency(profile?.default_currency || defaultCurrency);
        const d = new Date();
        d.setDate(d.getDate() + 7);
        setDueDate(d.toISOString().split('T')[0]);
        setPaymentLink(profile?.payment_gateway_url || '');
        setChaseSchedule('standard');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialInvoice, defaultCurrency, profile]);

  if (!isOpen) return null;

  const handleSetPresetDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientName.trim()) {
      setError('Client name is required');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('A valid client email address is required for automated chasing');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please specify a valid invoice amount greater than 0');
      return;
    }

    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        clientName: clientName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim() || undefined,
        amount: parsedAmount,
        currency,
        dueDate,
        paymentLink: paymentLink.trim() || undefined,
        chaseSchedule,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setClientName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setAmount('');
      setPaymentLink('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save invoice record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Pencil className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 id="modal-title" className="text-base sm:text-lg font-bold text-slate-900">
                {isEditing ? `Edit Invoice (${initialInvoice!.invoice_number})` : 'Add New Invoice'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? 'Update client details, invoice amount, due date, and work description.'
                  : 'Enter invoice & client details for automated tracking & chasing.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-white">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Client Details Section */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Client Contact Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe or Acme Corp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="billing@client.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone (for SMS/WhatsApp Chasing)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000 / +91 98..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Acme Studios LLC"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Invoice & Payment Terms
            </span>

            {/* Amount and Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm font-semibold font-mono text-slate-400">
                    {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Currency
                </label>
                <div className="grid grid-cols-4 rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
                  {(['USD', 'EUR', 'GBP', 'INR'] as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                        currency === c
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Due Date & Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Due Date <span className="text-rose-500">*</span>
                </label>
                {/* Presets */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(7)}
                    className="text-slate-700 hover:text-orange-600 font-medium underline cursor-pointer"
                  >
                    +7d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(14)}
                    className="text-slate-700 hover:text-orange-600 font-medium underline cursor-pointer"
                  >
                    +14d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(-35)}
                    className="text-rose-600 hover:underline font-semibold cursor-pointer"
                    title="Simulate 35 days overdue for escalation test"
                  >
                    35d Overdue (Test)
                  </button>
                </div>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Payment Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Link (Stripe, Razorpay, Wise, PayPal)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  placeholder="https://pay.stripe.com/... or https://rzp.io/..."
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Leave blank to auto-generate a secure dueFox branded payment gateway link.
              </p>
            </div>

            {/* Invoice Notes / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Notes / Description
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  placeholder="e.g. Q3 Software development sprint, design deliverables, website migration..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors resize-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Specify what work this invoice is for (included in invoice records and chase messages).
              </p>
            </div>

            {/* Chase Cadence Schedule */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Automated Chase Schedule
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChaseSchedule('gentle')}
                  className={`p-2.5 text-left border rounded-xl transition-all cursor-pointer ${
                    chaseSchedule === 'gentle'
                      ? 'border-orange-500 bg-orange-50/60 ring-1 ring-orange-500'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className={`block text-xs font-bold ${chaseSchedule === 'gentle' ? 'text-orange-600' : 'text-slate-900'}`}>
                    Gentle
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    Every 7 days, courteous
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setChaseSchedule('standard')}
                  className={`p-2.5 text-left border rounded-xl transition-all cursor-pointer ${
                    chaseSchedule === 'standard'
                      ? 'border-orange-500 bg-orange-50/60 ring-1 ring-orange-500'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className={`block text-xs font-bold ${chaseSchedule === 'standard' ? 'text-orange-600' : 'text-slate-900'}`}>
                    Standard
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    Days 3, 7, 14 & 21
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setChaseSchedule('assertive')}
                  className={`p-2.5 text-left border rounded-xl transition-all cursor-pointer ${
                    chaseSchedule === 'assertive'
                      ? 'border-orange-500 bg-orange-50/60 ring-1 ring-orange-500'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className={`block text-xs font-bold ${chaseSchedule === 'assertive' ? 'text-orange-600' : 'text-slate-900'}`}>
                    Assertive
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    With legal escalation
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>{isEditing ? 'Update Invoice' : 'Create Invoice & Schedule Chase'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
