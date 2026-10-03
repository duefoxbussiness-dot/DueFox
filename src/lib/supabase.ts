import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Client, Invoice, InvoiceWithClient, NewInvoiceInput, SupabaseConfig, InvoiceStatus, AuthUser, UserProfile, CurrencyCode, PlanTier } from '../types';
import { INITIAL_CLIENTS, INITIAL_INVOICES } from './initialData';

const CONFIG_STORAGE_KEY = 'duefox_supabase_config_v1';
const LOCAL_CLIENTS_KEY = 'duefox_local_clients_v1';
const LOCAL_INVOICES_KEY = 'duefox_local_invoices_v1';
const LOCAL_AUTH_KEY = 'duefox_auth_session_v1';

export const DEMO_USER: AuthUser = {
  id: 'usr-duefox-demo-01',
  email: 'demo@example.com',
  name: 'Demo User',
  created_at: '2026-09-01T00:00:00Z',
};

// Event bus for local real-time synchronization across tabs and within app
const localEventTarget = new EventTarget();
const LOCAL_CHANGE_EVENT = 'duefox_db_change';
const AUTH_CHANGE_EVENT = 'duefox_auth_change';

function createInvoiceNumber(): string {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

// Calculate days overdue based on today
export function calculateDaysOverdue(dueDateStr: string): number {
  const due = new Date(dueDateStr);
  const now = new Date(); // Current date (2026-09-24)
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Automatically resolve status based on days overdue if not explicitly marked paid
export function resolveAutomaticStatus(dueDateStr: string, currentStatus: InvoiceStatus): InvoiceStatus {
  if (currentStatus === 'paid') return 'paid';
  const daysOverdue = calculateDaysOverdue(dueDateStr);
  if (daysOverdue >= 30) {
    return 'escalated';
  }
  return 'pending';
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private config: SupabaseConfig = {
    url: '',
    anonKey: '',
    isConnected: false,
    isCustom: false,
  };

  constructor() {
    this.init();
  }

  public init() {
    // Check environment variables first
    const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://uuoobrwdjrrhterucbra.supabase.co';
    const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
    console.info('[Supabase] Environment status:', {
      VITE_SUPABASE_URL: envUrl ? 'configured' : 'missing',
      VITE_SUPABASE_ANON_KEY: envKey ? 'configured' : 'missing',
    });

    // Check localStorage overrides
    let storedConfig: { url?: string; anonKey?: string } | null = null;
    try {
      const item = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (item) storedConfig = JSON.parse(item);
    } catch {
      // Ignore storage errors
    }

    const supabaseUrl = (storedConfig?.url || envUrl).trim();
    const targetKey = storedConfig?.anonKey || envKey;
    console.log('Using Supabase URL:', supabaseUrl);

    let isValidSupabaseUrl = false;
    try {
      const parsedUrl = new URL(supabaseUrl);
      isValidSupabaseUrl = (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') && Boolean(parsedUrl.hostname);
    } catch {
      // Invalid or empty URLs keep the app in local/demo mode.
    }

    if (isValidSupabaseUrl && targetKey && targetKey.length > 20) {
      try {
        this.client = createClient(supabaseUrl, targetKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
        this.config = {
          url: supabaseUrl,
          anonKey: targetKey,
          isConnected: true,
          isCustom: Boolean(storedConfig?.url),
        };
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
        this.client = null;
        this.config = { url: supabaseUrl, anonKey: targetKey, isConnected: false, isCustom: true };
      }
    } else {
      this.client = null;
      this.config = {
        url: '',
        anonKey: '',
        isConnected: false,
        isCustom: false,
      };
    }

    // Ensure local seed data exists if in local mode
    this.ensureLocalSeedData();
  }

  // Authentication: Sign In
  public async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();

    // If connected to Supabase and not a quick demo override
    if (this.client) {
      try {
        const { data, error } = await this.client.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          console.error('[Supabase] Sign-in failed:', error);
          // If custom Supabase returned error, return error message
          return { user: null, error: error.message };
        }

        if (data?.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            name: data.user.user_metadata?.full_name || trimmedEmail.split('@')[0],
            created_at: data.user.created_at,
          };
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
          localEventTarget.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
          return { user: authUser };
        }
      } catch (err: any) {
        console.error('[Supabase] Sign-in request threw an error:', err);
        return { user: null, error: err?.message || 'Authentication error' };
      }
    }

    // Local / Demo Authentication Fallback
    if (password.length < 4) {
      return { user: null, error: 'Password must be at least 4 characters long' };
    }

    const authUser: AuthUser = {
      id: trimmedEmail === DEMO_USER.email.toLowerCase() ? DEMO_USER.id : `usr-${Date.now()}`,
      email: trimmedEmail,
      name: trimmedEmail === DEMO_USER.email.toLowerCase() ? DEMO_USER.name : trimmedEmail.split('@')[0],
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
    localEventTarget.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return { user: authUser };
  }

  // Authentication: Sign Up
  public async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ user: AuthUser | null; error?: string; message?: string; requiresConfirmation?: boolean }> {
    const trimmedEmail = email.trim().toLowerCase();

    if (this.client) {
      try {
        const { data, error } = await this.client.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: fullName?.trim() },
          },
        });

        if (error) {
          console.error('[Supabase] Sign-up failed:', error);
          return { user: null, error: error.message };
        }

        if (data?.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            name: fullName?.trim() || data.user.user_metadata?.full_name || trimmedEmail.split('@')[0],
            created_at: data.user.created_at,
          };

          const hasSession = Boolean(data.session);
          if (hasSession) {
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
            localEventTarget.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
          }

          return {
            user: hasSession ? authUser : null,
            requiresConfirmation: !hasSession,
            message: 'Confirmation email sent! Please check your inbox and click the verification link before logging in.',
          };
        }
      } catch (err: any) {
        console.error('[Supabase] Sign-up request threw an error:', err);
        return { user: null, error: err?.message || 'Failed to create account' };
      }
    }

    // Local / Demo Sign Up
    if (password.length < 6) {
      return { user: null, error: 'Password must be at least 6 characters' };
    }

    const authUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email: trimmedEmail,
      name: fullName?.trim() || trimmedEmail.split('@')[0],
      created_at: new Date().toISOString(),
    };

    return {
      user: authUser,
      requiresConfirmation: true,
      message: 'Confirmation email sent! Please check your inbox and click the verification link before logging in.',
    };
  }

  // Authentication: Sign Out
  public async signOut(): Promise<void> {
    if (this.client) {
      try {
        const { error } = await this.client.auth.signOut();
        if (error) {
          console.error('[Supabase] Sign-out failed:', error);
        }
      } catch (err) {
        console.error('[Supabase] Sign-out request threw an error:', err);
      }
    }

    localStorage.removeItem(LOCAL_AUTH_KEY);
    localEventTarget.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }

  // Authentication: Get Current Logged-in User
  public async getUser(): Promise<AuthUser | null> {
    if (this.client) {
      try {
        const { data, error } = await this.client.auth.getUser();
        if (error) {
          console.error('[Supabase] User lookup failed:', error);
        }
        if (data?.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            created_at: data.user.created_at,
          };
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
          return authUser;
        }
        return null;
      } catch (err) {
        console.error('[Supabase] User lookup request threw an error:', err);
        return null;
      }
    }

    try {
      const stored = localStorage.getItem(LOCAL_AUTH_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    return null;
  }

  // Authentication: Listen to Auth Changes
  public onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    const handleAuthEvent = () => {
      this.getUser().then(callback);
    };

    localEventTarget.addEventListener(AUTH_CHANGE_EVENT, handleAuthEvent);

    let supabaseSub: any = null;
    if (this.client) {
      try {
        const { data } = this.client.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              created_at: session.user.created_at,
            };
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
            callback(authUser);
          } else {
            callback(null);
          }
        });
        supabaseSub = data?.subscription;
      } catch (err) {
        console.error('[Supabase] Auth-state subscription failed:', err);
      }
    }

    return () => {
      localEventTarget.removeEventListener(AUTH_CHANGE_EVENT, handleAuthEvent);
      if (supabaseSub) {
        supabaseSub.unsubscribe();
      }
    };
  }

  private ensureLocalSeedData() {
    try {
      if (!localStorage.getItem(LOCAL_CLIENTS_KEY)) {
        localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS));
      }
      if (!localStorage.getItem(LOCAL_INVOICES_KEY)) {
        localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(INITIAL_INVOICES));
      }
    } catch {
      // Ignore local storage quota errors
    }
  }

  public getConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public async updateConfig(url: string, anonKey: string): Promise<{ success: boolean; error?: string }> {
    const trimmedUrl = url.trim();
    const trimmedKey = anonKey.trim();

    if (!trimmedUrl && !trimmedKey) {
      // Clear custom config, switch to demo mode
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      this.init();
      localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
      return { success: true };
    }

    if (!trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('http://')) {
      return { success: false, error: 'Project URL must start with https://' };
    }

    if (trimmedKey.length < 20) {
      return { success: false, error: 'Anon key is too short. Please provide a valid Supabase anon key.' };
    }

    try {
      const testClient = createClient(trimmedUrl, trimmedKey);
      // Test connectivity by querying clients or invoices
      const { error } = await testClient.from('invoices').select('id').limit(1);
      
      if (error && error.code !== 'PGRST116' && !error.message.includes('permission denied')) {
        // Even if table does not exist yet, we still allow saving so user can run SQL migration!
        console.info('Connected to Supabase, but schema might need migration:', error.message);
      }

      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url: trimmedUrl, anonKey: trimmedKey }));
      this.client = testClient;
      this.config = {
        url: trimmedUrl,
        anonKey: trimmedKey,
        isConnected: true,
        isCustom: true,
      };

      localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to connect to Supabase' };
    }
  }

  public resetDemoData() {
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(INITIAL_INVOICES));
    localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
  }

  // Fetch all invoices combined with client info
  public async fetchClientsAndInvoices(userId?: string): Promise<InvoiceWithClient[]> {
    if (this.client) {
      try {
        // When authenticated, explicitly query by user_id to honor RLS policies:
        // supabase.from('invoices').select('*').eq('user_id', currentUser.id)
        if (userId) {
          // 1. Direct user_id query on invoices
          const { data: userInvoices, error: invError } = await this.client
            .from('invoices')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (invError) throw invError;

          if (userInvoices) {
            // Also fetch clients belonging to this user
            const { data: userClients, error: clientsError } = await this.client
              .from('clients')
              .select('*')
              .eq('user_id', userId);
            if (clientsError) throw clientsError;

            const clientMap = new Map<string, Client>();
            (userClients || []).forEach((c: any) => clientMap.set(c.id, c));

            // If some clients aren't found in user_id query, fetch matching client IDs
            const missingClientIds = userInvoices
              .map((inv: any) => inv.client_id)
              .filter((cid: string) => !clientMap.has(cid));

            if (missingClientIds.length > 0) {
              const { data: extraClients, error: extraClientsError } = await this.client
                .from('clients')
                .select('*')
                .in('id', missingClientIds);
              if (extraClientsError) throw extraClientsError;
              (extraClients || []).forEach((c: any) => clientMap.set(c.id, c));
            }

            return userInvoices.map((inv: any) => {
              const client = clientMap.get(inv.client_id) || {
                id: inv.client_id,
                user_id: inv.user_id,
                name: 'Client',
                email: 'client@example.com',
                phone: '',
                created_at: inv.created_at,
              };
              const daysOverdue = calculateDaysOverdue(inv.due_date);
              const status = inv.status === 'paid' ? 'paid' : (daysOverdue >= 30 ? 'escalated' : inv.status || 'pending');

              return {
                id: inv.id,
                user_id: inv.user_id,
                client_id: inv.client_id,
                invoice_number: inv.invoice_number || `INV-${inv.id.substring(0, 6)}`,
                amount: Number(inv.amount),
                currency: inv.currency || 'USD',
                due_date: inv.due_date,
                status,
                payment_link: inv.payment_link,
                chase_count: Number(inv.chase_count || 0),
                last_chased_at: inv.last_chased_at,
                chase_schedule: inv.chase_schedule || 'standard',
                notes: inv.notes,
                created_at: inv.created_at,
                client,
                days_overdue: daysOverdue,
              };
            });
          }
        }

        // General fallback query if no userId
        const query = this.client
          .from('invoices')
          .select(`
            *,
            clients:client_id (*)
          `)
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (!error && data) {
          return this.mapSupabaseInvoiceRows(data);
        }

        // If joined query failed, query separately
        const [clientsRes, invoicesRes] = await Promise.all([
          this.client.from('clients').select('*'),
          this.client.from('invoices').select('*').order('created_at', { ascending: false }),
        ]);
        if (clientsRes.error) throw clientsRes.error;
        if (invoicesRes.error) throw invoicesRes.error;

        if (invoicesRes.data) {
          const clientMap = new Map<string, Client>();
          (clientsRes.data || []).forEach((c: any) => clientMap.set(c.id, c));

          let rows = invoicesRes.data;
          if (userId && rows.some((r: any) => r.user_id === userId)) {
            rows = rows.filter((r: any) => r.user_id === userId);
          }

          return rows.map((inv: any) => {
            const client = clientMap.get(inv.client_id) || {
              id: inv.client_id,
              user_id: inv.user_id,
              name: 'Unknown Client',
              email: 'unknown@client.com',
              phone: '',
              created_at: inv.created_at,
            };
            const daysOverdue = calculateDaysOverdue(inv.due_date);
            const status = inv.status === 'paid' ? 'paid' : (daysOverdue >= 30 ? 'escalated' : inv.status || 'pending');

            return {
              id: inv.id,
              user_id: inv.user_id,
              client_id: inv.client_id,
              invoice_number: inv.invoice_number || `INV-${inv.id.substring(0, 6)}`,
              amount: Number(inv.amount),
              currency: inv.currency || 'USD',
              due_date: inv.due_date,
              status,
              payment_link: inv.payment_link,
              chase_count: Number(inv.chase_count || 0),
              last_chased_at: inv.last_chased_at,
              chase_schedule: inv.chase_schedule || 'standard',
              notes: inv.notes,
              created_at: inv.created_at,
              client,
              days_overdue: daysOverdue,
            };
          });
        }
      } catch (err) {
        console.warn('Supabase fetch error:', err);
        if (this.client) throw err;
      }
    }

    // Fallback to local synced storage
    return this.getLocalClientsAndInvoices(userId);
  }

  public async fetchPublicInvoice(invoiceId: string): Promise<{ invoice: InvoiceWithClient; profile: UserProfile | null } | null> {
    if (this.client) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceId);
        let row = null;

        if (isUuid) {
          const idResult = await this.client
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .maybeSingle();
          if (idResult.error) throw idResult.error;
          row = idResult.data;
        }

        if (!row) {
          const invoiceNumberResult = await this.client
            .from('invoices')
            .select('*')
            .eq('invoice_number', invoiceId)
            .maybeSingle();
          if (invoiceNumberResult.error) throw invoiceNumberResult.error;
          row = invoiceNumberResult.data;
        }

        if (row) {
          const { data: clientRecord, error: clientError } = await this.client
            .from('clients')
            .select('*')
            .eq('id', row.client_id)
            .maybeSingle();
          if (clientError) throw clientError;

          const invoice = this.mapSupabaseInvoiceRows([{ ...row, clients: clientRecord }])[0];
          const profile = invoice.user_id ? await this.getProfile(invoice.user_id) : null;
          return { invoice, profile };
        }
      } catch (err) {
        console.warn('Supabase public invoice lookup failed, checking local records:', err);
      }
    }

    const invoice = this.getLocalClientsAndInvoices().find((item) => item.id === invoiceId || item.invoice_number === invoiceId);
    if (!invoice) return null;

    const profile = invoice.user_id ? await this.getProfile(invoice.user_id) : null;
    return { invoice, profile };
  }

  private mapSupabaseInvoiceRows(data: any[]): InvoiceWithClient[] {
    return data.map((row: any) => {
      const clientData = row.clients || {
        id: row.client_id,
        user_id: row.user_id,
        name: 'Unknown Client',
        email: 'unknown@client.com',
        phone: '',
        created_at: row.created_at,
      };
      const daysOverdue = calculateDaysOverdue(row.due_date);
      const status = row.status === 'paid' ? 'paid' : (daysOverdue >= 30 ? 'escalated' : row.status || 'pending');

      return {
        id: row.id,
        user_id: row.user_id,
        client_id: row.client_id,
        invoice_number: row.invoice_number || `INV-${row.id.substring(0, 6)}`,
        amount: Number(row.amount),
        currency: row.currency || 'USD',
        due_date: row.due_date,
        status,
        payment_link: row.payment_link,
        chase_count: Number(row.chase_count || 0),
        last_chased_at: row.last_chased_at,
        chase_schedule: row.chase_schedule || 'standard',
        notes: row.notes,
        created_at: row.created_at,
        client: clientData,
        days_overdue: daysOverdue,
      };
    });
  }

  private getLocalClientsAndInvoices(userId?: string): InvoiceWithClient[] {
    try {
      this.ensureLocalSeedData();
      const rawClients = localStorage.getItem(LOCAL_CLIENTS_KEY);
      const rawInvoices = localStorage.getItem(LOCAL_INVOICES_KEY);

      const clients: Client[] = rawClients ? JSON.parse(rawClients) : INITIAL_CLIENTS;
      let invoices: Invoice[] = rawInvoices ? JSON.parse(rawInvoices) : INITIAL_INVOICES;

      // If user has specific invoices in local store, prioritize them, else show demo set
      if (userId) {
        const userMatches = invoices.filter((i) => i.user_id === userId);
        if (userMatches.length > 0) {
          invoices = userMatches;
        }
      }

      const clientMap = new Map<string, Client>();
      clients.forEach((c) => clientMap.set(c.id, c));

      return invoices.map((inv) => {
        const client = clientMap.get(inv.client_id) || {
          id: inv.client_id,
          user_id: inv.user_id,
          name: 'Client',
          email: 'client@example.com',
          phone: '',
          created_at: inv.created_at,
        };
        const daysOverdue = calculateDaysOverdue(inv.due_date);
        const resolvedStatus = inv.status === 'paid' ? 'paid' : (daysOverdue >= 30 ? 'escalated' : inv.status);

        return {
          ...inv,
          status: resolvedStatus,
          client,
          days_overdue: daysOverdue,
        };
      });
    } catch {
      return [];
    }
  }

  // Insert a new invoice with client handling and user_id association
  public async insertInvoice(input: NewInvoiceInput, userId?: string): Promise<InvoiceWithClient> {
    const nowIso = new Date().toISOString();
    const daysOverdue = calculateDaysOverdue(input.dueDate);
    const initialStatus: InvoiceStatus = daysOverdue >= 30 ? 'escalated' : 'pending';
    const resolvedUserId = userId || (await this.getUser())?.id || 'demo-user-id';

    if (this.client) {
      try {
        // 1. Check if client exists by email in Supabase
        const { data: existingClients } = await this.client
          .from('clients')
          .select('*')
          .eq('email', input.email.trim().toLowerCase())
          .limit(1);

        let clientId: string;
        let clientRecord: Client;

        if (existingClients && existingClients.length > 0) {
          clientId = existingClients[0].id;
          clientRecord = existingClients[0];
          // Update phone or name if provided
          await this.client
            .from('clients')
            .update({
              name: input.clientName.trim(),
              phone: input.phone.trim(),
              company: input.company?.trim(),
              user_id: resolvedUserId,
            })
            .eq('id', clientId);
        } else {
          // Insert client
          const newClientId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`;
          const newClient: any = {
            id: newClientId,
            user_id: resolvedUserId,
            name: input.clientName.trim(),
            email: input.email.trim().toLowerCase(),
            phone: input.phone.trim(),
            company: input.company?.trim() || '',
            created_at: nowIso,
          };
          const { data: createdClient, error: clientError } = await this.client
            .from('clients')
            .insert(newClient)
            .select()
            .single();

          if (clientError || !createdClient) {
            throw clientError || new Error('Failed to create client in Supabase');
          }
          clientId = createdClient.id;
          clientRecord = createdClient;
        }

        // 2. Generate invoice number
        const invoiceNumber = input.invoiceNumber?.trim() || createInvoiceNumber();
        const newInvoiceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `inv-${Date.now()}`;

        // Ensure user_id is explicitly set and included in the insert payload
        const invoiceToInsert = {
          id: newInvoiceId,
          user_id: resolvedUserId,
          client_id: clientId,
          invoice_number: invoiceNumber,
          amount: Number(input.amount),
          currency: input.currency,
          due_date: input.dueDate,
          status: initialStatus,
          payment_link: input.paymentLink?.trim() || `${window.location.origin}/pay/${newInvoiceId}`,
          chase_count: 0,
          chase_schedule: input.chaseSchedule || 'standard',
          notes: input.notes?.trim() || '',
          created_at: nowIso,
        };

        const { data: createdInvoice, error: invError } = await this.client
          .from('invoices')
          .insert([invoiceToInsert])
          .select()
          .single();

        if (invError || !createdInvoice) {
          throw invError || new Error('Failed to insert invoice into Supabase');
        }

        return {
          id: createdInvoice.id,
          user_id: createdInvoice.user_id || resolvedUserId,
          client_id: clientId,
          invoice_number: invoiceNumber,
          amount: Number(createdInvoice.amount),
          currency: createdInvoice.currency,
          due_date: createdInvoice.due_date,
          status: createdInvoice.status,
          payment_link: createdInvoice.payment_link,
          chase_count: 0,
          chase_schedule: createdInvoice.chase_schedule,
          notes: createdInvoice.notes,
          created_at: createdInvoice.created_at,
          client: clientRecord,
          days_overdue: daysOverdue,
        };
      } catch (err) {
        console.warn('Supabase insert failed, inserting into local store:', err);
      }
    }

    // Local Insert Fallback
    const rawClients = localStorage.getItem(LOCAL_CLIENTS_KEY);
    const rawInvoices = localStorage.getItem(LOCAL_INVOICES_KEY);

    const clients: Client[] = rawClients ? JSON.parse(rawClients) : [...INITIAL_CLIENTS];
    const invoices: Invoice[] = rawInvoices ? JSON.parse(rawInvoices) : [...INITIAL_INVOICES];

    // Find or create client
    let client = clients.find((c) => c.email.toLowerCase() === input.email.trim().toLowerCase());
    if (!client) {
      client = {
        id: `c-${Date.now()}`,
        user_id: resolvedUserId,
        name: input.clientName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        company: input.company?.trim(),
        created_at: nowIso,
      };
      clients.unshift(client);
    } else {
      client.name = input.clientName.trim();
      client.phone = input.phone.trim();
      client.user_id = resolvedUserId;
      if (input.company) client.company = input.company.trim();
    }

    const invoiceNumber = input.invoiceNumber?.trim() || createInvoiceNumber();
    const localInvoiceId = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newInvoice: Invoice = {
      id: localInvoiceId,
      user_id: resolvedUserId,
      client_id: client.id,
      invoice_number: invoiceNumber,
      amount: Number(input.amount),
      currency: input.currency,
      due_date: input.dueDate,
      status: initialStatus,
      payment_link: input.paymentLink?.trim() || `${window.location.origin}/pay/${localInvoiceId}`,
      chase_count: 0,
      chase_schedule: input.chaseSchedule || 'standard',
      notes: input.notes?.trim() || '',
      created_at: nowIso,
    };

    invoices.unshift(newInvoice);

    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients));
    localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(invoices));
    localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));

    return {
      ...newInvoice,
      client,
      days_overdue: daysOverdue,
    };
  }

  // Update an existing invoice and its client details
  public async updateInvoice(id: string, input: NewInvoiceInput, userId?: string): Promise<InvoiceWithClient> {
    const daysOverdue = calculateDaysOverdue(input.dueDate);

    if (this.client) {
      try {
        // 1. Fetch current invoice to know client_id and current status
        const { data: currentInv } = await this.client
          .from('invoices')
          .select('client_id, status, invoice_number, payment_link, chase_count, created_at, user_id')
          .eq('id', id)
          .single();

        const clientId = currentInv?.client_id;
        const currentStatus = currentInv?.status || 'pending';
        const updatedStatus: InvoiceStatus =
          currentStatus === 'paid' ? 'paid' : (daysOverdue >= 30 ? 'escalated' : 'pending');

        let clientRecord: Client;

        if (clientId) {
          // Update client in clients table
          const { data: updatedClient } = await this.client
            .from('clients')
            .update({
              name: input.clientName.trim(),
              email: input.email.trim().toLowerCase(),
              phone: input.phone.trim(),
              company: input.company?.trim() || '',
            })
            .eq('id', clientId)
            .select()
            .single();

          clientRecord = updatedClient || {
            id: clientId,
            name: input.clientName.trim(),
            email: input.email.trim().toLowerCase(),
            phone: input.phone.trim(),
            company: input.company?.trim(),
            created_at: new Date().toISOString(),
          };
        } else {
          clientRecord = {
            id: `c-${Date.now()}`,
            name: input.clientName.trim(),
            email: input.email.trim().toLowerCase(),
            phone: input.phone.trim(),
            company: input.company?.trim(),
            created_at: new Date().toISOString(),
          };
        }

        // Update invoice in invoices table
        const { data: updatedInv, error: invError } = await this.client
          .from('invoices')
          .update({
            invoice_number: input.invoiceNumber?.trim() || currentInv?.invoice_number,
            amount: Number(input.amount),
            currency: input.currency,
            due_date: input.dueDate,
            status: updatedStatus,
            payment_link: input.paymentLink === undefined
              ? currentInv?.payment_link || null
              : input.paymentLink.trim() || null,
            chase_schedule: input.chaseSchedule || 'standard',
            notes: input.notes?.trim() || '',
          })
          .eq('id', id)
          .select()
          .single();

        if (invError) {
          throw invError;
        }

        const result: InvoiceWithClient = {
          id,
          client_id: clientId || clientRecord.id,
          invoice_number: updatedInv?.invoice_number || input.invoiceNumber?.trim() || currentInv?.invoice_number || `INV-${id.substring(0, 6)}`,
          amount: Number(updatedInv?.amount ?? input.amount),
          currency: updatedInv?.currency || input.currency,
          due_date: updatedInv?.due_date || input.dueDate,
          status: updatedInv?.status || updatedStatus,
          payment_link: updatedInv?.payment_link ?? (input.paymentLink === undefined
            ? currentInv?.payment_link
            : input.paymentLink.trim() || undefined),
          chase_count: updatedInv?.chase_count ?? (currentInv?.chase_count || 0),
          last_chased_at: updatedInv?.last_chased_at,
          chase_schedule: updatedInv?.chase_schedule || input.chaseSchedule || 'standard',
          notes: updatedInv?.notes ?? input.notes,
          created_at: updatedInv?.created_at || currentInv?.created_at || new Date().toISOString(),
          client: clientRecord,
          days_overdue: daysOverdue,
        };

        // Also update local storage to keep state mirrored
        this.updateLocalInvoiceAndClient(id, input, result);

        localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
        return result;
      } catch (err) {
        console.warn('Supabase update failed, falling back to local store:', err);
      }
    }

    // Local fallback update
    return this.updateLocalInvoiceAndClient(id, input);
  }

  private updateLocalInvoiceAndClient(
    id: string,
    input: NewInvoiceInput,
    exactResult?: InvoiceWithClient
  ): InvoiceWithClient {
    const rawClients = localStorage.getItem(LOCAL_CLIENTS_KEY);
    const rawInvoices = localStorage.getItem(LOCAL_INVOICES_KEY);

    const clients: Client[] = rawClients ? JSON.parse(rawClients) : [...INITIAL_CLIENTS];
    const invoices: Invoice[] = rawInvoices ? JSON.parse(rawInvoices) : [...INITIAL_INVOICES];

    const invIndex = invoices.findIndex((i) => i.id === id);
    const existingInv = invIndex >= 0 ? invoices[invIndex] : null;

    const daysOverdue = calculateDaysOverdue(input.dueDate);
    const currentStatus = existingInv?.status || 'pending';
    const resolvedStatus: InvoiceStatus =
      currentStatus === 'paid' ? 'paid' : (daysOverdue >= 30 ? 'escalated' : 'pending');

    let client = clients.find((c) => c.id === existingInv?.client_id);
    if (client) {
      client.name = input.clientName.trim();
      client.email = input.email.trim().toLowerCase();
      client.phone = input.phone.trim();
      client.company = input.company?.trim();
    } else {
      client = {
        id: existingInv?.client_id || `c-${Date.now()}`,
        name: input.clientName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        company: input.company?.trim(),
        created_at: new Date().toISOString(),
      };
      clients.push(client);
    }

    const updatedInvoice: Invoice = {
      ...(existingInv || {
        id,
        invoice_number: `INV-${new Date().getFullYear()}-001`,
        chase_count: 0,
        created_at: new Date().toISOString(),
      }),
      invoice_number: input.invoiceNumber?.trim() || existingInv?.invoice_number || `INV-${id.substring(0, 6)}`,
      client_id: client.id,
      amount: Number(input.amount),
      currency: input.currency,
      due_date: input.dueDate,
      status: resolvedStatus,
      payment_link: input.paymentLink === undefined
        ? existingInv?.payment_link
        : input.paymentLink.trim() || undefined,
      chase_schedule: input.chaseSchedule || 'standard',
      notes: input.notes?.trim() || '',
    };

    if (invIndex >= 0) {
      invoices[invIndex] = updatedInvoice;
    } else {
      invoices.unshift(updatedInvoice);
    }

    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients));
    localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(invoices));
    localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));

    return exactResult || {
      ...updatedInvoice,
      client,
      days_overdue: daysOverdue,
    };
  }

  // Update status (e.g. mark paid or reopen)
  public async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
    if (this.client) {
      try {
        const { error } = await this.client
          .from('invoices')
          .update({ status })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.warn('Supabase status update failed, saving locally:', err);
      }
    }

    // Always update local store to mirror state
    try {
      const rawInvoices = localStorage.getItem(LOCAL_INVOICES_KEY);
      if (rawInvoices) {
        const invoices: Invoice[] = JSON.parse(rawInvoices);
        const updated = invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv));
        localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(updated));
      }
    } catch {}

    localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
  }

  // Delete an invoice
  public async deleteInvoice(id: string): Promise<void> {
    if (this.client) {
      try {
        const { error } = await this.client
          .from('invoices')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.warn('Supabase delete failed, deleting locally:', err);
      }
    }

    try {
      const rawInvoices = localStorage.getItem(LOCAL_INVOICES_KEY);
      if (rawInvoices) {
        const invoices: Invoice[] = JSON.parse(rawInvoices);
        const filtered = invoices.filter((inv) => inv.id !== id);
        localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(filtered));
      }
    } catch {}

    localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
  }

  // Record a chase reminder sent
  public async recordChase(id: string): Promise<void> {
    const nowIso = new Date().toISOString();

    if (this.client) {
      try {
        // Query current chase count
        const { data } = await this.client.from('invoices').select('chase_count').eq('id', id).single();
        const nextCount = (data?.chase_count || 0) + 1;
        await this.client
          .from('invoices')
          .update({
            chase_count: nextCount,
            last_chased_at: nowIso,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase chase update failed, updating locally:', err);
      }
    }

    try {
      const rawInvoices = localStorage.getItem(LOCAL_INVOICES_KEY);
      if (rawInvoices) {
        const invoices: Invoice[] = JSON.parse(rawInvoices);
        const updated = invoices.map((inv) =>
          inv.id === id
            ? {
                ...inv,
                chase_count: (inv.chase_count || 0) + 1,
                last_chased_at: nowIso,
              }
            : inv
        );
        localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(updated));
      }
    } catch {}

    localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
  }

  // Real-time updates subscription
  public subscribeToChanges(onChange: () => void): () => void {
    // 1. Supabase Postgres Realtime channel
    if (this.client) {
      try {
        this.channel = this.client
          .channel('public:invoices_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'invoices' },
            () => {
              onChange();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'clients' },
            () => {
              onChange();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime channel subscription error:', err);
      }
    }

    // 2. Local EventTarget listener for instant state reflection
    const handleLocalChange = () => onChange();
    localEventTarget.addEventListener(LOCAL_CHANGE_EVENT, handleLocalChange);

    // 3. Storage event listener for multi-tab support
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === LOCAL_INVOICES_KEY || e.key === LOCAL_CLIENTS_KEY) {
        onChange();
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (this.channel) {
        this.channel.unsubscribe();
      }
      localEventTarget.removeEventListener(LOCAL_CHANGE_EVENT, handleLocalChange);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }

  // User Profile & Company Settings Management
  public async getProfile(userId: string): Promise<UserProfile> {
    const cacheKey = `duefox_profile_${userId}`;
    // Check local storage cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    // Check Supabase database
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          const profile: UserProfile = {
            id: data.id,
            full_name: data.full_name || '',
            company_name: data.company_name || '',
            business_email: data.business_email || '',
            phone: data.phone || '',
            default_currency: (data.default_currency as CurrencyCode) || 'USD',
            company_address: data.company_address || '',
            tax_id: data.tax_id || '',
            payment_gateway_url: data.payment_gateway_url || '',
            bank_holder_name: data.bank_holder_name || '',
            bank_name: data.bank_name || '',
            bank_account_number: data.bank_account_number || '',
            bank_swift_bic: data.bank_swift_bic || '',
            bank_routing_wise: data.bank_routing_wise || '',
            plan: (data.plan as PlanTier) || 'free',
            plan_status: data.plan_status || 'Active',
            updated_at: data.updated_at,
          };
          localStorage.setItem(cacheKey, JSON.stringify(profile));
          return profile;
        }
      } catch (err) {
        console.info('Supabase profiles table fetch note:', err);
      }
    }

    // Default seed profile for new user
    const defaultProfile: UserProfile = {
      id: userId,
      full_name: '',
      company_name: '',
      business_email: '',
      phone: '',
      default_currency: 'USD',
      company_address: '',
      tax_id: '',
      payment_gateway_url: '',
      bank_holder_name: '',
      bank_name: '',
      bank_account_number: '',
      bank_swift_bic: '',
      bank_routing_wise: '',
      plan: 'free',
      plan_status: 'Active',
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(cacheKey, JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  public async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const cacheKey = `duefox_profile_${profile.id}`;
    const updatedProfile: UserProfile = {
      ...profile,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(cacheKey, JSON.stringify(updatedProfile));

    if (this.client) {
      try {
        // Also update Supabase auth metadata
        await this.client.auth.updateUser({
          data: {
            full_name: profile.full_name,
            company_name: profile.company_name,
            default_currency: profile.default_currency,
          },
        });

        // Upsert into public.profiles table
        await this.client.from('profiles').upsert({
          id: profile.id,
          full_name: profile.full_name,
          company_name: profile.company_name,
          business_email: profile.business_email,
          phone: profile.phone,
          default_currency: profile.default_currency,
          company_address: profile.company_address || null,
          tax_id: profile.tax_id || null,
          payment_gateway_url: profile.payment_gateway_url || null,
          bank_holder_name: profile.bank_holder_name || null,
          bank_name: profile.bank_name || null,
          bank_account_number: profile.bank_account_number || null,
          bank_swift_bic: profile.bank_swift_bic || null,
          bank_routing_wise: profile.bank_routing_wise || null,
          plan: profile.plan || 'free',
          plan_status: profile.plan_status || 'Active',
          updated_at: updatedProfile.updated_at,
        });
      } catch (err) {
        console.warn('Supabase profile sync note:', err);
      }
    }

    localEventTarget.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
    return updatedProfile;
  }

  // Generate SQL migration snippet for the user's Supabase SQL Editor
  public getSqlMigrationScript(): string {
    return `-- ==========================================
-- dueFox.co Supabase Migration Schema
-- Run this in your Supabase Project's SQL Editor
-- ==========================================

-- 1. Create Profiles Table (User & Company Settings)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  business_email TEXT,
  phone TEXT,
  default_currency TEXT DEFAULT 'USD',
  company_address TEXT,
  tax_id TEXT,
  payment_gateway_url TEXT,
  bank_holder_name TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_swift_bic TEXT,
  bank_routing_wise TEXT,
  plan TEXT DEFAULT 'free',
  plan_status TEXT DEFAULT 'Active',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'escalated', 'paid')),
  payment_link TEXT,
  chase_count INTEGER NOT NULL DEFAULT 0,
  last_chased_at TIMESTAMPTZ,
  chase_schedule TEXT DEFAULT 'standard',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 6. Access Policies for Authenticated & Public Access
CREATE POLICY "Allow authenticated user profile" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Allow public read invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete invoices" ON public.invoices FOR DELETE USING (true);

-- 7. Enable Realtime Replication for instant live UI updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
`;
  }
}

export const supabaseService = new SupabaseService();

