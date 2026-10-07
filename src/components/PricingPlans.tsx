import { useState } from 'react';
import { Check, ChevronDown, ShieldCheck } from 'lucide-react';
import { PlanTier } from '../types';

type PricingPlansProps = {
  selectedPlan?: PlanTier;
  onSelectPlan: (plan: PlanTier) => void;
  compact?: boolean;
};

const plans: Array<{
  id: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualTotal: number;
  cta: string;
  features: string[];
}> = [
  {
    id: 'pro',
    name: 'Pro Chaser',
    description: 'For active freelancers & solopreneurs tired of chasing overdue payments manually.',
    monthlyPrice: 9,
    annualPrice: 7,
    annualTotal: 84,
    cta: 'Start 7-Day Free Trial',
    features: [
      'Unlimited Active Invoices',
      'Automated Email & WhatsApp Chasing',
      'Progressive Tone Escalation (Polite to Urgent)',
      'Custom UPI ID / QR / Bank Wire Details',
      'Custom Branding (Logo & Colors)',
      'Read Receipts & Analytics',
      'Priority Support',
    ],
  },
  {
    id: 'agency',
    name: 'Agency / Scale',
    description: 'For growing agencies & teams managing multi-client high-ticket portfolios.',
    monthlyPrice: 49,
    annualPrice: 39,
    annualTotal: 468,
    cta: 'Start Agency Trial',
    features: [
      'Everything in Pro',
      'Multi-Brand Profiles & White-Labeling',
      'Team Member Access',
      'Custom Domain for Payment Links',
      'High-Ticket Recovery Escalation Queue',
      'Dedicated Account Manager',
    ],
  },
];

const comparisonFeatures = [
  'Active invoices',
  'Automated email reminders',
  'Automated WhatsApp chasing',
  'Progressive tone escalation',
  'Public payment page links',
  'UPI / QR / bank wire details',
  'Custom branding',
  'Read receipts & analytics',
  'Priority support',
  'Multi-brand & white-label',
  'Team member access',
  'Custom payment-link domain',
  'High-ticket escalation queue',
  'Dedicated account manager',
];

const featureAvailability: Record<string, PlanTier[]> = {
  'Active invoices': ['pro', 'agency'],
  'Automated email reminders': ['pro', 'agency'],
  'Automated WhatsApp chasing': ['pro', 'agency'],
  'Progressive tone escalation': ['pro', 'agency'],
  'Public payment page links': ['pro', 'agency'],
  'UPI / QR / bank wire details': ['pro', 'agency'],
  'Custom branding': ['pro', 'agency'],
  'Read receipts & analytics': ['pro', 'agency'],
  'Priority support': ['pro', 'agency'],
  'Multi-brand & white-label': ['agency'],
  'Team member access': ['agency'],
  'Custom payment-link domain': ['agency'],
  'High-ticket escalation queue': ['agency'],
  'Dedicated account manager': ['agency'],
};

const faqs = [
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes, upgrade or downgrade instantly whenever your needs change.',
  },
  {
    question: 'Do my clients need a DueFox account?',
    answer: 'No. Clients can open and pay invoices directly through your public payment link.',
  },
  {
    question: 'Is automated WhatsApp chasing included in Pro?',
    answer: 'Yes, automated WhatsApp chasing is fully included in Pro.',
  },
  {
    question: 'Are there any hidden transaction fees?',
    answer: 'No. DueFox charges a 0% platform fee, so you keep 100% of your earnings.',
  },
];

export function PricingPlans({ selectedPlan, onSelectPlan, compact = false }: PricingPlansProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showComparison, setShowComparison] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const showMarketingDetails = !compact;

  return (
    <div className={compact ? 'w-full min-w-0 space-y-5' : 'space-y-10'}>
      {!compact && (
        <header className="mx-auto max-w-3xl space-y-3 text-center">
          <span className="text-xs font-bold tracking-widest text-[#FF5722] uppercase">Transparent, flat pricing</span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Plans That Pay For Themselves on Invoice #1
          </h2>
          <p className="text-sm text-slate-600 sm:text-base">
            Choose the plan that fits your team and start with a 7-day free trial.
          </p>
        </header>
      )}

      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex max-w-full items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-[#FF5722] sm:text-sm">
          Start 7-Day Free Trial • No Credit Card Required
        </span>
        <p className="mt-3 text-xs leading-5 text-slate-600 sm:text-sm">
          Get full access to automated WhatsApp/email chasing &amp; custom gateway links for 7 days.
        </p>
      </div>

      <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {(['monthly', 'annual'] as const).map((cycle) => {
          const active = billingCycle === cycle;
          return (
            <button
              key={cycle}
              type="button"
              onClick={() => setBillingCycle(cycle)}
              aria-pressed={active}
              className={`relative flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors sm:px-4 ${
                active ? 'bg-[#FF5722] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cycle === 'monthly' ? 'Monthly' : 'Annual'}
              {cycle === 'annual' && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Save 20% · 2 Months Free
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showMarketingDetails && (
        <aside className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-amber-50 px-5 py-4 text-center shadow-sm sm:px-8">
          <p className="text-sm font-bold text-slate-900 sm:text-base">
            Recover just 1 unpaid $100 invoice, and DueFox pays for itself for an entire year.
          </p>
        </aside>
      )}

      <div className={`grid min-w-0 grid-cols-1 items-stretch ${compact ? 'gap-4' : 'gap-5'} lg:grid-cols-2`}>
        {plans.map((plan) => {
          const isPro = plan.id === 'pro';
          const isSelected = selectedPlan === plan.id;
          const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          return (
            <article
              key={plan.id}
              className={`relative flex min-w-0 flex-col rounded-2xl bg-white ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7'} ${
                isPro
                  ? 'border-2 border-[#FF5722] shadow-[0_14px_45px_-18px_rgba(255,87,34,0.55)] lg:-translate-y-2'
                  : plan.id === 'agency'
                    ? 'border border-purple-200 shadow-sm'
                    : 'border border-slate-200 shadow-sm'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF5722] px-3.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">
                  Most Popular
                </div>
              )}
              <div className={isPro ? 'pt-2' : ''}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${
                    isPro ? 'text-[#FF5722]' : 'text-purple-700'
                  }`}>
                    {plan.name}
                  </span>
                  {isSelected && (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                      Current plan
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight text-slate-900">${price}</span>
                  <span className="text-sm font-semibold text-slate-400">/mo</span>
                </div>
                <p className="mt-1 min-h-5 text-xs font-medium text-slate-500">
                  {billingCycle === 'annual' && plan.annualTotal > 0
                    ? `Billed $${plan.annualTotal}/year`
                    : billingCycle === 'annual'
                      ? 'Free forever'
                      : plan.monthlyPrice === 0
                        ? 'Free forever'
                        : 'Billed monthly'}
                </p>
                {billingCycle === 'annual' && plan.annualTotal > 0 && (
                  <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    Save 20% · 2 months free
                  </span>
                )}
                <p className="mt-3 min-h-10 text-xs leading-5 text-slate-600">{plan.description}</p>
              </div>

              <ul className={`mt-4 flex-1 space-y-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-700 ${compact ? 'sm:space-y-1.5' : 'sm:space-y-3'}`}>
                {(compact ? plan.features.slice(0, 3) : plan.features).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onSelectPlan(plan.id)}
                className={`mt-5 w-full whitespace-normal break-words rounded-xl px-3 py-3 text-xs font-extrabold transition-all sm:px-4 sm:text-sm ${
                  isPro
                    ? 'bg-[#FF5722] text-white shadow-md hover:bg-[#F4511E] hover:shadow-lg'
                    : plan.id === 'agency'
                      ? 'border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100'
                      : 'border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                {plan.cta}
              </button>
            </article>
          );
        })}
      </div>

      {showMarketingDetails && (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-700">
          {[
            'No Credit Card Required',
            'Cancel Anytime',
            '0% Platform Transaction Fees',
          ].map((badge) => (
            <span key={badge} className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {badge}
            </span>
          ))}
        </div>
      )}

      {showMarketingDetails && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          aria-expanded={showComparison}
          onClick={() => setShowComparison((open) => !open)}
          className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-slate-900 hover:bg-slate-50"
        >
          Compare All Features
          <ChevronDown className={`h-4 w-4 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
        </button>
        {showComparison && (
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-bold">Feature</th>
                  {plans.map((plan) => <th key={plan.id} className="px-4 py-3 font-bold">{plan.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonFeatures.map((feature) => (
                  <tr key={feature}>
                    <th className="px-4 py-3 font-medium text-slate-700">{feature}</th>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-slate-600">
                        {feature === 'Active invoices'
                            ? 'Unlimited'
                          : featureAvailability[feature].includes(plan.id)
                            ? <Check className="h-4 w-4 text-emerald-600" aria-label="Included" />
                            : <span aria-label="Not included">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>}

      {showMarketingDetails && <section className="space-y-3">
        <h3 className="text-center text-lg font-extrabold text-slate-900">Pricing FAQs</h3>
        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={faq.question} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-xs font-bold text-slate-900 sm:text-sm"
                >
                  {faq.question}
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <p className="px-4 pb-4 text-xs leading-5 text-slate-600">{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </section>}
    </div>
  );
}
