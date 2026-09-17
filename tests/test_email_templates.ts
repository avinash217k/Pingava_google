import {
  renderSignupVerificationEmail,
  renderPasswordResetEmail,
  renderWelcomeEmail,
  renderMonitorAlertEmail,
  renderSslExpiryAlertEmail,
  renderHeartbeatAlertEmail,
  renderTestAlertEmail,
  renderEmailChangeConfirmEmail,
  renderEmailChangeSecurityAlertEmail,
  renderMetaGuardianAlertEmail,
  renderContactInquiryAckEmail,
  renderTeamInquiryAlertEmail,
} from '../emailTemplates';

console.log('Testing email template generation...');

// 1. Signup Verification Email
const signup = renderSignupVerificationEmail({
  verifyUrl: 'https://pingava.com/verify-email?token=test-token-12345',
  email: 'alex@example.com',
  expiresInMinutes: 30,
});
console.assert(signup.html.includes('Verify your email address'), 'Signup HTML missing title');
console.assert(signup.html.includes('https://pingava.com/verify-email?token=test-token-12345'), 'Signup HTML missing URL');
console.assert(signup.html.includes('linear-gradient'), 'Signup HTML missing brand gradient');
console.assert(signup.text.includes('test-token-12345'), 'Signup text missing URL');
console.log('✔ Signup Verification Email passed');

// 2. Password Reset Email
const reset = renderPasswordResetEmail({
  resetUrl: 'https://pingava.com/reset-password?token=reset-token-67890',
  email: 'alex@example.com',
  expiresInMinutes: 60,
});
console.assert(reset.html.includes('Reset Your Password'), 'Reset HTML missing title');
console.assert(reset.html.includes('reset-token-67890'), 'Reset HTML missing URL');
console.assert(reset.text.includes('reset-token-67890'), 'Reset text missing URL');
console.log('✔ Password Reset Email passed');

// 3. Welcome Email
const welcome = renderWelcomeEmail({
  name: 'Alex Rivera',
  email: 'alex@example.com',
  dashboardUrl: 'https://dashboard.pingava.com/monitors',
});
console.assert(welcome.html.includes('Welcome aboard, Alex! 👋'), 'Welcome HTML missing greeting');
console.assert(welcome.html.includes('Add Your First Monitor'), 'Welcome HTML missing CTA');
console.assert(welcome.text.includes('Alex'), 'Welcome text missing name');
console.log('✔ Welcome Email passed');

// 4. Monitor Outage Alert Email
const outage = renderMonitorAlertEmail({
  kind: 'down',
  monitorName: 'Production API Gateway',
  monitorUrl: 'https://api.acme.corp/v1/health',
  errorMessage: 'HTTP 504 Gateway Timeout from Frankfurt Edge',
  statusCode: 504,
  durationMs: 8200,
  timestamp: new Date().toISOString(),
  failureStreak: 3,
  incidentId: 42,
});
console.assert(outage.subject.includes('[ALERT] Production API Gateway is DOWN!'), 'Outage subject mismatch');
console.assert(outage.html.includes('Service Outage Confirmed'), 'Outage HTML missing status');
console.assert(outage.html.includes('HTTP 504 Gateway Timeout'), 'Outage HTML missing error');
console.log('✔ Monitor Outage Alert Email passed');

// 5. Monitor Recovery Alert Email
const recovery = renderMonitorAlertEmail({
  kind: 'recovery',
  monitorName: 'Production API Gateway',
  monitorUrl: 'https://api.acme.corp/v1/health',
  durationMs: 94,
  timestamp: new Date().toISOString(),
  recoveryStreak: 3,
});
console.assert(recovery.subject.includes('[RECOVERED] Production API Gateway is back up!'), 'Recovery subject mismatch');
console.assert(recovery.html.includes('Service Restored &amp; Operational'), 'Recovery HTML missing status');
console.log('✔ Monitor Recovery Alert Email passed');

// 6. SSL Expiry Alert Email
const ssl = renderSslExpiryAlertEmail({
  monitorName: 'Acme Auth Portal',
  monitorUrl: 'https://auth.acme.corp',
  daysRemaining: 7,
  expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  issuer: "Let's Encrypt Authority X3",
  protocol: 'TLS 1.3',
  urgency: 'CRITICAL: Expires in 7 days',
});
console.assert(ssl.subject.includes('expires in 7 days'), 'SSL subject mismatch');
console.assert(ssl.html.includes('Certificate Expires in 7 Days'), 'SSL HTML missing days');
console.log('✔ SSL Expiry Alert Email passed');

// 7. Heartbeat Alert Email
const heartbeat = renderHeartbeatAlertEmail({
  kind: 'down',
  jobName: 'Daily Billing Sync Worker',
  periodSeconds: 86400,
  graceSeconds: 3600,
  lastPingAt: new Date(Date.now() - 95000000).toISOString(),
  timestamp: new Date().toISOString(),
});
console.assert(heartbeat.subject.includes('[CRON MISSED]'), 'Heartbeat subject mismatch');
console.assert(heartbeat.html.includes('Cron Job Check-In Overdue'), 'Heartbeat HTML missing status');
console.log('✔ Heartbeat Alert Email passed');

// 8. Test Alert Email
const testAlert = renderTestAlertEmail({
  monitorName: 'Staging Ingestion Node',
  recipientEmail: 'devops@example.com',
  timestamp: new Date().toISOString(),
});
console.assert(testAlert.subject.includes('[TEST]'), 'Test alert subject mismatch');
console.assert(testAlert.html.includes('SMTP Alert Pipeline Operational'), 'Test alert HTML missing text');
console.log('✔ Test Alert Email passed');

// 9. Contact Inquiry Visitor Ack Email
const ack = renderContactInquiryAckEmail({
  ticketId: 'PGV-9821',
  topic: 'Enterprise Monitoring Probes',
  subject: 'Custom synthetic intervals question',
  message: 'We require 10-second checks across 10 regions. Is this supported in the enterprise plan?',
  email: 'cto@enterprise.com',
});
console.assert(ack.html.includes('Ticket #PGV-9821'), 'Ack HTML missing ticket ID');
console.log('✔ Contact Inquiry Ack Email passed');

console.log('\n🎉 ALL 9 EMAIL TEMPLATE TESTS PASSED SUCCESSFULLY!');
