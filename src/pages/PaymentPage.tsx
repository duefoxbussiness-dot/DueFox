import React, { useState, useEffect } from 'react';
import { MOCK_INVOICES } from './checkout-source/data/mockInvoices';
import { Invoice, InvoiceStatus } from './checkout-source/types/invoice';
import { PaymentPage as CheckoutPage } from './checkout-source/components/PaymentPage';
import { DemoController } from './checkout-source/components/DemoController';
import './checkout-source/index.css';

export default function PaymentPage() {
  // Identify invoice from URL hash or query param or default to Vikram Patel's invoice
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>(() => {
    try {
      const hash = window.location.hash;
      const pathId = window.location.pathname.match(/^\/pay\/([^/]+)/)?.[1];
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('invoice');

      if (pathId) {
        const found = MOCK_INVOICES.find((inv) => inv.id.toLowerCase() === pathId.toLowerCase());
        if (found) return found;
      }

      if (queryId) {
        const found = MOCK_INVOICES.find((inv) => inv.id.toLowerCase() === queryId.toLowerCase());
        if (found) return found;
      }

      if (hash && hash.includes('/pay/')) {
        const idFromHash = hash.split('/pay/')[1]?.split('?')[0];
        if (idFromHash) {
          const found = MOCK_INVOICES.find((inv) => inv.id.toLowerCase() === idFromHash.toLowerCase());
          if (found) return found;
        }
      }
    } catch {
      // Fallback
    }
    return MOCK_INVOICES[0]; // Default to INV-2026-084 (Vikram Patel)
  });

  const [statusOverride, setStatusOverride] = useState<InvoiceStatus>(selectedInvoice.status);
  const [isSimulatedPaid, setIsSimulatedPaid] = useState(false);

  // Sync hash when invoice changes
  useEffect(() => {
    setStatusOverride(selectedInvoice.status);
    setIsSimulatedPaid(false);
    if (!window.location.hash.includes(`/pay/${selectedInvoice.id}`)) {
      window.location.hash = `/pay/${selectedInvoice.id}`;
    }
  }, [selectedInvoice]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Interactive tester bar for reviewer / user demo */}
      <DemoController
        currentInvoice={selectedInvoice}
        onSelectInvoice={(inv) => setSelectedInvoice(inv)}
        statusOverride={statusOverride}
        onChangeStatusOverride={(st) => {
          setStatusOverride(st);
          if (st === 'paid') {
            setIsSimulatedPaid(true);
          } else {
            setIsSimulatedPaid(false);
          }
        }}
        isPaidSuccessView={isSimulatedPaid}
        onToggleSuccessView={(val) => setIsSimulatedPaid(val)}
      />

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
