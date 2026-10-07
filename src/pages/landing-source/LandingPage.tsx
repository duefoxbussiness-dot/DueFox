import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
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
  AlertTriangle,
  Repeat,
  TrendingDown,
  ShieldAlert,
  ArrowUpRight,
  Github,
  Twitter,
  MessageCircle
} from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { InteractiveDashboardPreview } from './components/InteractiveDashboardPreview';
import { PricingPlans } from '../../components/PricingPlans';

interface LandingPageProps {
  onNavigateToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDashboard }) => {
  const [calculatorInvoiceAmount, setCalculatorInvoiceAmount] = useState<number>(24000);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [manualPauseVersion, setManualPauseVersion] = useState(0);
  const [copiedPaymentLink, setCopiedPaymentLink] = useState(false);
  const [paymentLinkCopyFailed, setPaymentLinkCopyFailed] = useState(false);
  const [featureCurrency, setFeatureCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>('USD');

  const workflowSteps = [
    {
      context: 'Create Account & Workspace Access',
      title: '1. Create Account & Instant Dashboard Access',
      description: 'Sign up in under 30 seconds using your business email. Instant database workspace ready without lengthy onboarding forms or upfront payment setup.',
      image: '/screenshots/login%20-1.png',
      imageAlt: 'DueFox account sign-up screen',
    },
    {
      context: 'Configure Business Profile & Sender Branding',
      title: '2. Configure Business Profile & Sender Branding',
      description: 'Enter your Company Name, Representative/Sender Name, and Business Email. These branding details auto-populate all outgoing Email & WhatsApp messages so clients immediately recognize who is following up.',
      image: '/screenshots/profile%20-3.png',
      imageAlt: 'DueFox business profile settings screen',
    },
    {
      context: 'Connect Payment & Wire Gateway Details',
      title: '3. Connect Global Payment & Wire Gateway Details',
      description: 'Add your Stripe payment link, Razorpay/UPI ID, or Bank Wire details. DueFox automatically attaches instant 1-click settlement options directly inside reminder emails and WhatsApp notifications.',
      image: '/screenshots/payment%20-4.png',
      imageAlt: 'DueFox global payment methods settings screen',
    },
    {
      context: 'Add Invoice & Set Reminder Cadence',
      title: '4. Input Invoice Details & Set Multi-Channel Cadence',
      description: 'Enter invoice number, amount, due date, and client contact information (Email & WhatsApp). Select your preferred chasing tone (Gentle, Standard, or Assertive) to set up automated reminder intervals.',
      image: '/screenshots/add%20invoice%202%20-5a.png',
      imageAlt: 'DueFox invoice form with client contact details and reminder schedule',
    },
    {
      context: 'Auto-Chase Dashboard Milestone',
      title: '5. Automated Multi-Channel Recovery Running Daily',
      description: 'Sit back and focus on your business. DueFox continuously tracks past-due balances, triggers scheduled Email & WhatsApp reminders, and updates payment statuses instantly upon settlement.',
      image: '/screenshots/dashboard%20final-%206.png',
      imageAlt: 'DueFox dashboard showing invoice recovery and active chase statuses',
      badge: '🎉 Congrats! Your Chasing Automation is Now LIVE 🚀',
    },
  ];

  useEffect(() => {
    if (isCarouselHovered || isManuallyPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveStep((currentStep) => (currentStep + 1) % workflowSteps.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [isCarouselHovered, isManuallyPaused, workflowSteps.length]);

  useEffect(() => {
    if (!isManuallyPaused) return;

    const timeoutId = window.setTimeout(() => setIsManuallyPaused(false), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [isManuallyPaused, manualPauseVersion]);

  const navigateToStep = (stepIndex: number) => {
    setActiveStep(stepIndex);
    setIsManuallyPaused(true);
    setManualPauseVersion((version) => version + 1);
  };

  const copyFeaturePaymentLink = async () => {
    try {
      await navigator.clipboard.writeText('https://duefox.co/pay/inv-2026-089');
      setPaymentLinkCopyFailed(false);
      setCopiedPaymentLink(true);
    } catch {
      setCopiedPaymentLink(false);
      setPaymentLinkCopyFailed(true);
    }
  };

  useEffect(() => {
    if (!copiedPaymentLink && !paymentLinkCopyFailed) return;

    const timeoutId = window.setTimeout(() => {
      setCopiedPaymentLink(false);
      setPaymentLinkCopyFailed(false);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [copiedPaymentLink, paymentLinkCopyFailed]);

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
              <span>Start 7-Day Free Trial</span>
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
              <Check className="w-4 h-4 text-emerald-500" /> No credit card required
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

      {/* 3. Interactive five-step onboarding carousel */}
      <section id="how-it-works" className="relative z-10 py-6 md:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-4 md:mb-5 space-y-2"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How DueFox Works (In 5 Simple Steps)
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            Follow each step to set up your workspace and automate invoice recovery.
          </p>
        </motion.div>

        <div
          className="space-y-2"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 gap-3 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center"
            >
              <div className="flex flex-col gap-2 py-2 md:py-3 lg:col-span-5">
                <div className="flex flex-wrap gap-1.5" aria-label="Choose a workflow step">
                  {workflowSteps.map((step, index) => (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => navigateToStep(index)}
                      aria-label={`Show step ${index + 1}: ${step.context}`}
                      aria-pressed={activeStep === index}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        activeStep === index
                          ? 'border-[#FF5722] bg-[#FF5722] text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-slate-900'
                      }`}
                    >
                      Step {index + 1}
                    </button>
                  ))}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Step {activeStep + 1} of {workflowSteps.length}: {workflowSteps[activeStep].context}
                </h3>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                  {workflowSteps[activeStep].badge && (
                    <div className="mb-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                      {workflowSteps[activeStep].badge}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900">
                      {workflowSteps[activeStep].title}
                    </h4>
                    <p className="text-sm leading-snug text-slate-600">
                      {workflowSteps[activeStep].description}
                    </p>
                    {activeStep === workflowSteps.length - 1 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] leading-tight font-semibold text-emerald-700">
                          ✓ Daily Multi-Channel Follow-ups Active
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] leading-tight font-semibold text-emerald-700">
                          ✓ Automatic Escalation &amp; Audit Log Enabled
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateToStep((activeStep - 1 + workflowSteps.length) % workflowSteps.length)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Previous Step
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStep === workflowSteps.length - 1) {
                        window.location.href = '/login';
                        return;
                      }
                      navigateToStep(activeStep + 1);
                    }}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition-colors sm:flex-none ${
                      activeStep === workflowSteps.length - 1
                        ? 'bg-orange-600 hover:bg-orange-700 font-bold shadow-lg shadow-orange-500/20 animate-pulse'
                        : 'bg-[#FF5722] hover:bg-[#E64A19] font-semibold shadow-sm'
                    }`}
                  >
                    {activeStep === workflowSteps.length - 1 ? 'Start Invoice Chasing Now 🚀' : 'Next Step'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden bg-white p-2 lg:col-span-7">
                <div className="flex items-center gap-1.5 rounded-t-xl border-b border-slate-100 bg-slate-50 px-3 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] sm:text-xs text-slate-500">
                    app.duefox.co/{workflowSteps[activeStep].context.toLowerCase().replaceAll(' ', '-')}
                  </span>
                </div>
                <img
                  src={workflowSteps[activeStep].image}
                  alt={workflowSteps[activeStep].imageAlt}
                  loading="lazy"
                  decoding="async"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  className="w-full h-auto max-h-[380px] object-contain mx-auto transition-all duration-300 crisp-edges rounded-b-xl bg-slate-100"
                />
              </div>
            </motion.div>
          </AnimatePresence>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="h-full rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-emerald-50/40 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-200 bg-gradient-to-br from-rose-100 to-orange-50 text-rose-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">SMART ESCALATION</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Overdue Aging Matrix &amp; Smart Escalation</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Automatically triages outstanding balances. System transitions from polite reminders to authoritative notices as invoices age past due dates.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>REMINDER TIMELINE</span>
                    <span>INVOICE AGE</span>
                  </div>
                  <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
                    <span className="w-1/3 bg-gradient-to-r from-emerald-400 to-yellow-400" />
                    <span className="w-1/3 bg-orange-400" />
                    <span className="w-1/3 bg-rose-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <span className="block text-[11px] font-bold text-slate-700">0–7 Days</span>
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] leading-tight font-semibold text-emerald-700">Gentle Ping</span>
                      <p className="text-[10px] leading-tight text-slate-500">Courteous Nudge</p>
                    </div>
                    <div className="space-y-2">
                      <span className="block text-[11px] font-bold text-slate-700">14–21 Days</span>
                      <span className="inline-flex rounded-full bg-orange-50 px-2 py-1 text-[10px] leading-tight font-semibold text-orange-700">Firm Reminder</span>
                      <p className="text-[10px] leading-tight text-slate-500">Direct Follow-up</p>
                    </div>
                    <div className="space-y-2">
                      <span className="block text-[11px] font-bold text-slate-700">30+ Days</span>
                      <span className="inline-flex rounded-full bg-rose-50 px-2 py-1 text-[10px] leading-tight font-semibold text-rose-700">Critical Notice</span>
                      <p className="text-[10px] leading-tight text-slate-500">Legal Escalation &amp; Wire Notice</p>
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">✓ Dynamic Tone Shifting</span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">✓ Custom Due Date Triggers</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="h-full rounded-2xl border border-slate-200/80 bg-gradient-to-br from-orange-50/50 via-white to-slate-50/70 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600">
                    <Copy className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">1-CLICK CHECKOUT</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Frictionless 1-Click Payment Settlement</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Generates isolated, distraction-free payment pages. Copy checkout links directly to clipboard or trigger instant multi-channel dispatches.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate font-mono text-xs text-slate-700">duefox.co/pay/inv-2026-089</span>
                    </div>
                    <button
                      type="button"
                      onClick={copyFeaturePaymentLink}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF5722] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#E64A19]"
                    >
                      {copiedPaymentLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedPaymentLink ? 'Copied! ✓' : 'Copy Link'}
                    </button>
                  </div>
                  {paymentLinkCopyFailed && (
                    <p role="status" className="mt-2 text-xs font-medium text-rose-600">Could not copy link. Please copy it manually.</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      ['Stripe', 'bg-indigo-50 text-indigo-700 border-indigo-200'],
                      ['Razorpay', 'bg-blue-50 text-blue-700 border-blue-200'],
                      ['Wise', 'bg-emerald-50 text-emerald-700 border-emerald-200'],
                      ['Bank Wire', 'bg-slate-100 text-slate-700 border-slate-200'],
                      ['UPI', 'bg-violet-50 text-violet-700 border-violet-200'],
                    ].map(([gateway, style]) => (
                      <span key={gateway} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${style}`}>{gateway}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-semibold text-slate-500">QUICK SHARE</span>
                    {['WhatsApp', 'Slack', 'Email Thread'].map((channel) => (
                      <span key={channel} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">{channel}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4 }}
              className="h-full rounded-2xl border border-slate-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/40 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">GLOBAL ENGINE</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Multi-Currency Support &amp; Automated FX Tracking</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Seamlessly issue and recover invoices across global markets with native currency calculations and real-time exchange rates.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap gap-2" aria-label="Choose display currency">
                    {([
                      ['USD', '$ USD'],
                      ['EUR', '€ EUR'],
                      ['GBP', '£ GBP'],
                      ['INR', '₹ INR'],
                    ] as const).map(([currency, label]) => (
                      <button
                        key={currency}
                        type="button"
                        onClick={() => setFeatureCurrency(currency)}
                        aria-pressed={featureCurrency === currency}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                          featureCurrency === currency
                            ? 'border-[#FF5722] bg-orange-50 text-orange-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50/70 p-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Outstanding</p>
                      <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: featureCurrency,
                          maximumFractionDigits: 0,
                        }).format(6550 * ({ USD: 1, EUR: 0.92, GBP: 0.85, INR: 83.5 }[featureCurrency]))}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <TrendingDown className="h-3.5 w-3.5" />
                      FX view
                    </span>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">✓ Auto-Calculated Totals</span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">✓ Cross-Border Tax Fields</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -4 }}
              className="h-full rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/50 via-white to-violet-50/40 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                    <Lock className="h-3 w-3" />
                    LIVE AUDIT
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Real-Time Audit Trail &amp; Read Receipts</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Immutable event log tracking every message dispatch, email open, and payment link click so clients can never claim missed notices.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wide text-slate-700">RECENT ACTIVITY</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      LIVE
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl bg-emerald-50/70 px-3 py-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium text-slate-700"><span className="font-mono text-[11px] text-slate-500">10:14 AM</span> · WhatsApp Reminder Delivered</span>
                      <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-blue-50/70 px-3 py-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium text-slate-700"><span className="font-mono text-[11px] text-slate-500">10:15 AM</span> · Invoice Link Opened by Client</span>
                      <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-violet-50/70 px-3 py-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />
                      <span className="text-xs font-medium text-slate-700"><span className="font-mono text-[11px] text-slate-500">11:30 AM</span> · Payment Initiated via Stripe</span>
                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-violet-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                    🔒 Supabase Secured Immutable Logs
                  </div>
                </div>
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

      <section id="pricing" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <PricingPlans onSelectPlan={() => handleGoToDashboard()} />
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
              Join 1,400+ freelancers and agency owners collecting on time with automated dignity. Get full access to automated WhatsApp/email chasing and custom gateway links for 7 days.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { window.location.href = '/login'; }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white px-8 py-4 rounded-xl font-black text-base shadow-lg transition-all duration-150 cursor-pointer"
              >
                <span>Start 7-Day Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-xs font-medium text-slate-300">
              <span>✓ 7-day free trial</span>
              <span>✓ No credit card required</span>
              <span>✓ Instant n8n/Supabase setup</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 9. Enterprise Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-5 md:px-12">
          <div className="col-span-2 space-y-5 md:pr-8">
            <a href="#" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-3">
              <img src="/duefox-logo.svg" alt="DueFox" className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-orange-950/30" />
              <span className="text-2xl font-black tracking-tight text-white">duefox<span className="text-[#FF5722]">.co</span></span>
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Automated B2B Invoice Chasing &amp; Payment Recovery for Modern Agencies and Freelancers.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              System Status: All Automation Systems Operational
            </div>
          </div>

          <nav aria-label="Product links" className="space-y-4">
            <h3 className="text-sm font-bold text-white">Product</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#how-it-works" className="transition-colors hover:text-white">How It Works</a></li>
              <li><a href="#features" className="transition-colors hover:text-white">Core Features</a></li>
              <li><a href="#pricing" className="transition-colors hover:text-white">Pricing Plans</a></li>
              <li><a href="#features" className="transition-colors hover:text-white">Integrations (n8n &amp; Supabase)</a></li>
              <li><a href="#how-it-works" className="transition-colors hover:text-white">Chasing Cadence Engine</a></li>
            </ul>
          </nav>

          <nav aria-label="Resources and help" className="space-y-4">
            <h3 className="text-sm font-bold text-white">Resources</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#faq" className="transition-colors hover:text-white">Documentation</a></li>
              <li><a href="#features" className="transition-colors hover:text-white">Invoice Email Templates</a></li>
              <li><a href="#calculator" className="transition-colors hover:text-white">Payment Recovery Guide</a></li>
              <li><a href="#faq" className="transition-colors hover:text-white">API Reference</a></li>
              <li><a href="#how-it-works" className="transition-colors hover:text-white">Chasing Best Practices</a></li>
            </ul>
          </nav>

          <nav aria-label="Trust and legal" className="col-span-2 space-y-4 md:col-span-1">
            <h3 className="text-sm font-bold text-white">Trust &amp; Legal</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="mailto:support@duefox.co?subject=Privacy%20Policy" className="transition-colors hover:text-white">Privacy Policy</a></li>
              <li><a href="mailto:support@duefox.co?subject=Terms%20of%20Service" className="transition-colors hover:text-white">Terms of Service</a></li>
              <li><a href="mailto:support@duefox.co?subject=Security%20%26%20Data%20Protection" className="transition-colors hover:text-white">Security &amp; Data Protection</a></li>
              <li><a href="mailto:support@duefox.co?subject=GDPR%20Compliance" className="transition-colors hover:text-white">GDPR Compliance</a></li>
              <li><a href="#features" className="transition-colors hover:text-white">Audit Trail Logs</a></li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-5 text-xs md:flex-row md:items-center md:justify-between md:px-12">
            <p className="text-slate-500">© 2026 duefox.co — Built for Cash-Flow Clarity. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-2">
              <a href="mailto:support@duefox.co" className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white">
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white">
                <Twitter className="h-3.5 w-3.5" /> X / Twitter
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white">
                <Github className="h-3.5 w-3.5" /> GitHub
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Support
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
