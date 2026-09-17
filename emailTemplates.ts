/**
 * Pingava Email Design System & Modern SaaS Templates
 *
 * Implements a responsive, bulletproof HTML email design system matching Pingava's
 * dark SaaS aesthetic (#0b1324 canvas, #111a2e card) and signature brand gradients
 * (linear-gradient(110deg, #087f5b, #078fad) / emerald #12b76a to cyan #38bdf8).
 *
 * Compatible with Apple Mail, Gmail (Web, iOS, Android), Outlook, and modern email clients.
 */

export function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface BaseEmailOptions {
  preheader?: string;
  badgeText?: string;
  badgeType?: 'success' | 'danger' | 'warning' | 'info' | 'brand';
  title: string;
  subtitle?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  recipientEmail?: string;
  footerNote?: string;
}

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  brand: {
    bg: 'rgba(8, 122, 75, 0.18)',
    text: '#34d399',
    border: 'rgba(52, 211, 153, 0.35)',
  },
  success: {
    bg: 'rgba(18, 183, 106, 0.18)',
    text: '#34d399',
    border: 'rgba(18, 183, 106, 0.35)',
  },
  danger: {
    bg: 'rgba(239, 68, 68, 0.18)',
    text: '#f87171',
    border: 'rgba(239, 68, 68, 0.35)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.18)',
    text: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  info: {
    bg: 'rgba(7, 143, 173, 0.18)',
    text: '#38bdf8',
    border: 'rgba(56, 189, 248, 0.35)',
  },
};

/**
 * Base layout wrapper that renders the complete email document with:
 * - High-contrast responsive container (max-width: 600px)
 * - Top brand gradient accent bar (emerald to cyan)
 * - Sleek Pingava brand header with mark & category pill
 * - Injected body content
 * - Call to Action (CTA) button with brand gradient
 * - Standardized SaaS footer with quick navigation links
 */
export function renderBaseEmailLayout(options: BaseEmailOptions): string {
  const badge = BADGE_STYLES[options.badgeType || 'brand'] || BADGE_STYLES.brand;
  const preheaderText = options.preheader
    ? `<div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">${escapeHtml(
        options.preheader
      )}</div>`
    : '';

  const badgeHtml = options.badgeText
    ? `<span style="display: inline-block; background: ${badge.bg}; border: 1px solid ${badge.border}; color: ${badge.text}; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.08em;">${escapeHtml(
        options.badgeText
      )}</span>`
    : '';

  const ctaButtonHtml =
    options.ctaText && options.ctaUrl
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 24px;">
          <tr>
            <td align="center" style="border-radius: 8px; background: #087a4b; background: linear-gradient(110deg, #087f5b 0%, #078fad 100%);">
              <a href="${escapeHtml(options.ctaUrl)}" target="_blank" style="font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 14px 32px; display: inline-block; border-radius: 8px; background: #087a4b; background: linear-gradient(110deg, #087f5b 0%, #078fad 100%); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 4px 14px rgba(7, 143, 173, 0.28); letter-spacing: 0.01em;">
                ${escapeHtml(options.ctaText)}
              </a>
            </td>
          </tr>
        </table>
      `
      : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(options.title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .content-cell { padding: 24px 20px !important; }
      .header-cell { padding: 24px 20px !important; }
      .footer-cell { padding: 24px 20px !important; }
      .metric-col { width: 100% !important; display: block !important; margin-bottom: 8px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #070d18; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #f8fafc;">
  ${preheaderText}
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #070d18; padding: 36px 12px 48px;">
    <tr>
      <td align="center">
        <!-- Main Card Wrapper -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #111a2e; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; overflow: hidden; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.55);">
          
          <!-- Signature Brand Gradient Accent Bar -->
          <tr>
            <td height="4" style="height: 4px; background: #087a4b; background: linear-gradient(90deg, #087a4b 0%, #12b76a 45%, #078fad 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td class="header-cell" style="padding: 30px 36px 22px; background: linear-gradient(180deg, rgba(8, 122, 75, 0.12) 0%, rgba(17, 26, 46, 0) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="middle">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 10px;">
                          <!-- Stylized Logo Mark -->
                          <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #087f5b 0%, #078fad 100%); text-align: center; line-height: 32px; font-weight: 800; font-size: 18px; color: #ffffff; box-shadow: 0 2px 10px rgba(8, 122, 75, 0.4);">
                            P
                          </div>
                        </td>
                        <td valign="middle">
                          <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #12b76a; text-transform: lowercase;">pingava</span>
                          <span style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-top: 2px;">Synthetic Reliability Suite</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    ${badgeHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Content Area -->
          <tr>
            <td class="content-cell" style="padding: 34px 36px 24px;">
              <h1 style="margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; line-height: 1.35;">
                ${options.title}
              </h1>
              ${
                options.subtitle
                  ? `<p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #94a3b8;">${options.subtitle}</p>`
                  : '<div style="height: 14px;"></div>'
              }

              ${options.bodyHtml}

              ${ctaButtonHtml}
            </td>
          </tr>

          <!-- Standardized SaaS Footer -->
          <tr>
            <td class="footer-cell" style="padding: 26px 36px 32px; background-color: #0b1324; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0 0 14px; font-size: 12px; color: #64748b; font-weight: 600; letter-spacing: 0.02em;">
                <a href="https://dashboard.pingava.com" target="_blank" style="color: #94a3b8; text-decoration: none; margin: 0 9px;">Dashboard</a> &bull;
                <a href="https://www.pingava.com/docs" target="_blank" style="color: #94a3b8; text-decoration: none; margin: 0 9px;">Documentation</a> &bull;
                <a href="https://www.pingava.com/api-docs" target="_blank" style="color: #94a3b8; text-decoration: none; margin: 0 9px;">API Docs</a> &bull;
                <a href="https://www.pingava.com/status" target="_blank" style="color: #94a3b8; text-decoration: none; margin: 0 9px;">System Status</a>
              </p>
              
              <div style="height: 1px; background: rgba(255, 255, 255, 0.04); margin: 16px 0;"></div>

              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; line-height: 1.55;">
                ${
                  options.footerNote
                    ? `${options.footerNote}<br/>`
                    : ''
                }
                Sent by Pingava Synthetic Reliability Platform &bull; <a href="mailto:alerts@pingava.com" style="color: #94a3b8; text-decoration: none;">alerts@pingava.com</a>
                ${options.recipientEmail ? `<br/><span style="color: #475569;">Intended for ${escapeHtml(options.recipientEmail)}</span>` : ''}
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} Pingava Inc. 6-Region Synthetic Uptime &amp; API Reliability.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. SIGN UP MAIL: Email Verification Template
 */
export function renderSignupVerificationEmail(options: {
  verifyUrl: string;
  email: string;
  expiresInMinutes?: number;
}): { html: string; text: string } {
  const expiresIn = options.expiresInMinutes || 30;
  const safeEmail = escapeHtml(options.email);
  const safeUrl = escapeHtml(options.verifyUrl);

  const text = `Welcome to Pingava!

Please verify your email address to activate your synthetic monitoring workspace:
${options.verifyUrl}

This verification link will expire in ${expiresIn} minutes.

What you get with Pingava:
• 6-Region Global Synthetic Edge Probes
• Zero-Noise Multi-Check Outage Confirmation
• AI Root-Cause Diagnostic Reports
• Public Status Pages & Webhook Integrations

If you didn't create a Pingava account, you can safely ignore this email.

Best regards,
The Pingava Team
https://pingava.com`;

  const bodyHtml = `
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.65; color: #cbd5e1;">
      Thank you for creating an account with Pingava. To complete your setup and activate your synthetic monitoring workspace, please verify your email address (<strong>${safeEmail}</strong>) by clicking the button below:
    </p>

    <!-- Platform Highlights Card -->
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 20px 22px; margin: 24px 0 28px;">
      <h3 style="margin: 0 0 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #34d399;">What's waiting in your workspace:</h3>
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="top" style="padding-bottom: 10px; width: 26px; font-size: 15px;">🌐</td>
          <td style="padding-bottom: 10px; font-size: 13px; line-height: 1.5; color: #e2e8f0;">
            <strong>6-Region Global Probes:</strong> Monitor HTTP, REST, and WebSockets from Singapore, Tokyo, Frankfurt, Virginia, São Paulo, and Sydney.
          </td>
        </tr>
        <tr>
          <td valign="top" style="padding-bottom: 10px; width: 26px; font-size: 15px;">⚡</td>
          <td style="padding-bottom: 10px; font-size: 13px; line-height: 1.5; color: #e2e8f0;">
            <strong>AI Root-Cause Synthesis:</strong> Instant failure diagnostics detailing HTTP response codes, header anomalies, and MTTR breakdowns.
          </td>
        </tr>
        <tr>
          <td valign="top" style="width: 26px; font-size: 15px;">🛡️</td>
          <td style="font-size: 13px; line-height: 1.5; color: #e2e8f0;">
            <strong>Zero-Noise Verification:</strong> Multi-region consensus prevents false alarms from intermittent network blips.
          </td>
        </tr>
      </table>
    </div>

    <!-- Direct Link Fallback Box -->
    <div style="background: #0a1120; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 14px 16px; margin-top: 24px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 6px;">Button not working? Copy &amp; paste this URL:</div>
      <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 12px; color: #38bdf8; word-break: break-all; line-height: 1.45;">
        ${safeUrl}
      </div>
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: 'Verify your email address to activate your Pingava monitoring workspace.',
    badgeText: 'Account Verification',
    badgeType: 'brand',
    title: 'Verify your email address',
    subtitle: 'Activate your workspace to start monitoring websites, APIs, and microservices.',
    bodyHtml,
    ctaText: 'Verify Email & Activate Workspace →',
    ctaUrl: options.verifyUrl,
    recipientEmail: options.email,
    footerNote: `This link expires in ${expiresIn} minutes. If you did not create a Pingava account, you can safely ignore this email.`,
  });

  return { html, text };
}

/**
 * 2. RESET PASSWORD MAIL: Password Reset Template
 */
export function renderPasswordResetEmail(options: {
  resetUrl: string;
  email: string;
  expiresInMinutes?: number;
}): { html: string; text: string } {
  const expiresIn = options.expiresInMinutes || 60;
  const safeEmail = escapeHtml(options.email);
  const safeUrl = escapeHtml(options.resetUrl);

  const text = `Reset your Pingava password

We received a request to reset the password for your Pingava account (${options.email}).

Click the link below to set a new password:
${options.resetUrl}

This link is valid for ${expiresIn} minutes.

If you did not request a password reset, no changes have been made to your account. You can safely disregard this message.

Security Team
Pingava Synthetic Reliability Suite
https://pingava.com`;

  const bodyHtml = `
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #cbd5e1;">
      We received a request to reset the password for your Pingava account (<strong>${safeEmail}</strong>).
    </p>

    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.65; color: #94a3b8;">
      Click the button below to choose a new password. For security purposes, this password reset link will expire in <strong>${expiresIn} minutes</strong>.
    </p>

    <!-- Direct Link Fallback Box -->
    <div style="background: #0a1120; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 14px 16px; margin: 24px 0 20px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 6px;">Button not working? Copy &amp; paste this URL:</div>
      <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 12px; color: #38bdf8; word-break: break-all; line-height: 1.45;">
        ${safeUrl}
      </div>
    </div>

    <!-- Security Advisory Box -->
    <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 14px 16px;">
      <div style="font-size: 13px; color: #fbbf24; line-height: 1.5;">
        <strong>Didn't request this?</strong> If you did not make this request, you can safely ignore this email; your account and password remain secure.
      </div>
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: 'Reset your Pingava account password. Link expires in 60 minutes.',
    badgeText: 'Account Security',
    badgeType: 'warning',
    title: 'Reset Your Password',
    subtitle: 'Choose a new password for your Pingava synthetic monitoring workspace.',
    bodyHtml,
    ctaText: 'Reset Password →',
    ctaUrl: options.resetUrl,
    recipientEmail: options.email,
    footerNote: `This link expires in ${expiresIn} minutes. If you did not initiate this request, no action is needed.`,
  });

  return { html, text };
}

/**
 * 3. WELCOME MAIL: Welcome Aboard Onboarding Template
 */
export function renderWelcomeEmail(options: {
  name: string;
  email: string;
  dashboardUrl?: string;
}): { html: string; text: string } {
  const firstName = options.name.trim().split(' ')[0] || 'there';
  const targetUrl = options.dashboardUrl || 'https://dashboard.pingava.com/monitors';

  const text = `Welcome to Pingava, ${firstName}!

Your Pingava workspace is activated. You now have access to our modern synthetic monitoring suite built for engineering teams who need fewer false alarms, predictive latency detection, and instant root-cause clarity.

Add your first monitor:
${targetUrl}

Quick 3-Step Setup:
1. Add Target URL: Configure your production website, microservice, or REST API endpoint.
2. Set Confirmation Rules: Use 2-to-3 consecutive check failures to prevent false alerts from temporary internet hiccups.
3. Connect Alert Channels: Receive instant notifications via email, webhook, Slack, or PagerDuty.

What makes Pingava different:
• 6-Region Global Edge Probes (Singapore, Tokyo, Frankfurt, N. Virginia, São Paulo, Sydney)
• AI Root-Cause Synthesis on incidents
• Predictive Latency Jitter Radar & SSL Expiry Hygiene
• Branded Public Status Pages for transparent user communication

Have questions or need assistance? Reply directly to this email or reach us anytime at connect@pingava.com.

Best regards,
The Pingava Team
https://pingava.com`;

  const bodyHtml = `
    <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.65; color: #cbd5e1;">
      Your Pingava workspace is ready. You now have access to a modern synthetic monitoring suite engineered for teams who need <strong>zero false alarms</strong>, predictive latency detection, and instant root-cause clarity before outages impact users.
    </p>

    <!-- Quick 3-Step Setup Card -->
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 10px; padding: 22px 24px; margin-bottom: 26px;">
      <h3 style="margin: 0 0 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: #34d399;">Quick 3-Step Setup</h3>
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="top" style="padding-bottom: 14px; width: 30px;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(18, 183, 106, 0.2); color: #34d399; font-size: 12px; font-weight: 700; text-align: center; line-height: 22px; border: 1px solid rgba(52, 211, 153, 0.3);">1</div>
          </td>
          <td style="padding-bottom: 14px; font-size: 14px; line-height: 1.5; color: #e2e8f0;">
            <strong style="color: #ffffff;">Add Target URL:</strong> Configure your production website, microservice, or REST API endpoint.
          </td>
        </tr>
        <tr>
          <td valign="top" style="padding-bottom: 14px; width: 30px;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(18, 183, 106, 0.2); color: #34d399; font-size: 12px; font-weight: 700; text-align: center; line-height: 22px; border: 1px solid rgba(52, 211, 153, 0.3);">2</div>
          </td>
          <td style="padding-bottom: 14px; font-size: 14px; line-height: 1.5; color: #e2e8f0;">
            <strong style="color: #ffffff;">Set Confirmation Rules:</strong> Use 2-to-3 consecutive check failures to prevent false alerts from temporary internet hiccups.
          </td>
        </tr>
        <tr>
          <td valign="top" style="width: 30px;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(18, 183, 106, 0.2); color: #34d399; font-size: 12px; font-weight: 700; text-align: center; line-height: 22px; border: 1px solid rgba(52, 211, 153, 0.3);">3</div>
          </td>
          <td style="font-size: 14px; line-height: 1.5; color: #e2e8f0;">
            <strong style="color: #ffffff;">Connect Alert Channels:</strong> Receive dispatches via email, webhook, Slack, Discord, or PagerDuty.
          </td>
        </tr>
      </table>
    </div>

    <!-- Core Platform Differentiators -->
    <h3 style="margin: 0 0 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;">What makes Pingava different:</h3>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px 16px; background: rgba(255, 255, 255, 0.02); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 3px;">🌐 6-Region Global Edge Probes</div>
          <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Simultaneous synthetic probes from Singapore, Tokyo, Frankfurt, N. Virginia, São Paulo, and Sydney.</div>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 14px 16px; background: rgba(255, 255, 255, 0.02); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 3px;">⚡ AI Root-Cause Synthesis</div>
          <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Automated failure post-mortems summarizing status codes, response headers, and MTTR breakdowns.</div>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 14px 16px; background: rgba(255, 255, 255, 0.02); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 3px;">📡 Predictive Latency Radar &amp; SSL Hygiene</div>
          <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Track response jitter, SSL certificate expiration windows, and API contract drift in real time.</div>
        </td>
      </tr>
    </table>

    <!-- Need Help Section -->
    <div style="padding: 16px 18px; background: #0a1120; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06);">
      <p style="margin: 0; font-size: 13px; line-height: 1.55; color: #94a3b8;">
        Need onboarding assistance or custom API checks? Simply hit <strong>Reply</strong> to this email or reach us anytime at <a href="mailto:connect@pingava.com" style="color: #34d399; font-weight: 600; text-decoration: none;">connect@pingava.com</a>.
      </p>
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: `Welcome to Pingava, ${firstName}! Your next-gen synthetic uptime & API monitoring workspace is ready.`,
    badgeText: 'Workspace Activated',
    badgeType: 'brand',
    title: `Welcome aboard, ${escapeHtml(firstName)}! 👋`,
    subtitle: 'Next-Gen Synthetic Reliability & API Monitoring',
    bodyHtml,
    ctaText: 'Add Your First Monitor →',
    ctaUrl: targetUrl,
    recipientEmail: options.email,
  });

  return { html, text };
}

/**
 * 4. ALERTS@PINGAVA.COM: Monitor Incident & Recovery Alerts
 */
export function renderMonitorAlertEmail(options: {
  kind: 'down' | 'recovery';
  monitorName: string;
  monitorUrl: string;
  errorMessage?: string;
  statusCode?: number;
  durationMs?: number;
  timestamp: string;
  recoveryStreak?: number;
  failureStreak?: number;
  incidentId?: string | number;
  dashboardUrl?: string;
}): { html: string; text: string; subject: string } {
  const isDown = options.kind === 'down';
  const targetDashboard = options.dashboardUrl || 'https://dashboard.pingava.com/monitors';

  const subject = isDown
    ? `🚨 [ALERT] ${options.monitorName} is DOWN!`
    : `✅ [RECOVERED] ${options.monitorName} is back up!`;

  const text = isDown
    ? `[ALERT] ${options.monitorName} is DOWN!

Monitor: ${options.monitorName}
URL: ${options.monitorUrl}
Reason: ${options.errorMessage || 'Connection failed or HTTP status error'}
Streak: ${options.failureStreak || 1} consecutive failure(s)
Detected at: ${options.timestamp}

Investigate incident:
${targetDashboard}

Powered by Pingava Synthetic Reliability Platform
alerts@pingava.com`
    : `[RECOVERED] ${options.monitorName} is back up!

Monitor: ${options.monitorName}
URL: ${options.monitorUrl}
Status: Healthy (All checks passed)
Recovery checks: ${options.recoveryStreak || 2} successful check(s)
Resolved at: ${options.timestamp}

View dashboard:
${targetDashboard}

Powered by Pingava Synthetic Reliability Platform
alerts@pingava.com`;

  const statusColor = isDown ? '#ef4444' : '#10b981';
  const statusBg = isDown ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)';
  const statusBorder = isDown ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';
  const statusBadge = isDown ? 'CRITICAL OUTAGE DETECTED' : 'SERVICE FULLY RECOVERED';
  const badgeType = isDown ? 'danger' : 'success';

  const bodyHtml = `
    <!-- Incident Status Highlight Banner -->
    <div style="background: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="middle" style="width: 32px; font-size: 24px;">
            ${isDown ? '🚨' : '✅'}
          </td>
          <td valign="middle" style="padding-left: 10px;">
            <div style="font-size: 16px; font-weight: 700; color: ${statusColor};">
              ${isDown ? 'Service Outage Confirmed' : 'Service Restored &amp; Operational'}
            </div>
            <div style="font-size: 13px; color: #cbd5e1; margin-top: 3px;">
              <strong>${escapeHtml(options.monitorName)}</strong> (${escapeHtml(options.monitorUrl)})
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Diagnostic Details Matrix -->
    <div style="background: #0a1120; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px; width: 38%;">Target URL</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; word-break: break-all;">
            <a href="${escapeHtml(options.monitorUrl)}" target="_blank" style="color: #38bdf8; text-decoration: none;">${escapeHtml(options.monitorUrl)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Health Status</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: ${statusColor}; font-size: 13px; font-weight: 700;">
            ${isDown ? 'DOWN / UNREACHABLE' : 'OPERATIONAL / UP'}
          </td>
        </tr>
        ${
          isDown && options.errorMessage
            ? `
            <tr>
              <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Failure Reason</td>
              <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #fca5a5; font-size: 13px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace;">
                ${escapeHtml(options.errorMessage)}
              </td>
            </tr>
            `
            : ''
        }
        ${
          options.durationMs !== undefined
            ? `
            <tr>
              <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Response Latency</td>
              <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace;">
                ${options.durationMs} ms
              </td>
            </tr>
            `
            : ''
        }
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Timestamp (UTC)</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #cbd5e1; font-size: 13px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace;">
            ${escapeHtml(options.timestamp)}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; color: #94a3b8; font-size: 13px;">Detection Engine</td>
          <td style="padding: 12px 18px; color: #34d399; font-size: 13px; font-weight: 600;">
            Pingava Global Consensus (6-Region Edge)
          </td>
        </tr>
      </table>
    </div>

    <!-- Assurance Callout -->
    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
      ${
        isDown
          ? 'Pingava multi-region consensus confirmed this failure before triggering this alert to eliminate false positives. Check your logs and infrastructure immediately.'
          : 'All global edge probes have verified that your service has returned to normal latency and HTTP status code boundaries.'
      }
    </p>
  `;

  const html = renderBaseEmailLayout({
    preheader: isDown
      ? `Alert: ${options.monitorName} is down. Failure detected at ${options.timestamp}.`
      : `Resolved: ${options.monitorName} has recovered and is operational.`,
    badgeText: statusBadge,
    badgeType,
    title: isDown
      ? `Service Outage: ${escapeHtml(options.monitorName)}`
      : `Service Restored: ${escapeHtml(options.monitorName)}`,
    subtitle: isDown
      ? 'An endpoint failure has been detected and confirmed by Pingava synthetic probes.'
      : 'Endpoint recovery confirmed by Pingava global synthetic probes.',
    bodyHtml,
    ctaText: isDown ? 'Investigate Incident in Dashboard →' : 'View Monitor Status →',
    ctaUrl: targetDashboard,
  });

  return { html, text, subject };
}

/**
 * 5. ALERTS@PINGAVA.COM: SSL / TLS Certificate Expiry Alert
 */
export function renderSslExpiryAlertEmail(options: {
  monitorName: string;
  monitorUrl: string;
  daysRemaining: number;
  expiresAt: string;
  issuer?: string;
  protocol?: string;
  urgency: string;
  dashboardUrl?: string;
}): { html: string; text: string; subject: string } {
  const days = options.daysRemaining;
  const isCritical = days <= 7;
  const statusColor = isCritical ? '#ef4444' : '#f59e0b';
  const targetDashboard = options.dashboardUrl || 'https://dashboard.pingava.com/monitors';

  const subject = `[SSL ${options.urgency}] Certificate for ${options.monitorName} expires in ${days} days`;

  const text = `SSL Certificate Alert for ${options.monitorName} (${options.monitorUrl})

Status: ${options.urgency}
Days Remaining: ${days}
Expires At: ${options.expiresAt}
Issuer: ${options.issuer || 'Unknown'}
Protocol: ${options.protocol || 'TLS'}

Please renew your TLS certificate immediately to prevent browser warning screens and downtime for your visitors.

View in Dashboard:
${targetDashboard}

Pingava SSL Certificate Guardian
alerts@pingava.com`;

  const bodyHtml = `
    <!-- Urgency Callout -->
    <div style="background: ${isCritical ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)'}; border: 1px solid ${isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="middle" style="width: 32px; font-size: 24px;">⚠️</td>
          <td valign="middle" style="padding-left: 10px;">
            <div style="font-size: 16px; font-weight: 700; color: ${statusColor};">
              Certificate Expires in ${days} Day${days === 1 ? '' : 's'}
            </div>
            <div style="font-size: 13px; color: #cbd5e1; margin-top: 2px;">
              Action required for <strong>${escapeHtml(options.monitorName)}</strong>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Certificate Metadata Table -->
    <div style="background: #0a1120; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px; width: 38%;">Target Endpoint</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace;">
            <a href="${escapeHtml(options.monitorUrl)}" target="_blank" style="color: #38bdf8; text-decoration: none;">${escapeHtml(options.monitorUrl)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Days Remaining</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: ${statusColor}; font-size: 14px; font-weight: 700;">
            ${days} days
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Expiration Date</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace;">
            ${escapeHtml(new Date(options.expiresAt).toUTCString())}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Certificate Authority</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #cbd5e1; font-size: 13px;">
            ${escapeHtml(options.issuer || 'Unknown')}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; color: #94a3b8; font-size: 13px;">Protocol</td>
          <td style="padding: 12px 18px; color: #cbd5e1; font-size: 13px;">
            ${escapeHtml(options.protocol || 'TLS 1.3')}
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
      Expired TLS certificates trigger full-screen browser security warnings that block incoming visitors. Please renew your certificate with your CA or automated renewal provider (e.g. Let's Encrypt / Certbot / Cloudflare).
    </p>
  `;

  const html = renderBaseEmailLayout({
    preheader: `SSL Warning: Certificate for ${options.monitorName} expires in ${days} days.`,
    badgeText: isCritical ? 'TLS Emergency Expiry' : 'TLS Expiration Notice',
    badgeType: isCritical ? 'danger' : 'warning',
    title: `SSL Certificate Alert: ${escapeHtml(options.monitorName)}`,
    subtitle: `Your TLS certificate expires in ${days} days. Renew now to avoid site interruption.`,
    bodyHtml,
    ctaText: 'Open SSL Certificate Guardian →',
    ctaUrl: targetDashboard,
  });

  return { html, text, subject };
}

/**
 * 6. ALERTS@PINGAVA.COM: Cron Heartbeat Missed / Recovered Alert
 */
export function renderHeartbeatAlertEmail(options: {
  kind: 'down' | 'recovery';
  jobName: string;
  periodSeconds: number;
  graceSeconds: number;
  lastPingAt?: string | null;
  timestamp: string;
  dashboardUrl?: string;
}): { html: string; text: string; subject: string } {
  const isDown = options.kind === 'down';
  const targetDashboard = options.dashboardUrl || 'https://dashboard.pingava.com/heartbeats';

  const subject = isDown
    ? `🚨 [CRON MISSED] ${options.jobName} did not check in on time!`
    : `✅ [CRON RECOVERED] ${options.jobName} checked in successfully`;

  const text = isDown
    ? `[CRON MISSED] ${options.jobName} did not check in on time!

Job: ${options.jobName}
Expected Frequency: Every ${Math.round(options.periodSeconds / 60)} min
Grace Period: ${Math.round(options.graceSeconds / 60)} min
Last Check-In: ${options.lastPingAt ? new Date(options.lastPingAt).toUTCString() : 'Never'}
Detected at: ${options.timestamp}

Investigate heartbeat:
${targetDashboard}

Pingava Cron Heartbeat Engine
alerts@pingava.com`
    : `[CRON RECOVERED] ${options.jobName} checked in successfully

Job: ${options.jobName}
Status: Healthy
Last Ping: ${options.lastPingAt ? new Date(options.lastPingAt).toUTCString() : options.timestamp}

View in Heartbeat Manager:
${targetDashboard}

Pingava Cron Heartbeat Engine
alerts@pingava.com`;

  const statusColor = isDown ? '#ef4444' : '#10b981';
  const statusBg = isDown ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)';
  const statusBorder = isDown ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';

  const bodyHtml = `
    <!-- Heartbeat Status Banner -->
    <div style="background: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="middle" style="width: 32px; font-size: 24px;">${isDown ? '🚨' : '✅'}</td>
          <td valign="middle" style="padding-left: 10px;">
            <div style="font-size: 16px; font-weight: 700; color: ${statusColor};">
              ${isDown ? 'Cron Job Check-In Overdue' : 'Cron Job Check-In Received'}
            </div>
            <div style="font-size: 13px; color: #cbd5e1; margin-top: 2px;">
              Heartbeat monitor: <strong>${escapeHtml(options.jobName)}</strong>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Details Table -->
    <div style="background: #0a1120; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px; width: 38%;">Job Name</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-weight: 700;">
            ${escapeHtml(options.jobName)}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Expected Frequency</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #cbd5e1; font-size: 13px;">
            Every ${Math.round(options.periodSeconds / 60)} min (grace: ${Math.round(options.graceSeconds / 60)} min)
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Last Check-In</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace;">
            ${options.lastPingAt ? escapeHtml(new Date(options.lastPingAt).toUTCString()) : 'Never'}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; color: #94a3b8; font-size: 13px;">Current Status</td>
          <td style="padding: 12px 18px; color: ${statusColor}; font-size: 13px; font-weight: 700;">
            ${isDown ? 'OVERDUE / MISSED' : 'HEALTHY / ACTIVE'}
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
      ${
        isDown
          ? 'Your background job or cron worker did not send its expected ping before the grace window expired. Check your scheduler, queue workers, or server logs.'
          : 'Your cron heartbeat has checked in successfully and the overdue incident has been resolved.'
      }
    </p>
  `;

  const html = renderBaseEmailLayout({
    preheader: isDown
      ? `Alert: Cron heartbeat ${options.jobName} missed its scheduled check-in.`
      : `Restored: Cron heartbeat ${options.jobName} checked in successfully.`,
    badgeText: isDown ? 'Heartbeat Missed' : 'Heartbeat Recovered',
    badgeType: isDown ? 'danger' : 'success',
    title: isDown
      ? `Cron Missed: ${escapeHtml(options.jobName)}`
      : `Cron Recovered: ${escapeHtml(options.jobName)}`,
    subtitle: isDown
      ? 'A scheduled background worker or queue job did not ping Pingava in time.'
      : 'Periodic check-in resumed normally.',
    bodyHtml,
    ctaText: 'Open Heartbeat Manager →',
    ctaUrl: targetDashboard,
  });

  return { html, text, subject };
}

/**
 * 7. TEST ALERT: Email Delivery Verification Template
 */
export function renderTestAlertEmail(options: {
  monitorName?: string;
  recipientEmail: string;
  timestamp: string;
  dashboardUrl?: string;
}): { html: string; text: string; subject: string } {
  const title = options.monitorName
    ? `Alert Delivery Test: ${options.monitorName}`
    : 'Pingava Email Delivery Test';
  const subject = options.monitorName
    ? `[TEST] ${options.monitorName} Alert Test`
    : 'Test Alert from Pingava Uptime Monitoring';
  const targetDashboard = options.dashboardUrl || 'https://dashboard.pingava.com';

  const text = `${title}

This is a test notification confirming that your Pingava email delivery integration is operational.

Recipient: ${options.recipientEmail}
Timestamp: ${options.timestamp}

View Dashboard:
${targetDashboard}

Powered by Pingava Synthetic Reliability Platform
alerts@pingava.com`;

  const bodyHtml = `
    <!-- Success Banner -->
    <div style="background: rgba(18, 183, 106, 0.12); border: 1px solid rgba(18, 183, 106, 0.3); border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="middle" style="width: 32px; font-size: 24px;">⚡</td>
          <td valign="middle" style="padding-left: 10px;">
            <div style="font-size: 16px; font-weight: 700; color: #34d399;">
              SMTP Alert Pipeline Operational
            </div>
            <div style="font-size: 13px; color: #cbd5e1; margin-top: 2px;">
              Your email delivery integration is active and verified.
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Metadata Table -->
    <div style="background: #0a1120; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        ${
          options.monitorName
            ? `
            <tr>
              <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px; width: 38%;">Target Monitor</td>
              <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-weight: 700;">
                ${escapeHtml(options.monitorName)}
              </td>
            </tr>
            `
            : ''
        }
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px; width: 38%;">Verified Recipient</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace;">
            ${escapeHtml(options.recipientEmail)}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; color: #94a3b8; font-size: 13px;">Dispatched At</td>
          <td style="padding: 12px 18px; color: #cbd5e1; font-size: 13px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace;">
            ${escapeHtml(options.timestamp)}
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
      When an incident occurs or recovers, dispatches will be delivered to this inbox within milliseconds of multi-probe confirmation.
    </p>
  `;

  const html = renderBaseEmailLayout({
    preheader: 'Pingava email delivery integration test notification.',
    badgeText: 'Test Dispatch',
    badgeType: 'info',
    title: escapeHtml(title),
    subtitle: 'This test confirms that your alert routing and SMTP delivery pipeline are configured properly.',
    bodyHtml,
    ctaText: 'Open Pingava Dashboard →',
    ctaUrl: targetDashboard,
    recipientEmail: options.recipientEmail,
  });

  return { html, text, subject };
}

/**
 * 8. EMAIL CHANGE CONFIRMATION (Dispatched to the requested new email)
 */
export function renderEmailChangeConfirmEmail(options: {
  userName: string;
  oldEmail: string;
  newEmail: string;
  confirmUrl: string;
}): { html: string; text: string } {
  const safeName = escapeHtml(options.userName);
  const safeNew = escapeHtml(options.newEmail);
  const safeOld = escapeHtml(options.oldEmail);
  const safeUrl = escapeHtml(options.confirmUrl);

  const text = `Confirm your new email address

Hello ${options.userName},

A request was made to update your Pingava account email address from ${options.oldEmail} to ${options.newEmail}.

Click the link below to confirm this change (valid for 2 hours):
${options.confirmUrl}

If you did not make this request, please ignore this email.

Pingava Security Team
https://pingava.com`;

  const bodyHtml = `
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #cbd5e1;">
      Hello <strong>${safeName}</strong>,
    </p>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.65; color: #cbd5e1;">
      A request was submitted to update your Pingava workspace email from <code>${safeOld}</code> to <code>${safeNew}</code>.
    </p>
    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.65; color: #94a3b8;">
      Click the button below to confirm this change. For security reasons, this link is valid for <strong>2 hours</strong>.
    </p>

    <!-- Fallback link -->
    <div style="background: #0a1120; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 6px;">Button not working? Copy &amp; paste this URL:</div>
      <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 12px; color: #38bdf8; word-break: break-all; line-height: 1.45;">
        ${safeUrl}
      </div>
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: 'Confirm your updated Pingava account email address.',
    badgeText: 'Email Change',
    badgeType: 'brand',
    title: 'Confirm your new email address',
    subtitle: 'Verify your new email to complete the account update.',
    bodyHtml,
    ctaText: 'Confirm Email Change →',
    ctaUrl: options.confirmUrl,
    recipientEmail: options.newEmail,
    footerNote: 'If you did not request this update, you can safely ignore this email.',
  });

  return { html, text };
}

/**
 * 9. EMAIL CHANGE SECURITY NOTICE (Dispatched to the current account email)
 */
export function renderEmailChangeSecurityAlertEmail(options: {
  userName: string;
  oldEmail: string;
  newEmail: string;
}): { html: string; text: string } {
  const safeName = escapeHtml(options.userName);
  const safeNew = escapeHtml(options.newEmail);

  const text = `[Security Alert] Email change requested for your Pingava account

Hello ${options.userName},

A request was recently submitted to change your Pingava account email address to ${options.newEmail}.

If you initiated this change, please check your new inbox at ${options.newEmail} to confirm it.

If you did NOT request this, someone may have accessed your account. Please log in immediately and update your password or contact support at connect@pingava.com.

Pingava Security Team
https://pingava.com`;

  const bodyHtml = `
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #cbd5e1;">
      Hello <strong>${safeName}</strong>,
    </p>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.65; color: #cbd5e1;">
      A request was recently submitted to change your Pingava account email address to <strong>${safeNew}</strong>.
    </p>
    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.65; color: #94a3b8;">
      If you made this request, a confirmation link was sent to <strong>${safeNew}</strong>.
    </p>

    <!-- Security Warning Box -->
    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px 18px; margin: 20px 0;">
      <div style="font-size: 13px; font-weight: 700; color: #f87171; margin-bottom: 4px;">Didn't request this change?</div>
      <div style="font-size: 13px; color: #fca5a5; line-height: 1.55;">
        If you did not make this change, your account credentials may be compromised. Please sign in to your Pingava dashboard, change your password immediately, or email us at <a href="mailto:connect@pingava.com" style="color: #f87171; font-weight: 600;">connect@pingava.com</a>.
      </div>
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: 'Security Notice: Email change requested for your Pingava account.',
    badgeText: 'Security Notice',
    badgeType: 'danger',
    title: 'Security Notice: Email Change Requested',
    subtitle: 'An update to your workspace email was initiated.',
    bodyHtml,
    ctaText: 'Review Account Security in Dashboard →',
    ctaUrl: 'https://dashboard.pingava.com/settings',
    recipientEmail: options.oldEmail,
  });

  return { html, text };
}

/**
 * 10. META-GUARDIAN WATCHDOG ALERT: System Self-Monitoring
 */
export function renderMetaGuardianAlertEmail(options: {
  title: string;
  message: string;
  revision: string;
  timestamp: string;
  isTest?: boolean;
}): { html: string; text: string } {
  const isTest = options.isTest ?? false;
  const safeTitle = escapeHtml(options.title);
  const safeMsg = escapeHtml(options.message);

  const text = `${isTest ? '[TEST] ' : ''}Pingava Meta-Guardian Alert: ${options.title}

${options.message}

Time: ${options.timestamp}
Cloud Run Revision: ${options.revision}
Dashboard: https://dashboard.pingava.com/observability`;

  const bodyHtml = `
    <div style="background: ${isTest ? 'rgba(56, 189, 248, 0.12)' : 'rgba(239, 68, 68, 0.15)'}; border: 1px solid ${isTest ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.35)'}; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="middle" style="width: 32px; font-size: 24px;">${isTest ? '🛡️' : '🚨'}</td>
          <td valign="middle" style="padding-left: 10px;">
            <div style="font-size: 16px; font-weight: 700; color: ${isTest ? '#38bdf8' : '#f87171'};">
              ${safeTitle}
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
              Meta-Guardian Self-Observability Engine
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Message Payload Box -->
    <div style="background: #0a1120; border-left: 4px solid ${isTest ? '#0284c7' : '#ef4444'}; padding: 16px; border-radius: 6px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 13px; color: #f8fafc; white-space: pre-wrap; margin-bottom: 24px; line-height: 1.55;">${safeMsg}</div>

    <!-- Metadata Grid -->
    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
      <div style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
        <div>Cloud Run Revision: <code style="color: #38bdf8;">${escapeHtml(options.revision)}</code></div>
        <div>Dispatched At: <code style="color: #cbd5e1;">${escapeHtml(options.timestamp)}</code></div>
      </div>
    </div>
  `;

  const html = renderBaseEmailLayout({
    preheader: `Meta-Guardian Alert: ${options.title}`,
    badgeText: isTest ? 'Observability Test' : 'Meta-Guardian Watchdog',
    badgeType: isTest ? 'info' : 'danger',
    title: isTest ? 'Meta-Guardian Test Verification' : `🚨 ${safeTitle}`,
    subtitle: 'Pingava autonomous self-observability and watchdog alert.',
    bodyHtml,
    ctaText: 'Open Observability Dashboard →',
    ctaUrl: 'https://dashboard.pingava.com/observability',
  });

  return { html, text };
}

/**
 * 11. CONTACT INQUIRY ACKNOWLEDGMENT: Visitor Confirmation
 */
export function renderContactInquiryAckEmail(options: {
  ticketId: string | number;
  topic: string;
  subject: string;
  message: string;
  email: string;
}): { html: string; text: string } {
  const safeTopic = escapeHtml(options.topic);
  const safeSubject = escapeHtml(options.subject);
  const safeMessage = escapeHtml(options.message);

  const text = `Inquiry Received - Ticket #${options.ticketId}

Hello,

Thank you for contacting Pingava. We have received your inquiry regarding "${options.topic}" (Ticket #${options.ticketId}):

Subject: ${options.subject}
Message:
${options.message}

Our team has received your query at connect@pingava.com and will follow up with you directly.

Best regards,
The Pingava Team
connect@pingava.com
https://pingava.com`;

  const bodyHtml = `
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #cbd5e1;">Hello,</p>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.65; color: #cbd5e1;">
      Thank you for contacting Pingava. We received your inquiry regarding <strong>${safeTopic}</strong> and assigned it reference ticket <strong>#${escapeHtml(
    options.ticketId
  )}</strong>.
    </p>

    <!-- Ticket Summary Box -->
    <div style="background: #0a1120; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px; width: 30%;">Ticket Reference</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #34d399; font-size: 13px; font-weight: 700; font-family: 'SFMono-Regular', Consolas, Menlo, monospace;">
            #${escapeHtml(options.ticketId)}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Topic</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px;">
            ${safeTopic}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Subject</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-weight: 600;">
            ${safeSubject}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 14px 18px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Your Message</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 0 18px 18px; color: #cbd5e1; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.6; color: #94a3b8;">
      Our engineering &amp; support team is reviewing your message and will follow up with you directly at <strong>${escapeHtml(
        options.email
      )}</strong>.
    </p>
    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
      If you have additional details to share in the meantime, reply directly to this email or write to <a href="mailto:connect@pingava.com" style="color: #34d399; font-weight: 600; text-decoration: none;">connect@pingava.com</a>.
    </p>
  `;

  const html = renderBaseEmailLayout({
    preheader: `We have received your inquiry: Ticket #${options.ticketId} - ${options.subject}`,
    badgeText: `Ticket #${options.ticketId}`,
    badgeType: 'brand',
    title: 'Inquiry Received',
    subtitle: 'We have received your message and will follow up shortly.',
    bodyHtml,
    recipientEmail: options.email,
  });

  return { html, text };
}

/**
 * 12. TEAM INQUIRY DISPATCH: Internal Lead Notification
 */
export function renderTeamInquiryAlertEmail(options: {
  ticketId: string | number;
  topic: string;
  subject: string;
  message: string;
  email: string;
}): { html: string; text: string } {
  const safeTopic = escapeHtml(options.topic);
  const safeSubject = escapeHtml(options.subject);
  const safeMessage = escapeHtml(options.message);
  const safeEmail = escapeHtml(options.email);

  const text = `New Inquiry Submitted: #${options.ticketId} (${options.topic})

Work Email: ${options.email}
Topic: ${options.topic}
Subject: ${options.subject}

Message:
${options.message}

Reply directly to respond to ${options.email}.`;

  const bodyHtml = `
    <!-- Summary Header -->
    <div style="background: rgba(8, 122, 75, 0.12); border: 1px solid rgba(18, 183, 106, 0.3); border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 15px; font-weight: 700; color: #34d399;">New Website Lead / Support Inquiry</div>
      <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">Ticket #${escapeHtml(
        options.ticketId
      )} &bull; ${safeTopic}</div>
    </div>

    <!-- Key Metadata Table -->
    <div style="background: #0a1120; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px; width: 30%;">Work Email</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #38bdf8; font-size: 13px; font-weight: 600;">
            <a href="mailto:${safeEmail}" style="color: #38bdf8; text-decoration: none;">${safeEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Topic</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px;">
            ${safeTopic}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-size: 13px;">Subject</td>
          <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f8fafc; font-size: 13px; font-weight: 600;">
            ${safeSubject}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 14px 18px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Inquiry Message</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 0 18px 18px; color: #f1f5f9; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 12px; line-height: 1.55; color: #64748b; text-align: center;">
      Hit &lsquo;Reply&rsquo; in your email client to respond directly to ${safeEmail}.
    </p>
  `;

  const html = renderBaseEmailLayout({
    preheader: `[New Inquiry] #${options.ticketId} from ${options.email}: ${options.subject}`,
    badgeText: `Inquiry #${options.ticketId}`,
    badgeType: 'info',
    title: `Inquiry: ${safeSubject}`,
    subtitle: `Received from ${safeEmail}`,
    bodyHtml,
    ctaText: `Reply to ${safeEmail} →`,
    ctaUrl: `mailto:${options.email}?subject=Re:%20[Pingava%20%23${options.ticketId}]%20${encodeURIComponent(options.subject)}`,
  });

  return { html, text };
}
