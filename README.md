<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5299f9ef-5102-4608-84b0-bd218bbe73f9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## End-to-End Tests

Install the Playwright Chromium browser once:
`npx playwright install chromium`

Run the end-to-end suite:
`npm run test`

## Overdue Invoice Reminders

Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GMAIL_USER`, and
`GMAIL_APP_PASSWORD` in `.env` using [.env.example](./.env.example) as a template.
Optionally set `SUPABASE_SERVICE_ROLE_KEY` to let the server-side script bypass
Supabase row-level security; if it is unset, the script uses the anon key.
For this email-only test, WhatsApp sending is disabled. The script sends Gmail
reminders to unpaid invoices due today or earlier: Polite for 0–7 days overdue,
Firm for 8–29 days, and Strict for 30 or more days. It increments
`chase_count` and updates `last_chased_at` after the email sends successfully.

Run it with Node.js 20 or later:

```sh
npm run reminders
```

Run this script only on a trusted server. The service-role key bypasses RLS:
never expose it to browser/client code or commit it. Keep Gmail credentials
server-side and do not commit `.env`.
