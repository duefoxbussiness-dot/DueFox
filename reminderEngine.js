import 'dotenv/config';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { isBoom } from '@hapi/boom';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import pino from 'pino';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PAGE_SIZE = 500;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WHATSAPP_CONNECTION_TIMEOUT_MS = 15000;
const authDirectory = join(dirname(fileURLToPath(import.meta.url)), 'auth_info_baileys');
let whatsappConnectionPromise;
let whatsappSocket;
let whatsappMessageSent = false;

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function formatWhatsAppPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return digits;
}

function getConfiguration() {
  const gmailAppPassword =
    (process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD)?.trim();
  if (!gmailAppPassword) {
    throw new Error('Missing required environment variable: GMAIL_PASS or GMAIL_APP_PASSWORD');
  }

  return {
    supabaseUrl: requiredEnv('VITE_SUPABASE_URL'),
    supabaseKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      requiredEnv('VITE_SUPABASE_ANON_KEY'),
    gmailUser: requiredEnv('GMAIL_USER'),
    gmailAppPassword,
  };
}

function getDaysOverdue(dueDate, today) {
  const dueDateMs = Date.parse(`${dueDate}T00:00:00.000Z`);
  if (!Number.isFinite(dueDateMs)) {
    throw new Error(`Invalid invoice due date: ${dueDate}`);
  }

  return Math.floor((Date.parse(`${today}T00:00:00.000Z`) - dueDateMs) / DAY_IN_MS);
}

function getTone(daysOverdue) {
  if (daysOverdue >= 30) return 'Strict';
  if (daysOverdue >= 8) return 'Firm';
  return 'Polite';
}

function getPaymentLink(invoice) {
  const paymentLink = invoice.payment_link?.trim();
  return paymentLink ? `\nPayment link: ${paymentLink}` : '';
}

function formatInvoiceAmount(invoice) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: invoice.currency || 'USD',
  }).format(Number(invoice.amount));
}

function getEmailHtml(invoice, client) {
  const clientName = client.name || '';
  const companyName = client.company || 'DueFox.co';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Overdue Invoice Reminder</title>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

    <!-- Hidden Preheader Text -->
    <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px;">
        Invoice #${invoice.invoice_number} from ${companyName} is outstanding: ${invoice.currency} ${invoice.amount}.
    </div>

    <!-- Main Centered Container -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 10px 0;">

                <!-- Main Card (Tool UI Matched Light Theme) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05); text-align: center;">
                    <tr>
                        <td style="padding: 32px 24px;">

                            <!-- Logo Badge -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 12px;">
                                        <div style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; font-size: 20px; font-weight: 800; padding: 10px 22px; border-radius: 12px; letter-spacing: -0.5px;">
                                            dueFox.co
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-size: 12px; color: #64748b; padding-bottom: 20px;">
                                        Sent on behalf of ${companyName}
                                    </td>
                                </tr>
                            </table>

                            <!-- Hero Title & Subtext -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3; padding-bottom: 12px; letter-spacing: -0.3px;">
                                        Action Required: Overdue Invoice Reminder
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-size: 14px; color: #475569; line-height: 1.6; padding-bottom: 8px;">
                                        Hi <strong style="color: #0f172a;">${clientName}</strong>, this is an automated notification regarding your pending invoice with ${companyName}.
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-size: 13.5px; color: #64748b; line-height: 1.6; padding-bottom: 24px;">
                                        This invoice was issued by <strong style="color: #334155;">${companyName}</strong>.
                                    </td>
                                </tr>
                            </table>

                            <!-- Invoice Card Table (Left-Aligned Values with Padding Gap) -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">

                                <!-- Issuer / Company -->
                                <tr>
                                    <td style="padding: 12px 10px 12px 14px; color: #475569; font-size: 13.5px; font-weight: 500; border-bottom: 1px solid #e2e8f0; text-align: left; white-space: nowrap; width: 1%;">
                                        Issuer / Company :
                                    </td>
                                    <td style="padding: 12px 14px 12px 8px; color: #0f172a; font-size: 13.5px; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: left; word-break: break-word;">
                                        ${companyName}
                                    </td>
                                </tr>

                                <!-- Invoice Number -->
                                <tr>
                                    <td style="padding: 12px 10px 12px 14px; color: #475569; font-size: 13.5px; font-weight: 500; border-bottom: 1px solid #e2e8f0; text-align: left; white-space: nowrap; width: 1%;">
                                        Invoice Number :
                                    </td>
                                    <td style="padding: 12px 14px 12px 8px; color: #0f172a; font-size: 13.5px; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: left; word-break: break-word;">
                                        #${invoice.invoice_number}
                                    </td>
                                </tr>

                                <!-- Service Description -->
                                <tr>
                                    <td style="padding: 12px 10px 12px 14px; color: #475569; font-size: 13.5px; font-weight: 500; border-bottom: 1px solid #e2e8f0; text-align: left; vertical-align: top; white-space: nowrap; width: 1%;">
                                        Service Description :
                                    </td>
                                    <td style="padding: 12px 14px 12px 8px; color: #0f172a; font-size: 13.5px; font-weight: 400; line-height: 1.5; border-bottom: 1px solid #e2e8f0; text-align: left; word-wrap: break-word; overflow-wrap: break-word;">
                                        ${invoice.notes || ''}
                                    </td>
                                </tr>

                                <!-- Due Date -->
                                <tr>
                                    <td style="padding: 12px 10px 12px 14px; color: #475569; font-size: 13.5px; font-weight: 500; border-bottom: 1px solid #e2e8f0; text-align: left; white-space: nowrap; width: 1%;">
                                        Due Date :
                                    </td>
                                    <td style="padding: 12px 14px 12px 8px; color: #0f172a; font-size: 13.5px; font-weight: 600; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                        ${invoice.due_date}
                                    </td>
                                </tr>

                                <!-- Amount Outstanding -->
                                <tr>
                                    <td style="padding: 12px 10px 12px 14px; color: #475569; font-size: 13.5px; font-weight: 500; text-align: left; white-space: nowrap; width: 1%;">
                                        Amount Outstanding :
                                    </td>
                                    <td style="padding: 12px 14px 12px 8px; color: #f97316; font-size: 16px; font-weight: 700; text-align: left; word-break: break-word;">
                                        ${invoice.currency} ${invoice.amount}
                                    </td>
                                </tr>
                            </table>

                            <!-- Complete Payment Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 8px 0 24px 0;">
                                        <a href="${invoice.payment_link}" target="_blank" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 15px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);">
                                            Complete Payment Now &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Things to know -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: left;">
                                <tr>
                                    <td style="font-size: 14px; font-weight: 600; color: #0f172a; padding-bottom: 8px;">
                                        Things to know
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size: 13px; color: #64748b; line-height: 1.6; padding-bottom: 4px;">
                                        &bull; Payments are processed securely via our encrypted payment gateway.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size: 13px; color: #64748b; line-height: 1.6; padding-bottom: 4px;">
                                        &bull; Have questions? Reply directly to this email to contact ${companyName}.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size: 13px; color: #64748b; line-height: 1.6; padding-bottom: 20px;">
                                        &bull; If you have already completed this transaction in the last 24 hours, please disregard this automated message.
                                    </td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
                                <tr>
                                    <td align="center" style="font-size: 12px; color: #64748b; line-height: 1.5;">
                                        &copy; 2026 DueFox.co &bull; Automated Payment Recovery System
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-size: 11px; color: #94a3b8; padding-top: 4px;">
                                        Sent on behalf of ${companyName}
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>
</html>`;
}

function getReminder(invoice, client, daysOverdue, tone) {
  const invoiceNumber = invoice.invoice_number || `Invoice ${invoice.id}`;
  const amount = formatInvoiceAmount(invoice);
  const paymentLink = getPaymentLink(invoice);

  if (tone === 'Strict') {
    return {
      subject: `Urgent: ${invoiceNumber} is ${daysOverdue} days overdue`,
      email: `Dear ${client.name},\n\nOur records show that invoice ${invoiceNumber} for ${amount}, due on ${invoice.due_date}, is now ${daysOverdue} days overdue. Please arrange payment immediately.${paymentLink}\n\nIf you have already paid, please disregard this notice and let us know so we can update our records.\n\nRegards,\nAccounts Receivable`,
      html: getEmailHtml(invoice, client),
    };
  }

  if (tone === 'Firm') {
    return {
      subject: `Payment requested: overdue invoice ${invoiceNumber}`,
      email: `Hello ${client.name},\n\nInvoice ${invoiceNumber} for ${amount} was due on ${invoice.due_date} and is now ${daysOverdue} days overdue. Please arrange payment promptly.${paymentLink}\n\nIf payment has already been sent, please let us know.\n\nRegards,\nAccounts Receivable`,
      html: getEmailHtml(invoice, client),
    };
  }

  return {
    subject: `Friendly reminder: invoice ${invoiceNumber}`,
    email: `Hello ${client.name},\n\nThis is a friendly reminder that invoice ${invoiceNumber} for ${amount} was due on ${invoice.due_date}.${paymentLink}\n\nIf you have already paid, please disregard this message. Let us know if you need another copy of the invoice.\n\nThank you,\nAccounts Receivable`,
    html: getEmailHtml(invoice, client),
  };
}

function getClient(invoice) {
  const relatedClients = Array.isArray(invoice.clients) ? invoice.clients : [invoice.clients];
  const client = relatedClients.length === 1 ? relatedClients[0] : null;
  const email = client?.id === invoice.client_id ? client.email?.trim() : '';
  if (!client || client.id !== invoice.client_id || !email) {
    console.error(`[ReminderEngine] Invoice ${invoice.id} has no client email address; skipping.`);
    return null;
  }
  return { ...client, email };
}

async function fetchOverdueInvoices(supabase, today) {
  const invoices = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, client_id, invoice_number, amount, currency, due_date, status, payment_link, notes, chase_count, last_chased_at, clients:clients(id, name, email, phone, company)')
      .in('status', ['pending', 'escalated'])
      .lte('due_date', today)
      .order('due_date', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Could not fetch overdue invoices: ${error.message}`);
    }

    invoices.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) {
      return invoices;
    }
  }
}

async function processInvoice(invoice, dependencies) {
  const { supabase, transporter, configuration, today } = dependencies;
  const daysOverdue = getDaysOverdue(invoice.due_date, today);
  if (daysOverdue < 0) return 'skipped';

  if (invoice.last_chased_at && invoice.last_chased_at.slice(0, 10) === today) {
    return 'skipped';
  }

  const client = getClient(invoice);
  if (!client) return 'skipped';

  const tone = getTone(daysOverdue);
  const reminder = getReminder(invoice, client, daysOverdue, tone);

  await transporter.sendMail({
    from: configuration.gmailUser,
    to: client.email,
    subject: reminder.subject,
    text: reminder.email,
    html: reminder.html,
  });

  let whatsappSent = false;
  try {
    whatsappSent = await sendWhatsAppReminder(invoice, client);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[ReminderEngine] WhatsApp reminder for invoice ${invoice.id} failed; email was delivered: ${message}`,
    );
  }

  const { error } = await supabase
    .from('invoices')
    .update({
      chase_count: Number(invoice.chase_count || 0) + 1,
      last_chased_at: new Date().toISOString(),
    })
    .eq('id', invoice.id);

  if (error) {
    throw new Error(`Could not record reminder for invoice ${invoice.id}: ${error.message}`);
  }

  console.info(
    `[ReminderEngine] Sent ${tone} email reminder for invoice ${invoice.id} (${daysOverdue} days overdue); WhatsApp ${whatsappSent ? 'sent' : 'not sent'}; invoice update recorded.`,
  );
  return 'sent';
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(authDirectory);
  return new Promise((resolve, reject) => {
    let settled = false;
    let socket;
    let timeout;
    const finish = (connection) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(connection);
    };
    timeout = setTimeout(() => {
      console.warn('[ReminderEngine] WhatsApp connection timed out; continuing with email reminders only.');
      socket?.end();
      finish(null);
    }, WHATSAPP_CONNECTION_TIMEOUT_MS);

    try {
      socket = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
      });
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
      return;
    }

    socket.ev.on('creds.update', () => {
      saveCreds().catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ReminderEngine] Could not save WhatsApp session credentials: ${message}`);
      });
    });
    socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        console.warn('[ReminderEngine] WhatsApp session is not authenticated; pair it with whatsappAuth.js. Continuing with email reminders only.');
        socket.end();
        finish(null);
      } else if (connection === 'open') {
        console.info('[ReminderEngine] WhatsApp connected.');
        whatsappSocket = socket;
        finish(socket);
      } else if (connection === 'close') {
        const disconnectError = lastDisconnect?.error;
        const statusCode = isBoom(disconnectError)
          ? disconnectError.output.statusCode
          : undefined;
        const isConflict = statusCode === DisconnectReason.connectionReplaced;
        const reason = isConflict
          ? 'connection conflict (another WhatsApp session replaced this one)'
          : statusCode === DisconnectReason.loggedOut
            ? 'session logged out'
            : disconnectError instanceof Error
              ? disconnectError.message
              : 'connection closed';
        if (whatsappSocket === socket) whatsappSocket = undefined;
        whatsappConnectionPromise = Promise.resolve(null);
        console.warn(`[ReminderEngine] WhatsApp ${reason}; continuing with email reminders only.`);
        finish(null);
      }
    });
  });
}

async function sendWhatsAppReminder(invoice, client) {
  const cleanPhone = formatWhatsAppPhone(client.phone);
  if (!cleanPhone) {
    console.warn(`[ReminderEngine] Invoice ${invoice.id} client has no valid phone number; WhatsApp reminder skipped.`);
    return false;
  }

  whatsappConnectionPromise ??= connectToWhatsApp().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[ReminderEngine] Could not initialize WhatsApp; continuing with email reminders only: ${message}`);
    return null;
  });

  const socket = await whatsappConnectionPromise;
  if (!socket) return false;

  const clientName = client.name || 'there';
  try {
    const response = await socket.sendMessage(`${cleanPhone}@s.whatsapp.net`, {
      text: `Hello ${clientName}, this is a reminder that your invoice for ${formatInvoiceAmount(invoice)} was due on ${invoice.due_date}.`,
    });
    console.log(`[ReminderEngine] WhatsApp send response for invoice ${invoice.id}:`, response);
    whatsappMessageSent = true;
  } catch (error) {
    console.log(`[ReminderEngine] WhatsApp send error for invoice ${invoice.id}:`, error);
    if (isBoom(error) && error.output.statusCode === DisconnectReason.connectionReplaced) {
      console.warn('[ReminderEngine] WhatsApp connection conflict while sending; skipping further WhatsApp reminders in this batch.');
      if (whatsappSocket === socket) whatsappSocket = undefined;
      whatsappConnectionPromise = Promise.resolve(null);
      socket.end();
      return false;
    }
    throw error;
  }
  return true;
}

async function closeWhatsApp() {
  const socket = whatsappSocket;
  whatsappSocket = undefined;
  whatsappConnectionPromise = undefined;

  if (!socket) {
    whatsappMessageSent = false;
    return;
  }

  try {
    if (whatsappMessageSent) {
      await new Promise((res) => setTimeout(res, 5000));
      whatsappMessageSent = false;
    }
    socket.end();
    console.info('[ReminderEngine] WhatsApp connection closed.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[ReminderEngine] Could not cleanly close WhatsApp connection: ${message}`);
  }
}

async function runReminderEngine() {
  const configuration = getConfiguration();
  const supabase = createClient(configuration.supabaseUrl, configuration.supabaseKey);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: configuration.gmailUser,
      pass: configuration.gmailAppPassword,
    },
  });
  const today = new Date().toISOString().slice(0, 10);
  const invoices = await fetchOverdueInvoices(supabase, today);
  let sent = 0;
  let skipped = 0;
  const failures = [];

  try {
    for (const invoice of invoices) {
      try {
        if ((await processInvoice(invoice, { supabase, transporter, configuration, today })) === 'sent') {
          sent += 1;
        } else {
          skipped += 1;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push({ invoiceId: invoice.id, message });
        console.error(`[ReminderEngine] Invoice ${invoice.id} failed: ${message}`);
      }
    }
  } finally {
    await closeWhatsApp();
  }

  console.info(`[ReminderEngine] Complete: ${sent} sent, ${skipped} skipped, ${failures.length} failed.`);
  if (failures.length > 0) {
    throw new Error(`${failures.length} invoice reminder(s) failed`);
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  runReminderEngine().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ReminderEngine] Run failed: ${message}`);
    process.exitCode = 1;
  });
}
