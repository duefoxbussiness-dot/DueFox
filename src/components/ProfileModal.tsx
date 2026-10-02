import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileCheck2,
  Check,
  CreditCard,
  Landmark,
  Crown,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { UserProfile, CurrencyCode, PlanTier } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
  initialTab?: 'profile' | 'payments' | 'plan';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  initialTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'plan'>(initialTab);

  // Tab 1: Business Profile
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>('USD');
  const [companyAddress, setCompanyAddress] = useState('');
  const [taxId, setTaxId] = useState('');

  // Tab 2: Global Payment Methods
  const [paymentGatewayUrl, setPaymentGatewayUrl] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankSwiftBic, setBankSwiftBic] = useState('');
  const [bankRoutingWise, setBankRoutingWise] = useState('');

  // Tab 3: Subscription Plan
  const [plan, setPlan] = useState<PlanTier>('free');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profile) {
      setFullName(profile.full_name || '');
      setCompanyName(profile.company_name || '');
      setBusinessEmail(profile.business_email || '');
      setPhone(profile.phone || '');
      setDefaultCurrency(profile.default_currency || 'USD');
      setCompanyAddress(profile.company_address || '');
      setTaxId(profile.tax_id || '');

      setPaymentGatewayUrl(profile.payment_gateway_url || '');
      setBankHolderName(profile.bank_holder_name || '');
      setBankName(profile.bank_name || '');
      setBankAccountNumber(profile.bank_account_number || '');
      setBankSwiftBic(profile.bank_swift_bic || '');
      setBankRoutingWise(profile.bank_routing_wise || '');

      setPlan(profile.plan || 'free');

      setError(null);
      setSaveSuccess(false);
      setActiveTab(initialTab);
    }
  }, [isOpen, profile, initialTab]);

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setActiveTab('profile');
      setError('Please provide your Company / Agency Name.');
      return;
    }

    if (!fullName.trim()) {
      setActiveTab('profile');
      setError('Please provide a representative or full name.');
      return;
    }

    if (!businessEmail.trim() || !businessEmail.includes('@')) {
      setActiveTab('profile');
      setError('Please provide a valid business email.');
      return;
    }

    setSaving(true);
    try {
      await onSaveProfile({
        ...profile,
        full_name: fullName.trim(),
        company_name: companyName.trim(),
        business_email: businessEmail.trim(),
        phone: phone.trim(),
        default_currency: defaultCurrency,
        company_address: companyAddress.trim() || undefined,
        tax_id: taxId.trim() || undefined,
        payment_gateway_url: paymentGatewayUrl.trim() || undefined,
        bank_holder_name: bankHolderName.trim() || undefined,
        bank_name: bankName.trim() || undefined,
        bank_account_number: bankAccountNumber.trim() || undefined,
        bank_swift_bic: bankSwiftBic.trim() || undefined,
        bank_routing_wise: bankRoutingWise.trim() || undefined,
        plan: plan,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPlan = async (newPlan: PlanTier) => {
    setPlan(newPlan);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Company & Payment Settings
              </h2>
              <p className="text-xs text-slate-500">
                Configure business profile, payment links, wire transfer, and subscription
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation - Light Slate Pills with Active Orange */}
        <div className="flex items-center px-6 py-3 border-b border-slate-200 bg-slate-50/70 shrink-0 gap-2 sm:gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-orange-500 text-white shadow-xs font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Business Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-orange-500 text-white shadow-xs font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Global Payment Methods</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'plan'
                ? 'bg-orange-500 text-white shadow-xs font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Crown className="w-4 h-4 shrink-0" />
            <span>Subscription & Plan</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] rounded uppercase font-bold ${
                activeTab === 'plan'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {plan.toUpperCase()}
            </span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: Business Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>
                  These details auto-populate your invoices, email signatures, and legal invoice headers.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Company / Agency Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Representative Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Representative Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Business Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. contact@acmecorp.com"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Business Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Business Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. +1 555 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Default Currency Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Currency for New Invoices
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { code: 'USD' as CurrencyCode, symbol: '$', label: 'USD ($)' },
                    { code: 'EUR' as CurrencyCode, symbol: '€', label: 'EUR (€)' },
                    { code: 'GBP' as CurrencyCode, symbol: '£', label: 'GBP (£)' },
                    { code: 'INR' as CurrencyCode, symbol: '₹', label: 'INR (₹)' },
                  ].map((cur) => (
                    <button
                      key={cur.code}
                      type="button"
                      onClick={() => setDefaultCurrency(cur.code)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        defaultCurrency === cur.code
                          ? 'bg-orange-50 border-orange-500 text-orange-600 ring-1 ring-orange-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold text-sm">{cur.symbol}</span>
                      <span>{cur.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Company Address & Tax ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Business Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. 123 Main Street, Suite 400"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tax ID / VAT / GSTIN / EIN <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Your tax ID"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Global Payment Methods */}
          {activeTab === 'payments' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Direct Gateway Section */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Direct Payment Gateway Link</h3>
                    <p className="text-[11px] text-slate-500">
                      Stripe Payment Link, PayPal.me, Razorpay, or your custom checkout portal
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder="e.g. https://buy.stripe.com/..."
                    value={paymentGatewayUrl}
                    onChange={(e) => setPaymentGatewayUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  ⚡ When set, new invoices automatically use this gateway link unless a customized link is specified.
                </p>
              </div>

              {/* Bank Wire Transfer Details ($1k+ High-Ticket) */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Bank Wire Transfer Details</h3>
                      <p className="text-[11px] text-slate-500">
                        For High-Ticket Accounts ($1k+) and corporate enterprise wire remittance
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    High-Ticket Remittance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Holder / Beneficiary Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={bankHolderName}
                      onChange={(e) => setBankHolderName(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Your bank name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Account Number / IBAN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Number / IBAN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Account number or IBAN"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* SWIFT / BIC Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SWIFT / BIC Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SWIFT or BIC code"
                      value={bankSwiftBic}
                      onChange={(e) => setBankSwiftBic(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Wise Tag / ACH Details */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wise Tag / ACH Routing / IFSC <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Routing number, IFSC, or Wise tag"
                    value={bankRoutingWise}
                    onChange={(e) => setBankRoutingWise(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Auto-attached to automated chase reminder emails when client invoice exceeds $1,000.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Subscription & Plan Status */}
          {activeTab === 'plan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Current Active Plan Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 via-slate-50 to-orange-50/30 border border-orange-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 capitalize">{plan} Plan Active</span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {plan === 'free'
                        ? 'Standard chasing features for independent contractors.'
                        : plan === 'pro'
                        ? 'Unlimited automated invoice recovery and payment gateway routing.'
                        : 'Full multi-organization automated collections powerhouse.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* 1. Free Tier */}
                <div
                  onClick={() => handleSelectPlan('free')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    plan === 'free'
                      ? 'bg-orange-50/40 border-orange-500 ring-1 ring-orange-500'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-slate-500">Basic</span>
                      {plan === 'free' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-slate-900 mb-2">
                      $0 <span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Up to 10 invoices</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Email reminders</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Payment copy link</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan('free');
                    }}
                    className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      plan === 'free'
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {plan === 'free' ? 'Selected' : 'Downgrade to Free'}
                  </button>
                </div>

                {/* 2. Pro Plan - Prominently Highlighted */}
                <div
                  onClick={() => handleSelectPlan('pro')}
                  className="p-4 rounded-xl border relative transition-all cursor-pointer flex flex-col justify-between ring-2 ring-[#FF5722] border-[#FF5722] bg-white sm:scale-[1.03] shadow-lg z-10"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FF5722] text-white text-[10px] font-extrabold uppercase tracking-wide rounded-full shadow-md whitespace-nowrap">
                    ★ RECOMMENDED / MOST POPULAR
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 pt-1">
                      <span className="text-xs font-bold uppercase text-[#FF5722]">Pro Chaser</span>
                      {plan === 'pro' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-slate-900 mb-2">
                      $9 <span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Unlimited invoices</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>WhatsApp & Email chasing</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Custom gateway links</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>High-ticket wire details</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan('pro');
                    }}
                    className="mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-xs"
                  >
                    {plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                  </button>
                </div>

                {/* 3. Agency Plan */}
                <div
                  onClick={() => handleSelectPlan('agency')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    plan === 'agency'
                      ? 'bg-purple-50/40 border-purple-500 ring-1 ring-purple-500'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-purple-700">Agency / Scale</span>
                      {plan === 'agency' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-slate-900 mb-2">
                      $49 <span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Everything in Pro</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Multi-brand profiles</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Priority escalation queue</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Dedicated account support</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan('agency');
                    }}
                    className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      plan === 'agency'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white'
                    }`}
                  >
                    {plan === 'agency' ? 'Current Plan' : 'Upgrade to Agency'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500">
              <span>Saved in Supabase <strong className="text-slate-700 font-semibold">profiles</strong> table</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
