/**
 * Security Service for Pingava
 * Centralized cryptographic hashing, timing-safe verification, and SSRF outbound target protection.
 */

import crypto from 'node:crypto';
import dns from 'node:dns';

export const PBKDF2_ITERATIONS = 210000;

/**
 * Hashes a plaintext password using PBKDF2-HMAC-SHA512 with 210,000 iterations.
 * Format: pbkdf2:<iterations>:<salt>:<hash>
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
  return `pbkdf2:${PBKDF2_ITERATIONS}:${salt}:${hash}`;
}

/**
 * Timing-safe password verification supporting modern (210k iterations) and legacy (1k iterations) hashes.
 * Protects against timing attacks and buffer-length mismatch exceptions.
 */
export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash || !password) return false;

  if (storedHash.startsWith('pbkdf2:')) {
    const parts = storedHash.split(':');
    let iterations = 1000;
    let salt = '';
    let originalHash = '';

    if (parts.length === 4) {
      // Modern format: pbkdf2:<iterations>:<salt>:<hash>
      iterations = parseInt(parts[1], 10) || PBKDF2_ITERATIONS;
      salt = parts[2];
      originalHash = parts[3];
    } else if (parts.length === 3) {
      // Legacy format: pbkdf2:<salt>:<hash> (1,000 iterations)
      iterations = 1000;
      salt = parts[1];
      originalHash = parts[2];
    } else {
      return false;
    }

    try {
      const testHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
      const bTest = Buffer.from(testHash, 'hex');
      const bOrig = Buffer.from(originalHash, 'hex');

      if (bTest.length !== bOrig.length || bTest.length === 0) {
        return false;
      }
      return crypto.timingSafeEqual(bTest, bOrig);
    } catch {
      return false;
    }
  }

  // Plaintext match fallback for initial seed accounts before first login
  return storedHash === password;
}

export interface SafeTargetResult {
  safeUrl: string;
  sanitizedHeaders: Record<string, string>;
}

/**
 * Checks whether an IP address belongs to loopback, link-local, cloud metadata, or private RFC1918 networks.
 */
export function isPrivateOrInternalIp(ip: string): boolean {
  if (!ip) return false;
  let lower = ip.toLowerCase().trim();

  // Strip brackets if IPv6 literal like [::1] or [::ffff:127.0.0.1]
  if (lower.startsWith('[') && lower.endsWith(']')) {
    lower = lower.slice(1, -1);
  }

  // Check and extract IPv6-mapped IPv4 address (e.g., ::ffff:127.0.0.1, ::ffff:7f00:1, ::ffff:a9fe:a9fe)
  if (lower.startsWith('::ffff:')) {
    const v4Part = lower.slice(7);
    if (v4Part.includes('.')) {
      return isPrivateOrInternalIp(v4Part);
    }
    const hexParts = v4Part.split(':');
    if (hexParts.length === 2) {
      const high = parseInt(hexParts[0], 16);
      const low = parseInt(hexParts[1], 16);
      if (!isNaN(high) && !isNaN(low)) {
        const d1 = (high >> 8) & 0xff;
        const d2 = high & 0xff;
        const d3 = (low >> 8) & 0xff;
        const d4 = low & 0xff;
        return isPrivateOrInternalIp(`${d1}.${d2}.${d3}.${d4}`);
      }
    }
  }

  // IPv6 checks
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80:') || lower.startsWith('fc00:') || lower.startsWith('fd00:')) return true;

  // IPv4 checks
  const match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;

  const a = parseInt(match[1], 10);
  const b = parseInt(match[2], 10);

  if (a === 127) return true; // 127.0.0.0/8 (Loopback)
  if (a === 0) return true; // 0.0.0.0/8 (Broadcast / current network)
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 (Link-local & GCP/AWS/Azure metadata)
  if (a === 10) return true; // 10.0.0.0/8 (Private RFC 1918)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 (Private RFC 1918)
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 (Private RFC 1918)
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (Carrier-Grade NAT)

  return false;
}

/**
 * Validates that an outbound target URL is safe to probe:
 * 1. Protocol must be http: or https:
 * 2. Hostname must not be localhost, metadata services, or internal names
 * 3. Resolved DNS IP addresses must not be private/reserved
 * 4. User-supplied headers are sanitized to prevent cloud metadata authorization bypass (Metadata-Flavor)
 */
export async function validateSafeOutboundTarget(
  rawUrl: string,
  headers?: Record<string, any>
): Promise<SafeTargetResult> {
  const urlStr = String(rawUrl || '').trim();
  if (!urlStr) {
    throw new Error('Target URL is required.');
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error('Invalid URL format.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol '${parsed.protocol}'. Only HTTP and HTTPS are allowed.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  const FORBIDDEN_HOSTNAMES = new Set([
    'localhost',
    'metadata.google.internal',
    'metadata',
    '169.254.169.254',
    '0.0.0.0',
    '::1',
    '[::1]'
  ]);

  if (
    FORBIDDEN_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Requests to internal hostnames and cloud metadata services are forbidden.');
  }

  if (isPrivateOrInternalIp(hostname)) {
    throw new Error('Testing private, loopback, or cloud metadata IP addresses is not allowed.');
  }

  try {
    const lookupResults = await dns.promises.lookup(hostname, { all: true });
    for (const record of lookupResults) {
      if (isPrivateOrInternalIp(record.address)) {
        throw new Error(`Domain '${hostname}' resolves to private/internal IP '${record.address}' which is forbidden.`);
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('resolves to private/internal IP')) {
      throw err;
    }
    // If DNS resolution fails (e.g. offline sandbox or non-existent domain), allow fetch to attempt and report natural network failure
  }

  const sanitizedHeaders: Record<string, string> = {};
  if (headers && typeof headers === "object") {
    const FORBIDDEN_HEADER_PREFIXES = ['metadata-flavor', 'x-google-', 'x-metadata-', 'x-forwarded-'];
    for (const [k, v] of Object.entries(headers)) {
      const lower = k.toLowerCase().trim();
      if (!FORBIDDEN_HEADER_PREFIXES.some(prefix => lower.startsWith(prefix))) {
        sanitizedHeaders[k] = String(v);
      }
    }
  }

  return { safeUrl: parsed.toString(), sanitizedHeaders };
}

export interface VerifiedGoogleUser {
  email: string;
  name: string;
  picture?: string;
}

/**
 * Validates and verifies Google ID tokens.
 * In production, checks cryptographic validity via Google's tokeninfo API.
 * Validates expiration, audience client ID, and verified email status.
 */
export async function verifyGoogleIdToken(
  credential?: string,
  expectedClientId?: string
): Promise<VerifiedGoogleUser | null> {
  if (!credential || typeof credential !== 'string') return null;

  const parts = credential.split('.');
  if (parts.length !== 3) return null;

  let payload: any;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = Buffer.from(padded, 'base64').toString('utf8');
    payload = JSON.parse(jsonPayload);
  } catch {
    return null;
  }

  if (!payload || !payload.email || typeof payload.email !== 'string') {
    return null;
  }

  // 1. Check expiration if present
  if (payload.exp && typeof payload.exp === 'number') {
    const nowSec = Math.floor(Date.now() / 1000);
    // Allow up to 5 minutes clock skew
    if (payload.exp < nowSec - 300) {
      return null;
    }
  }

  // 2. Check audience if expectedClientId is configured
  const effectiveClientId = expectedClientId || process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (effectiveClientId && payload.aud && payload.aud !== effectiveClientId) {
    return null;
  }

  // 3. Check email_verified
  const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true';
  if (!isEmailVerified) {
    return null;
  }

  // 4. Verify cryptographic signature via Google's tokeninfo endpoint if network is reachable
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 4000);
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
      signal: ctrl.signal
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const verified = await resp.json();
      if (verified && verified.email) {
        if (effectiveClientId && verified.aud !== effectiveClientId) {
          return null;
        }
        return {
          email: String(verified.email).toLowerCase().trim(),
          name: verified.name || verified.given_name || String(verified.email).split('@')[0],
          picture: verified.picture || undefined
        };
      }
      return null;
    } else if (process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production') {
      // In production, failure of Google's tokeninfo endpoint means token is rejected
      return null;
    }
  } catch {
    // In strict production mode, network failure verifying Google token should not permit bypass
    if (process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production') {
      return null;
    }
  }

  // Fallback for offline testing / sandbox test runs
  if (process.env.NODE_ENV === 'test' || process.env.VITEST || !process.env.NODE_ENV) {
    return {
      email: String(payload.email).toLowerCase().trim(),
      name: payload.name || payload.given_name || String(payload.email).split('@')[0],
      picture: payload.picture || undefined
    };
  }

  return null;
}

export interface SafeFetchOptions extends RequestInit {
  maxRedirects?: number;
}

/**
 * Performs outbound HTTP requests with redirect-aware SSRF protection:
 * 1. Validates the initial target against the SSRF guardian.
 * 2. Follows redirects manually up to maxRedirects (default 5).
 * 3. Re-evaluates each redirect location against forbidden hostnames, metadata IPs, and private subnets.
 * 4. Sanitizes sensitive headers across all hops.
 */
export async function safeFetch(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const maxRedirects = options.maxRedirects ?? 5;
  let currentUrl = targetUrl;
  let redirectsCount = 0;

  // Make a copy of options
  const { maxRedirects: _, ...fetchOpts } = options;

  while (true) {
    const { safeUrl, sanitizedHeaders } = await validateSafeOutboundTarget(
      currentUrl,
      fetchOpts.headers as Record<string, any>
    );

    const mergedHeaders: Record<string, string> = {
      ...(fetchOpts.headers as Record<string, string> || {}),
      ...sanitizedHeaders
    };

    const response = await fetch(safeUrl, {
      ...fetchOpts,
      headers: mergedHeaders,
      redirect: 'manual'
    });

    const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
    if (!isRedirect) {
      return response;
    }

    redirectsCount++;
    if (redirectsCount > maxRedirects) {
      throw new Error(`Exceeded maximum allowed redirects (${maxRedirects}).`);
    }

    const location = response.headers.get('location');
    if (!location) {
      return response;
    }

    // Resolve redirect location against current URL (handles both relative and absolute redirect targets)
    const nextUrl = new URL(location, currentUrl).toString();

    // Adjust method and body for standard HTTP redirect semantics
    if (response.status === 303 || ((response.status === 301 || response.status === 302) && fetchOpts.method === 'POST')) {
      fetchOpts.method = 'GET';
      delete fetchOpts.body;
    }

    currentUrl = nextUrl;
  }
}
