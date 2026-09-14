import tls from 'node:tls';
import { URL } from 'node:url';

export interface SslCheckResult {
  valid: boolean;
  status: 'valid' | 'expiring' | 'expired' | 'error' | 'not_applicable';
  valid_from?: string | null;
  expires_at: string | null;
  days_remaining: number | null;
  issuer: string | null;
  subject: string | null;
  protocol: string | null;
  error: string | null;
  checked_at: string;
}

/**
 * Connects to a target HTTPS domain using SNI-enabled TLS socket
 * and inspects the remote peer certificate.
 */
export function checkSslCertificate(targetUrl: string, timeoutMs: number = 8000): Promise<SslCheckResult> {
  const checkedAt = new Date().toISOString();
  let parsed: URL;

  try {
    parsed = new URL(targetUrl);
  } catch {
    return Promise.resolve({
      valid: false,
      status: 'error',
      expires_at: null,
      days_remaining: null,
      issuer: null,
      subject: null,
      protocol: null,
      error: 'Invalid target URL',
      checked_at: checkedAt
    });
  }

  if (parsed.protocol !== 'https:') {
    return Promise.resolve({
      valid: true,
      status: 'not_applicable',
      expires_at: null,
      days_remaining: null,
      issuer: null,
      subject: null,
      protocol: null,
      error: null,
      checked_at: checkedAt
    });
  }

  const hostname = parsed.hostname;
  const port = Number(parsed.port) || 443;

  return new Promise((resolve) => {
    let resolved = false;

    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname, // Required for SNI (Cloudflare, GCP, AWS, CDNs)
        timeout: timeoutMs,
        rejectUnauthorized: false // Inspect even self-signed or expired certs without immediate crash
      },
      () => {
        if (resolved) return;
        resolved = true;

        try {
          const cert = socket.getPeerCertificate();
          const authorized = socket.authorized;
          const authError = socket.authorizationError;
          const protocol = socket.getProtocol();

          socket.end();

          if (!cert || !cert.valid_to) {
            resolve({
              valid: false,
              status: 'error',
              expires_at: null,
              days_remaining: null,
              issuer: null,
              subject: null,
              protocol,
              error: authError ? String(authError) : 'No SSL certificate returned by host',
              checked_at: checkedAt
            });
            return;
          }

          const validToDate = new Date(cert.valid_to);
          const now = Date.now();
          const diffMs = validToDate.getTime() - now;
          const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          let status: 'valid' | 'expiring' | 'expired' | 'error' = 'valid';
          let errorMsg: string | null = null;

          if (daysRemaining <= 0) {
            status = 'expired';
            errorMsg = `SSL certificate expired ${Math.abs(daysRemaining)} days ago (${validToDate.toLocaleDateString()})`;
          } else if (daysRemaining <= 30) {
            status = 'expiring';
            errorMsg = `SSL certificate expires in ${daysRemaining} days (${validToDate.toLocaleDateString()})`;
          } else if (!authorized && authError) {
            status = 'error';
            errorMsg = `Certificate verification issue: ${authError}`;
          }

          const issuerName =
            (typeof cert.issuer?.O === 'string' ? cert.issuer.O : null) ||
            (typeof cert.issuer?.CN === 'string' ? cert.issuer.CN : null) ||
            'Trusted Certificate Authority';

          const subjectName =
            (typeof cert.subject?.CN === 'string' ? cert.subject.CN : null) ||
            hostname;

          const validFromDate = cert.valid_from ? new Date(cert.valid_from) : null;

          resolve({
            valid: status === 'valid' || (status === 'expiring' && daysRemaining > 0),
            status,
            valid_from: validFromDate ? validFromDate.toISOString() : null,
            expires_at: validToDate.toISOString(),
            days_remaining: daysRemaining,
            issuer: issuerName,
            subject: subjectName,
            protocol: protocol || 'TLS',
            error: errorMsg,
            checked_at: checkedAt
          });
        } catch (inspectErr: any) {
          resolve({
            valid: false,
            status: 'error',
            expires_at: null,
            days_remaining: null,
            issuer: null,
            subject: null,
            protocol: null,
            error: inspectErr?.message || 'Failed to inspect SSL certificate',
            checked_at: checkedAt
          });
        }
      }
    );

    socket.on('timeout', () => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        valid: false,
        status: 'error',
        expires_at: null,
        days_remaining: null,
        issuer: null,
        subject: null,
        protocol: null,
        error: `TLS handshake timed out after ${timeoutMs}ms`,
        checked_at: checkedAt
      });
    });

    socket.on('error', (err: any) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        valid: false,
        status: 'error',
        expires_at: null,
        days_remaining: null,
        issuer: null,
        subject: null,
        protocol: null,
        error: err?.message || 'TLS socket connection failed',
        checked_at: checkedAt
      });
    });
  });
}
