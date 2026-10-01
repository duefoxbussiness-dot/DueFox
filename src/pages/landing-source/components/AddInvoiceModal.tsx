import React, { useState } from 'react';
import { X, FileText, User, Mail, Phone, Building, DollarSign, Calendar, Link2, Sparkles, Check } from 'lucide-react';
import { Currency, ChaseSchedule, Invoice } from '../types';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInvoice: (invoice: Invoice) => void;
}

export const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({
  isOpen,
  onClose,
  onAddInvoice,
}) => {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [amount, setAmount] = useState('2500');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [dueDate, setDueDate] = useState('2026-10-08');
  const [paymentLink, setPaymentLink] = useState('');
  const [notes, setNotes] = useState('');
  const [chaseSchedule, setChaseSchedule] = useState<ChaseSchedule>('Standard');

  if (!isOpen) return null;

  const handleApplyPreset = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !email.trim() || !amount) return;

    const numAmount = parseFloat(amount) || 0;
    const initials = clientName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 3600 * 24));
    const isOverdue = diffDays > 0;
    const isCritical = diffDays >= 30;

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName,
      clientAvatar: initials || 'CL',
      company: company || 'Independent Client',
      email,
      phone: phone || '+1 (555) 000-0000',
      workDescription: notes || 'Product design and implementation milestone',
      amount: numAmount,
      currency,
      dueDate,
      status: isCritical ? 'Critical' : isOverdue ? 'Pending' : 'Pending',
      agingDays: isOverdue ? diffDays : undefined,
      chaseSchedule,
      paymentLink: paymentLink || `https://duefox.co/pay/inv-${Date.now().toString().slice(-4)}`,
      notes,
    };

    onAddInvoice(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header matching Screenshot */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5722] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Invoice</h3>
              <p className="text-xs text-slate-500">
                Enter invoice &amp; client details for automated tracking &amp; chasing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800">
          {/* Section 1: Client Contact Information */}
          <div className="space-y-4">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              CLIENT CONTACT INFORMATION
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Name <span className="text-[#FF5722]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe or Acme Corp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-[#FF5722]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="billing@client.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone (for SMS/WhatsApp Chasing)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000 / +91 98..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Acme Studios LLC"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Invoice & Payment Terms */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              INVOICE &amp; PAYMENT TERMS
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount <span className="text-[#FF5722]">*</span>
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                    {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'}
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722] transition-colors font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Currency
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
                  {(['USD', 'EUR', 'GBP', 'INR'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        currency === c
                          ? 'bg-[#FF5722] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
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
                <label className="text-xs font-semibold text-slate-700">
                  Due Date <span className="text-[#FF5722]">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(7)}
                    className="text-slate-600 hover:text-[#FF5722] font-semibold underline underline-offset-2"
                  >
                    +7d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(14)}
                    className="text-slate-600 hover:text-[#FF5722] font-semibold underline underline-offset-2"
                  >
                    +14d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(-35)}
                    className="text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    35d Overdue (Test)
                  </button>
                </div>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722] transition-colors"
                />
              </div>
            </div>

            {/* Payment Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Link (Stripe, Razorpay, Wise, PayPal)
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://pay.stripe.com/... or https://rzp.io/..."
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722] transition-colors"
                />
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Leave blank to auto-generate a secure dueFox branded payment gateway link.
              </p>
            </div>

            {/* Invoice Notes / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Notes / Description
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Q3 Software development sprint, design deliverables, website migration..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722] transition-colors"
              />
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                Specify what work this invoice is for (included in invoice records and chase messages).
              </p>
            </div>
          </div>

          {/* Section 3: Automated Chase Schedule */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Automated Chase Schedule
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'Gentle',
                  title: 'Gentle',
                  desc: 'Every 7 days, courteous',
                },
                {
                  id: 'Standard',
                  title: 'Standard',
                  desc: 'Days 3, 7, 14 & 21',
                },
                {
                  id: 'Assertive',
                  title: 'Assertive',
                  desc: 'With legal escalation',
                },
              ].map((sch) => {
                const isSelected = chaseSchedule === sch.id;
                return (
                  <div
                    key={sch.id}
                    onClick={() => setChaseSchedule(sch.id as ChaseSchedule)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#FF5722] bg-[#FF5722]/5 ring-1 ring-[#FF5722]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      {sch.title}
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#FF5722]" />}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{sch.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Create Invoice &amp; Schedule Chase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
