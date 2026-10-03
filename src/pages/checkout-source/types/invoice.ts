export type InvoiceStatus = 'overdue' | 'due_soon' | 'pending' | 'paid';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface InvoiceItem {
  id: string;
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface CompanyProfile {
  name: string;
  legalName: string;
  representative: string;
  email: string;
  phone: string;
  taxId: string; // GST / EIN / VAT
  address: string;
  city: string;
  country: string;
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    swiftBic: string;
    routingOrIfsc: string;
    wiseTag?: string;
  };
}

export interface ClientProfile {
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  gstOrTaxId?: string;
}

export interface Invoice {
  id: string; // e.g. "INV-2026-084"
  invoiceNumber?: string;
  client: ClientProfile;
  agency: CompanyProfile;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  daysOverdue: number;
  currency: CurrencyCode;
  currencySymbol: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.18 or 0
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  workSummary: string;
  chaseCadence?: 'Gentle' | 'Standard' | 'Assertive';
  paymentDetails?: {
    paidAt?: string;
    transactionId?: string;
    method?: string;
    receiptId?: string;
  };
}
