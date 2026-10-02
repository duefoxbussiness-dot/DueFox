import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DEMO_USER, supabaseService } from '../lib/supabase';
import {
  AuthUser,
  CurrencyCode,
  DashboardStats,
  InvoiceStatus,
  InvoiceWithClient,
  NewInvoiceInput,
  SupabaseConfig,
  ThemeMode,
  UserProfile,
} from '../types';
import { Header } from '../components/Header';
import { StatCards } from '../components/StatCards';
import { InvoiceTable } from '../components/InvoiceTable';
import { AddInvoiceModal } from '../components/AddInvoiceModal';
import { ChasePreviewModal } from '../components/ChasePreviewModal';
import { ProfileModal } from '../components/ProfileModal';
import { SupabaseConfigModal } from '../components/SupabaseConfigModal';
import { AuthView } from '../components/AuthView';
import { ToastContainer, ToastMessage } from '../components/Toast';

const demoDueDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

const DEMO_INVOICES: InvoiceWithClient[] = [
  {
    id: 'demo-inv-acme',
    user_id: DEMO_USER.id,
    client_id: 'demo-client-acme',
    invoice_number: 'DEMO-1042',
    amount: 1200,
    currency: 'USD',
    due_date: demoDueDate(12),
    status: 'pending',
    chase_count: 2,
    chase_schedule: 'standard',
    notes: 'Brand identity and design services',
    created_at: new Date().toISOString(),
    client: {
      id: 'demo-client-acme',
      user_id: DEMO_USER.id,
      name: 'Jordan Lee',
      email: 'jordan@acmecorp.example',
      phone: '',
      company: 'Acme Corp',
      created_at: new Date().toISOString(),
    },
    days_overdue: 12,
  },
  {
    id: 'demo-inv-stark',
    user_id: DEMO_USER.id,
    client_id: 'demo-client-stark',
    invoice_number: 'DEMO-1043',
    amount: 4500,
    currency: 'USD',
    due_date: demoDueDate(38),
    status: 'escalated',
    chase_count: 5,
    chase_schedule: 'assertive',
    notes: 'Product engineering milestone',
    created_at: new Date().toISOString(),
    client: {
      id: 'demo-client-stark',
      user_id: DEMO_USER.id,
      name: 'Morgan Stark',
      email: 'morgan@stark.example',
      phone: '',
      company: 'Stark Ltd',
      created_at: new Date().toISOString(),
    },
    days_overdue: 38,
  },
  {
    id: 'demo-inv-cyberdyne',
    user_id: DEMO_USER.id,
    client_id: 'demo-client-cyberdyne',
    invoice_number: 'DEMO-1044',
    amount: 850,
    currency: 'USD',
    due_date: demoDueDate(6),
    status: 'pending',
    chase_count: 1,
    chase_schedule: 'gentle',
    notes: 'Monthly software consulting',
    created_at: new Date().toISOString(),
    client: {
      id: 'demo-client-cyberdyne',
      user_id: DEMO_USER.id,
      name: 'Riley Connor',
      email: 'riley@cyberdyne.example',
      phone: '',
      company: 'Cyberdyne',
      created_at: new Date().toISOString(),
    },
    days_overdue: 6,
  },
];

export default function Dashboard() {
  // Theme Mode (Default: Crisp Light Theme)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('duefox_theme') as ThemeMode;
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}
    return 'light';
  });

  // Supabase Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // User Profile & Organization Settings
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'payments' | 'plan'>('profile');

  // Invoices & Dashboard data state
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'ALL' | CurrencyCode>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceWithClient | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [chaseInvoice, setChaseInvoice] = useState<InvoiceWithClient | null>(null);

  // Supabase Config state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() =>
    supabaseService.getConfig()
  );

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync theme with document element and persistence
  useEffect(() => {
    try {
      localStorage.setItem('duefox_theme', theme);
    } catch {}

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#0F172A';
      document.body.style.color = '#F8FAFC';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#F8FAFC';
      document.body.style.color = '#0F172A';
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check auth session on startup
  useEffect(() => {
    let mounted = true;

    supabaseService.getUser().then((user) => {
      if (mounted) {
        setCurrentUser(user);
        setAuthLoading(false);
      }
    });

    const unsubscribe = supabaseService.onAuthChange((user) => {
      if (mounted) {
        setCurrentUser(user);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Fetch organization and sender profile whenever authenticated user changes
  useEffect(() => {
    if (currentUser) {
      supabaseService.getProfile(currentUser.id).then((profile) => {
        setUserProfile(profile);
      });
    } else {
      setUserProfile(null);
    }
  }, [currentUser]);

  // Handler: Save profile settings
  const handleSaveProfile = async (updated: UserProfile) => {
    try {
      const saved = await supabaseService.saveProfile(updated);
      setUserProfile(saved);
      addToast(
        'success',
        'Settings updated successfully!',
        `Default currency: ${saved.default_currency} · Remittance details synced to Supabase`
      );
    } catch (err: any) {
      addToast('error', 'Failed to save settings', err?.message);
      throw err;
    }
  };

  // Fetch invoices filtered by authenticated user_id
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    if (currentUser.id === DEMO_USER.id) {
      setInvoices(DEMO_INVOICES);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await supabaseService.fetchClientsAndInvoices(currentUser.id);
      setInvoices(data);
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      addToast('error', 'Failed to fetch data', err?.message || 'Please verify database connectivity');
    } finally {
      setLoading(false);
    }
  }, [currentUser, addToast]);

  // Initial load and Real-time subscription setup
  useEffect(() => {
    if (!currentUser) return;
    loadData();
    if (currentUser.id === DEMO_USER.id) return;

    // Subscribe to live Postgres changes and local bus updates
    const unsubscribe = supabaseService.subscribeToChanges(() => {
      supabaseService.fetchClientsAndInvoices(currentUser.id).then((updated) => {
        setInvoices(updated);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, loadData]);

  // Compute Dashboard Statistics dynamically
  const stats: DashboardStats = useMemo(() => {
    let overdueUSD = 0;
    let overdueEUR = 0;
    let overdueGBP = 0;
    let overdueINR = 0;
    let pendingCount = 0;
    let escalatedCount = 0;
    let paidCount = 0;
    let paidUSD = 0;
    let paidEUR = 0;
    let paidGBP = 0;
    let paidINR = 0;

    invoices.forEach((inv) => {
      if (inv.status === 'paid') {
        paidCount++;
        if (inv.currency === 'USD') paidUSD += inv.amount;
        else if (inv.currency === 'EUR') paidEUR += inv.amount;
        else if (inv.currency === 'GBP') paidGBP += inv.amount;
        else paidINR += inv.amount;
      } else {
        if (inv.status === 'escalated') {
          escalatedCount++;
        } else {
          pendingCount++;
        }

        // Add to overdue amount if past due or due today
        if (inv.days_overdue >= 0) {
          if (inv.currency === 'USD') overdueUSD += inv.amount;
          else if (inv.currency === 'EUR') overdueEUR += inv.amount;
          else if (inv.currency === 'GBP') overdueGBP += inv.amount;
          else overdueINR += inv.amount;
        }
      }
    });

    return {
      totalOverdueUSD: overdueUSD,
      totalOverdueEUR: overdueEUR,
      totalOverdueGBP: overdueGBP,
      totalOverdueINR: overdueINR,
      pendingCount,
      escalatedCount,
      paidCount,
      totalPaidUSD: paidUSD,
      totalPaidEUR: paidEUR,
      totalPaidGBP: paidGBP,
      totalPaidINR: paidINR,
    };
  }, [invoices]);

  const handleOpenAddModal = () => {
    setEditingInvoice(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (invoice: InvoiceWithClient) => {
    setEditingInvoice(invoice);
    setIsAddModalOpen(true);
  };

  // Handler: Save Invoice (Create or Update in Supabase with user_id)
  const handleSaveInvoice = async (input: NewInvoiceInput) => {
    if (!currentUser) return;

    if (editingInvoice) {
      try {
        const updated = await supabaseService.updateInvoice(editingInvoice.id, input, currentUser.id);
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === editingInvoice.id ? updated : inv))
        );
        addToast(
          'success',
          `Invoice ${updated.invoice_number} updated`,
          `Updated details saved in Supabase for ${updated.client.name}`
        );
      } catch (err: any) {
        addToast('error', 'Failed to update invoice', err?.message || 'Database update failed');
        throw err;
      }
    } else {
      try {
        const created = await supabaseService.insertInvoice(input, currentUser.id);
        setInvoices((prev) => [created, ...prev]);
        addToast(
          'success',
          `Invoice ${created.invoice_number} created`,
          `Client: ${created.client.name} · Automated chase schedule initialized`
        );
      } catch (err: any) {
        addToast('error', 'Failed to create invoice', err?.message || 'Database insert failed');
        throw err;
      }
    }
  };

  // Handler: Update status (Mark Paid / Reopen)
  const handleMarkPaid = async (id: string, newStatus: InvoiceStatus) => {
    const target = invoices.find((i) => i.id === id);
    if (!target) return;

    try {
      await supabaseService.updateInvoiceStatus(id, newStatus);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
      );
      if (newStatus === 'paid') {
        addToast(
          'success',
          `Invoice ${target.invoice_number} marked as Paid`,
          `Recovered ${target.currency === 'USD' ? '$' : '₹'}${target.amount.toLocaleString()} from ${target.client.name}`
        );
      } else {
        addToast('info', `Invoice ${target.invoice_number} reopened`, 'Status reset to pending');
      }
    } catch (err: any) {
      addToast('error', 'Status update failed', err?.message);
    }
  };

  // Handler: Delete invoice
  const handleDeleteInvoice = async (id: string) => {
    const target = invoices.find((i) => i.id === id);
    try {
      await supabaseService.deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      addToast(
        'info',
        `Invoice ${target?.invoice_number || ''} deleted`,
        'Record removed from database'
      );
    } catch (err: any) {
      addToast('error', 'Failed to delete invoice', err?.message);
    }
  };

  // Handler: Dispatch Chase reminder
  const handleSendChase = async (invoiceId: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;

    try {
      await supabaseService.recordChase(invoiceId);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                chase_count: (inv.chase_count || 0) + 1,
                last_chased_at: new Date().toISOString(),
              }
            : inv
        )
      );
      addToast(
        'success',
        `Chase reminder sent to ${target.client.name}`,
        `Payment link dispatched to ${target.client.email}`
      );
    } catch (err: any) {
      addToast('error', 'Failed to record chase', err?.message);
    }
  };

  // Handler: Batch chase all overdue invoices
  const handleBatchChase = async () => {
    const overdueInvoices = invoices.filter((i) => i.status !== 'paid');
    if (overdueInvoices.length === 0) return;

    try {
      for (const inv of overdueInvoices) {
        await supabaseService.recordChase(inv.id);
      }
      await loadData();
      addToast(
        'success',
        `Automated chase triggered for ${overdueInvoices.length} invoices`,
        'Email & SMS payment notices dispatched via dueFox engine'
      );
    } catch (err: any) {
      addToast('error', 'Batch chase failed', err?.message);
    }
  };

  // Handler: Sign out
  const handleSignOut = async () => {
    await supabaseService.signOut();
    setCurrentUser(null);
    addToast('info', 'Signed Out', 'You have securely signed out of dueFox.co');
  };

  // Handler: Reset demo data
  const handleResetDemoData = () => {
    supabaseService.resetDemoData();
    loadData();
    addToast('info', 'Demo data re-seeded', 'Default invoices & clients restored');
  };

  const handleConfigUpdated = () => {
    setSupabaseConfig(supabaseService.getConfig());
    loadData();
  };

  const unpaidCount = invoices.filter((i) => i.status !== 'paid').length;

  // 1. Initial Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white">
        <div className="w-12 h-12 rounded-2xl bg-electric flex items-center justify-center shadow-lg animate-pulse mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-white"
          >
            <polygon points="12 2 19 8 19 19 5 19 5 8 12 2" fill="currentColor" fillOpacity="0.25" />
            <path d="M5 8l7 4 7-4" />
            <path d="M12 12v7" />
            <path d="M9 5l3 3 3-3" />
          </svg>
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Loading dueFox engine...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated View: Render Glassmorphic Login / Sign Up
  if (!currentUser) {
    return (
      <>
        <AuthView
          onAuthenticated={(user) => {
            setCurrentUser(user);
            addToast('success', `Welcome to dueFox, ${user.name || user.email}!`);
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          supabaseConfig={supabaseConfig}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          config={supabaseConfig}
          onConfigUpdated={handleConfigUpdated}
          onResetDemoData={handleResetDemoData}
        />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // 3. Authenticated View: Render Full Modern Dashboard
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        onOpenAddModal={handleOpenAddModal}
        onOpenUpgradePlan={() => {
          setProfileModalTab('plan');
          setIsProfileModalOpen(true);
        }}
        onOpenProfileModal={() => {
          setProfileModalTab('profile');
          setIsProfileModalOpen(true);
        }}
        user={currentUser}
        profile={userProfile}
        isDemoMode={currentUser.id === DEMO_USER.id}
        onCreateAccount={() => setCurrentUser(null)}
        onSignOut={handleSignOut}
      />

      {/* Main Workspace Canvas - Full Desktop Width */}
      <main className="flex-1 w-full px-6 lg:px-10 py-6 space-y-6">
        {/* Top Row: Stat Cards */}
        <section aria-label="Dashboard Statistics">
          <StatCards
            stats={stats}
            selectedCurrency={selectedCurrency}
            onSelectCurrency={setSelectedCurrency}
          />
        </section>

        {/* Main Section: Invoice Data Table */}
        <section aria-label="Invoice Management Table">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Invoice Accounts & Chase Queue
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track overdue balances, automate collection cadence, and escalate past-due client accounts.
                </p>
              </div>

              {/* Status explanation indicator */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <span>Paid</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>Pending</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span>Critical (30+ Days)</span>
                </span>
              </div>
            </div>

            <InvoiceTable
              invoices={invoices}
              loading={loading}
              onMarkPaid={handleMarkPaid}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteInvoice}
              onOpenChaseModal={(inv) => setChaseInvoice(inv)}
              onOpenAddModal={handleOpenAddModal}
              selectedCurrency={selectedCurrency}
              onToast={addToast}
            />
          </div>
        </section>

        {/* Quiet Footnote & Database Integration Reference */}
        <footer className="pt-6 pb-4 border-t border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">dueFox.co</span>
            <span aria-hidden="true">·</span>
            <span>Automated Invoice Chasing Engine</span>
            <span aria-hidden="true">·</span>
            <span>Real-time persistence via @supabase/supabase-js</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium underline underline-offset-2 cursor-pointer"
            >
              Supabase SQL Schema & Credentials
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium underline underline-offset-2 cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </footer>
      </main>

      {/* Modals */}
      <AddInvoiceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingInvoice(null);
        }}
        initialInvoice={editingInvoice}
        onSubmit={handleSaveInvoice}
        defaultCurrency={userProfile?.default_currency || 'USD'}
        profile={userProfile}
      />

      <ChasePreviewModal
        invoice={chaseInvoice}
        isOpen={Boolean(chaseInvoice)}
        onClose={() => setChaseInvoice(null)}
        onSendChase={handleSendChase}
        profile={userProfile}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveProfile}
        initialTab={profileModalTab}
        isDemoMode={currentUser.id === DEMO_USER.id}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={supabaseConfig}
        onConfigUpdated={handleConfigUpdated}
        onResetDemoData={handleResetDemoData}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
