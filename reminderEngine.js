import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
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
let geminiConfigurationWarningLogged = false;
let geminiClient;
const businessProfileCache = new Map();

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
  if (daysOverdue >= 10) return 'Urgent/Final Notice';
  if (daysOverdue >= 4) return 'Firm';
  return 'Polite';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function getDefaultAIDynamicMessage({ businessName, invoiceNumber, amount, dueDate, overdueDays }) {
  const tone = getTone(overdueDays);

  if (tone === 'Urgent/Final Notice') {
    return `The balance is now ${overdueDays} days overdue; please arrange payment immediately to bring your account up to date.`;
  }

  if (tone === 'Firm') {
    return `The balance is now ${overdueDays} days overdue; please arrange payment promptly.`;
  }

  return 'Please arrange payment at your convenience.';
}

export async function generateAIReminder({
  businessName = 'Your business',
  invoiceNumber = 'your invoice',
  amount,
  dueDate,
  overdueDays,
  fallback = getDefaultAIDynamicMessage({ businessName, invoiceNumber, amount, dueDate, overdueDays }),
}) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    if (!geminiConfigurationWarningLogged) {
      console.warn('[ReminderEngine] GEMINI_API_KEY is not configured; using hardcoded reminder templates.');
      geminiConfigurationWarningLogged = true;
    }
    return fallback;
  }

  try {
    geminiClient ??= new GoogleGenAI({ apiKey });
    const tone = getTone(overdueDays);
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        'Write strictly in professional English. Generate exactly one short sentence containing only the dynamic overdue status and tone-appropriate payment request for the fixed email and WhatsApp templates.',
        `Set urgency only from overdueDays: Polite for 0–3 days, Firm for 4–9 days, and Urgent/Final Notice for 10+ days. The required tone for this message is ${tone}.`,
        'The fixed template already includes the greeting, issuer, invoice number, amount, due date, platform explanation, and payment instructions. Do not repeat any of those details. Do not include a greeting, introductory/header phrase, company or platform name, invoice number, amount, date, the word invoice, disclaimer, link, signature, or other template content.',
        'For overdue invoices, mention only the number of days overdue and make a tone-appropriate request to pay. For 0 overdue days, give a brief polite request to pay at their convenience. Do not invent claims, fees, penalties, or threats.',
        'Return JSON with exactly one field, dynamicMessage. It must contain one plain-English sentence, with no newline, HTML, markdown, or other-language phrases.',
        `Invoice data: ${JSON.stringify({ overdueDays })}`,
      ].join('\n'),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dynamicMessage: { type: Type.STRING },
          },
          required: ['dynamicMessage'],
        },
      },
    });
    const generated = JSON.parse(response.text || '');
    const dynamicMessage = generated?.dynamicMessage;
    const sentenceEndings = typeof dynamicMessage === 'string'
      ? dynamicMessage.match(/[!?](?=\s|$)|\.(?!\d)(?=\s|$)/g) || []
      : [];
    if (
      typeof dynamicMessage !== 'string' ||
      !dynamicMessage.trim() ||
      /<[^>]+>/.test(dynamicMessage) ||
      /[\u0900-\u097F]/u.test(dynamicMessage) ||
      /[\r\n]/.test(dynamicMessage) ||
      sentenceEndings.length !== 1 ||
      /^(?:hi|hello|dear|reminder|invoice|duefox|this message|this is (?:a )?(?:polite|firm|urgent))/i.test(dynamicMessage.trim()) ||
      dynamicMessage.toLowerCase().includes('duefox') ||
      dynamicMessage.toLowerCase().includes(invoiceNumber.toLowerCase()) ||
      dynamicMessage.toLowerCase().includes(businessName.toLowerCase()) ||
      /\binvoice\b/i.test(dynamicMessage) ||
      (overdueDays > 0 && !dynamicMessage.toLowerCase().includes(`${overdueDays} days overdue`))
    ) {
      throw new Error('Gemini returned a dynamic reminder that does not match the required single-sentence structure.');
    }

    return dynamicMessage.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[ReminderEngine] Gemini reminder generation failed; using hardcoded templates: ${message}`);
    return fallback;
  }
}

function formatInvoiceAmount(invoice) {
  const amount = Number(invoice.amount);
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid invoice amount: ${invoice.amount}`);
  }
  return `₹${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export function buildReminderTemplates(invoice, client, business, dynamicMessage) {
  const clientName = client.name?.trim() || 'there';
  const businessName = business.businessName?.trim() || 'Your business';
  const invoiceNumber = invoice.invoice_number || `Invoice ${invoice.id}`;
  const amount = formatInvoiceAmount(invoice);
  const dueDate = invoice.due_date;
  const serviceDescription = invoice.notes?.trim() || 'Services provided';
  const paymentUrl = invoice.payment_link?.trim() || '';
  const timestamp = new Date().toISOString();
  const subject = `Reminder: Invoice #${invoiceNumber} - ${timestamp}`;
  const companyName = escapeHtml(businessName);
  const safeClientName = escapeHtml(clientName);
  const safeInvoiceNumber = escapeHtml(invoiceNumber);
  const safeAmount = escapeHtml(amount);
  const safeDueDate = escapeHtml(dueDate);
  const safeServiceDescription = escapeHtml(serviceDescription);
  const safePaymentUrl = escapeHtml(paymentUrl);
  const paymentSecurityNote = '🔒 Clicking the link will safely redirect you to the verified DueFox secure payment portal, pre-filled with your invoice details for a seamless and safe transaction.';
  const emailBody = `👋 <strong>Hi ${safeClientName},</strong>
<p style="font-size: 15px; line-height: 1.5;">We hope you are doing well. This message is sent via <strong>DueFox.co</strong> on behalf of <strong>${companyName}</strong>.</p>
<p style="font-size: 15px; line-height: 1.5;">The main reason for this message is that your invoice for &quot;<strong>${safeServiceDescription}</strong>&quot; is pending, and DueFox.co is managing the automated payment follow-up. ${escapeHtml(dynamicMessage)}</p>`;
  const emailInvoiceDetails = `<div style="margin: 20px 0;">
<p style="margin: 5px 0;">• <strong>Company:</strong> ${companyName}</p>
<p style="margin: 5px 0;">• <strong>Invoice:</strong> #${safeInvoiceNumber}</p>
<p style="margin: 5px 0;">• <strong>Work:</strong> ${safeServiceDescription}</p>
<p style="margin: 5px 0;">• <strong>Amount:</strong> ${safeAmount}</p>
<p style="margin: 5px 0;">• <strong>Due Date:</strong> ${safeDueDate}</p>
</div>`;
  const disclaimer = `DueFox.co is an automated follow-up tool that manages invoice reminders. It has no other relationship between you and ${businessName}.`;
  const whatsappText = `👋 *Hi ${clientName},*

We hope you are doing well. This message is sent via *DueFox.co* on behalf of *${businessName}*.

The main reason for this message is that your invoice for "*${serviceDescription}*" is pending, and DueFox.co is managing the automated payment follow-up. ${dynamicMessage}

📋 *Invoice Details:*
• *Company:* ${businessName}
• *Invoice:* #${invoiceNumber}
• *Work:* ${serviceDescription}
• *Amount:* ${amount}
• *Due Date:* ${dueDate}

💳 *Pay Securely Here:*

${paymentUrl}

${paymentSecurityNote}

*(If you have already paid, please ignore this message.)*

📌 *NOTE:* ${disclaimer}

Best regards,

*${businessName}*`;
  const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(subject)}</title>
    <style>
      * { box-sizing: border-box; }
      @media only screen and (max-width: 600px) {
        .email-card { padding: 10px !important; }
      }
    </style>
</head>
<body style="margin: 0; padding: 10px 0; background-color: #F8FAFC; background-color: transparent; width: 100% !important; font-family: Arial, sans-serif; color: #333333;">
  <div class="email-card" style="max-width: 600px; width: 96% !important; margin: 0 auto; padding: 15px; border-radius: 8px; box-sizing: border-box; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 24px;"><div style="background-color: #FF5226; color: #ffffff; display: inline-block; padding: 6px 18px; border-radius: 6px; font-weight: bold; font-size: 16px;">dueFox.co</div></div>
    <div style="font-size: 15px; line-height: 1.5; color: #333333;">${emailBody}</div>
    <div style="font-size: 15px; line-height: 1.5; color: #333333;">
      <p style="margin: 0 0 10px;">📋 <strong>Invoice Details:</strong></p>
      ${emailInvoiceDetails}
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${safePaymentUrl}" style="background-color: #FF5226; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Pay Invoice Now &rarr;</a>
    </div>
    <p style="font-size: 13px; line-height: 1.5;">${paymentSecurityNote}</p>
    <p style="font-size: 13px; color: #64748B;"><em>(If you have already paid, please ignore this message.)</em></p>
    <p style="font-size: 13px; color: #64748B; line-height: 1.5;">📌 <strong>NOTE:</strong> ${escapeHtml(disclaimer)}</p>
    <p style="font-size: 14px;">Best regards,</p>
    <p style="font-size: 14px;"><strong>${companyName}</strong></p>
  </div>
</body>
</html>`;
  return {
    emailSubject: subject,
    emailHtml,
    whatsappText,
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

async function getBusinessProfile(supabase, userId, invoiceId) {
  if (!userId) {
    console.warn(`[ReminderEngine] Invoice ${invoiceId} has no business owner ID; using a generic sender identity.`);
    return { businessName: 'Your business', email: '' };
  }

  if (businessProfileCache.has(userId)) {
    return businessProfileCache.get(userId);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('representative_name, company_name, business_email')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not fetch business profile for invoice ${invoiceId}: ${error.message}`);
  }

  if (!data) {
    console.warn(`[ReminderEngine] No business profile found for invoice ${invoiceId}; using a generic sender identity.`);
  }

  const profile = {
    businessName: data?.company_name?.trim() || data?.representative_name?.trim() || 'Your business',
    email: data?.business_email?.trim() || '',
  };
  businessProfileCache.set(userId, profile);
  return profile;
}

async function fetchOverdueInvoices(supabase, today) {
  const invoices = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, user_id, client_id, invoice_number, amount, currency, due_date, status, payment_link, notes, chase_count, last_chased_at, clients:clients(id, name, email, phone, company)')
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

function htmlToText(html) {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6])\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

  const business = await getBusinessProfile(supabase, invoice.user_id, invoice.id);
  const invoiceNumber = invoice.invoice_number || `Invoice ${invoice.id}`;
  const amount = formatInvoiceAmount(invoice);
  const fallback = getDefaultAIDynamicMessage({
    businessName: business.businessName,
    invoiceNumber,
    amount,
    dueDate: invoice.due_date,
    overdueDays: daysOverdue,
  });
  const dynamicMessage = await generateAIReminder({
    businessName: business.businessName,
    invoiceNumber,
    amount,
    dueDate: invoice.due_date,
    overdueDays: daysOverdue,
    fallback,
  });
  const reminder = buildReminderTemplates(invoice, client, business, dynamicMessage);
  const emailHtml = reminder.emailHtml;

  await transporter.sendMail({
    from: {
      name: business.businessName,
      address: configuration.gmailUser,
    },
    replyTo: business.email || configuration.gmailUser,
    to: client.email,
    subject: reminder.emailSubject,
    text: `${htmlToText(emailHtml)}${invoice.payment_link?.trim() ? `\n\nPayment link: ${invoice.payment_link.trim()}` : ''}`,
    html: emailHtml,
  });

  let whatsappSent = false;
  try {
    whatsappSent = await sendWhatsAppReminder(invoice, client, reminder.whatsappText);
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

async function sendWhatsAppReminder(invoice, client, whatsappText) {
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

  try {
    const response = await socket.sendMessage(`${cleanPhone}@s.whatsapp.net`, {
      text: whatsappText,
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
