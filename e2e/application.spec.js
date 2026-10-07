import { expect, test } from '@playwright/test';

async function openDemoDashboard(page) {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Instant Demo Login' }).click();
  await expect(page.getByRole('heading', { name: 'Invoice Accounts & Chase Queue' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173).*/, (route) => route.abort());
});

test('renders the demo dashboard and invoice count', async ({ page }) => {
  await openDemoDashboard(page);

  await expect(page.getByRole('button', { name: 'All Invoices (3)' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Jordan Lee' })).toBeVisible();
});

test('updates shared pricing for annual billing and expands comparisons and FAQs', async ({ page }) => {
  await page.goto('/');

  const proPlan = page.locator('article').filter({ hasText: 'Pro Chaser' });
  const agencyPlan = page.locator('article').filter({ hasText: 'Agency' });
  await expect(proPlan.getByText('$9', { exact: true })).toBeVisible();
  await expect(agencyPlan.getByText('$49', { exact: true })).toBeVisible();
  await expect(page.getByText('Recover just 1 unpaid $100 invoice, and DueFox pays for itself for an entire year.')).toBeVisible();

  await page.getByRole('button', { name: /Annual.*Save 20%/ }).click();
  await expect(proPlan.getByText('$7', { exact: true })).toBeVisible();
  await expect(proPlan.getByText('Billed $84/year')).toBeVisible();
  await expect(agencyPlan.getByText('$39', { exact: true })).toBeVisible();
  await expect(agencyPlan.getByText('Billed $468/year')).toBeVisible();

  await page.getByRole('button', { name: 'Compare All Features' }).click();
  const invoiceLimitRow = page.getByRole('row').filter({ hasText: 'Active invoices' });
  await expect(invoiceLimitRow.getByText('10')).toBeVisible();
  await expect(invoiceLimitRow.getByText('Unlimited')).toHaveCount(2);

  await page.getByRole('button', { name: 'Can I switch plans anytime?' }).click();
  await expect(page.getByText('Yes, upgrade or downgrade instantly whenever your needs change.')).toBeVisible();
});

test('opens the add invoice modal with the expected fields', async ({ page }) => {
  await openDemoDashboard(page);
  await page.getByRole('button', { name: 'Add Invoice' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Add New Invoice' })).toBeVisible();
  await expect(dialog.getByPlaceholder('e.g. John Doe or Acme Corp')).toBeVisible();
  await expect(dialog.getByPlaceholder('billing@client.com')).toBeVisible();
  await expect(dialog.getByPlaceholder('2500')).toBeVisible();
  await expect(dialog.locator('input[type="date"]')).toBeVisible();
  await expect(dialog.getByPlaceholder(/Q3 Software development sprint/)).toBeVisible();
});

test('falls back to the email composer when chase webhook dispatch fails', async ({ page }) => {
  await page.addInitScript(() => {
    window.__e2eOpenedUrls = [];
    window.open = (url) => {
      let popupUrl = String(url || 'about:blank');
      const popup = {
        closed: false,
        close() {
          this.closed = true;
        },
      };
      Object.defineProperty(popup, 'location', {
        get() {
          return {
            set href(value) {
              popupUrl = String(value);
              window.__e2eOpenedUrls.push(popupUrl);
            },
          };
        },
      });
      window.__e2eOpenedUrls.push(popupUrl);
      return popup;
    };
  });
  await page.route('**/__e2e__/dispatch', (route) => route.abort('failed'));
  await openDemoDashboard(page);

  const invoiceRow = page.getByRole('row').filter({ hasText: 'Jordan Lee' });
  await expect(invoiceRow.getByText('2 chases sent')).toBeVisible();
  await invoiceRow.getByRole('button', { name: 'Chase' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Trigger Automated Chase Reminder' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Dispatch Chase Now' }).click();

  await expect.poll(async () => page.evaluate(() => window.__e2eOpenedUrls)).toEqual(
    expect.arrayContaining([expect.stringMatching(/^mailto:jordan@acmecorp\.example\?subject=/)])
  );
  await expect(invoiceRow.getByText('3 chases sent')).toBeVisible();
  await expect(dialog.getByText(/Failed to fetch/)).toHaveCount(0);
});

test('shows invoice-specific wire and UPI payment details on the public page', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const client = {
      id: 'e2e-client',
      user_id: 'e2e-user',
      name: 'Taylor Client',
      email: 'taylor@example.test',
      phone: '',
      company: 'Example Co',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('duefox_local_clients_v1', JSON.stringify([client]));
    localStorage.setItem('duefox_local_invoices_v1', JSON.stringify([{
      id: 'e2e-payment-invoice',
      user_id: 'e2e-user',
      client_id: client.id,
      invoice_number: 'E2E-INV-01',
      amount: 1200,
      currency: 'INR',
      due_date: '2026-12-31',
      status: 'pending',
      chase_count: 0,
      chase_schedule: 'standard',
      notes: 'E2E payment details',
      created_at: new Date().toISOString(),
    }]));
    localStorage.setItem('duefox_profile_e2e-user', JSON.stringify({
      id: 'e2e-user',
      full_name: 'Taylor Agency',
      company_name: 'Taylor Agency',
      business_email: 'billing@example.test',
      phone: '',
      default_currency: 'INR',
      upi_id: 'taylor@upi',
      bank_holder_name: 'Taylor Agency',
      bank_name: 'Example Bank',
      bank_account_number: '123456789012',
      bank_swift_bic: 'EXAMP123',
      bank_routing_wise: '110000000',
    }));
  });
  await page.goto('/pay/e2e-payment-invoice');

  await expect(page.getByText('E2E-INV-01').first()).toBeVisible();
  await page.getByRole('button', { name: 'Wire / ACH' }).click();
  await expect(page.getByText('Example Bank')).toBeVisible();
  await expect(page.getByText('123456789012')).toBeVisible();

  await page.getByRole('button', { name: 'UPI / QR' }).click();
  await expect(page.getByText('Creator UPI payment details')).toBeVisible();
  await expect(page.getByText('taylor@upi')).toBeVisible();
});
