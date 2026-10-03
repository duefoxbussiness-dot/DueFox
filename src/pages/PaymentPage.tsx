import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_INVOICES } from './checkout-source/data/mockInvoices';
import { Invoice as CheckoutInvoice, InvoiceStatus as CheckoutInvoiceStatus } from './checkout-source/types/invoice';
import { PaymentPage as CheckoutPage } from './checkout-source/components/PaymentPage';
import { DemoController } from './checkout-source/components/DemoController';
import { supabaseService } from '../lib/supabase';
import { InvoiceWithClient, UserProfile } from '../types';
import './checkout-source/index.css';

type CheckoutInvoiceWithPaymentDetails = CheckoutInvoice & {
  paymentLink?: string;
  agency: CheckoutInvoice['agency'] & {
    paymentGatewayUrl?: string;
    upiId?: string;
  };
};

function toCheckoutInvoice(invoice: InvoiceWithClient, profile: UserProfile | null): CheckoutInvoiceWithPaymentDetails {
  const currencySymbol = invoice.currency === 'INR' ? '₹' : invoice.currency === 'EUR' ? '€' : invoice.currency === 'GBP' ? '£' : '$';
  const companyName = profile?.company_name || profile?.full_name || '';
  const savedGatewayUrl = profile?.payment_gateway_url?.trim() || '';
  const invoicePaymentLink = invoice.payment_link?.trim() || '';
  const isGeneratedDueFoxLink = invoicePaymentLink.startsWith(`${window.location.origin}/pay/`) ||
    /^https?:\/\/(?:pay\.)?duefox\.co\/(?:pay|inv)\//i.test(invoicePaymentLink);
  const extractUpiId = (url: string) => {
    if (!url.toLowerCase().startsWith('upi://')) return '';
    try {
      return new URL(url).searchParams.get('pa') || '';
    } catch {
      return '';
    }
  };
  const upiId = profile?.upi_id?.trim() ||
    extractUpiId(savedGatewayUrl) || extractUpiId(invoicePaymentLink);
  const paymentGatewayUrl = savedGatewayUrl.toLowerCase().startsWith('upi://') ? '' : savedGatewayUrl;
  const description = invoice.notes?.trim() || 'Professional services';
  const dueDate = new Date(`${invoice.due_date}T00:00:00`);
  const issueDate = new Date(invoice.created_at);
  const status: CheckoutInvoiceStatus = invoice.status === 'paid'
    ? 'paid'
    : invoice.days_overdue > 0
      ? 'overdue'
      : invoice.days_overdue > -7
        ? 'due_soon'
        : 'pending';

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    paymentLink: invoicePaymentLink && !isGeneratedDueFoxLink && !invoicePaymentLink.toLowerCase().startsWith('upi://') ? invoicePaymentLink : undefined,
    client: {
      name: invoice.client.name,
      company: invoice.client.company || '',
      email: invoice.client.email,
      phone: invoice.client.phone || '',
    },
    agency: {
      name: companyName,
      legalName: companyName,
      paymentGatewayUrl,
      upiId,
      representative: profile?.full_name || '',
      email: profile?.business_email || '',
      phone: profile?.phone || '',
      taxId: profile?.tax_id || '',
      address: profile?.company_address || '',
      city: '',
      country: '',
      bankDetails: {
        accountHolder: profile?.bank_holder_name || '',
        bankName: profile?.bank_name || '',
        accountNumber: profile?.bank_account_number || '',
        swiftBic: profile?.bank_swift_bic || '',
        routingOrIfsc: profile?.bank_routing_wise?.startsWith('@') ? '' : profile?.bank_routing_wise || '',
        wiseTag: profile?.bank_routing_wise?.startsWith('@') ? profile.bank_routing_wise : undefined,
      },
    },
    issueDate: Number.isNaN(issueDate.getTime()) ? '' : issueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    dueDate: Number.isNaN(dueDate.getTime()) ? invoice.due_date : dueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    status,
    daysOverdue: Math.max(invoice.days_overdue, 0),
    currency: invoice.currency,
    currencySymbol,
    items: [{ id: invoice.id, description, quantity: 1, unitPrice: invoice.amount, amount: invoice.amount }],
    subtotal: invoice.amount,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: invoice.amount,
    notes: invoice.notes,
    workSummary: `Work: ${description}`,
    chaseCadence: invoice.chase_schedule ? invoice.chase_schedule[0].toUpperCase() + invoice.chase_schedule.slice(1) as 'Gentle' | 'Standard' | 'Assertive' : 'Standard',
  };
}

export default function PaymentPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [selectedInvoice, setSelectedInvoice] = useState<CheckoutInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusOverride, setStatusOverride] = useState<CheckoutInvoiceStatus>('pending');
  const [isSimulatedPaid, setIsSimulatedPaid] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');

    supabaseService.fetchPublicInvoice(decodeURIComponent(id))
      .then((result) => {
        if (!active) return;
        if (result) {
          const checkoutInvoice = toCheckoutInvoice(result.invoice, result.profile);
          setSelectedInvoice(checkoutInvoice);
          setStatusOverride(checkoutInvoice.status);
          setIsSimulatedPaid(checkoutInvoice.status === 'paid');
          return;
        }

        const demoInvoice = MOCK_INVOICES.find((invoice) => invoice.id.toLowerCase() === decodeURIComponent(id).toLowerCase());
        if (demoInvoice) {
          setSelectedInvoice(demoInvoice);
          setStatusOverride(demoInvoice.status);
          setIsSimulatedPaid(demoInvoice.status === 'paid');
        } else {
          setSelectedInvoice(null);
          setIsSimulatedPaid(false);
          setLoadError('This invoice could not be found or is not publicly available.');
        }
      })
      .catch(() => {
        if (!active) return;
        const demoInvoice = MOCK_INVOICES.find((invoice) => invoice.id.toLowerCase() === decodeURIComponent(id).toLowerCase());
        if (demoInvoice) {
          setSelectedInvoice(demoInvoice);
          setStatusOverride(demoInvoice.status);
          setIsSimulatedPaid(demoInvoice.status === 'paid');
        } else {
          setSelectedInvoice(null);
          setIsSimulatedPaid(false);
          setLoadError('Unable to load this invoice. Please try again later.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm text-slate-600">Loading invoice...</div>;
  }

  if (!selectedInvoice) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center text-sm text-slate-600">{loadError}</div>;
  }

  const isDemoInvoice = MOCK_INVOICES.some((invoice) => invoice.id === selectedInvoice.id);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {isDemoInvoice && (
        <DemoController
          currentInvoice={selectedInvoice}
          onSelectInvoice={(inv) => setSelectedInvoice(inv)}
          statusOverride={statusOverride}
          onChangeStatusOverride={(st) => {
            setStatusOverride(st);
            setIsSimulatedPaid(st === 'paid');
          }}
          isPaidSuccessView={isSimulatedPaid}
          onToggleSuccessView={setIsSimulatedPaid}
        />
      )}

      {/* Main Payment Checkout Page */}
      <CheckoutPage
        invoice={selectedInvoice}
        statusOverride={statusOverride}
        isSimulatedPaid={isSimulatedPaid}
        onResetPaidState={() => {
          setIsSimulatedPaid(false);
          setStatusOverride(selectedInvoice.status);
        }}
        onPaymentComplete={async (info) => {
          if (!isDemoInvoice) {
            await supabaseService.updateInvoiceStatus(selectedInvoice.id, 'paid');
          }
          setIsSimulatedPaid(true);
          setStatusOverride('paid');
          setSelectedInvoice((currentInvoice) => currentInvoice ? {
            ...currentInvoice,
            status: 'paid',
            paymentDetails: {
              transactionId: info.transactionId,
              method: info.method,
              paidAt: info.date,
            },
          } : currentInvoice);
        }}
      />
    </div>
  );
}
