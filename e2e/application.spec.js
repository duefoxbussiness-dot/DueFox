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

test('keeps the initial page background aligned with the saved theme across reloads and viewports', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('e2e_theme_initialized')) return;
    localStorage.setItem('duefox_theme', 'dark');
    sessionStorage.setItem('e2e_theme_initialized', 'true');
  });

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => {
      const root = document.documentElement;
      const background = getComputedStyle(document.body).backgroundColor;
      return root.classList.contains('dark') &&
        getComputedStyle(root).backgroundColor === background &&
        getComputedStyle(document.getElementById('root')).backgroundColor === background;
    })).toBe(true);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 23, 42)');
    await page.reload();
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 23, 42)');
  }

  await page.evaluate(() => localStorage.setItem('duefox_theme', 'light'));
  await page.reload();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 250, 252)');
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

test('keeps dashboard pricing compact and usable on mobile', async ({ page }) => {
  await openDemoDashboard(page);
  await page.getByRole('button', { name: 'Upgrade Plan' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Company & Payment Settings' })).toBeVisible();
  await expect(dialog.locator('article')).toHaveCount(3);
  await expect(dialog.getByText('Recover just 1 unpaid $100 invoice, and DueFox pays for itself for an entire year.')).toHaveCount(0);
  await expect(dialog.getByText('14-Day Money-Back Guarantee')).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Compare All Features' })).toHaveCount(0);
  await expect(dialog.getByRole('heading', { name: 'Pricing FAQs' })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  const dialogBounds = await dialog.boundingBox();
  expect(dialogBounds).not.toBeNull();
  expect(dialogBounds.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  const cardTops = await dialog.locator('article').evaluateAll((cards) =>
    cards.map((card) => card.getBoundingClientRect().top)
  );
  expect(cardTops[0]).toBeLessThan(cardTops[1]);
  expect(cardTops[1]).toBeLessThan(cardTops[2]);
});

test('keeps live demo settings pricing compact on mobile', async ({ page }) => {
  await page.goto('/#dashboard');
  await page.getByRole('button', { name: 'Upgrade Plan' }).click();

  const annualBilling = page.getByRole('button', { name: /Annual.*Save 20%/ });
  await expect(annualBilling).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compare All Features' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Pricing FAQs' })).toHaveCount(0);
  await expect(page.getByText('Cancel Anytime in 1-Click')).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const cards = page.locator('article');
  await expect(cards).toHaveCount(3);
  const cardTops = await cards.evaluateAll((items) => items.map((card) => card.getBoundingClientRect().top));
  expect(cardTops[0]).toBeLessThan(cardTops[1]);
  expect(cardTops[1]).toBeLessThan(cardTops[2]);
});

test('opens the add invoice modal with the expected fields', async ({ page }) => {
  await openDemoDashboard(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Add Invoice' }).click();

  const dialog = page.getByRole('dialog');
  const dialogBounds = await dialog.boundingBox();
  expect(dialogBounds).not.toBeNull();
  expect(dialogBounds.width).toBeLessThanOrEqual(390);
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
