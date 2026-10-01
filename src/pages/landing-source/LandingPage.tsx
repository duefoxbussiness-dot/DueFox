import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Send, 
  Zap, 
  ChevronRight, 
  MessageSquare, 
  Mail, 
  FileText, 
  Calendar, 
  Copy, 
  Lock, 
  ExternalLink,
  ChevronDown,
  Building,
  CheckCircle2,
  AlertTriangle,
  Repeat,
  TrendingDown,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { InteractiveDashboardPreview } from './components/InteractiveDashboardPreview';

interface LandingPageProps {
  onNavigateToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDashboard }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [calculatorInvoiceAmount, setCalculatorInvoiceAmount] = useState<number>(24000);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Standard redirection handler required by user prompt
  const handleGoToDashboard = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    } else {
      window.location.href = '/dashboard';
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Pricing matching the exact uploaded image: $0 Starter, $29 Pro Chaser, $79 Agency / Scale
  const prices = {
    starter: 0,
    pro: billingCycle === 'monthly' ? 29 : 24,
    agency: billingCycle === 'monthly' ? 79 : 64,
  };

  // ROI math
  const estimatedRecovered = Math.round(calculatorInvoiceAmount * 0.94);
  const hoursSaved = Math.round((calculatorInvoiceAmount / 1500) * 3.5);

  const faqs = [
    {
      q: 'Will automated chasing damage my client relationships?',
      a: 'Not at all. DueFox uses humanized, polite-to-firm escalation templates that sound like a high-touch agency account manager. You can choose between Gentle (courteous weekly reminder), Standard (Days 3, 7, 14, 21), or Assertive (with structured legal escalation notice). Most late payments happen due to administrative oversight, not bad intent.',
    },
    {
      q: 'How does the WhatsApp escalation channel work?',
      a: 'DueFox integrates with WhatsApp Business API to deliver concise, read-receipt verified payment links directly to your client’s mobile device. With a 98% open rate compared to 20% for email, WhatsApp messages eliminate the "I missed your invoice email" excuse.',
    },
    {
      q: 'Can I connect my existing Stripe, Razorpay, or bank wire details?',
      a: 'Yes! DueFox seamlessly supports direct payment gateway links from Stripe, Razorpay, Wise, and PayPal. For corporate invoices above $1,000, DueFox automatically formats and attaches your high-ticket Bank Wire & SWIFT remittance instructions.',
    },
    {
      q: 'What happens when a client settles their balance?',
      a: 'The moment payment is detected or you click "Settled", DueFox instantly pauses all future chase sequences for that invoice and dispatches a polite payment confirmation receipt to both parties.',
    },
    {
      q: 'How long does onboarding take?',
      a: 'Under 2 minutes. Add your agency name, connect your payment link or bank details, enter or import your pending client invoices, and DueFox handles the entire follow-up cadence automatically.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#FF5722]/20 selection:text-[#FF5722] overflow-x-hidden">
      {/* Subtle Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, 40, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 50, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-amber-100/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-purple-100/25 rounded-full blur-3xl"
        />
      </div>

      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
          {/* Brand Logo */}
          <div className="flex items-center">
            <BrandLogo size="md" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('calculator')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              ROI Calculator
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Header CTAs: Launch App / Sign In */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToDashboard}
              className="hidden sm:inline-flex items-center text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoToDashboard}
              className="inline-flex items-center gap-2 bg-[#FF5722] hover:bg-[#F4511E] text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Staggered Entrance Animations */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Subtle Announcement Pill with Motion */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-[#FF5722]/30 text-xs font-bold text-[#FF5722] shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
            <span>Automated Invoice Recovery for Freelancers &amp; Agencies</span>
          </motion.div>

          {/* Bold Headline with Motion */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]"
          >
            Stop Chasing Unpaid Invoices Manually.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] via-[#F4511E] to-amber-600">
              Get Paid 3x Faster.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-base sm:text-lg lg:text-xl text-[#64748B] max-w-3xl mx-auto font-normal leading-relaxed"
          >
            Automated invoice tracking, multi-channel escalation (Email &amp; WhatsApp), and instant client payment links for freelancers &amp; agencies.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white px-8 py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
            >
              <span>Start Free (Up to 10 Invoices)</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToSection('live-demo')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-7 py-4 rounded-xl font-bold text-base shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#FF5722]" />
              <span>View Live Demo</span>
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="pt-3 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500"
          >
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> Free $0 tier available
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> 2-minute setup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> Stripe &amp; Bank Wire compatible
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> Multi-Currency: USD, EUR, GBP, INR
            </span>
          </motion.div>
        </div>

        {/* Visual Container: Interactive Dashboard Preview matching Screenshots */}
        <motion.div
          id="live-demo"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
          className="mt-12 sm:mt-16 scroll-mt-28"
        >
          <InteractiveDashboardPreview onGoToDashboard={handleGoToDashboard} />
        </motion.div>
      </section>

      {/* Social Proof Strip with Logo Fade-in */}
      <section className="relative z-10 border-y border-slate-200/80 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Trusted by 1,400+ Independent Studios, Contractors &amp; Agencies
            </p>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Over <span className="text-[#FF5722] font-black">$4.2M+</span> in delinquent agency invoices recovered on autopilot
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 font-black tracking-tight text-lg">
            {['CLOUDMATRIX', 'LUMEN CYBER', 'NOVACREST', 'FINVOX AI', 'SHARMA DESIGN'].map((brand, i) => (
              <motion.span
                key={brand}
                whileHover={{ scale: 1.05, color: '#0F172A' }}
                className="transition-colors cursor-default"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 3-Step Execution Workflow ("How DueFox Works") with Staggered Scroll Animations */}
      <section id="how-it-works" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-3"
        >
          <span className="text-xs font-bold tracking-widest text-[#FF5722] uppercase">
            SEAMLESS 3-STEP WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How DueFox Works
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            From invoice dispatch to funds hitting your bank account in 3 automated steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs relative flex flex-col justify-between group hover:border-[#FF5722]/50 hover:shadow-md transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Add &amp; Sync Invoices
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Connect client accounts and outstanding dues in seconds. Input invoice amounts, multi-currency terms (USD, EUR, GBP, INR), and due dates with 1-click presets.
              </p>

              {/* Step 1 Visual Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Client: Vikram Patel</span>
                  <span className="text-[#FF5722] font-mono">INV-2026-084</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Q2 Cloud migration</span>
                  <span className="text-slate-900">₹1,45,000 INR</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Auto-synced to Chase Queue
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-[#FF5722] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Zero manual spreadsheet logging <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs relative flex flex-col justify-between group hover:border-[#FF5722]/50 hover:shadow-md transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Set Escalation Cadence
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Automated polite-to-firm reminder queues via Email &amp; WhatsApp. Select your chase cadence without ever having to write an awkward follow-up text.
              </p>

              {/* Step 2 Visual Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-700">Standard Cadence</span>
                  <span className="text-[#25D366] font-semibold flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> WhatsApp + Email
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Day 3: Friendly Courteous Ping</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Day 7 &amp; 14: Statement Reminder</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Day 21+: Firm Legal Escalation Notice</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-[#FF5722] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              98% open rates via WhatsApp <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs relative flex flex-col justify-between group hover:border-[#FF5722]/50 hover:shadow-md transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5722] flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Settle Payments Instantly
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Clients receive clean payment links (<span className="font-mono text-xs text-slate-800">/pay/:id</span>) for 1-click settlement via Stripe, Razorpay, or High-Ticket Bank Wire transfer.
              </p>

              {/* Step 3 Visual Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Settlement Portal</span>
                  <span className="text-emerald-600 font-bold">1-Click Checkout</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <span className="font-mono text-[10px] text-slate-600 truncate max-w-[140px]">
                    duefox.co/pay/inv-2026-089
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FF5722] text-white text-[10px] font-bold">
                    Pay $3,200
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Auto-marks invoice as "Paid" and sends receipt
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-[#FF5722] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Direct to your bank account <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Feature Breakdown Grid (2x2 Grid) */}
      <section id="features" className="relative z-10 py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
          >
            <span className="text-xs font-bold tracking-widest text-[#FF5722] uppercase">
              BUILT FOR CASH-FLOW CLARITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Collections Power, Tailored for Lean Teams
            </h2>
            <p className="text-sm sm:text-base text-[#64748B]">
              Everything you need to eliminate delinquent balances and accelerate your collection turnaround.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Overdue Aging Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Overdue Aging Matrix (0–30 Days vs Critical 30+ Days)
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Automatic triage separates standard polite reminders from severely delinquent accounts. When an invoice crosses 30 days overdue, DueFox switches tone from friendly pings to authoritative escalation notices.
                </p>
              </div>

              {/* Matrix Pill Comparison */}
              <div className="mt-6 pt-5 border-t border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <div className="font-bold text-amber-900">0–30 Days (Pending)</div>
                  <div className="text-[11px] text-amber-700 mt-1">Courteous nudge, deliverables review link &amp; easy card checkout.</div>
                </div>
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                  <div className="font-bold text-rose-900">30+ Days (Critical)</div>
                  <div className="text-[11px] text-rose-700 mt-1">Prioritized firm reminder cadence, legal escalation wording &amp; wire details.</div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: One-Click Chase & Copy Payment Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF5722] border border-orange-200 flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  One-Click Chase &amp; Copy Payment Links
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Every invoice generates an isolated, distraction-free payment page. One tap copies the link straight to your clipboard so you can drop it into Slack, WhatsApp, iMessage, or email threads with zero friction.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200/80 bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-mono text-[11px] text-slate-500">https://duefox.co/pay/inv-2026-089</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#FF5722] text-white font-bold text-xs shadow-2xs">
                    Copy Link
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Multi-Currency Global Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4 }}
              className="bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Multi-Currency Support (USD, EUR, GBP, INR)
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Working with cross-border clients? Switch currency filters instantly on your dashboard. Total overdue metrics calculate native sums across US Dollars ($), Euros (€), British Pounds (£), and Indian Rupees (₹).
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200/80 flex items-center gap-2">
                {['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)'].map((curr) => (
                  <span
                    key={curr}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs"
                  >
                    {curr}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Feature 4: Automated Client Communication Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -4 }}
              className="bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Automated Client Communication Logs &amp; Audit Trail
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Maintain an immutable record of every message sent, delivery timestamps, WhatsApp read receipts, and client view events. Know exactly when clients opened invoices before you follow up.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>WhatsApp Business API Verified</span>
                </div>
                <span className="font-semibold text-slate-900">Audit Proof Log</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Interactive ROI & DSO Recovery Calculator with Reactive Motion */}
      <section id="calculator" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold tracking-widest text-[#FF5722] uppercase">
                CALCULATE YOUR UNLOCKED CASH
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                How Much Cash Is Trapped In Your Late Invoice Queue?
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                The average creative agency waits 42+ days for invoices to clear. With DueFox’s multi-channel automated cadence, average DSO (Days Sales Outstanding) drops to 11 days.
              </p>

              {/* Slider */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Average Monthly Outstanding Invoices
                  </label>
                  <motion.span
                    key={calculatorInvoiceAmount}
                    initial={{ scale: 1.1, color: '#FF5722' }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-black text-[#FF5722]"
                  >
                    ${calculatorInvoiceAmount.toLocaleString()}
                  </motion.span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="2000"
                  value={calculatorInvoiceAmount}
                  onChange={(e) => setCalculatorInvoiceAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF5722]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>$2,000/mo</span>
                  <span>$50,000/mo</span>
                  <span>$100,000/mo</span>
                </div>
              </div>
            </div>

            {/* Recovery Output Card */}
            <motion.div
              whileHover={{ y: -3 }}
              className="lg:col-span-5 bg-[#F8FAFC] rounded-2xl p-7 border border-slate-200/90 shadow-2xs space-y-6"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Estimated Cash Recovered in &lt; 14 Days
                </span>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  ${estimatedRecovered.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">DSO Reduction</span>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">42d → 11d</div>
                  <span className="text-[10px] text-slate-500">74% faster collection</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Admin Time Saved</span>
                  <div className="text-lg font-black text-[#FF5722] mt-0.5">{hoursSaved} hrs/mo</div>
                  <span className="text-[10px] text-slate-500">Zero awkward emails</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoToDashboard}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Claim Your Recovered Cash</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 6. Pricing Tiers - 100% MATCHING THE UPLOADED SETTINGS IMAGE */}
      <section id="pricing" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 space-y-4"
        >
          <span className="text-xs font-bold tracking-widest text-[#FF5722] uppercase">
            TRANSPARENT, FLAT PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Plans That Pay For Themselves on Invoice #1
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            Start free with up to 10 invoices, or scale with unlimited WhatsApp automation.
          </p>

          {/* Billing Switcher with Slide Animation */}
          <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-2xs mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${
                billingCycle === 'monthly' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {billingCycle === 'monthly' && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-[#FF5722] rounded-lg shadow-xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Monthly Billing</span>
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer relative flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {billingCycle === 'annual' && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-[#FF5722] rounded-lg shadow-xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>Annual Billing</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Save 20%
                </span>
              </span>
            </button>
          </div>
        </motion.div>

        {/* 3 Pricing Cards: Exactly matching the uploaded image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* 1. STARTER PLAN ($0 /mo) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
          >
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  STARTER
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    $0
                  </span>
                  <span className="text-slate-400 font-semibold text-sm">/mo</span>
                </div>
                <p className="text-xs text-[#64748B] mt-2">
                  Free forever for freelancers with up to 10 active monthly invoices.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-3.5 text-xs">
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 10 invoices</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Email reminders</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Payment copy link</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoToDashboard}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm transition-all shadow-2xs cursor-pointer"
              >
                Downgrade to Free
              </motion.button>
            </div>
          </motion.div>

          {/* 2. PRO CHASER PLAN ($29 /mo) - HIGHLIGHTED WITH ORANGE BORDER MATCHING SCREENSHOT */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-7 sm:p-8 border-2 border-[#FF5722] shadow-xl flex flex-col justify-between relative transform md:-translate-y-2"
          >
            {/* Top Badge matching Screenshot */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF5722] text-white text-[10.5px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs whitespace-nowrap">
              ★ RECOMMENDED / MOST POPULAR
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#FF5722] uppercase tracking-wider">
                  PRO CHASER
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    ${prices.pro}
                  </span>
                  <span className="text-slate-400 font-semibold text-sm">/mo</span>
                </div>
                <p className="text-xs text-[#64748B] mt-2">
                  Unlimited automated invoice recovery and payment gateway routing.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-3.5 text-xs">
                <ul className="space-y-3 text-slate-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-900">Unlimited invoices</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-900">WhatsApp &amp; Email chasing</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom gateway links</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>High-ticket wire details</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoToDashboard}
                className="w-full py-4 px-4 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Upgrade to Pro
              </motion.button>
            </div>
          </motion.div>

          {/* 3. AGENCY / SCALE PLAN ($79 /mo) - PURPLE BORDER MATCHING SCREENSHOT */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-7 sm:p-8 border-2 border-purple-400 shadow-md flex flex-col justify-between relative hover:shadow-xl transition-all"
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    AGENCY / SCALE
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-[10.5px] font-bold px-2 py-0.5 rounded-md">
                    Current
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    ${prices.agency}
                  </span>
                  <span className="text-slate-400 font-semibold text-sm">/mo</span>
                </div>
                <p className="text-xs text-[#64748B] mt-2">
                  Full multi-organization automated collections powerhouse.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-3.5 text-xs">
                <ul className="space-y-3 text-slate-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-brand profiles</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority escalation queue</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated account support</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoToDashboard}
                className="w-full py-3.5 px-4 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white font-black text-sm shadow-xs transition-all cursor-pointer"
              >
                Current Plan
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ Section with Smooth AnimatePresence Accordion */}
      <section id="faq" className="relative z-10 py-20 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 space-y-3"
          >
            <span className="text-xs font-bold tracking-widest text-[#FF5722] uppercase">
              GOT QUESTIONS?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#64748B]">
              Everything you need to know about automated invoice chasing with dueFox.co.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-[#F8FAFC] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-[#FF5722] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400 shrink-0"
                    >
                      <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-[#FF5722]' : ''}`} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-slate-200/60 pt-3 bg-white">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Call to Action Banner (Bottom) */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-xl"
        >
          {/* Orange Glow Graphic */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FF5722]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#FF5722]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Eliminate Unpaid Invoice Anxiety For Good?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Join 1,400+ freelancers and agency owners collecting on time with automated dignity. Start with our free tier or upgrade as your business expands.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoToDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white px-8 py-4 rounded-xl font-black text-base shadow-lg transition-all duration-150 cursor-pointer"
              >
                <span>Launch App &amp; Start Free</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              Instant setup · Free forever on Starter tier · No credit card required
            </p>
          </div>
        </motion.div>
      </section>

      {/* 9. Minimalist Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <BrandLogo size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <p className="text-xs text-slate-500">
              Built for modern agencies. Collect what you are owed with automated dignity.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-slate-900 cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-slate-900 cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-slate-900 cursor-pointer">
              Pricing
            </button>
            <button onClick={handleGoToDashboard} className="hover:text-[#FF5722] cursor-pointer">
              Dashboard
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">© 2026 dueFox.co. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
