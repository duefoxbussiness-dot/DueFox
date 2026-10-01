import React, { useState } from 'react';
import { Mail, MessageSquare, Check, X, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Invoice } from '../types';

interface SampleEmailWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice;
}

export const SampleEmailWhatsAppModal: React.FC<SampleEmailWhatsAppModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const clientName = invoice?.clientName || 'Sarah Jenkins';
  const company = invoice?.company || 'Lumen Cyber Inc.';
  const amountStr = invoice ? (invoice.currency === 'USD' ? `$${invoice.amount.toLocaleString()}` : `₹${invoice.amount.toLocaleString()}`) : '$3,200';
  const invoiceNum = invoice?.invoiceNumber || 'INV-2026-089';
  const payLink = invoice?.paymentLink || 'https://duefox.co/pay/inv-2026-089';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(payLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF5722]/10 text-[#FF5722] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Channel Chase Preview</h3>
              <p className="text-xs text-slate-500">Live preview of automated dispatch to {clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-slate-200 bg-white px-6 pt-3">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-[#25D366] text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
            WhatsApp Escalation (98% Open Rate)
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'border-[#FF5722] text-[#FF5722]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            Polite Email Dispatch
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 bg-slate-50/50">
          {activeTab === 'whatsapp' ? (
            <div className="max-w-md mx-auto bg-[#EFEAE2] p-4 rounded-2xl shadow-inner border border-emerald-900/10">
              <div className="text-[10px] text-center text-slate-500 mb-3 font-medium bg-white/70 py-1 px-3 rounded-full w-max mx-auto shadow-xs">
                Today · WhatsApp Business Verified
              </div>

              {/* Chat bubble */}
              <div className="bg-white rounded-2xl rounded-tl-xs p-4 shadow-sm text-slate-800 text-xs sm:text-sm leading-relaxed border border-emerald-100 relative">
                <p className="font-semibold text-slate-900 mb-1">
                  Hi {clientName.split(' ')[0]},
                </p>
                <p className="text-slate-700 text-xs leading-relaxed mb-3">
                  This is an automated friendly reminder from <strong>dueFox.co</strong> on behalf of your agency partner regarding outstanding invoice{' '}
                  <span className="font-mono font-bold text-slate-900">{invoiceNum}</span> for{' '}
                  <span className="font-bold text-slate-900">{amountStr}</span>.
                </p>
                <p className="text-slate-700 text-xs leading-relaxed mb-3">
                  You can review itemized deliverables and complete 1-click payment securely using the direct link below:
                </p>

                {/* Simulated Payment Card Link */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold text-slate-900">dueFox Secure Settlement</div>
                    <div className="text-[10px] text-slate-500 font-mono">{payLink}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Stripe · Bank Wire · Cards
                    </div>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 bg-[#FF5722] hover:bg-[#F4511E] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Pay Now'}
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 text-right mt-1">10:42 AM · Delivered & Read ✓✓</div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-xs sm:text-sm">
              <div className="pb-3 mb-3 border-b border-slate-100 flex flex-col gap-1 text-xs">
                <div className="text-slate-500">
                  <strong className="text-slate-700">From:</strong> billing@duefox.co (via dueFox Automated Dispatch)
                </div>
                <div className="text-slate-500">
                  <strong className="text-slate-700">To:</strong> {invoice?.email || 'sarah.j@lumencyber.io'}
                </div>
                <div className="text-slate-800 font-semibold">
                  <strong className="text-slate-700">Subject:</strong> Statement & Reminder: {invoiceNum} - {company} ({amountStr})
                </div>
              </div>

              <div className="space-y-3 text-slate-700 text-xs leading-relaxed">
                <p>Dear {clientName},</p>
                <p>
                  We hope you are having a productive week. We are reaching out regarding invoice{' '}
                  <span className="font-mono font-bold text-slate-900">{invoiceNum}</span> for the amount of{' '}
                  <span className="font-bold text-[#FF5722]">{amountStr}</span>, which was due on{' '}
                  {invoice?.dueDate || 'Aug 18, 2026'}.
                </p>
                <p>
                  To settle this balance without delay, please use our instant payment checkout:
                </p>
                <div className="py-2">
                  <a
                    href="#checkout"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyLink();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5722] text-white font-semibold text-xs shadow-xs hover:bg-[#F4511E] transition-all"
                  >
                    Complete Payment via dueFox Portal <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500">
                  For corporate accounting inquiries or direct wire routing numbers, reply directly to this notice or click the payment link above.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Cadence rule: <span className="font-semibold text-slate-700">Standard (Days 3, 7, 14, 21)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
