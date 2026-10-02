import React, { useState } from 'react';
import { X, Building2, CreditCard, Sparkles, Check, Crown, ShieldAlert, Landmark, CheckCircle2 } from 'lucide-react';
import { BusinessProfile, Currency } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  onSaveProfile: (profile: BusinessProfile) => void;
  defaultTab?: 'profile' | 'payment' | 'plan';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  defaultTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'payment' | 'plan'>(defaultTab);
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveProfile(formData);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5722]/10 text-[#FF5722] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Company &amp; Payment Settings</h3>
              <p className="text-xs text-slate-500">
                Configure business profile, payment links, wire transfer, and subscription
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

        {/* Tab Navigation matching Screenshot */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/60">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#FF5722] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Business Profile
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'payment'
                ? 'bg-[#FF5722] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Global Payment Methods
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'plan'
                ? 'bg-[#FF5722] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Subscription &amp; Plan
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-white/20 rounded-md">
              {formData.currentPlan === 'Starter' ? 'Basic' : formData.currentPlan}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 text-slate-800 text-xs">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-800 text-xs flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#FF5722] shrink-0" />
                <span>These details auto-populate your invoices, email signatures, and legal invoice headers.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company / Agency Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Representative Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={formData.representativeName}
                    onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Email *</label>
                  <input
                    type="email"
                    placeholder="e.g. contact@acmecorp.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Currency for New Invoices</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['USD', 'EUR', 'GBP', 'INR'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, defaultCurrency: c })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        formData.defaultCurrency === c
                          ? 'border-[#FF5722] bg-[#FF5722]/10 text-[#FF5722]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {c === 'USD' ? '$ USD ($)' : c === 'EUR' ? '€ EUR (€)' : c === 'GBP' ? '£ GBP (£)' : '₹ INR (₹)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Address (Optional)</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    placeholder="e.g. 123 Main Street, Suite 400"
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax ID / VAT / GSTIN / EIN (Optional)</label>
                  <input
                    type="text"
                    value={formData.taxId || ''}
                    placeholder="e.g. Your tax ID"
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#FF5722]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-5">
              {/* Direct Gateway */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF5722]/10 text-[#FF5722] flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Direct Payment Gateway Link</h4>
                    <p className="text-[11px] text-slate-500">Stripe Payment Link, PayPal.me, Razorpay, or your custom checkout portal</p>
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="e.g. https://buy.stripe.com/..."
                  value={formData.directGatewayLink || ''}
                  onChange={(e) => setFormData({ ...formData, directGatewayLink: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#FF5722]"
                />
                <p className="text-[10.5px] text-slate-400">
                  ⚡ When set, new invoices automatically use this gateway link unless a customized link is specified.
                </p>
              </div>

              {/* Wire Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Bank Wire Transfer Details</h4>
                      <p className="text-[11px] text-slate-500">For High-Ticket Accounts ($1k+) and corporate enterprise wire remittance</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    High-Ticket Remittance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Account Holder / Beneficiary Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={formData.bankDetails?.accountHolder || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails!, accountHolder: e.target.value },
                        })
                      }
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Your bank name"
                      value={formData.bankDetails?.bankName || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails!, bankName: e.target.value },
                        })
                      }
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Account Number / IBAN</label>
                    <input
                      type="text"
                      placeholder="e.g. Account number or IBAN"
                      value={formData.bankDetails?.accountNumber || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails!, accountNumber: e.target.value },
                        })
                      }
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">SWIFT / BIC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SWIFT or BIC code"
                      value={formData.bankDetails?.swiftCode || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails!, swiftCode: e.target.value },
                        })
                      }
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  Auto-attached to automated chase reminder emails when client invoice exceeds $1,000.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="space-y-4">
              {/* Current plan banner */}
              <div className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5722] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{formData.currentPlan === 'Starter' ? 'Basic' : formData.currentPlan} Plan Active</span>
                      <span className="text-[10.5px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formData.currentPlan === 'Starter'
                        ? 'Core invoice tracking and email reminders.'
                        : formData.currentPlan === 'Pro'
                        ? 'Unlimited invoices with automated payment chasing.'
                        : 'Multi-brand collections and priority escalation.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plans Grid matching Screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {/* Basic ($0/mo) */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">BASIC</span>
                    <div className="text-3xl font-black text-slate-900 my-2">
                      $0 <span className="text-xs font-semibold text-slate-400">/mo</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 mt-4">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Up to 10 invoices</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Email reminders</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Payment copy link</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, currentPlan: 'Starter' })}
                    className="mt-6 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                  >
                    Downgrade to Free
                  </button>
                </div>

                {/* Pro Chaser ($9/mo) */}
                <div className="p-5 rounded-2xl border-2 border-[#FF5722] bg-white shadow-sm flex flex-col justify-between relative">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF5722] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-xs">
                    ★ RECOMMENDED / MOST POPULAR
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#FF5722] uppercase tracking-wider">PRO CHASER</span>
                    <div className="text-3xl font-black text-slate-900 my-2">
                      $9 <span className="text-xs font-semibold text-slate-400">/mo</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 mt-4">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited invoices</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> WhatsApp &amp; Email chasing</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Custom gateway links</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> High-ticket wire details</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, currentPlan: 'Pro' })}
                    className="mt-6 w-full py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* Agency / Scale ($49/mo) */}
                <div className="p-5 rounded-2xl border-2 border-purple-400 bg-white shadow-sm flex flex-col justify-between relative">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">AGENCY / SCALE</span>
                      <span className="bg-purple-100 text-purple-700 text-[10.5px] font-bold px-2 py-0.5 rounded-md">
                        Current
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 my-2">
                      $49 <span className="text-xs font-semibold text-slate-400">/mo</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 mt-4">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Everything in Pro</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Multi-brand profiles</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Priority escalation queue</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Dedicated account support</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, currentPlan: 'Agency' })}
                    className="mt-6 w-full py-2.5 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Current Plan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-mono">
            Saved in Supabase <strong className="text-slate-600">profiles</strong> table
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#FF5722] hover:bg-[#F4511E] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSavedNotice ? <CheckCircle2 className="w-4 h-4" /> : null}
              {isSavedNotice ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
