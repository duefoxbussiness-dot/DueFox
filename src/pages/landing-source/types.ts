export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

export type InvoiceStatus = 'Paid' | 'Pending' | 'Critical';

export type ChaseSchedule = 'Gentle' | 'Standard' | 'Assertive';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAvatar: string;
  company: string;
  email: string;
  phone: string;
  workDescription: string;
  amount: number;
  currency: Currency;
  dueDate: string;
  status: InvoiceStatus;
  agingDays?: number;
  paymentLink?: string;
  chaseSchedule: ChaseSchedule;
  notes?: string;
  lastChaseDate?: string;
}

export interface BusinessProfile {
  companyName: string;
  representativeName: string;
  email: string;
  phone: string;
  defaultCurrency: Currency;
  address?: string;
  taxId?: string;
  directGatewayLink?: string;
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    swiftCode: string;
    routingOrIfsc?: string;
  };
  currentPlan: 'Starter' | 'Pro' | 'Agency';
}
