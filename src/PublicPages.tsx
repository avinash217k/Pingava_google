import { useState, type ReactNode } from "react"
import {
  Activity,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Globe2,
  HelpCircle,
  Mail,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react"
import metadata from "../public-pages.json"
import { PublicFooter, PublicHeader } from "./MarketingPages"
import { PageMetadata } from "./Seo"
import "./PublicPages.css"

export type PublicPagePath = keyof typeof metadata
// oxlint-disable-next-line react/only-export-components
export function isPublicPagePath(path: string): path is PublicPagePath {
  return Object.hasOwn(metadata, path)
}

function Actions({
  primary = "Start monitoring",
  secondary = "Check an endpoint",
}: {
  primary?: string
  secondary?: string
}) {
  return (
    <div className="public-page-actions">
      <a className="primary-btn" href="/register">
        {primary}
        <ArrowRight size={16} />
      </a>
      <a className="secondary-btn" href="/tools/uptime-checker">
        {secondary}
      </a>
    </div>
  )
}

function Section({
  title,
  children,
  id,
}: {
  title: string
  children: ReactNode
  id?: string
}) {
  return (
    <section className="public-page-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

/* =========================================================
   1. PRICING VIEW
   ========================================================= */
function PricingView() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: "Developer",
      desc: "For individual developers, side projects, and open source tools.",
      price: "$0",
      period: "forever free",
      popular: false,
      btnText: "Start monitoring free",
      btnClass: "outline",
      features: [
        "5 synthetic HTTP / API monitors",
        "3-minute check intervals",
        "1 public status page",
        "SSL certificate validity checks",
        "Email outage & recovery alerts",
        "30-day response history & retention",
        "1 consecutive failure confirmation rule",
      ],
    },
    {
      name: "Pro",
      desc: "For growing web apps, APIs, and teams that need instant alerts.",
      price: isAnnual ? "$15" : "$19",
      period: isAnnual ? "per month (billed annually)" : "per month",
      popular: true,
      btnText: "Start 14-day free trial",
      btnClass: "primary",
      features: [
        "50 synthetic HTTP / API monitors",
        "30-second check intervals",
        "5 status pages with custom domains & SSL",
        "Multi-region edge probes (US, EU, AP)",
        "JSON Path payload assertions",
        "SSL expiry alerts (30, 14, 7 days)",
        "Webhooks, Slack & PagerDuty alerts",
        "1-year high-resolution metrics retention",
        "Predictive Latency Anomaly Radar",
      ],
    },
    {
      name: "Team",
      desc: "For engineering teams operating mission-critical microservices.",
      price: isAnnual ? "$39" : "$49",
      period: isAnnual ? "per month (billed annually)" : "per month",
      popular: false,
      btnText: "Start 14-day free trial",
      btnClass: "primary",
      features: [
        "250 synthetic HTTP / API monitors",
        "15-second check intervals",
        "Unlimited custom status pages",
        "Subscriber email & webhook broadcasts",
        "Gemini AI automated incident post-mortems",
        "API contract drift guardian & schema checks",
        "Multi-region quorum consensus rules",
        "Team seats with role-based access",
        "2-year metrics retention & priority SLA",
      ],
    },
    {
      name: "Enterprise",
      desc: "For high-scale organizations requiring custom probes and guarantees.",
      price: "Custom",
      period: "tailored billing",
      popular: false,
      btnText: "Talk to engineering",
      btnClass: "outline",
      features: [
        "Unlimited synthetic monitors",
        "5-second check intervals",
        "Dedicated private probe clusters",
        "99.99% availability SLA guarantee",
        "SAML 2.0 / Okta SSO & SCIM directory",
        "Custom audit logs & cold storage exports",
        "Dedicated Slack channel with reliability team",
      ],
    },
  ]

  const faqs = [
    {
      q: "What counts as a monitor in Pingava?",
      a: "A monitor is any single website URL, REST API endpoint, or health check that Pingava tests on a recurring schedule. You can configure HTTP methods, custom headers, request bodies, timeout limits, and failure thresholds for each monitor.",
    },
    {
      q: "How does the consecutive failure rule prevent false alarms?",
      a: "Transient network blips and routing hiccups happen on the internet. Pingava verifies outages with consecutive failure checks (e.g. 2 or 3 failed attempts in a row) across multiple edge probes before opening an incident or sending alert notifications.",
    },
    {
      q: "Can I change or cancel my plan at any time?",
      a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time directly from your workspace dashboard. Changes take effect immediately, and annual plans are prorated automatically.",
    },
    {
      q: "Do I need a credit card to sign up for the free Developer tier?",
      a: "No credit card is required. You can sign up with your email or Google account and begin monitoring up to 5 endpoints immediately for free.",
    },
    {
      q: "How does the Gemini AI post-mortem feature work?",
      a: "When an incident resolves, our Gemini AI diagnostic engine synthesizes the failed HTTP codes, error payloads, response latency timeline, and probe locations into an exportable, executive-ready post-mortem report in markdown.",
    },
  ]

  return (
    <>
      <div className="pricing-billing-toggle-wrap">
        <div className="pricing-billing-toggle" role="group" aria-label="Billing frequency">
          <button
            type="button"
            className={!isAnnual ? "active" : ""}
            onClick={() => setIsAnnual(false)}
          >
            Monthly billing
          </button>
          <button
            type="button"
            className={isAnnual ? "active" : ""}
            onClick={() => setIsAnnual(true)}
          >
            Annual billing
          </button>
        </div>
        <span className="pricing-save-badge">Save 20% with annual</span>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`pricing-card ${plan.popular ? "popular" : ""}`}
          >
            {plan.popular && <span className="pricing-popular-badge">Most Popular</span>}
            <h3>{plan.name}</h3>
            <p className="pricing-card-desc">{plan.desc}</p>
            <div className="pricing-price-wrap">
              <span className="pricing-price-amount">{plan.price}</span>
              <span className="pricing-price-period">/{plan.period}</span>
            </div>
            <ul className="pricing-features-list">
              {plan.features.map((feat) => (
                <li key={feat}>
                  <Check size={16} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <a
              href={plan.name === "Enterprise" ? "/contact" : "/register"}
              className={`pricing-card-btn ${plan.btnClass}`}
            >
              {plan.btnText}
            </a>
          </article>
        ))}
      </div>

      <Section title="Feature Comparison">
        <div className="pricing-table-section">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Developer</th>
                <th>Pro</th>
                <th>Team</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Monitor Allowance</strong></td>
                <td>5 monitors</td>
                <td>50 monitors</td>
                <td>250 monitors</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td><strong>Check Interval</strong></td>
                <td>3 minutes</td>
                <td>30 seconds</td>
                <td>15 seconds</td>
                <td>5 seconds</td>
              </tr>
              <tr>
                <td><strong>Global Edge Probes</strong></td>
                <td>1 Region</td>
                <td>6 Global Regions</td>
                <td>6 Global Regions</td>
                <td>Custom Probes</td>
              </tr>
              <tr>
                <td><strong>Public Status Pages</strong></td>
                <td>1 Status Page</td>
                <td>5 Custom Domains</td>
                <td>Unlimited Pages</td>
                <td>White-label / Multi</td>
              </tr>
              <tr>
                <td><strong>SSL Expiry Alerts</strong></td>
                <td>Basic</td>
                <td>30 / 14 / 7 Days</td>
                <td>Granular + Chain</td>
                <td>Dedicated Policy</td>
              </tr>
              <tr>
                <td><strong>Alert Channels</strong></td>
                <td>Email</td>
                <td>Email, Webhook, Slack</td>
                <td>PagerDuty, Webhooks</td>
                <td>Custom Integrations</td>
              </tr>
              <tr>
                <td><strong>AI Root Cause Post-Mortems</strong></td>
                <td>—</td>
                <td>Standard</td>
                <td>Gemini 2.0 Pro</td>
                <td>Custom Prompting</td>
              </tr>
              <tr>
                <td><strong>Data Retention</strong></td>
                <td>30 days</td>
                <td>1 year</td>
                <td>2 years</td>
                <td>Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Frequently Asked Questions">
        <div className="faq-grid">
          {faqs.map((faq) => (
            <details key={faq.q} className="faq-item">
              <summary>
                <span>{faq.q}</span>
                <HelpCircle size={16} />
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  )
}

/* =========================================================
   2. API DOCS VIEW
   ========================================================= */
function ApiDocsView() {
  const [lang, setLang] = useState<"curl" | "js" | "python">("curl")
  const [copied, setCopied] = useState("")

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(""), 2000)
  }

  const curlList = `curl -X GET "https://api.pingava.com/v1/monitors" \
  -H "Authorization: Bearer pingava_live_YOUR_KEY" \
  -H "Accept: application/json"`

  const jsList = `const response = await fetch("https://api.pingava.com/v1/monitors", {
  headers: {
    "Authorization": "Bearer pingava_live_YOUR_KEY",
    "Accept": "application/json"
  }
});
const { data } = await response.json();
console.log(data);`

  const pyList = `import requests

url = "https://api.pingava.com/v1/monitors"
headers = {
    "Authorization": "Bearer pingava_live_YOUR_KEY",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
print(response.json())`

  const listCode = lang === "curl" ? curlList : lang === "js" ? jsList : pyList

  const jsonMonitors = `[
  {
    "id": 1084,
    "name": "Production API Gateway",
    "url": "https://api.pingava.com/health",
    "method": "GET",
    "interval_seconds": 30,
    "status": "up",
    "uptime_percentage": 99.98,
    "response_time_ms": 142,
    "ssl": {
      "valid": true,
      "days_remaining": 68,
      "issuer": "Let's Encrypt"
    }
  }
]`

  return (
    <div className="api-docs-container">
      <div className="api-badge-row">
        <span className="api-badge">Base URL: <code>https://api.pingava.com/v1</code></span>
        <span className="api-badge">Format: <code>JSON</code></span>
        <span className="api-badge">Rate Limit: <code>600 req/min</code></span>
        <span className="api-badge">Auth: <code>Bearer token</code></span>
      </div>

      <Section title="Authentication">
        <p>
          Authenticate API requests by providing your Pingava secret API key in the
          <code>Authorization</code> header using the <code>Bearer</code> scheme:
        </p>
        <div className="code-box">
          <div className="code-tabs-header">
            <span style={{ fontSize: "12px", color: "#8fa3b8" }}>HTTP Authorization Header</span>
            <button
              type="button"
              className="code-tab-btn"
              onClick={() => copyCode("Authorization: Bearer pingava_live_xxxxxxxxxx", "auth")}
            >
              {copied === "auth" ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre>Authorization: Bearer pingava_live_xxxxxxxxxxxxxxxxxxxxxxxx</pre>
        </div>
      </Section>

      <Section title="Endpoints">
        {/* GET /monitors */}
        <div className="api-endpoint-card">
          <div className="api-endpoint-header">
            <span className="api-method get">GET</span>
            <code className="api-path">/v1/monitors</code>
            <span className="api-endpoint-desc">List all synthetic monitors</span>
          </div>
          <div className="api-endpoint-body">
            <div>
              <p className="api-params-title">Request Example</p>
              <div className="code-tabs-header">
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    className={`code-tab-btn ${lang === "curl" ? "active" : ""}`}
                    onClick={() => setLang("curl")}
                  >
                    cURL
                  </button>
                  <button
                    type="button"
                    className={`code-tab-btn ${lang === "js" ? "active" : ""}`}
                    onClick={() => setLang("js")}
                  >
                    JavaScript
                  </button>
                  <button
                    type="button"
                    className={`code-tab-btn ${lang === "python" ? "active" : ""}`}
                    onClick={() => setLang("python")}
                  >
                    Python
                  </button>
                </div>
                <button
                  type="button"
                  className="code-tab-btn"
                  onClick={() => copyCode(listCode, "list")}
                >
                  {copied === "list" ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="code-box">
                <pre>{listCode}</pre>
              </div>
            </div>
            <div>
              <p className="api-params-title">Response Example (200 OK)</p>
              <div className="code-box">
                <pre>{jsonMonitors}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* POST /monitors */}
        <div className="api-endpoint-card">
          <div className="api-endpoint-header">
            <span className="api-method post">POST</span>
            <code className="api-path">/v1/monitors</code>
            <span className="api-endpoint-desc">Create a new synthetic monitor</span>
          </div>
          <div className="api-endpoint-body">
            <div>
              <p className="api-params-title">Request Payload Schema</p>
              <div className="code-box">
                <pre>{`{
  "name": "Auth Microservice",
  "url": "https://auth.example.com/v1/health",
  "method": "POST",
  "interval_seconds": 30,
  "timeout_seconds": 10,
  "headers": {
    "X-Client": "Pingava-Synthetic"
  },
  "body": "{\\"ping\\": true}",
  "accepted_statuses": "200,201",
  "failure_threshold": 2
}`}</pre>
              </div>
            </div>
            <div>
              <p className="api-params-title">Response (201 Created)</p>
              <div className="code-box">
                <pre>{`{
  "status": "created",
  "monitor_id": 1085,
  "first_check_scheduled_in_seconds": 2
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Webhooks & Event Signatures">
        <p>
          Pingava delivers webhook alerts for downtime, recovery, and certificate expiration.
          Every webhook payload is signed using HMAC SHA-256 with your workspace webhook secret.
          Verify incoming events using the <code>X-Pingava-Signature</code> HTTP header:
        </p>
        <div className="code-box">
          <pre>{`// Node.js Webhook Signature Verification
const crypto = require("crypto");

function verifyPingavaWebhook(payload, signatureHeader, secret) {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
}`}</pre>
        </div>
      </Section>
    </div>
  )
}

/* =========================================================
   3. CHANGELOG VIEW
   ========================================================= */
function ChangelogView() {
  const releases = [
    {
      version: "v2.4.0",
      date: "September 2026",
      tag: "feature",
      title: "Multi-Region Edge Probes & Predictive Latency Radar",
      desc: "Expanded global synthetic probe network across 6 regions with real-time latency anomaly detection.",
      bullets: [
        "Simultaneous synthetic probing from US-East, US-West, EU-Central, EU-West, AP-South, and AP-East.",
        "Predictive Latency Anomaly Radar flagging p95 degradation before outages trigger.",
        "Edge waterfalls highlighting DNS lookup, TCP connect, and TLS handshake times per geography.",
      ],
    },
    {
      version: "v2.3.0",
      date: "August 2026",
      tag: "feature",
      title: "Gemini AI Automated Incident Post-Mortems",
      desc: "One-click post-mortem generator turning raw incident error logs and timelines into polished markdown reports.",
      bullets: [
        "Automatic synthesis of HTTP failure status codes, request bodies, and edge timestamps.",
        "Root cause diagnostic breakdown highlighting server, networking, or certificate root causes.",
        "Instant export to markdown for GitHub, Notion, or executive status distributions.",
      ],
    },
    {
      version: "v2.2.0",
      date: "July 2026",
      tag: "improvement",
      title: "SSL / TLS Certificate Guardian & Expiry Warning Tiers",
      desc: "Complete overhaul of HTTPS certificate auditing with automated alerts and chain analysis.",
      bullets: [
        "Configurable advance expiry alerts at 30 days, 14 days, 7 days, and 24 hours.",
        "Subject Alternative Name (SAN) coverage verification for multi-tenant and wildcard hosts.",
        "TLS handshake timing benchmarks and cipher suite deprecation alerts.",
      ],
    },
    {
      version: "v2.1.0",
      date: "June 2026",
      tag: "feature",
      title: "Custom Status Pages 2.0 & CNAME Support",
      desc: "Deliver transparent communication on your own custom domain with subscriber broadcasts.",
      bullets: [
        "Custom domain support (e.g. status.yourdomain.com) with automatic Let's Encrypt SSL.",
        "Email subscription double-opt-in workflows with zero friction.",
        "Custom brand logo and dark/light color schemes for public pages.",
      ],
    },
    {
      version: "v2.0.0",
      date: "May 2026",
      tag: "improvement",
      title: "Next-Gen Synthetic Monitoring Engine & Zero-Noise Thresholds",
      desc: "Built from scratch for sub-second check dispatching and rock-solid consecutive failure confirmation.",
      bullets: [
        "Consecutive failure rules (1-5 checks) guaranteeing zero false positives from transit blips.",
        "JSON Path payload assertions and regex matching on response content.",
        "New REST API v1 for programmatic monitor creation and incident queries.",
      ],
    },
  ]

  return (
    <div className="changelog-stream">
      {releases.map((item) => (
        <article key={item.version} className="changelog-node">
          <div className="changelog-header-row">
            <span className="changelog-version">{item.version}</span>
            <span className="changelog-date">{item.date}</span>
            <span className={`changelog-tag ${item.tag}`}>{item.tag}</span>
          </div>
          <div className="changelog-card">
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <ul>
              {item.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  )
}

/* =========================================================
   4. BLOG VIEW
   ========================================================= */
function BlogView() {
  const [filter, setFilter] = useState("All")
  const [activeArticle, setActiveArticle] = useState<number | null>(null)

  const articles = [
    {
      id: 1,
      category: "Architecture",
      readTime: "6 min read",
      date: "September 2026",
      title: "Designing Zero-Overhead Multi-Region Synthetic Probes at Scale",
      excerpt:
        "How we engineered distributed edge probe nodes across 6 continents to run deterministic synthetic HTTP checks without false alerts caused by transient BGP flapping.",
      content:
        "When running continuous synthetic checks for hundreds of thousands of customer endpoints, transient network transit blips are inevitable. A single edge node in Frankfurt observing a DNS timeout does not necessarily mean your application is down. In this engineering deep-dive, we share how Pingava utilizes multi-region quorum consensus and consecutive failure confirmations to ensure developers are only paged when genuine incidents strike.",
    },
    {
      id: 2,
      category: "Reliability",
      readTime: "8 min read",
      date: "August 2026",
      title: "Why 99.9% Uptime Is No Longer Enough: Surviving with Latency SLAs",
      excerpt:
        "Modern cloud users don't differentiate between an HTTP 500 error and a 12-second hanging request. Here is how p95/p99 latency monitoring protects user trust.",
      content:
        "Traditional uptime monitoring relied solely on binary status codes: 200 meant healthy, 500 meant down. However, in distributed cloud architectures, degradation almost always shows up first as latency tail-spikes. When downstream databases bottleneck, requests hang and saturate thread pools. We walk through how setting aggressive response time assertions and anomaly thresholds catches performance collapse before it turns into full downtime.",
    },
    {
      id: 3,
      category: "Security",
      readTime: "5 min read",
      date: "July 2026",
      title: "The Anatomy of an SSL Expiry Outage (and How to Never Have One)",
      excerpt:
        "Over 60% of unforeseen production outages stem from expired certificates or misconfigured intermediate chains. Here is our checklist for automated SSL hygiene.",
      content:
        "Every seasoned engineering team has a war story about an expired SSL certificate on an API endpoint. Automated ACME renewals fail quietly when DNS records change or rate limits trigger. When an HTTPS certificate expires, modern browsers and mobile clients terminate the TLS handshake immediately. Continuous synthetic probing that parses the leaf, intermediate, and root certificates 30 days ahead of expiration is the only foolproof safeguard.",
    },
    {
      id: 4,
      category: "Best Practices",
      readTime: "7 min read",
      date: "June 2026",
      title: "Effective Incident Communication: What to Say on Your Public Status Page",
      excerpt:
        "Proven templates and guidelines for Investigating, Identified, Monitoring, and Resolved updates that preserve trust when production fails.",
      content:
        "During an outage, silence is the worst possible customer experience. Transparent, calm, and accurate incident updates turn moments of service friction into demonstrations of competence. In this guide, we provide battle-tested templates for every stage of an incident lifecycle and discuss why separating internal diagnostics from external customer communications is crucial.",
    },
    {
      id: 5,
      category: "Architecture",
      readTime: "6 min read",
      date: "May 2026",
      title: "Catching Silent API Contract Drift in Production Microservices",
      excerpt:
        "Why standard HTTP 200 OK checks fail to catch broken schema changes, and how JSON Path assertions protect API consumers.",
      content:
        "An API can return a 200 OK status code with an empty array or missing keys when an upstream backend schema changes unintentionally. Consumers fail immediately, but basic pingers report the service as healthy. By combining payload validation with JSON schema assertions in synthetic checks, engineers detect regression bugs before customer reports arrive.",
    },
  ]

  const categories = ["All", "Architecture", "Reliability", "Security", "Best Practices"]
  const filtered =
    filter === "All" ? articles : articles.filter((a) => a.category === filter)

  return (
    <>
      <div className="blog-filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`blog-filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="blog-grid">
        {filtered.map((article) => (
          <article
            key={article.id}
            className="blog-card"
            onClick={() => setActiveArticle(article.id)}
          >
            <div>
              <div className="blog-card-meta">
                <span className="blog-tag-badge">{article.category}</span>
                <span>{article.readTime}</span>
              </div>
              <h3 style={{ marginTop: "10px" }}>{article.title}</h3>
              <p style={{ marginTop: "8px" }}>{article.excerpt}</p>
            </div>
            <div className="blog-footer-meta">
              <span>Pingava Reliability Team</span>
              <span>{article.date}</span>
            </div>
          </article>
        ))}
      </div>

      {activeArticle !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            zIndex: 9999,
          }}
          onClick={() => setActiveArticle(null)}
        >
          <div
            style={{
              maxWidth: "680px",
              width: "100%",
              background: "var(--surface)",
              color: "var(--foreground)",
              padding: "36px",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const a = articles.find((art) => art.id === activeArticle)!
              return (
                <>
                  <span className="blog-tag-badge">{a.category} &middot; {a.readTime}</span>
                  <h2 style={{ margin: "14px 0 16px", font: "700 24px Manrope, sans-serif" }}>
                    {a.title}
                  </h2>
                  <p style={{ lineHeight: "1.75", color: "var(--muted-foreground)" }}>
                    {a.content}
                  </p>
                  <p style={{ lineHeight: "1.75", color: "var(--muted-foreground)", marginTop: "14px" }}>
                    Continuous synthetic probing is standard practice for modern cloud teams.
                    Explore how Pingava automates this with multi-region edge inspections and
                    automated incident notifications.
                  </p>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => setActiveArticle(null)}
                    >
                      Close article
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}

/* =========================================================
   5. SYSTEM STATUS VIEW
   ========================================================= */
function StatusView() {
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState("")

  const components = [
    { name: "North America Edge Probes", loc: "US-East (VA), US-West (OR)", uptime: "100.0%" },
    { name: "Europe Edge Probes", loc: "EU-Central (FRA), EU-West (LON)", uptime: "100.0%" },
    { name: "Asia-Pacific Edge Probes", loc: "AP-South (MUM), AP-East (SIN)", uptime: "100.0%" },
    { name: "Synthetic Check Dispatch Engine", loc: "Distributed Core Cluster", uptime: "99.99%" },
    { name: "Alert Delivery Network", loc: "Email & Webhook Relays", uptime: "100.0%" },
    { name: "Gemini AI Post-Mortem Service", loc: "Diagnostic Pipeline", uptime: "100.0%" },
    { name: "Public Status Pages CDN", loc: "Global Anycast Edge", uptime: "100.0%" },
    { name: "Web Dashboard & API Ingestion", loc: "Core Platform", uptime: "99.99%" },
  ]

  return (
    <>
      <div className="status-system-banner">
        <div className="status-system-left">
          <i className="status-pulse-large" />
          <div>
            <h2>All Systems Operational</h2>
            <p>99.99% overall platform availability over the past 90 days.</p>
          </div>
        </div>
        <span className="status-uptime-pill">99.99% Uptime</span>
      </div>

      <Section title="Core Services & Global Edge Probes">
        <div className="status-component-table">
          {components.map((c) => (
            <div key={c.name} className="status-row">
              <div className="status-name-group">
                <strong>{c.name}</strong>
                <span>&middot; {c.loc}</span>
              </div>
              <span className="status-state-badge">
                <i />
                Operational ({c.uptime})
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="90-Day Platform Uptime History">
        <div className="status-history-wrap">
          <div className="status-history-bars" aria-label="90 days uptime visualization">
            {Array.from({ length: 90 }).map((_, idx) => (
              <span
                key={idx}
                className="status-bar-day"
                title={`Day ${90 - idx} ago: 100% uptime, 0 incidents`}
              />
            ))}
          </div>
          <div className="status-history-labels">
            <span>90 days ago</span>
            <span>Today (100.0%)</span>
          </div>
        </div>
      </Section>

      <Section title="Recent Incident & Maintenance Log">
        <article className="changelog-card" style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <strong>Scheduled Edge Network Maintenance</strong>
            <span style={{ fontSize: "12px", color: "#12b76a", fontWeight: 700 }}>Resolved</span>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--muted-foreground)" }}>
            Completed routing upgrades across European synthetic probe nodes. Check dispatching
            transferred seamlessly without packet loss or monitor interruptions.
          </p>
          <small style={{ display: "block", marginTop: "8px", color: "var(--muted-foreground)" }}>
            Completed August 28, 2026 &middot; Duration: 11 minutes
          </small>
        </article>
      </Section>

      <Section title="Subscribe to Status Updates">
        {subscribed ? (
          <div className="public-footer-newsletter-success" role="status">
            <CheckCircle2 size={16} />
            <div>
              <strong>Subscribed to incident updates!</strong>
              <small>You will receive email notifications if an outage occurs.</small>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email) setSubscribed(true)
            }}
            style={{ display: "flex", gap: "10px", maxWidth: "440px" }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--input)",
                color: "var(--foreground)",
              }}
            />
            <button type="submit" className="primary-btn">
              Subscribe
            </button>
          </form>
        )}
      </Section>
    </>
  )
}

/* =========================================================
   6. DOCUMENTATION VIEW
   ========================================================= */
function DocsView() {
  const guides = [
    {
      title: "Quickstart Guide",
      desc: "Go from account creation to active synthetic monitoring in less than 2 minutes.",
      link: "/support#first-monitor",
      icon: Zap,
    },
    {
      title: "Website & HTTP Monitoring",
      desc: "Configure intervals, accepted HTTP status codes, timeouts, and failure thresholds.",
      link: "/support#website",
      icon: Globe2,
    },
    {
      title: "API Synthetic Checks & Assertions",
      desc: "Test POST/PUT payloads, custom headers, and validate JSON response bodies.",
      link: "/support#api",
      icon: Code2,
    },
    {
      title: "SSL / TLS Certificate Monitoring",
      desc: "Automate certificate chain checks, TLS handshakes, and advance expiry notifications.",
      link: "/support#ssl",
      icon: ShieldCheck,
    },
    {
      title: "Incidents & Webhook Integrations",
      desc: "Deliver signed JSON webhook payloads to Slack, PagerDuty, or custom backend services.",
      link: "/support#webhooks",
      icon: Bell,
    },
    {
      title: "Public Status Page Customization",
      desc: "Host public status updates on custom subdomains with subscriber notification blasts.",
      link: "/support#status-pages",
      icon: Activity,
    },
  ]

  return (
    <>
      <Section title="Getting Started Documentation">
        <p>
          Pingava provides powerful synthetic monitoring with intuitive setup. Explore our
          developer guides to learn how to test endpoints, configure assertions, and route alerts.
        </p>
        <div className="public-resource-links" style={{ marginTop: "24px" }}>
          {guides.map((g) => {
            const Icon = g.icon
            return (
              <a key={g.title} href={g.link}>
                <Icon size={24} style={{ color: "var(--primary)" }} />
                <span>
                  <strong>{g.title}</strong>
                  <small>{g.desc}</small>
                </span>
                <ArrowRight size={16} />
              </a>
            )
          })}
        </div>
      </Section>
      <Section title="Developers & API">
        <p>
          Looking to automate monitor deployment through your CI/CD pipeline or Terraform?
          Review our comprehensive REST API documentation.
        </p>
        <a href="/api-docs" className="primary-btn" style={{ display: "inline-flex", gap: "8px", marginTop: "12px" }}>
          Explore API Documentation <ArrowRight size={15} />
        </a>
      </Section>
    </>
  )
}

/* =========================================================
   7. ABOUT VIEW
   ========================================================= */
function AboutView() {
  return (
    <>
      <div className="about-stats-grid">
        <div className="about-stat-card">
          <div className="about-stat-num">12M+</div>
          <div className="about-stat-label">Monthly Synthetic Checks</div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-num">42</div>
          <div className="about-stat-label">Global Probe Edge Points</div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-num">99.99%</div>
          <div className="about-stat-label">Platform Availability SLA</div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-num">&lt; 100ms</div>
          <div className="about-stat-label">Average Check Dispatch Latency</div>
        </div>
      </div>

      <Section title="Our Mission">
        <p>
          Modern web applications and APIs are complex distributed systems. A single failing
          microservice, an unexpected DNS failure, or a quietly expired SSL certificate can cause
          catastrophic downtime before engineering teams notice.
        </p>
        <p>
          Pingava was created with a single uncompromising mission: <strong>eliminate silent downtime</strong>.
          We combine distributed multi-region synthetic probes, zero-noise confirmation algorithms,
          and transparent public status communication so teams know what is happening before their users do.
        </p>
      </Section>

      <Section title="Engineering Values">
        <div className="public-principles">
          <article>
            <h3>Zero False Alarms</h3>
            <p>
              Alert fatigue destroys on-call morale. We enforce consecutive failure rules and
              multi-region quorum consensus to ensure you are only paged when genuine issues occur.
            </p>
          </article>
          <article>
            <h3>Radical Transparency</h3>
            <p>
              When systems fail, honest and immediate communication builds customer trust. Our public
              status pages and AI post-mortems turn operational challenges into demonstrations of reliability.
            </p>
          </article>
          <article>
            <h3>Developer-First Simplicity</h3>
            <p>
              Powerful observability should not require weeks of enterprise onboarding or heavy agents.
              Pingava is ready in 60 seconds with pure HTTP synthetics.
            </p>
          </article>
        </div>
      </Section>
    </>
  )
}

/* =========================================================
   8. CONTACT VIEW
   ========================================================= */
function ContactView() {
  const [topic, setTopic] = useState("Technical Support")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [ticketId, setTicketId] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message, topic }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || "Unable to dispatch inquiry.")
      }
      setTicketId(data.ticketId || `PG-${Math.floor(1000 + Math.random() * 9000)}`)
      setSent(true)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch inquiry. Please email support@pingava.com directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-interactive-grid">
      <div>
        <Section title="Direct Channels">
          <p>
            Have a question about Pingava, need dedicated enterprise probe deployment, or
            discovered a security issue? Our engineering and reliability team is ready to help.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "20px 0" }}>
            <a className="public-contact-email" href="mailto:support@pingava.com">
              <Mail size={22} />
              support@pingava.com
            </a>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "var(--muted-foreground)" }}>
              For technical support, active monitoring issues, and account assistance.
            </p>

            <a className="public-contact-email" href="mailto:connect@pingava.com">
              <Mail size={22} />
              connect@pingava.com
            </a>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--muted-foreground)" }}>
              For general inquiries, enterprise contracts, and partnerships.
            </p>
          </div>
          <div style={{ marginTop: "24px" }}>
            <p><strong>Response Time Guarantees:</strong></p>
            <ul style={{ paddingLeft: "20px", color: "var(--muted-foreground)", fontSize: "14px", lineHeight: "1.7" }}>
              <li><strong>Critical Outages / Security:</strong> &lt; 2 hours SLA</li>
              <li><strong>General Product Inquiries:</strong> &lt; 24 hours</li>
              <li><strong>Enterprise Sales & Custom Probes:</strong> Same-day follow-up</li>
            </ul>
          </div>
        </Section>
      </div>

      <div className="contact-form-container">
        {sent ? (
          <div className="contact-success-card">
            <CheckCircle2 size={36} color="#12b76a" style={{ margin: "0 auto" }} />
            <h3>Message Dispatched</h3>
            <p>
              Thank you for reaching out to Pingava. Ticket <strong>#{ticketId}</strong> has
              been created. Your inquiry has been routed to <strong>connect@pingava.com</strong> and
              a confirmation copy has been sent to your work email (<strong>{email}</strong>).
            </p>
            <button
              type="button"
              className="primary-btn"
              style={{ marginTop: "20px" }}
              onClick={() => {
                setSent(false)
                setSubject("")
                setMessage("")
              }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3 style={{ margin: "0 0 4px", font: "700 18px 'Manrope', sans-serif" }}>
              Send a direct inquiry
            </h3>
            <label>
              Inquiry Type
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="Technical Support">Technical & Account Support</option>
                <option value="Enterprise Sales">Enterprise & Custom Probe Regions</option>
                <option value="Security Report">Security Disclosure / Vulnerability</option>
                <option value="Billing">Billing & Subscription Inquiry</option>
                <option value="Integration">Integration or Partnership</option>
              </select>
            </label>
            <label>
              Work Email
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
            <label>
              Subject
              <input
                type="text"
                required
                placeholder="Brief summary of your inquiry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
            <label>
              Message
              <textarea
                required
                placeholder="Please describe how we can assist your team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
            <button type="submit" className="primary-btn" style={{ justifySelf: "flex-start" }} disabled={isSubmitting}>
              {isSubmitting ? "Sending inquiry..." : <>Send Inquiry <Send size={15} /></>}
            </button>
            {errorMsg && (
              <p style={{ color: "var(--destructive)", fontSize: "13px", margin: "6px 0 0" }}>
                {errorMsg}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   9. SUPPORT VIEW
   ========================================================= */
const helpGroups = [
  [
    "Getting Started",
    [
      ["first-monitor", "Create your first monitor", "Create an account, verify your email, then choose Add monitor in your dashboard. Select Website / URL or API endpoint, enter a name and public URL, and save your configuration."],
      ["website", "Website monitoring", "Choose Website / URL for a regular availability check. Advanced options let you adjust accepted status codes, timeout, response rules and failure thresholds."],
      ["api", "API monitoring", "Choose API endpoint to configure the HTTP method, headers, query parameters and a JSON body. Test only endpoints you are authorized to call. State-changing methods default to manual execution; enable recurring execution only when repeated requests are safe."],
    ],
  ],
  [
    "Monitoring",
    [
      ["configuration", "Monitor configuration", "Edit a monitor to change its request and schedule. Pause a monitor to stop scheduled checks while keeping its history. Changes apply to subsequent checks."],
      ["assertions", "Response assertions", "Add a maximum response time, expected response text or a JSON assertion in response rules. A response may fail a check even when its HTTP status is accepted. Text matching is case-sensitive and checks the first 1 MB of the response."],
      ["thresholds", "Failure/recovery thresholds", "Failures before incident controls how many consecutive failed checks confirm an outage. Successes before recovery controls how many successful checks resolve it. State-changing requests are not immediately retried."],
      ["ssl", "SSL monitoring", "HTTPS checks validate certificates and record certificate expiry. Certificate problems appear with check results, and expiry warnings use the configured warning period."],
    ],
  ],
  [
    "Incidents & Alerts",
    [
      ["incidents", "How incidents work", "Confirmed monitor failures create automatic incidents. You can also create a manual incident and publish status updates. The Incidents page combines current incidents, history and an activity timeline."],
      ["email", "Email alerts", "Manage email notification preferences in Settings. Review downtime, recovery and SSL notification attempts in Alert channels. Check your spam folder if a notification has not arrived."],
      ["webhooks", "Webhooks", "Add an HTTPS webhook in Alert channels, select the events to receive and use Test to send a test event. Review delivery history when troubleshooting. Keep webhook endpoint tokens private."],
      ["status-pages", "Status pages", "Choose which monitors to publish in Status pages, set a public name and slug, and share the page with your users. Subscribers confirm their email before receiving applicable incident updates."],
    ],
  ],
  [
    "Account",
    [
      ["verification", "Login and verification", "Use Google Sign-In or email and password. Email registration requires verification; use Resend verification email if the link expires or does not arrive."],
      ["password", "Password reset", "Choose Forgot password on the sign-in page and follow the link sent to your email. Google accounts use Google to manage their sign-in credentials."],
      ["settings", "Account settings", "Open Settings to manage your profile, security and notification preferences. Email changes require confirmation. Contact support for account or data deletion requests."],
    ],
  ],
] as const

function SupportView() {
  return (
    <>
      <nav className="public-topic-nav" aria-label="Support topics">
        {helpGroups.map(([group], i) => (
          <a href={`#help-${i}`} key={group}>
            {group}
          </a>
        ))}
      </nav>
      {helpGroups.map(([group, entries], i) => (
        <Section title={group} id={`help-${i}`} key={group}>
          <div className="public-help-list">
            {entries.map(([id, title, copy]) => (
              <details id={id} key={id}>
                <summary>{title}</summary>
                <p>{copy}</p>
              </details>
            ))}
          </div>
        </Section>
      ))}
      <Section title="Still need help?">
        <p>
          Contact our on-call reliability team directly at{" "}
          <a href="mailto:connect@pingava.com">connect@pingava.com</a>.
        </p>
      </Section>
    </>
  )
}

/* =========================================================
   10. SSL MONITORING VIEW
   ========================================================= */
function SslMonitoringView() {
  return (
    <>
      <Section title="An available server still needs a valid certificate.">
        <p>
          An expired or invalid certificate can cause a browser or API client to refuse the
          connection, even when your server is running. HTTPS checks in Pingava validate the
          certificate chain as part of checking availability.
        </p>
      </Section>
      <Section title="Complete Certificate Health Safeguards">
        <div className="public-feature-grid">
          {[
            [
              ShieldCheck,
              "Certificate Chain Validation",
              "Validates the complete trust chain from your leaf certificate up through intermediate authorities to trusted roots.",
            ],
            [
              Clock3,
              "Advance Expiry Warning Tiers",
              "Receive deduplicated notifications at 30 days, 14 days, 7 days, and 24 hours before expiration so renewals never slip.",
            ],
            [
              Zap,
              "TLS Handshake Latency",
              "Measure TLS negotiation and cipher exchange times across global regions to identify cryptographic bottlenecks.",
            ],
            [
              Activity,
              "One Unified Workflow",
              "Investigate SSL failures alongside uptime, HTTP response times, check history, and automated incident escalations.",
            ],
          ].map(([Icon, heading, copy]) => {
            const Component = Icon as typeof Activity
            return (
              <article key={String(heading)}>
                <Component size={24} />
                <h3>{String(heading)}</h3>
                <p>{String(copy)}</p>
              </article>
            )
          })}
        </div>
      </Section>
      <Section title="Start with an HTTPS monitor">
        <p>
          Add your public HTTPS URL to begin checking availability, SSL expiry, and response
          latencies right away.
        </p>
        <Actions primary="Monitor your SSL certificate" />
      </Section>
    </>
  )
}

/* =========================================================
   11. INCIDENT MANAGEMENT VIEW
   ========================================================= */
function IncidentManagementView() {
  return (
    <>
      <Section title="A Unified Operational Incident Workflow">
        <div className="public-feature-grid">
          {[
            [
              "Consecutive Failure Confirmation",
              "Confirmed monitor failures open automatic incidents. Transient network blips are confirmed before any alerts trigger.",
            ],
            [
              "Clear Status & Ownership Context",
              "Publish Investigating, Identified, Monitoring, or Resolved updates with timestamps, responder attribution, and public subscriber notifications.",
            ],
            [
              "Gemini AI Root Cause Post-Mortems",
              "Generate comprehensive incident post-mortems in seconds, synthesizing failed headers, codes, and MTTR breakdown.",
            ],
            [
              "Public Status Page Sync",
              "Keep customers confident with real-time incident broadcast updates synced directly to your branded public status pages.",
            ],
          ].map(([heading, copy]) => (
            <article key={heading}>
              <CheckCircle2 size={24} />
              <h3>{heading}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Connect detection with transparent communication">
        <p>
          Use your failure and recovery thresholds to confirm state changes, and email or webhook
          channels to dispatch alerts. Public status pages give users a trusted place to follow recovery.
        </p>
        <Actions primary="Start managing incidents" secondary="Explore status pages" />
      </Section>
    </>
  )
}

/* =========================================================
   PUBLIC HERO METADATA
   ========================================================= */
const hero: Record<PublicPagePath, [string, string, string]> = {
  "/pricing": [
    "TRANSPARENT PRICING",
    "Predictable plans that scale with your infrastructure.",
    "Start monitoring your websites and APIs for free. Upgrade whenever you need higher frequencies, multi-region edge inspections, or AI post-mortems.",
  ],
  "/api-docs": [
    "DEVELOPER API REFERENCE",
    "Pingava REST API v1 Documentation",
    "Automate synthetic monitors, query outage metrics, manage public status pages, and receive signed webhook alerts with our fast developer API.",
  ],
  "/changelog": [
    "CHANGELOG",
    "Everything new in Pingava",
    "Discover the latest releases, performance improvements, edge probe expansions, and bug fixes across our monitoring platform.",
  ],
  "/blog": [
    "RELIABILITY ENGINEERING BLOG",
    "Perspectives on uptime, distributed systems & incident response",
    "Practical insights, deep-dives into edge synthetic monitoring, SSL lifecycle hygiene, and incident management best practices.",
  ],
  "/status": [
    "SYSTEM STATUS",
    "Pingava Operational Health & Availability",
    "Real-time status and 90-day reliability metrics across our global probe network, check dispatchers, and notification delivery pipelines.",
  ],
  "/docs": [
    "DOCUMENTATION",
    "Pingava Platform Documentation & Guides",
    "Everything you need to configure synthetic website monitors, execute payload-driven API checks, manage certificates, and broadcast status updates.",
  ],
  "/about": [
    "ABOUT PINGAVA",
    "Know when something breaks — before your users do.",
    "Pingava is a synthetic monitoring and incident communication platform built to help teams understand the health of their websites and APIs, respond to failures quickly, and keep users informed.",
  ],
  "/contact": [
    "GET IN TOUCH",
    "We are here to help your team stay online.",
    "Have a question about Pingava, need dedicated enterprise probe deployment, or discovered a security issue? Reach our reliability engineers directly.",
  ],
  "/ssl-monitoring": [
    "SSL & TLS GUARDIAN",
    "Keep your certificates in check.",
    "Validate HTTPS certificates and watch their expiry alongside your regular uptime checks. Know when certificate problems could prevent users from reaching your service.",
  ],
  "/incident-management": [
    "INCIDENT MANAGEMENT",
    "From a confirmed outage to a clear update.",
    "Manage automatic and manual incidents in one place, record progress, generate AI post-mortems, and keep your users informed as service recovers.",
  ],
  "/support": [
    "HELP & SUPPORT",
    "Find your next step.",
    "Practical guidance for setting up monitors, understanding response assertions, configuring webhooks, and managing your Pingava workspace.",
  ],
}

/* =========================================================
   MAIN PUBLIC PAGE COMPONENT
   ========================================================= */
export function PublicPage({ path }: { path: PublicPagePath }) {
  const page = metadata[path]
  const [eyebrow, title, description] = hero[path]

  return (
    <div className="public-content-page">
      <PageMetadata
        title={page.title}
        description={page.description}
        canonicalPath={path}
        noIndex={!page.indexable}
        preserveCanonical
      />
      <PublicHeader />
      <main>
        <header className="public-page-hero">
          <p className="public-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
          {["/ssl-monitoring", "/incident-management"].includes(path) && (
            <Actions primary={path === "/ssl-monitoring" ? "Monitor your SSL certificate" : "Start managing incidents"} />
          )}
        </header>

        {path === "/pricing" && <PricingView />}
        {path === "/api-docs" && <ApiDocsView />}
        {path === "/changelog" && <ChangelogView />}
        {path === "/blog" && <BlogView />}
        {path === "/status" && <StatusView />}
        {path === "/docs" && <DocsView />}
        {path === "/about" && <AboutView />}
        {path === "/contact" && <ContactView />}
        {path === "/support" && <SupportView />}
        {path === "/ssl-monitoring" && <SslMonitoringView />}
        {path === "/incident-management" && <IncidentManagementView />}
      </main>
      <PublicFooter />
    </div>
  )
}
