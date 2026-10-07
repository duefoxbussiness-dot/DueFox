import React, { useState } from 'react';
import { X, Building2, CreditCard, Sparkles, Check, Crown, ShieldAlert, Landmark, CheckCircle2 } from 'lucide-react';
import { BusinessProfile, Currency } from '../types';
import { PricingPlans } from '../../../components/PricingPlans';

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
      <div className={`relative w-full ${activeTab === 'plan' ? 'max-w-7xl' : 'max-w-2xl'} max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col`}>
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
            <PricingPlans
              compact
              selectedPlan={formData.currentPlan === 'Starter' ? 'free' : formData.currentPlan === 'Pro' ? 'pro' : 'agency'}
              onSelectPlan={(plan) => setFormData({ ...formData, currentPlan: plan === 'free' ? 'Starter' : plan === 'pro' ? 'Pro' : 'Agency' })}
            />
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
