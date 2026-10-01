export type InvoiceStatus = 'pending' | 'escalated' | 'paid';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';
export type ThemeMode = 'dark' | 'light';
export type PlanTier = 'free' | 'pro' | 'agency';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  // Tab 1: Business Profile
  full_name: string;
  company_name: string;
  business_email: string;
  phone: string;
  default_currency: CurrencyCode;
  company_address?: string;
  tax_id?: string;

  // Tab 2: Global Payment Methods
  payment_gateway_url?: string; // Stripe Payment Link / PayPal.me / Custom Gateway URL
  bank_holder_name?: string;
  bank_name?: string;
  bank_account_number?: string; // Account Number / IBAN
  bank_swift_bic?: string; // SWIFT / BIC Code
  bank_routing_wise?: string; // Wise Tag / ACH Details (Optional)

  // Tab 3: Subscription & Plan Status
  plan?: PlanTier;
  plan_status?: string;

  updated_at?: string;
}


export interface Client {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id?: string;
  client_id: string;
  invoice_number: string;
  amount: number;
  currency: CurrencyCode;
  due_date: string; // ISO date string YYYY-MM-DD
  status: InvoiceStatus;
  payment_link?: string;
  chase_count: number;
  last_chased_at?: string;
  chase_schedule?: 'gentle' | 'standard' | 'assertive';
  notes?: string;
  created_at: string;
}

export interface InvoiceWithClient extends Invoice {
  client: Client;
  days_overdue: number;
}

export interface NewInvoiceInput {
  clientName: string;
  email: string;
  phone: string;
  company?: string;
  amount: number;
  currency: CurrencyCode;
  dueDate: string;
  paymentLink?: string;
  chaseSchedule?: 'gentle' | 'standard' | 'assertive';
  notes?: string;
}

export interface DashboardStats {
  totalOverdueUSD: number;
  totalOverdueEUR?: number;
  totalOverdueGBP?: number;
  totalOverdueINR: number;
  pendingCount: number;
  escalatedCount: number;
  paidCount: number;
  totalPaidUSD: number;
  totalPaidEUR?: number;
  totalPaidGBP?: number;
  totalPaidINR: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isCustom: boolean;
}
