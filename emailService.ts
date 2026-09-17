import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { observability } from './observabilityService';

export interface SendAlertOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  fromName?: string;
  fromEmail?: string;
}

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.BREVO_API_KEY;

  if (!user || !pass) {
    // SMTP credentials not yet provided in Cloud Run environment
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      name: process.env.SMTP_HELO_DOMAIN || 'pingava.com',
      auth: {
        user,
        pass,
      },
    });
  }

  return cachedTransporter;
}

/**
 * Sends an email using configured SMTP credentials (ZeptoMail / Brevo / Zoho / Custom SMTP).
 * If credentials are not set, logs the alert gracefully so the app never crashes.
 */
export async function sendEmailAlert(options: SendAlertOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getTransporter();
  const fromAddress = options.fromEmail || process.env.SMTP_FROM || process.env.ALERT_EMAIL_FROM || process.env.EMAIL_FROM || 'alerts@pingava.com';
  const fromName = options.fromName || process.env.EMAIL_FROM_NAME || 'Pingava Alerts';

  if (!transporter) {
    console.log(`[Email Service] SMTP not configured. Notification to ${options.to} was queued in alert logs.`);
    observability.recordEmailAttempt(false, 'SMTP credentials (SMTP_USER / SMTP_PASS) not configured.');
    return { success: false, error: 'SMTP credentials (SMTP_USER / SMTP_PASS) not configured.' };
  }

  try {
    const senderEmail = fromAddress;
    const senderName = fromName;
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: options.to,
      replyTo: options.replyTo || (senderEmail.includes('welcome') ? 'connect@pingava.com' : undefined),
      subject: options.subject,
      text: options.text,
      html: options.html,
      headers: {
        'X-Mailer': 'Pingava-Notification-Engine',
        'Auto-Submitted': 'auto-generated',
      },
    });
    console.log(`[Email Service] Email sent successfully to ${options.to}: ${info.messageId} (from: ${senderEmail})`);
    observability.recordEmailAttempt(true);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Service] Failed to send email to ${options.to}:`, err);
    observability.recordEmailAttempt(false, err.message || 'Unknown SMTP error');
    return { success: false, error: err.message || 'Unknown SMTP error' };
  }
}
