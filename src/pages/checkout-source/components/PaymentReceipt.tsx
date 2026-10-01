import React from 'react';
import { Invoice } from '../types/invoice';
import { DueFoxLogo } from './DueFoxLogo';
import { CheckCircle2, Printer, X, Download, ShieldCheck } from 'lucide-react';

interface PaymentReceiptProps {
  invoice: Invoice;
  transactionId: string;
  paymentMethod: string;
  paidAtDate: string;
  onClose?: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  invoice,
  transactionId,
  paymentMethod,
  paidAtDate,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedAmount = `${invoice.currencySymbol}${invoice.totalAmount.toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Official Client Payment Receipt
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print / Save as PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 md:p-10 space-y-8 text-slate-800" id="printable-receipt">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <DueFoxLogo size="md" />
              <p className="text-xs text-slate-500 max-w-xs mt-2">
                Automated Payment Processing & Settlement Network
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Payment Settled & Closed
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {formattedAmount}
              </div>
              <p className="text-xs text-slate-500">
                Currency: <span className="font-semibold text-slate-700">{invoice.currency}</span>
              </p>
            </div>
          </div>

          {/* Receipt Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Receipt No.</span>
              <span className="font-mono font-bold text-slate-800">
                REC-{invoice.id.replace('INV-', '')}-{transactionId.slice(-4)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Invoice Ref</span>
              <span className="font-mono font-bold text-slate-800">{invoice.id}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Settled Date</span>
              <span className="font-semibold text-slate-800">{paidAtDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment Mode</span>
              <span className="font-semibold text-slate-800">{paymentMethod}</span>
            </div>
          </div>

          {/* Parties */}
          <div className="grid sm:grid-cols-2 gap-8 text-xs">
            {/* Billed By */}
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Payment Received By
              </span>
              <h4 className="font-bold text-sm text-slate-900">{invoice.agency.name}</h4>
              <p className="text-slate-600">{invoice.agency.address}</p>
              <p className="text-slate-600">{invoice.agency.city}, {invoice.agency.country}</p>
              <p className="text-slate-500 font-mono mt-1">Tax ID: {invoice.agency.taxId}</p>
              <p className="text-slate-500">{invoice.agency.email}</p>
            </div>

            {/* Billed To */}
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Paid By (Client)
              </span>
              <h4 className="font-bold text-sm text-slate-900">{invoice.client.name}</h4>
              <p className="font-medium text-slate-700">{invoice.client.company}</p>
              {invoice.client.address && <p className="text-slate-600">{invoice.client.address}</p>}
              <p className="text-slate-500 font-mono mt-1">
                {invoice.client.gstOrTaxId ? `Tax ID: ${invoice.client.gstOrTaxId}` : invoice.client.email}
              </p>
              <p className="text-slate-500">{invoice.client.phone}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between text-xs font-semibold text-slate-600">
              <span>Work Deliverable Description</span>
              <span>Amount</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {invoice.items.map((item, idx) => (
                <div key={item.id} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-800">{item.description}</div>
                    <div className="text-[11px] text-slate-400">Qty: {item.quantity} × {invoice.currencySymbol}{item.unitPrice.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="font-mono font-semibold text-slate-900">
                    {invoice.currencySymbol}{item.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
              <span>Total Paid & Cleared</span>
              <span className="font-mono text-sm text-emerald-700">
                {formattedAmount} {invoice.currency}
              </span>
            </div>
          </div>

          {/* Security & Verification Stamp */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-emerald-900">Cryptographically Verified Settlement</p>
                <p className="text-slate-500 font-mono text-[11px]">
                  Txn Hash: {transactionId}
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] font-semibold text-emerald-700 hidden sm:inline-block">
              AUTH_CODE: 200_OK
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="no-print bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download PDF Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
