import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_INVOICES } from './checkout-source/data/mockInvoices';
import { Invoice as CheckoutInvoice, InvoiceStatus as CheckoutInvoiceStatus } from './checkout-source/types/invoice';
import { PaymentPage as CheckoutPage } from './checkout-source/components/PaymentPage';
import { DemoController } from './checkout-source/components/DemoController';
import { supabaseService } from '../lib/supabase';
import { InvoiceWithClient, UserProfile } from '../types';
import './checkout-source/index.css';

function toCheckoutInvoice(invoice: InvoiceWithClient, profile: UserProfile | null): CheckoutInvoice {
  const currencySymbol = invoice.currency === 'INR' ? '₹' : invoice.currency === 'EUR' ? '€' : invoice.currency === 'GBP' ? '£' : '$';
  const companyName = profile?.company_name || profile?.full_name || '';
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
    client: {
      name: invoice.client.name,
      company: invoice.client.company || '',
      email: invoice.client.email,
      phone: invoice.client.phone || '',
    },
    agency: {
      name: companyName,
      legalName: companyName,
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
        routingOrIfsc: profile?.bank_routing_wise || '',
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
          return;
        }

        const demoInvoice = MOCK_INVOICES.find((invoice) => invoice.id.toLowerCase() === decodeURIComponent(id).toLowerCase());
        if (demoInvoice) {
          setSelectedInvoice(demoInvoice);
          setStatusOverride(demoInvoice.status);
        } else {
          setSelectedInvoice(null);
          setLoadError('This invoice could not be found or is not publicly available.');
        }
      })
      .catch(() => {
        if (!active) return;
        const demoInvoice = MOCK_INVOICES.find((invoice) => invoice.id.toLowerCase() === decodeURIComponent(id).toLowerCase());
        if (demoInvoice) {
          setSelectedInvoice(demoInvoice);
          setStatusOverride(demoInvoice.status);
        } else {
          setSelectedInvoice(null);
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
        onPaymentComplete={(info) => {
          setIsSimulatedPaid(true);
          setStatusOverride('paid');
        }}
      />
    </div>
  );
}
