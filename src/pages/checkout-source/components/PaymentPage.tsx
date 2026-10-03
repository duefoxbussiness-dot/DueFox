import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus } from '../types/invoice';
import { DueFoxLogo } from './DueFoxLogo';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building2,
  QrCode,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Receipt,
  FileCheck2,
  HelpCircle,
  ArrowRight,
  Smartphone,
  Info,
} from 'lucide-react';

interface PaymentPageProps {
  invoice: Invoice & {
    paymentLink?: string;
    agency: Invoice['agency'] & { paymentGatewayUrl?: string; upiId?: string };
  };
  statusOverride?: InvoiceStatus;
  isSimulatedPaid?: boolean;
  onResetPaidState?: () => void;
  onPaymentComplete?: (paymentInfo: { transactionId: string; method: string; date: string }) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  invoice,
  statusOverride,
  isSimulatedPaid = false,
  onResetPaidState,
  onPaymentComplete,
}) => {
  // Current active status
  const currentStatus = statusOverride || invoice.status;

  // Payment method tab state
  type PaymentMethodTab = 'card' | 'bank' | 'upi';
  const [activeTab, setActiveTab] = useState<PaymentMethodTab>(
    invoice.currency === 'INR' ? 'upi' : 'card'
  );

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholderName, setCardholderName] = useState(invoice.client.name);
  const [saveCard, setSaveCard] = useState(true);

  // UPI state
  const upiId = invoice.agency.upiId || '';
  const [paymentNotice, setPaymentNotice] = useState('');
  const [upiPaymentOpened, setUpiPaymentOpened] = useState(false);

  // Copy helpers
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isPaid, setIsPaid] = useState(isSimulatedPaid);
  const [transactionData, setTransactionData] = useState({
    id: 'TXN_DF_' + Math.floor(10000000000 + Math.random() * 90000000000),
    method: invoice.currency === 'INR' ? 'UPI (Instant Settlement)' : 'Credit Card (Visa •••• 4242)',
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  });

  // Sync simulated state prop
  useEffect(() => {
    setIsPaid(isSimulatedPaid);
  }, [isSimulatedPaid]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Card number input formatter
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Expiry date input formatter
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Card brand detector
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('55')) return 'Mastercard';
    if (clean.startsWith('34') || clean.startsWith('37')) return 'Amex';
    if (clean.startsWith('60') || clean.startsWith('65')) return 'RuPay';
    return null;
  };

  // Formatted amount
  const formattedAmount = `${invoice.currencySymbol}${invoice.totalAmount.toLocaleString('en-IN')}`;
  const agencyAddress = [invoice.agency.address, invoice.agency.city].filter(Boolean).join(', ');
  const bankEntries = [
    { key: 'holder', label: 'Beneficiary / Account Holder', value: invoice.agency.bankDetails.accountHolder },
    { key: 'bank', label: 'Bank Name', value: invoice.agency.bankDetails.bankName },
    { key: 'swift', label: 'SWIFT / BIC', value: invoice.agency.bankDetails.swiftBic },
    { key: 'iban', label: 'Account Number / IBAN', value: invoice.agency.bankDetails.accountNumber },
    { key: 'routing', label: 'ACH Routing / IFSC / Wise', value: invoice.agency.bankDetails.routingOrIfsc },
  ].filter((entry) => Boolean(entry.value));

  // Execute payment simulation
  const handlePayNow = () => {
    setPaymentNotice('');
    const checkoutUrl = invoice.paymentLink || invoice.agency.paymentGatewayUrl;

    if (activeTab === 'card' && checkoutUrl) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      setPaymentNotice('Secure checkout opened in a new tab. Your invoice will update after payment confirmation.');
      return;
    }

    if (activeTab === 'upi' && !upiPaymentOpened) {
      if (!upiId) {
        if (checkoutUrl) {
          window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
          setUpiPaymentOpened(true);
          setPaymentNotice('Secure checkout opened. After completing payment, confirm it here to update the invoice ledger.');
        } else {
          setPaymentNotice('The creator has not configured UPI payment details.');
        }
        return;
      }

      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(invoice.agency.name)}&am=${encodeURIComponent(invoice.totalAmount.toFixed(2))}&cu=${invoice.currency}&tn=${encodeURIComponent(invoice.invoiceNumber || invoice.id)}`;
      window.open(upiUrl, '_blank', 'noopener,noreferrer');
      setUpiPaymentOpened(true);
      setPaymentNotice('UPI payment opened. Complete the transfer, then confirm it below to update the invoice ledger.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(activeTab === 'bank' ? 'Recording remittance confirmation...' : 'Preparing payment confirmation...');

    setTimeout(() => {
      setProcessingStep('Updating the invoice ledger...');
    }, 600);

    setTimeout(() => {
      const selectedMethodName =
        activeTab === 'card'
          ? `Credit Card (${getCardBrand(cardNumber) || 'Card'} •••• ${cardNumber.replace(/\s/g, '').slice(-4) || '4242'})`
          : activeTab === 'upi'
            ? `UPI (${upiId})`
            : 'Direct Bank Wire (ACH/NEFT)';

      const newTxn = {
        id: 'TXN_DF_' + Math.floor(10000000000 + Math.random() * 90000000000),
        method: selectedMethodName,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setTransactionData(newTxn);
      setIsProcessing(false);
      setIsPaid(true);
      setPaymentNotice('Payment confirmation recorded. The invoice status is now settled.');

      if (onPaymentComplete) {
        onPaymentComplete({
          transactionId: newTxn.id,
          method: newTxn.method,
          date: newTxn.date,
        });
      }
    }, 1800);
  };

  const handleReset = () => {
    if (invoice.status === 'paid' && currentStatus === 'paid') return;
    setIsPaid(false);
    if (onResetPaidState) onResetPaidState();
  };

  // Render Status Badge
  const renderStatusPill = () => {
    if (isPaid || currentStatus === 'paid') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Paid · Settled & Closed
        </span>
      );
    }
    if (currentStatus === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Overdue · {invoice.daysOverdue} Days Past Due
        </span>
      );
    }
    if (currentStatus === 'due_soon') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Due Soon · Action Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        Payment Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* 2. TOP MINIMALIST HEADER */}
      <header className="no-print bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo + Subtle Security Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <DueFoxLogo size="md" />

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>Secure Billed via DueFox</span>
            </div>
          </div>

          {/* Right: Invoice Status Pill */}
          <div className="flex items-center gap-3">
            {renderStatusPill()}
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* If in Paid Success State, display Interactive Success Screen */}
        {isPaid ? (
          <PaymentSuccessModal
            invoice={invoice}
            transactionId={transactionData.id}
            paymentMethod={transactionData.method}
            paidAtDate={transactionData.date}
            onResetDemo={handleReset}
          />
        ) : (
          /* 3. SPLIT-SCREEN / TWO-COLUMN RESPONSIVE LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ======================================================== */}
            {/* LEFT COLUMN: INVOICE SUMMARY & BREAKDOWN (5 cols on lg) */}
            {/* ======================================================== */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Invoice Card */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
                {/* Invoice Meta Top Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Invoice Reference
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight flex items-center gap-2 mt-0.5">
                      <span>{invoice.invoiceNumber || invoice.id}</span>
                      <button
                        onClick={() => copyToClipboard(invoice.invoiceNumber || invoice.id, 'invoiceId')}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy Invoice ID"
                      >
                        {copiedField === 'invoiceId' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-right">
                      <div className="text-slate-400 font-medium">Issue Date</div>
                      <div className="font-semibold text-slate-700">{invoice.issueDate}</div>
                    </div>
                    <div className="h-7 w-px bg-slate-200" />
                    <div className="text-right">
                      <div className="text-slate-400 font-medium">Due Date</div>
                      <div className="font-semibold text-rose-600">{invoice.dueDate}</div>
                    </div>
                  </div>
                </div>

                {/* Billed By & Billed To Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
                  {/* Billed By (Agency Details) */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      Billed By (Agency)
                    </div>
                    {invoice.agency.name && <div className="font-bold text-slate-900 text-sm">{invoice.agency.name}</div>}
                    {agencyAddress && <div className="text-slate-600 leading-snug">{agencyAddress}</div>}
                    {invoice.agency.taxId && (
                      <div className="text-slate-500 font-mono text-[11px] pt-1">
                        Tax ID / EIN: <span className="font-semibold text-slate-700">{invoice.agency.taxId}</span>
                      </div>
                    )}
                    {invoice.agency.email && <div className="text-slate-500">{invoice.agency.email}</div>}
                  </div>

                  {/* Billed To (Client Details) */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      Billed To (Client)
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{invoice.client.name}</div>
                    {invoice.client.company && <div className="font-semibold text-slate-700">{invoice.client.company}</div>}
                    {invoice.client.email && <div className="text-slate-500">{invoice.client.email}</div>}
                    {invoice.client.phone && <div className="text-slate-500 font-mono text-[11px]">{invoice.client.phone}</div>}
                    {invoice.client.gstOrTaxId && (
                      <div className="text-slate-500 font-mono text-[11px]">
                        Client GSTIN: <span className="text-slate-700">{invoice.client.gstOrTaxId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Itemized Work Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Work Itemized Breakdown
                    </h3>
                    <span className="text-xs text-slate-400">
                      {invoice.items.length} Deliverables
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <tr>
                          <th className="py-2.5 px-4">Deliverable & Description</th>
                          <th className="py-2.5 px-3 text-center hidden sm:table-cell">Qty</th>
                          <th className="py-2.5 px-3 text-right hidden sm:table-cell">Rate</th>
                          <th className="py-2.5 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoice.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-900 leading-snug">
                                {item.description}
                              </div>
                              {item.category && (
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {item.category}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-600 hidden sm:table-cell font-mono">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-600 hidden sm:table-cell font-mono">
                              {invoice.currencySymbol}{item.unitPrice.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              {invoice.currencySymbol}{item.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Subtotal & Calculations */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Deliverables Subtotal</span>
                    <span className="font-mono font-medium">{invoice.currencySymbol}{invoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Taxes / Statutory Duties ({(invoice.taxRate * 100).toFixed(0)}%)</span>
                      <span className="font-mono font-medium">{invoice.currencySymbol}{invoice.taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.discountAmount && invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Early Settlement Credit</span>
                      <span className="font-mono font-medium">-{invoice.currencySymbol}{invoice.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Final Due Amount Box */}
                <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Total Payable Balance
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mt-1">
                      {formattedAmount}{' '}
                      <span className="text-base sm:text-lg font-sans font-semibold text-slate-300">
                        {invoice.currency}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 sm:text-right space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      <Lock className="w-3 h-3 text-[#FF5722]" />
                      Net Payable Without Surcharge
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Includes all statutory digital processing fees
                    </div>
                  </div>
                </div>

                {/* Work summary quote */}
                {invoice.notes && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-700">Remittance Note: </span>
                      {invoice.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* RIGHT COLUMN: PAYMENT OPTIONS & CHECKOUT CARD (5 cols)   */}
            {/* ======================================================== */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-7 space-y-6 sticky top-24">
                {/* Card Title */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Select Payment Method
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose your preferred secure payment channel
                  </p>
                </div>

                {/* Method Selector Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
                  {/* Tab 1: Credit / Debit Card */}
                  <button
                    onClick={() => setActiveTab('card')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'card'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CreditCard className={`w-3.5 h-3.5 ${activeTab === 'card' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">Card</span>
                  </button>

                  {/* Tab 2: Bank Transfer / ACH */}
                  <button
                    onClick={() => setActiveTab('bank')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'bank'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Building2 className={`w-3.5 h-3.5 ${activeTab === 'bank' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">Wire / ACH</span>
                  </button>

                  {/* Tab 3: UPI / QR Code */}
                  <button
                    onClick={() => setActiveTab('upi')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                      activeTab === 'upi'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <QrCode className={`w-3.5 h-3.5 ${activeTab === 'upi' ? 'text-[#FF5722]' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">UPI / QR</span>
                    {invoice.currency === 'INR' && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                        Fast
                      </span>
                    )}
                  </button>
                </div>

                {/* -------------------------------------------------- */}
                {/* TAB 1: CREDIT / DEBIT CARD                         */}
                {/* -------------------------------------------------- */}
                {activeTab === 'card' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="e.g. Vikram Patel"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                      />
                    </div>

                    {/* Card Number */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Card Number
                        </label>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                          {getCardBrand(cardNumber) ? (
                            <span className="px-1.5 py-0.5 rounded bg-orange-50 text-[#FF5722] font-bold border border-orange-200">
                              {getCardBrand(cardNumber)}
                            </span>
                          ) : (
                            <span>Visa · MC · Amex · RuPay</span>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4532 8920 1829 4242"
                          maxLength={19}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* Expiry & CVC */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Expires (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="08/28"
                          maxLength={5}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">
                            CVC / CVV
                          </label>
                          <span className="text-[10px] text-slate-400">3-4 digits</span>
                        </div>
                        <div className="relative">
                          <input
                            type="password"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722]"
                          />
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Save card option */}
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 pt-1">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded border-slate-300 text-[#FF5722] focus:ring-[#FF5722] cursor-pointer"
                      />
                      <span>Store card securely for upcoming milestone releases</span>
                    </label>
                  </div>
                )}

                {/* -------------------------------------------------- */}
                {/* TAB 2: BANK TRANSFER / ACH / WIRE                 */}
                {/* -------------------------------------------------- */}
                {activeTab === 'bank' && (
                  <div className="space-y-3.5 animate-in fade-in duration-200 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-800">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <span className="font-semibold text-[11px]">Direct Bank Remittance (High-Ticket)</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        0% Processing Fee
                      </span>
                    </div>

                    {bankEntries.length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {bankEntries.map((entry) => (
                          <div key={entry.key} className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                            <div className="min-w-0">
                              <div className="text-slate-400 text-[11px]">{entry.label}</div>
                              <div className="font-semibold text-slate-900 break-all">{entry.value}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(entry.value, entry.key)}
                              className="shrink-0 text-slate-400 hover:text-slate-800 cursor-pointer"
                              aria-label={`Copy ${entry.label}`}
                            >
                              {copiedField === entry.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                        {invoice.agency.bankDetails.wiseTag && (
                          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl sm:col-span-2">
                            <div className="text-slate-400 text-[11px]">Wise</div>
                            <div className="font-semibold text-slate-900">{invoice.agency.bankDetails.wiseTag}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="p-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl">
                        The creator has not configured wire transfer details.
                      </p>
                    )}

                    {/* Narrative notice */}
                    <div className="text-[11px] text-slate-500 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                          Important: Always specify <strong className="text-slate-800">{invoice.invoiceNumber || invoice.id}</strong> in the payment reference/narrative for instant automated ledger matching.
                      </span>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------- */}
                {/* TAB 3: UPI / QR CODE                               */}
                {/* -------------------------------------------------- */}
                {activeTab === 'upi' && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        Creator UPI payment details
                      </div>
                      {upiId ? (
                        <div className="flex items-center justify-between gap-3 rounded-lg bg-white border border-slate-200 px-3 py-2.5">
                          <span className="font-mono text-sm text-slate-900 break-all">{upiId}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(upiId, 'upi')}
                            className="text-slate-500 hover:text-slate-900 cursor-pointer"
                            aria-label="Copy creator UPI ID"
                          >
                            {copiedField === 'upi' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-500">The creator has not configured a UPI ID. Choose Wire / ACH or use the configured payment link.</p>
                      )}
                      <p className="text-[11px] text-slate-500">Amount: {formattedAmount} · Reference: {invoice.invoiceNumber || invoice.id}</p>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------- */}
                {/* PROMINENT ACTION BUTTON                           */}
                {/* -------------------------------------------------- */}
                <div className="pt-2">
                  <button
                    onClick={handlePayNow}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    style={{
                      boxShadow: '0 4px 14px rgba(255, 87, 34, 0.35)',
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{processingStep || 'Processing Settlement...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{activeTab === 'bank'
                          ? 'Confirm & Record Wire Remittance'
                          : activeTab === 'upi'
                            ? upiPaymentOpened ? 'Confirm UPI Payment' : 'Open UPI Payment'
                            : invoice.paymentLink || invoice.agency.paymentGatewayUrl
                              ? 'Continue to Secure Checkout'
                              : `Pay ${formattedAmount} Now`}</span>
                        <Lock className="w-4 h-4 ml-0.5" />
                      </>
                    )}
                  </button>
                  {paymentNotice && (
                    <p role="status" className="mt-3 text-center text-xs text-slate-600" aria-live="polite">
                      {paymentNotice}
                    </p>
                  )}
                </div>

                {/* -------------------------------------------------- */}
                {/* TRUST & SECURITY FOOTER                           */}
                {/* -------------------------------------------------- */}
                <div className="pt-4 border-t border-slate-100 space-y-3 text-slate-500">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>256-Bit SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-[#FF5722] shrink-0" />
                      <span>Instant Digital Receipt</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-center text-slate-400 pt-1">
                    Powered by <strong className="text-slate-600 font-semibold">DueFox Security Vault</strong> · PCI-DSS Compliant Tier 1
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MINIMALIST COMPLIANT FOOTER */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-auto text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">dueFox.co</span>
            <span>·</span>
            <span>Automated Invoice Chaser & Recovery Protocol</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Terms of Service</span>
            <span>·</span>
            <span>Client Privacy</span>
            <span>·</span>
            <span>Need Help? support@duefox.co</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
