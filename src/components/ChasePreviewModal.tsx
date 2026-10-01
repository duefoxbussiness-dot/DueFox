import React, { useState } from 'react';
import { X, Send, Mail, MessageSquare, ExternalLink, Check, Copy, AlertTriangle } from 'lucide-react';
import { InvoiceWithClient, UserProfile } from '../types';

interface ChasePreviewModalProps {
  invoice: InvoiceWithClient | null;
  isOpen: boolean;
  onClose: () => void;
  onSendChase: (invoiceId: string) => Promise<void>;
  profile?: UserProfile | null;
}

export const ChasePreviewModal: React.FC<ChasePreviewModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSendChase,
  profile,
}) => {
  const [activeChannel, setActiveChannel] = useState<'email' | 'whatsapp'>('email');
  const [sending, setSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !invoice) return null;

  const currencySymbol = invoice.currency === 'USD' ? '$' : '₹';
  const formattedAmount = `${currencySymbol}${invoice.amount.toLocaleString()}`;
  const isEscalated = invoice.days_overdue >= 30;

  const senderName = profile?.full_name || 'Accounts Receivable';
  const companyName = profile?.company_name || 'dueFox.co';
  const contactDetails = [
    profile?.business_email,
    profile?.phone,
    profile?.tax_id ? `Tax ID: ${profile.tax_id}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const paymentLink = invoice.payment_link || profile?.payment_gateway_url || `https://duefox.co/pay/${invoice.id}`;
  const wireSection =
    (invoice.amount >= 1000 || isEscalated) && profile?.bank_name && profile?.bank_account_number
      ? `\n\n--- Bank Wire Transfer Details (High-Ticket Remittance) ---\nBeneficiary: ${profile.bank_holder_name || companyName}\nBank: ${profile.bank_name}\nAccount / IBAN: ${profile.bank_account_number}\nSWIFT / BIC: ${profile.bank_swift_bic || 'N/A'}${profile.bank_routing_wise ? `\nRouting / Wise: ${profile.bank_routing_wise}` : ''}\n-------------------------------------------------------------`
      : '';

  // Prepare dynamic reminder subject and body with auto-filled company & sender details
  const emailSubject = isEscalated
    ? `URGENT: Formal Notice of Overdue Account - ${invoice.invoice_number} (${formattedAmount}) - ${companyName}`
    : `Friendly Reminder: Outstanding Invoice ${invoice.invoice_number} from ${companyName}`;

  const emailBody = isEscalated
    ? `Dear ${invoice.client.name},

We are writing on behalf of ${companyName} regarding invoice ${invoice.invoice_number} for ${formattedAmount}, which fell due on ${invoice.due_date} and is now ${invoice.days_overdue} days overdue.

Despite prior reminders, we have not yet received payment. To avoid further escalation, accrued interest, or suspension of ongoing deliverables, please settle the outstanding balance immediately using the secure payment link below:

Payment Link: ${paymentLink}${wireSection}

If you have already processed this remittance within the last 24 hours, please forward your proof of payment so we can update your ledger.

Sincerely,
${senderName}
${companyName}
${contactDetails ? `${contactDetails}\n` : ''}Automated Chasing via dueFox.co Engine`
    : `Hi ${invoice.client.name},

Hope you are having a productive week.

This is a quick courtesy note from ${companyName} to remind you that invoice ${invoice.invoice_number} for ${formattedAmount} was due on ${invoice.due_date}.

You can complete payment directly in 30 seconds via your preferred gateway:
${paymentLink}${wireSection}

Please let us know if you need an updated PO or copy of the invoice breakdown.

Best regards,
${senderName}
${companyName}
${contactDetails ? `${contactDetails}\n` : ''}Automated Chasing via dueFox.co`;

  const whatsappMessage = isEscalated
    ? `⚠️ *URGENT PAYMENT NOTICE* - ${invoice.invoice_number}
Hi ${invoice.client.name}, this is ${senderName} from *${companyName}*. Invoice ${invoice.invoice_number} (${formattedAmount}) is *${invoice.days_overdue} days overdue*. Please settle today to avoid collection hold: ${paymentLink}`
    : `👋 Hi ${invoice.client.name}, friendly reminder from *${companyName}* that invoice ${invoice.invoice_number} (${formattedAmount}) was due on ${invoice.due_date}. You can pay directly here: ${paymentLink} Thanks!`;

  const handleSend = async () => {
    try {
      setSending(true);
      await onSendChase(invoice.id);
      onClose();
    } finally {
      setSending(false);
    }
  };

  const handleCopyPaymentLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Trigger Automated Chase Reminder
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Invoice <span className="font-mono font-medium text-slate-800">{invoice.invoice_number}</span> · Client: {invoice.client.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 bg-white">
          {/* Overdue Warning Banner if 30+ days */}
          {isEscalated && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
              <span className="font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Account is {invoice.days_overdue} days overdue. Critical reminder template active.</span>
              </span>
              <span className="font-mono font-bold text-rose-700">{formattedAmount}</span>
            </div>
          )}

          {/* Channel selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveChannel('email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeChannel === 'email'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email ({invoice.client.email})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChannel('whatsapp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeChannel === 'whatsapp'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp / SMS ({invoice.client.phone || 'No phone'})</span>
            </button>
          </div>

          {/* Message Preview */}
          {activeChannel === 'email' ? (
            <div className="space-y-2">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Subject Line:
                </span>
                <p className="text-xs font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1">
                  {emailSubject}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Email Body:
                </span>
                <pre className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto mt-1">
                  {emailBody}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Instant Message Payload:
              </span>
              <pre className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto mt-1">
                {whatsappMessage}
              </pre>
            </div>
          )}

          {/* Quick Payment Link Box */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600 truncate mr-2 font-mono">
              {invoice.payment_link || `https://pay.duefox.co/inv/${invoice.invoice_number}`}
            </span>
            <button
              type="button"
              onClick={handleCopyPaymentLink}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current chase count: <strong className="font-mono text-slate-800">{invoice.chase_count}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : 'Dispatch Chase Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
