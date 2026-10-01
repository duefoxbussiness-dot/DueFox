import React, { useState } from 'react';
import { Invoice } from '../types/invoice';
import { CheckCircle2, Download, Mail, ArrowRight, ShieldCheck, Copy, Check, FileText } from 'lucide-react';
import { PaymentReceipt } from './PaymentReceipt';

interface PaymentSuccessModalProps {
  invoice: Invoice;
  transactionId: string;
  paymentMethod: string;
  paidAtDate: string;
  onResetDemo: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  invoice,
  transactionId,
  paymentMethod,
  paidAtDate,
  onResetDemo,
}) => {
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [emailSentToast, setEmailSentToast] = useState(false);

  const formattedAmount = `${invoice.currencySymbol}${invoice.totalAmount.toLocaleString('en-IN')}`;

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const handleSendEmailReceipt = () => {
    setEmailSentToast(true);
    setTimeout(() => setEmailSentToast(false), 3500);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Green Checkmark Hero */}
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 border-8 border-emerald-100/60 flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
        </div>

        {/* Title & Status */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Payment Settled & Closed
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Payment Successfully Confirmed
        </h2>

        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Thank you! The payment of <span className="font-semibold text-slate-900">{formattedAmount} {invoice.currency}</span> has been securely processed and reconciled into <span className="font-semibold text-slate-900">{invoice.agency.name}</span>'s account.
        </p>

        {/* Transaction Summary Card */}
        <div className="mt-8 bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-left text-xs space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Invoice Reference</span>
            <span className="font-mono font-bold text-slate-800">{invoice.id}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Amount Settled</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formattedAmount} {invoice.currency}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Payment Channel</span>
            <span className="font-semibold text-slate-800">{paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Date & Timestamp</span>
            <span className="font-medium text-slate-700">{paidAtDate}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500 font-medium">Transaction ID</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
              <span>{transactionId}</span>
              <button
                onClick={copyTransactionId}
                className="hover:text-slate-900 cursor-pointer text-slate-400"
                title="Copy Transaction ID"
              >
                {copiedTxn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Email Sent Alert Toast */}
        {emailSentToast && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-800 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official PDF payment receipt dispatched to <strong>{invoice.client.email}</strong></span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowReceiptModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-sm font-bold shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Payment Receipt (PDF)
          </button>

          <button
            onClick={handleSendEmailReceipt}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-slate-500" />
            Email Receipt to {invoice.client.email.split('@')[0]}
          </button>
        </div>

        {/* Sub-actions & Reset */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Auto-synced with DueFox Ledger & Accounting</span>
          </div>

          <button
            onClick={onResetDemo}
            className="inline-flex items-center gap-1 text-[#FF5722] font-semibold hover:underline cursor-pointer"
          >
            Switch back to Live Checkout view
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full PDF Receipt Modal if triggered */}
      {showReceiptModal && (
        <PaymentReceipt
          invoice={invoice}
          transactionId={transactionId}
          paymentMethod={paymentMethod}
          paidAtDate={paidAtDate}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </>
  );
};
