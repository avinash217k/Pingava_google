import fs from "node:fs";
import path from "node:path";

export interface PublicRouteMeta {
  title: string;
  description: string;
  canonicalPath: string;
  isIndexable: boolean;
}

const PUBLIC_METADATA: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Pingava – Know Before Your Users Do | Website & API Uptime Monitoring",
    description: "Monitor websites and APIs globally. Confirm real outages, catch performance problems, and know before your users do."
  },
  "/features": {
    title: "Features & SRE Observability Suite | Pingava",
    description: "Explore Pingava features: 6-region edge inspector, predictive latency radar, API contract guardian, and AI root cause diagnostics."
  },
  "/pricing": {
    title: "Pricing Plans & Tier Comparison | Pingava",
    description: "Transparent pricing for developer teams and enterprises. Free forever tier, high-frequency checks, and custom probe locations."
  },
  "/demo": {
    title: "Live Interactive Demo Dashboard | Pingava",
    description: "Experience Pingava live with zero authentication. Explore synthetic monitors, edge waterfalls, latency anomaly radar, and incident timelines."
  },
  "/docs": {
    title: "Documentation & Guides | Pingava",
    description: "Comprehensive developer guides for synthetic uptime checks, API payload testing, multi-region probes, and public status pages."
  },
  "/api-docs": {
    title: "REST API Documentation & Reference | Pingava",
    description: "Complete REST API reference for Pingava. Automate monitors, query incident metrics, manage status pages, and configure webhooks."
  },
  "/blog": {
    title: "Engineering & Reliability Blog | Pingava",
    description: "Deep-dives on distributed synthetic probes, SSL lifecycle management, high-availability architecture, and incident response."
  },
  "/changelog": {
    title: "Product Changelog & Release Notes | Pingava",
    description: "Explore the latest features, improvements, and fixes across the Pingava synthetic monitoring platform."
  },
  "/website-monitoring": {
    title: "Website Uptime Monitoring | Pingava",
    description: "Monitor website uptime and response times with confirmed outage detection, incident tracking and email alerts from Pingava."
  },
  "/api-monitoring": {
    title: "API Monitoring and Downtime Alerts | Pingava",
    description: "Monitor HTTP APIs, accepted status codes, timeouts, response times and SSL certificates with Pingava."
  },
  "/ssl-monitoring": {
    title: "SSL Certificate Monitoring & Expiry Alerts | Pingava",
    description: "Validate HTTPS certificates, monitor chain validity, TLS handshakes, and receive advance expiry alerts alongside synthetic uptime checks."
  },
  "/status-pages": {
    title: "Public Status Pages for Websites and APIs | Pingava",
    description: "Publish a clear public status page with live service health, incident updates and subscriber notifications using Pingava."
  },
  "/incident-management": {
    title: "Incident Management & AI Post-Mortems | Pingava",
    description: "Track automatic and manual incidents, generate AI post-mortems, coordinate resolution, and keep stakeholders informed with Pingava."
  },
  "/tools/uptime-checker": {
    title: "Free Website Uptime Checker | Pingava",
    description: "Check whether a public website or API endpoint is reachable and see its HTTP status and response time with Pingava."
  },
  "/status": {
    title: "Pingava System Status & Service Health",
    description: "Live status, 90-day uptime metrics, and real-time operational health across Pingava's global probe network and core platform."
  },
  "/about": {
    title: "About Pingava | Next-Gen Synthetic Monitoring",
    description: "Learn how Pingava brings website and API monitoring, multi-region synthetic probes, automated incident response and public status communication together."
  },
  "/contact": {
    title: "Contact Pingava | Engineering & Support",
    description: "Get in touch with the Pingava engineering team for product support, enterprise questions, security disclosures, and integrations."
  },
  "/support": {
    title: "Help & Support Center | Pingava",
    description: "Find help with monitor setup, response assertions, alert routing, webhook configuration, and your Pingava workspace."
  },
  "/privacy": {
    title: "Privacy Policy | Pingava",
    description: "How Pingava collects, processes, and protects your personal data and synthetic monitoring configurations."
  },
  "/terms": {
    title: "Terms of Service | Pingava",
    description: "Terms governing use of Pingava synthetic uptime monitoring, API probe network, and status page hosting."
  }
};

export function isPublicPagePath(p: string): boolean {
  const normalized = p.replace(/\/$/, "") || "/";
  return Boolean(PUBLIC_METADATA[normalized] || normalized.startsWith("/status/"));
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getPublicPageMeta(p: string): PublicRouteMeta {
  const normalized = p.replace(/\/$/, "") || "/";
  const item = PUBLIC_METADATA[normalized];
  if (item) {
    return {
      title: item.title,
      description: item.description,
      canonicalPath: normalized,
      isIndexable: true
    };
  }
  if (normalized.startsWith("/status/")) {
    const rawSlug = normalized.replace(/^\/status\//, "");
    const safeSlug = rawSlug.replace(/[^a-zA-Z0-9_\-\.]/g, "").slice(0, 100) || "default";
    const displaySlug = escapeHtml(safeSlug);
    return {
      title: `${displaySlug} Service Status | Pingava`,
      description: `Live status, uptime history, and operational performance for ${displaySlug}.`,
      canonicalPath: `/status/${safeSlug}`,
      isIndexable: true
    };
  }
  return {
    title: "Pingava – Know Before Your Users Do | Website & API Uptime Monitoring",
    description: "Monitor website uptime, APIs and response times with multi-region edge inspection, API contract drift guardian, predictive latency anomaly radar, downtime alerts and status pages. Know before your users do.",
    canonicalPath: normalized,
    isIndexable: false
  };
}

export function renderPublicPageContent(p: string): string {
  const normalized = p.replace(/\/$/, "") || "/";

  if (normalized === "/" || normalized === "/home" || normalized === "/marketing") {
    return `
    <div class="modern-landing" style="background-color:#070d18;color:#f8fafc;min-height:100vh;overflow-x:hidden;position:relative;">
    <div class="modern-hero-watermark" aria-hidden="true"></div>
    <header class="modern-nav" style="display:flex;align-items:center;justify-content:space-between;padding:1.25rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);">
      <a href="/" class="modern-nav-brand" style="display:flex;align-items:center;gap:0.75rem;text-decoration:none;color:#fff;font-weight:700;font-size:1.2rem;">
        <span style="display:inline-block;width:24px;height:24px;background:#38bdf8;border-radius:6px;"></span>
        <span>pingava</span>
      </a>
      <nav class="modern-nav-links" style="display:flex;gap:1.5rem;align-items:center;">
        <a href="/features" style="color:#94a3b8;text-decoration:none;">Features</a>
        <a href="/pricing" style="color:#94a3b8;text-decoration:none;">Pricing</a>
        <a href="/docs" style="color:#94a3b8;text-decoration:none;">Docs</a>
        <a href="/blog" style="color:#94a3b8;text-decoration:none;">Blog</a>
        <a href="/demo" style="color:#38bdf8;text-decoration:none;font-weight:600;">Live Demo</a>
      </nav>
      <div class="modern-nav-actions" style="display:flex;gap:1rem;align-items:center;">
        <a href="/login" style="color:#cbd5e1;text-decoration:none;">Sign In</a>
        <a href="/register" style="background:#0284c7;color:#fff;padding:0.5rem 1.2rem;border-radius:8px;text-decoration:none;font-weight:600;">Start Free</a>
      </div>
    </header>

    <main>
      <section class="modern-hero-section" style="text-align:center;padding:4rem 1.5rem 2rem;max-width:1100px;margin:0 auto;position:relative;">
        <div style="display:inline-flex;align-items:center;gap:0.5rem;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.25);padding:0.4rem 1rem;border-radius:999px;color:#38bdf8;font-size:0.85rem;margin-bottom:1.5rem;position:relative;z-index:1;">
          <span style="width:8px;height:8px;background:#34d399;border-radius:50%;display:inline-block;"></span>
          THE COMPLETE SRE &amp; RELIABILITY SUITE: AI Root Cause Diagnostics + Latency Jitter Radar
        </div>
        <h1 style="font-size:3rem;line-height:1.15;font-weight:800;color:#f8fafc;margin-bottom:1.5rem;">
          Next-Gen Uptime &amp; API Reliability. <br />
          <span style="background:linear-gradient(135deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Engineered to Reduce False Alarms.</span>
        </h1>
        <p style="font-size:1.15rem;color:#94a3b8;max-width:760px;margin:0 auto 1rem;line-height:1.6;">
          Monitor websites and APIs globally. Confirm real outages, catch performance problems, and understand why failures happen before your users report them.
        </p>
        <p style="font-size:0.95rem;color:#38bdf8;max-width:760px;margin:0 auto 2rem;font-weight:500;letter-spacing:0.01em;">
          Multi-region checks &middot; API validation &middot; Latency intelligence &middot; AI diagnostics
        </p>
        <div style="display:flex;gap:1rem;justify-content:center;align-items:center;flex-wrap:wrap;margin-bottom:2.5rem;">
          <a href="/register" style="background:#0284c7;color:#fff;padding:0.85rem 1.85rem;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem;">Start Monitoring Free &rarr;</a>
          <a href="/demo" style="background:rgba(255,255,255,0.06);color:#f1f5f9;border:1px solid rgba(255,255,255,0.15);padding:0.85rem 1.85rem;border-radius:10px;text-decoration:none;font-weight:600;font-size:1rem;">View Live Demo</a>
          <a href="#uptime-checker" style="background:transparent;color:#34d399;border:1px solid rgba(52,211,153,0.3);padding:0.85rem 1.85rem;border-radius:10px;text-decoration:none;font-weight:600;font-size:1rem;">Test Endpoint Live</a>
        </div>
        <div style="display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;color:#94a3b8;font-size:0.9rem;">
          <span>&check; 15s to 60s checks</span>
          <span>&check; 6 Global Edge Regions</span>
          <span>&check; AI Diagnostics</span>
          <span>&check; Predictive Jitter Radar</span>
          <span>&check; SSL Expiry Guardian</span>
          <span>&check; $0 Free Forever Tier</span>
        </div>
      </section>

      <!-- Dogfooding Edge Status Widget Placeholder -->
      <section style="max-width:880px;margin:1rem auto 3rem;padding:0 1rem;" id="edge-dogfooding-status">
        <div style="background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:1.25rem 1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.65rem;">
              <span style="display:inline-block;width:10px;height:10px;background:#10b981;border-radius:50%;"></span>
              <strong style="color:#f8fafc;font-size:0.95rem;">All Edge Systems Operational</strong>
              <span style="background:rgba(16,185,129,0.15);color:#34d399;font-size:0.75rem;padding:0.2rem 0.6rem;border-radius:999px;font-family:monospace;font-weight:700;">99.99% 30d</span>
            </div>
            <span style="font-size:0.8rem;color:#64748b;font-family:monospace;">Checked live across 4 of 6 global regions</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;">
            <div style="background:rgba(2,6,23,0.5);border:1px solid rgba(255,255,255,0.05);padding:0.75rem 1rem;border-radius:8px;">
              <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.35rem;"><span style="color:#94a3b8;">US-East (N. Virginia)</span><strong style="color:#34d399;font-family:monospace;">24 ms</strong></div>
              <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;"><div style="width:24%;height:100%;background:#34d399;"></div></div>
            </div>
            <div style="background:rgba(2,6,23,0.5);border:1px solid rgba(255,255,255,0.05);padding:0.75rem 1rem;border-radius:8px;">
              <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.35rem;"><span style="color:#94a3b8;">EU-Central (Frankfurt)</span><strong style="color:#38bdf8;font-family:monospace;">82 ms</strong></div>
              <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;"><div style="width:55%;height:100%;background:#38bdf8;"></div></div>
            </div>
            <div style="background:rgba(2,6,23,0.5);border:1px solid rgba(255,255,255,0.05);padding:0.75rem 1rem;border-radius:8px;">
              <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.35rem;"><span style="color:#94a3b8;">AP-South (Mumbai)</span><strong style="color:#34d399;font-family:monospace;">18 ms</strong></div>
              <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;"><div style="width:18%;height:100%;background:#34d399;"></div></div>
            </div>
            <div style="background:rgba(2,6,23,0.5);border:1px solid rgba(255,255,255,0.05);padding:0.75rem 1rem;border-radius:8px;">
              <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.35rem;"><span style="color:#94a3b8;">AP-Southeast (Singapore)</span><strong style="color:#34d399;font-family:monospace;">41 ms</strong></div>
              <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;"><div style="width:41%;height:100%;background:#34d399;"></div></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Instant URL Tester Section -->
      <section id="uptime-checker" style="max-width:960px;margin:2rem auto 4rem;padding:0 1.5rem;text-align:center;">
        <h2 style="font-size:2rem;color:#f8fafc;margin-bottom:0.75rem;">Test your website or REST API right now</h2>
        <p style="color:#94a3b8;max-width:640px;margin:0 auto 1.5rem;line-height:1.5;">Enter any public URL or API endpoint. We will ping it live from our global edge and inspect HTTP status, DNS lookup time, TTFB, and SSL health — no account required.</p>
        <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(255,255,255,0.12);padding:1.5rem;border-radius:12px;text-align:left;">
          <form action="/register" method="GET" style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            <input type="url" name="url" placeholder="https://yourdomain.com or https://api.yourdomain.com/health" style="flex:1;min-width:280px;background:#020617;border:1px solid rgba(255,255,255,0.15);color:#fff;padding:0.85rem 1rem;border-radius:8px;font-family:monospace;" />
            <button type="submit" style="background:#10b981;color:#fff;padding:0.85rem 1.75rem;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Run Instant Test</button>
          </form>
          <div style="margin-top:1rem;color:#64748b;font-size:0.85rem;">Try quick presets: <a href="/register?url=https://github.com" style="color:#38bdf8;text-decoration:none;margin-right:0.75rem;">github.com</a> <a href="/register?url=https://stripe.com" style="color:#38bdf8;text-decoration:none;margin-right:0.75rem;">stripe.com</a> <a href="/register?url=https://cloudflare.com" style="color:#38bdf8;text-decoration:none;">cloudflare.com</a></div>
        </div>
      </section>
    </main>

    <footer style="border-top:1px solid rgba(255,255,255,0.08);padding:3rem 2rem;max-width:1100px;margin:0 auto;color:#94a3b8;font-size:0.9rem;">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:2rem;margin-bottom:2rem;">
        <div>
          <strong style="color:#fff;font-size:1.1rem;">pingava</strong>
          <p style="margin-top:0.5rem;max-width:260px;line-height:1.5;">Next-gen website &amp; REST API synthetic monitoring, 6-region global edge waterfalls, and AI root cause diagnostics.</p>
          <div style="margin-top:1.25rem;">
            <a href="https://codehype.ai/product/pingava?utm_source=codehype_badge" target="_blank" rel="noopener noreferrer">
              <img src="https://codehype.ai/badges/pingava.svg?variant=find-us&amp;v=20" alt="Featured on CodeHype" width="180" height="65" loading="lazy" decoding="async" style="display:inline-block;border:0;width:100%;max-width:180px;height:auto;max-height:65px;" />
            </a>
          </div>
        </div>
        <div>
          <strong style="color:#fff;display:block;margin-bottom:0.75rem;">Product</strong>
          <ul style="list-style:none;padding:0;margin:0;line-height:2;">
            <li><a href="/features" style="color:#94a3b8;text-decoration:none;">Features</a></li>
            <li><a href="/pricing" style="color:#94a3b8;text-decoration:none;">Pricing</a></li>
            <li><a href="/demo" style="color:#94a3b8;text-decoration:none;">Live Demo</a></li>
            <li><a href="/status" style="color:#94a3b8;text-decoration:none;">System Status</a></li>
          </ul>
        </div>
        <div>
          <strong style="color:#fff;display:block;margin-bottom:0.75rem;">Resources</strong>
          <ul style="list-style:none;padding:0;margin:0;line-height:2;">
            <li><a href="/docs" style="color:#94a3b8;text-decoration:none;">Documentation</a></li>
            <li><a href="/api-docs" style="color:#94a3b8;text-decoration:none;">API Reference</a></li>
            <li><a href="/blog" style="color:#94a3b8;text-decoration:none;">Engineering Blog</a></li>
            <li><a href="/changelog" style="color:#94a3b8;text-decoration:none;">Changelog</a></li>
          </ul>
        </div>
        <div>
          <strong style="color:#fff;display:block;margin-bottom:0.75rem;">Company</strong>
          <ul style="list-style:none;padding:0;margin:0;line-height:2;">
            <li><a href="/about" style="color:#94a3b8;text-decoration:none;">About</a></li>
            <li><a href="/contact" style="color:#94a3b8;text-decoration:none;">Contact</a></li>
            <li><a href="/privacy" style="color:#94a3b8;text-decoration:none;">Privacy Policy</a></li>
            <li><a href="/terms" style="color:#94a3b8;text-decoration:none;">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.05);padding-top:1.5rem;font-size:0.85rem;">
        <span>&copy; 2026 Pingava. All rights reserved.</span>
        <span><a href="/sitemap.xml" style="color:#64748b;text-decoration:none;">Sitemap</a></span>
      </div>
    </footer>
    </div>
    `;
  }

  if (normalized === "/features") {
    return `
    <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava</a>
      <nav style="display:flex;gap:1.5rem;"><a href="/" style="color:#94a3b8;text-decoration:none;">Home</a><a href="/pricing" style="color:#94a3b8;text-decoration:none;">Pricing</a><a href="/demo" style="color:#38bdf8;text-decoration:none;">Demo</a></nav>
    </header>
    <main style="max-width:1100px;margin:3rem auto;padding:0 1.5rem;">
      <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:1rem;">Features &amp; SRE Observability Suite</h1>
      <p style="font-size:1.15rem;color:#94a3b8;margin-bottom:3rem;line-height:1.6;">Everything engineering teams need to detect outages before customers notice, eliminate false alarms, and diagnose failures instantly.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;">
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <h2 style="color:#38bdf8;font-size:1.35rem;margin-bottom:0.75rem;">6-Region Edge Inspector</h2>
          <p style="color:#94a3b8;line-height:1.6;">Run synthetic probes from North America, Europe, and Asia-Pacific. Identify DNS propagation delays, TLS handshake bottlenecks, and regional routing degradation.</p>
        </article>
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <h2 style="color:#818cf8;font-size:1.35rem;margin-bottom:0.75rem;">Predictive Latency Radar</h2>
          <p style="color:#94a3b8;line-height:1.6;">Track jitter variance and standard deviation across fleet response times to forecast silent degradation before outright downtime occurs.</p>
        </article>
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <h2 style="color:#34d399;font-size:1.35rem;margin-bottom:0.75rem;">API Contract Drift Guardian</h2>
          <p style="color:#94a3b8;line-height:1.6;">Automatically infer JSON response schemas and detect breaking schema drift, type regressions, and missing fields across every API check.</p>
        </article>
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <h2 style="color:#fbbf24;font-size:1.35rem;margin-bottom:0.75rem;">AI Root Cause Diagnostics</h2>
          <p style="color:#94a3b8;line-height:1.6;">When outages strike, Pingava synthesizes HTTP traces, regional edge logs, and headers into an executive-ready post-mortem with actionable remediation advice.</p>
        </article>
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <h2 style="color:#f472b6;font-size:1.35rem;margin-bottom:0.75rem;">Passive Cron Heartbeats</h2>
          <p style="color:#94a3b8;line-height:1.6;">Dead Man's Snitch monitoring for database backups, background workers, and recurring cron jobs with customizable grace intervals.</p>
        </article>
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <h2 style="color:#2dd4bf;font-size:1.35rem;margin-bottom:0.75rem;">Branded Public Status Pages</h2>
          <p style="color:#94a3b8;line-height:1.6;">Share transparent real-time availability with your customers. Built-in email subscription, incident history, and 90-day uptime bars.</p>
        </article>
      </div>
      <div style="text-align:center;margin-top:4rem;">
        <a href="/register" style="background:#0284c7;color:#fff;padding:0.9rem 2.2rem;border-radius:10px;text-decoration:none;font-weight:700;font-size:1.05rem;">Start Free &mdash; No Credit Card Required &rarr;</a>
      </div>
    </main>
    `;
  }

  if (normalized === "/pricing") {
    return `
    <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava</a>
      <nav style="display:flex;gap:1.5rem;"><a href="/features" style="color:#94a3b8;text-decoration:none;">Features</a><a href="/docs" style="color:#94a3b8;text-decoration:none;">Docs</a><a href="/demo" style="color:#38bdf8;text-decoration:none;">Demo</a></nav>
    </header>
    <main style="max-width:1100px;margin:3rem auto;padding:0 1.5rem;text-align:center;">
      <span style="display:inline-block;background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);padding:0.35rem 1rem;border-radius:999px;font-size:0.85rem;font-weight:700;margin-bottom:1rem;letter-spacing:0.04em;">PUBLIC EARLY ACCESS PROGRAM</span>
      <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:1rem;">100% Free During Launch. Paid Tiers Coming Soon.</h1>
      <p style="font-size:1.15rem;color:#94a3b8;margin-bottom:3rem;max-width:700px;margin-left:auto;margin-right:auto;">All synthetic uptime and API monitoring features are completely free during our public launch while payment aggregator compliance is finalized. No credit card required.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;text-align:left;">
        <div style="background:rgba(15,23,42,0.9);border:2px solid #10b981;padding:2rem;border-radius:12px;position:relative;">
          <span style="position:absolute;top:-12px;right:20px;background:#10b981;color:#0f172a;font-size:0.75rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:999px;">ACTIVE NOW</span>
          <h2 style="font-size:1.35rem;color:#f8fafc;margin-bottom:0.5rem;">Early Access Edition</h2>
          <div style="font-size:2rem;font-weight:800;color:#f8fafc;margin-bottom:1rem;">$0 <span style="font-size:1rem;color:#10b981;font-weight:600;">/ forever free during launch</span></div>
          <p style="color:#94a3b8;font-size:0.9rem;margin-bottom:1.5rem;">Full platform capabilities with zero fees. No credit card needed.</p>
          <ul style="list-style:none;padding:0;margin:0 0 2rem;color:#cbd5e1;line-height:2;font-size:0.9rem;">
            <li>&check; 10 synthetic monitors</li>
            <li>&check; 1-minute check intervals</li>
            <li>&check; 6-Region Global Edge Inspector</li>
            <li>&check; Unlimited public status pages with CNAME &amp; SSL</li>
            <li>&check; Multi-channel alerts (Email, Telegram, Slack, Discord)</li>
            <li>&check; AI root cause post-mortems</li>
          </ul>
          <a href="/register" style="display:block;text-align:center;background:#10b981;color:#06271f;padding:0.75rem;border-radius:8px;text-decoration:none;font-weight:700;">Start Monitoring Free</a>
        </div>
        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:2rem;border-radius:12px;position:relative;">
          <span style="position:absolute;top:-12px;right:20px;background:#38bdf8;color:#0f172a;font-size:0.75rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:999px;">COMING SOON</span>
          <h2 style="font-size:1.35rem;color:#f8fafc;margin-bottom:0.5rem;">Pro SRE Suite</h2>
          <div style="font-size:2rem;font-weight:800;color:#f8fafc;margin-bottom:1rem;">Coming Soon <span style="font-size:1rem;color:#94a3b8;font-weight:400;">(Post-verification)</span></div>
          <p style="color:#94a3b8;font-size:0.9rem;margin-bottom:1.5rem;">Higher monitor capacity and predictive analytics for scaling teams.</p>
          <ul style="list-style:none;padding:0;margin:0 0 2rem;color:#cbd5e1;line-height:2;font-size:0.9rem;">
            <li>&check; 60+ synthetic monitors</li>
            <li>&check; 30-second check intervals</li>
            <li>&check; Predictive Latency Jitter Radar (P50–P99)</li>
            <li>&check; API Contract &amp; Schema Drift Guardian</li>
            <li>&check; 1-year telemetry retention</li>
            <li>&check; Priority probe dispatch</li>
          </ul>
          <a href="/register" style="display:block;text-align:center;background:rgba(255,255,255,0.1);color:#fff;padding:0.75rem;border-radius:8px;text-decoration:none;font-weight:600;">Enroll in Early Access</a>
        </div>
        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:2rem;border-radius:12px;position:relative;">
          <span style="position:absolute;top:-12px;right:20px;background:#818cf8;color:#0f172a;font-size:0.75rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:999px;">COMING SOON</span>
          <h2 style="font-size:1.35rem;color:#f8fafc;margin-bottom:0.5rem;">Team / Enterprise</h2>
          <div style="font-size:2rem;font-weight:800;color:#f8fafc;margin-bottom:1rem;">Coming Soon <span style="font-size:1rem;color:#94a3b8;font-weight:400;">(Post-verification)</span></div>
          <p style="color:#94a3b8;font-size:0.9rem;margin-bottom:1.5rem;">Mission-critical reliability for scaling engineering organizations.</p>
          <ul style="list-style:none;padding:0;margin:0 0 2rem;color:#cbd5e1;line-height:2;font-size:0.9rem;">
            <li>&check; 250+ monitors</li>
            <li>&check; 15-second check intervals</li>
            <li>&check; Multi-user RBAC &amp; team workspaces</li>
            <li>&check; Dedicated private probe clusters</li>
            <li>&check; 99.99% availability SLA guarantee</li>
            <li>&check; Priority 24/7 engineering support</li>
          </ul>
          <a href="/contact" style="display:block;text-align:center;background:rgba(255,255,255,0.1);color:#fff;padding:0.75rem;border-radius:8px;text-decoration:none;font-weight:600;">Talk to Engineering</a>
        </div>
      </div>
    </main>
    `;
  }

  if (normalized === "/demo") {
    return `
    <header style="padding:1rem 2rem;background:#0f172a;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava <span style="color:#38bdf8;font-size:0.8rem;font-weight:400;margin-left:0.5rem;">[Live Demo]</span></a>
      <a href="/register" style="background:#0284c7;color:#fff;padding:0.5rem 1.2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem;">Set Up Your Own Free Account &rarr;</a>
    </header>
    <main style="max-width:1150px;margin:2rem auto;padding:0 1.5rem;">
      <div style="background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);border-radius:10px;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem;">
        <span style="color:#e2e8f0;font-size:0.95rem;">You are viewing an interactive read-only demo populated with live synthetic data.</span>
        <a href="/register" style="color:#38bdf8;font-weight:600;text-decoration:none;">Set Up Your Own Free Account &rarr;</a>
      </div>
      <h1 style="font-size:2rem;color:#f8fafc;margin-bottom:0.5rem;">Fleet Overview Dashboard</h1>
      <p style="color:#94a3b8;margin-bottom:2rem;">5 sample services monitored across global edge nodes.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2rem;">
        <div style="background:#1e293b;padding:1.25rem;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
          <div style="color:#94a3b8;font-size:0.85rem;">Overall Uptime</div>
          <strong style="color:#34d399;font-size:1.75rem;">99.98%</strong>
        </div>
        <div style="background:#1e293b;padding:1.25rem;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
          <div style="color:#94a3b8;font-size:0.85rem;">Avg. Response Time</div>
          <strong style="color:#38bdf8;font-size:1.75rem;">34 ms</strong>
        </div>
        <div style="background:#1e293b;padding:1.25rem;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
          <div style="color:#94a3b8;font-size:0.85rem;">Active Services</div>
          <strong style="color:#f8fafc;font-size:1.75rem;">5 / 5</strong>
        </div>
        <div style="background:#1e293b;padding:1.25rem;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
          <div style="color:#94a3b8;font-size:0.85rem;">Global Edge Nodes</div>
          <strong style="color:#f8fafc;font-size:1.75rem;">6 Nodes</strong>
        </div>
      </div>
    </main>
    `;
  }

  if (normalized === "/docs" || normalized === "/api-docs") {
    return `
    <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava <span style="color:#94a3b8;font-weight:400;font-size:0.9rem;">docs</span></a>
      <a href="/register" style="background:#0284c7;color:#fff;padding:0.5rem 1.2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem;">Start Free</a>
    </header>
    <main style="max-width:1000px;margin:3rem auto;padding:0 1.5rem;">
      <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:1rem;">Documentation &amp; Guides</h1>
      <p style="font-size:1.15rem;color:#94a3b8;margin-bottom:2.5rem;line-height:1.6;">Learn how to configure synthetic uptime checks, API assertions, multi-region edge monitoring, and alert dispatchers.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.5rem;border-radius:10px;">
          <h2 style="color:#38bdf8;font-size:1.2rem;margin-bottom:0.5rem;">Quickstart Guide</h2>
          <p style="color:#94a3b8;font-size:0.9rem;line-height:1.5;">Create your first monitor, set acceptable status codes, configure check frequencies, and verify alert channels in under 3 minutes.</p>
        </article>
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.5rem;border-radius:10px;">
          <h2 style="color:#38bdf8;font-size:1.2rem;margin-bottom:0.5rem;">REST API Reference</h2>
          <p style="color:#94a3b8;font-size:0.9rem;line-height:1.5;">Automate monitor provisioning via Terraform, GitHub Actions, or curl using our complete programmatic REST API.</p>
        </article>
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.5rem;border-radius:10px;">
          <h2 style="color:#38bdf8;font-size:1.2rem;margin-bottom:0.5rem;">Webhook Integrations</h2>
          <p style="color:#94a3b8;font-size:0.9rem;line-height:1.5;">Dispatch outage payloads into Telegram, Slack, Discord, PagerDuty, OpsGenie, and custom HTTP webhook endpoints.</p>
        </article>
      </div>
    </main>
    `;
  }

  if (normalized === "/about") {
    return `
    <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava</a>
      <nav style="display:flex;gap:1.5rem;"><a href="/" style="color:#94a3b8;text-decoration:none;">Home</a><a href="/features" style="color:#94a3b8;text-decoration:none;">Features</a><a href="/contact" style="color:#94a3b8;text-decoration:none;">Contact</a></nav>
    </header>
    <main style="max-width:960px;margin:3rem auto;padding:0 1.5rem;">
      <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:1rem;">About Pingava</h1>
      <p style="font-size:1.15rem;color:#94a3b8;margin-bottom:2.5rem;line-height:1.6;">Next-gen synthetic website and API uptime monitoring built by reliability engineers to eliminate silent downtime without alert fatigue.</p>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:3rem;">
        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.25rem;border-radius:10px;">
          <div style="color:#38bdf8;font-size:1.75rem;font-weight:800;margin-bottom:0.25rem;">6 Regions</div>
          <div style="color:#94a3b8;font-size:0.85rem;">Global Synthetic Edge Probes</div>
        </div>
        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.25rem;border-radius:10px;">
          <div style="color:#34d399;font-size:1.75rem;font-weight:800;margin-bottom:0.25rem;">15s &ndash; 30s</div>
          <div style="color:#94a3b8;font-size:0.85rem;">Sub-Minute Check Intervals</div>
        </div>
        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.25rem;border-radius:10px;">
          <div style="color:#fbbf24;font-size:1.75rem;font-weight:800;margin-bottom:0.25rem;">Quorum</div>
          <div style="color:#94a3b8;font-size:0.85rem;">Consecutive Failure Rules</div>
        </div>
        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.25rem;border-radius:10px;">
          <div style="color:#f472b6;font-size:1.75rem;font-weight:800;margin-bottom:0.25rem;">99.99%</div>
          <div style="color:#94a3b8;font-size:0.85rem;">Core Dispatcher &amp; Ingestion SLA</div>
        </div>
      </div>

      <section style="margin-bottom:3rem;">
        <h2 style="color:#f8fafc;font-size:1.5rem;margin-bottom:1rem;">Our Mission</h2>
        <p style="color:#94a3b8;line-height:1.7;margin-bottom:1rem;">Pingava was founded by engineers who experienced first-hand the acute pain of monitoring fatigue: inboxes inundated with false alarms at 3 AM caused by single-hop transit hiccups, while critical silent degradations&mdash;such as API contract drift, latency tail-spikes, and expiring SSL certificates&mdash;slipped past unnoticed until frustrated users reported them.</p>
        <p style="color:#94a3b8;line-height:1.7;">Our mission is to eliminate silent downtime through high-fidelity synthetic observability and radical incident transparency. By combining distributed multi-region edge probes, zero-noise confirmation algorithms, deep API payload validation, and transparent public status communication, we ensure engineering teams know exactly what is happening across their stack before their users do.</p>
      </section>

      <section style="margin-bottom:3rem;">
        <h2 style="color:#f8fafc;font-size:1.5rem;margin-bottom:1rem;">Architectural Principles</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.5rem;border-radius:10px;">
            <h3 style="color:#38bdf8;font-size:1.15rem;margin-bottom:0.5rem;">External Edge Vantage Points</h3>
            <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;">Probing endpoints from outside the firewall across North America, Europe, and Asia-Pacific, dissecting DNS, TCP, TLS, and TTFB timings.</p>
          </div>
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.5rem;border-radius:10px;">
            <h3 style="color:#34d399;font-size:1.15rem;margin-bottom:0.5rem;">Zero-Noise Outage Confirmation</h3>
            <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;">Filtering out transient internet routing blips with consecutive failure thresholds and multi-region quorum consensus before paging engineers.</p>
          </div>
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.5rem;border-radius:10px;">
            <h3 style="color:#fbbf24;font-size:1.15rem;margin-bottom:0.5rem;">Deep API &amp; SSL Hygiene</h3>
            <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;">Validating JSON Path response schemas and auditing certificate chains with multi-tier advance alerts (30, 14, 7 days) before expiry.</p>
          </div>
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.5rem;border-radius:10px;">
            <h3 style="color:#f472b6;font-size:1.15rem;margin-bottom:0.5rem;">Radical Operational Transparency</h3>
            <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;">Hosted public status pages with subscriber email broadcasts and AI-assisted post-mortems that turn downtime hurdles into demonstrations of maturity.</p>
          </div>
        </div>
      </section>

      <section style="margin-bottom:3rem;">
        <h2 style="color:#f8fafc;font-size:1.5rem;margin-bottom:1rem;">Official Brand Identity &amp; Logo Assets</h2>
        <p style="color:#94a3b8;line-height:1.7;margin-bottom:1.5rem;">Download official Pingava logo files, app icons, and favicons for light and dark backgrounds, press kits, and third-party integrations.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1rem;border-radius:10px;">
            <strong style="color:#38bdf8;display:block;margin-bottom:0.25rem;">Primary Brand Logo</strong>
            <span style="color:#94a3b8;font-size:0.85rem;display:block;margin-bottom:0.75rem;">Full logo on dark background with tagline</span>
            <a href="/pingava-logo.png" download style="color:#fff;font-size:0.85rem;text-decoration:none;background:rgba(56,189,248,0.2);padding:0.4rem 0.8rem;border-radius:6px;display:inline-block;">Download Logo</a>
          </div>
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1rem;border-radius:10px;">
            <strong style="color:#34d399;display:block;margin-bottom:0.25rem;">Brand Mark / Icon</strong>
            <span style="color:#94a3b8;font-size:0.85rem;display:block;margin-bottom:0.75rem;">Transparent circular monitoring ring</span>
            <a href="/pingava-mark.png" download style="color:#fff;font-size:0.85rem;text-decoration:none;background:rgba(52,211,153,0.2);padding:0.4rem 0.8rem;border-radius:6px;display:inline-block;">Download Mark</a>
          </div>
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1rem;border-radius:10px;">
            <strong style="color:#fbbf24;display:block;margin-bottom:0.25rem;">Light Background Logo</strong>
            <span style="color:#94a3b8;font-size:0.85rem;display:block;margin-bottom:0.75rem;">Colored icon + dark wordmark</span>
            <a href="/pingava-logo-light.png" download style="color:#fff;font-size:0.85rem;text-decoration:none;background:rgba(251,191,36,0.2);padding:0.4rem 0.8rem;border-radius:6px;display:inline-block;">Download Logo</a>
          </div>
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1rem;border-radius:10px;">
            <strong style="color:#f472b6;display:block;margin-bottom:0.25rem;">App Icon &amp; Favicons</strong>
            <span style="color:#94a3b8;font-size:0.85rem;display:block;margin-bottom:0.75rem;">Squircle container &amp; multi-size icons</span>
            <a href="/pingava-app-icon.png" download style="color:#fff;font-size:0.85rem;text-decoration:none;background:rgba(244,114,182,0.2);padding:0.4rem 0.8rem;border-radius:6px;display:inline-block;">Download App Icon</a>
          </div>
        </div>
      </section>

      <section>
        <h2 style="color:#f8fafc;font-size:1.5rem;margin-bottom:1rem;">Direct Access to Builders</h2>
        <p style="color:#94a3b8;line-height:1.7;">Reach our founders and reliability engineering team directly at <a href="mailto:connect@pingava.com" style="color:#38bdf8;text-decoration:none;">connect@pingava.com</a> or <a href="mailto:support@pingava.com" style="color:#38bdf8;text-decoration:none;">support@pingava.com</a>.</p>
      </section>
    </main>
    `;
  }

  if (normalized === "/contact") {
    return `
    <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava</a>
      <nav style="display:flex;gap:1.5rem;"><a href="/" style="color:#94a3b8;text-decoration:none;">Home</a><a href="/features" style="color:#94a3b8;text-decoration:none;">Features</a><a href="/support" style="color:#94a3b8;text-decoration:none;">Support</a></nav>
    </header>
    <main style="max-width:960px;margin:3rem auto;padding:0 1.5rem;">
      <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:1rem;">Contact Pingava Engineering</h1>
      <p style="font-size:1.15rem;color:#94a3b8;margin-bottom:2.5rem;line-height:1.6;">Direct channels for technical support, enterprise custom probe deployments, security disclosures, and integrations.</p>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;margin-bottom:3rem;">
        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <h2 style="color:#f8fafc;font-size:1.25rem;margin-bottom:0.75rem;">Technical &amp; Monitoring Support</h2>
          <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin-bottom:1rem;">For monitor configuration questions, check failure diagnostics, and active incident assistance.</p>
          <a href="mailto:support@pingava.com" style="color:#34d399;font-weight:700;font-size:1.1rem;text-decoration:none;">support@pingava.com</a>
          <div style="margin-top:1rem;color:#64748b;font-size:0.8rem;">Target SLA: &lt; 2 hours for critical incidents</div>
        </div>

        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <h2 style="color:#f8fafc;font-size:1.25rem;margin-bottom:0.75rem;">General Inquiries &amp; Partnerships</h2>
          <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin-bottom:1rem;">For enterprise contracts, custom probe regions, billing, and strategic integrations.</p>
          <a href="mailto:connect@pingava.com" style="color:#38bdf8;font-weight:700;font-size:1.1rem;text-decoration:none;">connect@pingava.com</a>
          <div style="margin-top:1rem;color:#64748b;font-size:0.8rem;">Target SLA: Same-day business response</div>
        </div>
      </div>

      <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:2rem;border-radius:12px;">
        <h2 style="color:#f8fafc;font-size:1.35rem;margin-bottom:0.75rem;">Fast Resolution Tip</h2>
        <p style="color:#94a3b8;line-height:1.6;font-size:0.95rem;">To help our team resolve technical inquiries on the first response, please include your <strong>target URL or API endpoint</strong>, the <strong>affected probe region(s)</strong> (e.g., Frankfurt, Mumbai, Virginia), and the observed <strong>HTTP status code or error snippet</strong>.</p>
      </div>
    </main>
    `;
  }

  if (normalized === "/privacy") {
    return `
    <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava</a>
      <a href="/terms" style="color:#94a3b8;text-decoration:none;">Terms of Service</a>
    </header>
    <main style="max-width:860px;margin:3rem auto;padding:0 1.5rem;">
      <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:0.5rem;">Privacy Policy</h1>
      <p style="color:#64748b;font-size:0.9rem;margin-bottom:2.5rem;">Last updated: September 15, 2026 &middot; Effective immediately</p>
      
      <div style="color:#cbd5e1;line-height:1.8;font-size:1rem;">
        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">1. Introduction &amp; Controller Identity</h2>
        <p>Pingava (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates a synthetic website and API uptime monitoring platform. We act as a Data Controller for account, billing, and platform interaction data, and as a Data Processor for synthetic check configurations and public status page subscriber notifications. Contact: <a href="mailto:connect@pingava.com" style="color:#38bdf8;">connect@pingava.com</a>.</p>

        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">2. Information We Collect</h2>
        <p>We collect account credentials (name, email, salted hashed passwords, Google OAuth IDs), synthetic target configurations (URLs, HTTP methods, custom headers, JSON Path assertions), operational telemetry (HTTP response codes, DNS, TCP, TLS, and TTFB latencies, TLS certificate expiration metadata, and error snippets), and status page subscriber emails.</p>

        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">3. AI Diagnostics &amp; Telemetry Privacy</h2>
        <p>Telemetry-only processing: AI diagnostic post-mortems analyze operational metadata (HTTP codes, latency timelines, and sanitized response snippets) solely to provide root cause summaries. Customer API configurations and response payloads are never sold or used to train generalized public foundational AI models.</p>

        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">4. Subprocessors &amp; Service Providers</h2>
        <p>We rely on trusted cloud infrastructure providers including Google Cloud Platform (Cloud Run, Firebase/Firestore), transactional email relays, Google Identity, and privacy-conscious analytics (PostHog/Google Analytics) under strict data protection agreements.</p>

        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">5. Data Retention &amp; Rights</h2>
        <p>Account records are retained while active. Metrics and logs are retained according to your plan tier (30 to 365+ days). You may exercise statutory GDPR, UK GDPR, and CCPA rights (access, rectification, deletion, portability) by emailing <a href="mailto:connect@pingava.com" style="color:#38bdf8;">connect@pingava.com</a> or <a href="mailto:support@pingava.com" style="color:#38bdf8;">support@pingava.com</a>.</p>
      </div>
    </main>
    `;
  }

  if (normalized === "/terms") {
    return `
    <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava</a>
      <a href="/privacy" style="color:#94a3b8;text-decoration:none;">Privacy Policy</a>
    </header>
    <main style="max-width:860px;margin:3rem auto;padding:0 1.5rem;">
      <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:0.5rem;">Terms of Service</h1>
      <p style="color:#64748b;font-size:0.9rem;margin-bottom:2.5rem;">Last updated: September 15, 2026 &middot; Effective immediately</p>
      
      <div style="color:#cbd5e1;line-height:1.8;font-size:1rem;">
        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">1. Acceptance &amp; Eligibility</h2>
        <p>By creating an account or using Pingava synthetic monitoring services, you agree to these Terms. You must be at least 18 years old and possess the legal authority to bind your organization.</p>

        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">2. Customer Authorization &amp; Acceptable Use (AUP)</h2>
        <p>You explicitly warrant that you own or have express legal authorization to monitor, ping, and request every website URL, IP, or API endpoint configured in your account. Probing third-party endpoints without permission, conducting denial-of-service (DDoS) attacks, vulnerability scanning, or sending spam via status pages is strictly prohibited and results in immediate account termination.</p>

        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">3. Monitoring Limitations &amp; Disclaimers</h2>
        <p>Synthetic checks are discrete measurements from external edge vantage points. Pingava is an observability and alerting utility, not an automated failover DNS, load balancer, or disaster recovery system. We disclaim liability for transit routing delays or filtered third-party notifications.</p>

        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">4. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Pingava disclaims all indirect, consequential, or lost-profit damages. Pingava&rsquo;s total aggregate liability shall not exceed the greater of One Hundred United States Dollars ($100.00 USD) or the total fees paid by you in the prior three (3) months.</p>

        <h2 style="color:#f8fafc;margin-top:2rem;font-size:1.35rem;">5. Contact &amp; Legal Notices</h2>
        <p>Direct all legal inquiries and formal notices to <a href="mailto:connect@pingava.com" style="color:#38bdf8;">connect@pingava.com</a> and technical security reports to <a href="mailto:support@pingava.com" style="color:#38bdf8;">support@pingava.com</a>.</p>
      </div>
    </main>
    `;
  }

  if (normalized === "/changelog") {
    return `
    <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava</a>
      <a href="/register" style="background:#0284c7;color:#fff;padding:0.5rem 1.2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem;">Start Free</a>
    </header>
    <main style="max-width:960px;margin:3rem auto;padding:0 1.5rem;">
      <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:1rem;">Product Changelog &amp; Release Notes</h1>
      <p style="font-size:1.15rem;color:#94a3b8;margin-bottom:2.5rem;line-height:1.6;">Follow the latest features, probe expansion, and reliability improvements across the Pingava platform.</p>
      
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <div style="display:flex;gap:1rem;align-items:center;margin-bottom:0.75rem;"><strong style="color:#38bdf8;font-size:1.1rem;">v2.4.0</strong><span style="color:#64748b;font-size:0.85rem;">September 2026</span></div>
          <h2 style="color:#f8fafc;font-size:1.35rem;margin-bottom:0.5rem;">6-Region Edge Probes &amp; Predictive Latency Radar</h2>
          <p style="color:#94a3b8;line-height:1.6;font-size:0.95rem;">Distributed synthetic probing across US-East (Virginia), US-West (Oregon), EU-Central (Frankfurt), EU-West (London), AP-South (Mumbai), and AP-East (Singapore), with predictive p95 latency jitter tracking.</p>
        </article>

        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <div style="display:flex;gap:1rem;align-items:center;margin-bottom:0.75rem;"><strong style="color:#38bdf8;font-size:1.1rem;">v2.3.0</strong><span style="color:#64748b;font-size:0.85rem;">August 2026</span></div>
          <h2 style="color:#f8fafc;font-size:1.35rem;margin-bottom:0.5rem;">AI Automated Incident Post-Mortems</h2>
          <p style="color:#94a3b8;line-height:1.6;font-size:0.95rem;">Instant synthesis of HTTP failure status codes, request bodies, and edge timestamps into polished markdown post-mortems.</p>
        </article>

        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <div style="display:flex;gap:1rem;align-items:center;margin-bottom:0.75rem;"><strong style="color:#38bdf8;font-size:1.1rem;">v2.2.0</strong><span style="color:#64748b;font-size:0.85rem;">July 2026</span></div>
          <h2 style="color:#f8fafc;font-size:1.35rem;margin-bottom:0.5rem;">SSL / TLS Certificate Guardian &amp; Expiry Warning Tiers</h2>
          <p style="color:#94a3b8;line-height:1.6;font-size:0.95rem;">Multi-tier notifications at 30, 14, 7, and 1 days before expiration with complete intermediate trust chain validation.</p>
        </article>
      </div>
    </main>
    `;
  }

  if (normalized === "/blog") {
    return `
    <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
      <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava</a>
      <a href="/register" style="background:#0284c7;color:#fff;padding:0.5rem 1.2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem;">Start Free</a>
    </header>
    <main style="max-width:960px;margin:3rem auto;padding:0 1.5rem;">
      <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:1rem;">Engineering &amp; Reliability Blog</h1>
      <p style="font-size:1.15rem;color:#94a3b8;margin-bottom:2.5rem;line-height:1.6;">Technical deep-dives on distributed edge synthetic probes, SSL lifecycle management, and incident response architecture.</p>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <span style="color:#38bdf8;font-size:0.8rem;font-weight:700;text-transform:uppercase;">Architecture &middot; 6 min read</span>
          <h2 style="color:#f8fafc;font-size:1.25rem;margin:0.5rem 0;">Designing Zero-Overhead Multi-Region Synthetic Probes at Scale</h2>
          <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;">How distributed edge probe nodes across 6 global regions run deterministic synthetic HTTP checks without false alerts caused by transient BGP flapping.</p>
        </article>

        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <span style="color:#34d399;font-size:0.8rem;font-weight:700;text-transform:uppercase;">Reliability &middot; 8 min read</span>
          <h2 style="color:#f8fafc;font-size:1.25rem;margin:0.5rem 0;">Why 99.9% Uptime Is No Longer Enough: Surviving with Latency SLAs</h2>
          <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;">Why binary 200 OK checks mask serious outages, and how tracking p95/p99 latency jitter catches system collapse before failure occurs.</p>
        </article>

        <article style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);padding:1.75rem;border-radius:12px;">
          <span style="color:#fbbf24;font-size:0.8rem;font-weight:700;text-transform:uppercase;">Security &middot; 5 min read</span>
          <h2 style="color:#f8fafc;font-size:1.25rem;margin:0.5rem 0;">The Anatomy of an SSL Expiry Outage (and How to Never Have One)</h2>
          <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;">Why automated ACME renewals fail quietly in production, and how multi-tiered advance certificate alerts prevent hard client terminations.</p>
        </article>
      </div>
    </main>
    `;
  }

  // Generic fallback public page
  const meta = getPublicPageMeta(normalized);

  return `
  <header style="padding:1.5rem 2rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
    <a href="/" style="color:#fff;font-weight:700;font-size:1.2rem;text-decoration:none;">pingava</a>
    <a href="/register" style="background:#0284c7;color:#fff;padding:0.5rem 1.2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem;">Start Free</a>
  </header>
  <main style="max-width:860px;margin:3rem auto;padding:0 1.5rem;">
    <h1 style="font-size:2.5rem;color:#f8fafc;margin-bottom:1rem;">${meta.title}</h1>
    <p style="font-size:1.15rem;color:#94a3b8;line-height:1.6;">${meta.description}</p>
  </main>
  `;
}

export function injectPublicPageIntoHtml(baseHtml: string, pathname: string): string {
  const meta = getPublicPageMeta(pathname);
  const semanticContent = renderPublicPageContent(pathname);

  const safeTitle = escapeHtml(meta.title);
  const safeDescription = escapeHtml(meta.description);

  let result = baseHtml;

  // Replace Title
  result = result.replace(/<title>[^<]*<\/title>/i, `<title>${safeTitle}</title>`);

  // Replace Description
  result = result.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${safeDescription}" />`);

  // Replace Canonical
  const canonicalUrl = `https://www.pingava.com${meta.canonicalPath === "/" ? "/" : meta.canonicalPath}`;
  if (/<link\s+rel="canonical"[^>]*>/i.test(result)) {
    result = result.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    result = result.replace("</head>", `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  // Ensure robots tag is index, follow
  if (/<meta\s+name="robots"[^>]*>/i.test(result)) {
    result = result.replace(/<meta\s+name="robots"[^>]*>/i, `<meta name="robots" content="index, follow" />`);
  } else {
    result = result.replace("</head>", `  <meta name="robots" content="index, follow" />\n</head>`);
  }

  // Update OpenGraph
  result = result.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}" />`);
  result = result.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${safeDescription}" />`);
  result = result.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  // Inject rendered semantic HTML into <div id="root">
  result = result.replace(
    /<div id="root"><\/div>/i,
    `<div id="root">${semanticContent}</div>`
  );

  return result;
}
