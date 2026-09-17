import { useState, type ReactNode } from "react"
import {
  Activity,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Download,
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

export { isPublicPagePath, type PublicPagePath } from "./publicPageUtils"

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
  const plans = [
    {
      name: "Early Access",
      desc: "Comprehensive synthetic monitoring unlocked for everyone during our launch.",
      price: "$0",
      period: "forever free during launch",
      popular: true,
      badge: "Available Now",
      btnText: "Start monitoring free",
      btnClass: "primary",
      features: [
        "10 synthetic HTTP / API monitors",
        "1-minute check intervals",
        "6-Region Global Edge Inspector",
        "Unlimited public status pages with CNAME & SSL",
        "SSL certificate validity & advance expiry alerts",
        "Multi-channel alerts (Email, Telegram, Slack, Discord, PagerDuty)",
        "Zero-noise consecutive failure verification rules",
        "AI automated root cause post-mortems",
      ],
    },
    {
      name: "Pro SRE Suite",
      desc: "For production platforms and teams requiring sub-minute triage.",
      price: "Coming Soon",
      period: "post-merchant verification",
      popular: false,
      badge: "Coming Soon",
      btnText: "Enroll as Early Adopter",
      btnClass: "outline",
      features: [
        "60+ synthetic monitors",
        "30-second rapid check intervals",
        "Predictive Latency Anomaly Radar (P50–P99)",
        "API Contract & Schema Drift Guardian",
        "1-year high-resolution telemetry retention",
        "Priority probe scheduling",
      ],
    },
    {
      name: "Team / Enterprise",
      desc: "For high-scale engineering organizations operating microservices.",
      price: "Coming Soon",
      period: "post-merchant verification",
      popular: false,
      badge: "Coming Soon",
      btnText: "Contact Engineering",
      btnClass: "outline",
      features: [
        "250+ synthetic monitors",
        "15-second ultra-high frequency checks",
        "Multi-user RBAC & team workspaces",
        "Dedicated private probe clusters & custom nodes",
        "99.99% availability SLA guarantee",
        "Priority 24/7 dedicated engineering support",
      ],
    },
  ]

  const faqs = [
    {
      q: "Why is Pingava completely free right now?",
      a: "We are currently operating our public Early Access launch while our payment aggregator and merchant account verification is underway. During this period, all registered workspaces enjoy full platform features completely free with zero credit card required.",
    },
    {
      q: "Will I ever be charged unexpectedly or forced to enter payment info?",
      a: "Never. Pingava never asks for your credit card during early access. When self-serve paid subscription tiers are launched, your workspace will remain intact and you will have complete control over whether to remain on the free tier or upgrade.",
    },
    {
      q: "What counts as a monitor in Pingava?",
      a: "A monitor is any single website URL, REST API endpoint, or health check that Pingava tests on a recurring schedule. You can configure HTTP methods, custom headers, request bodies, timeout limits, and failure thresholds for each monitor.",
    },
    {
      q: "Can I host a status page on my own custom domain?",
      a: "Yes! Custom domain status pages (via CNAME e.g. status.yourbrand.com) with automated SSL certificates are fully supported and free during early access.",
    },
    {
      q: "How does the consecutive failure rule prevent false alarms?",
      a: "Transient network blips and routing hiccups happen on the internet. Pingava verifies outages with consecutive failure checks (e.g. 2 or 3 failed attempts in a row) across multiple edge probes before opening an incident or sending alert notifications.",
    },
    {
      q: "How does the AI post-mortem feature work?",
      a: "When an incident resolves, our AI diagnostic engine synthesizes the failed HTTP codes, error payloads, response latency timeline, and probe locations into an exportable, executive-ready post-mortem report in markdown.",
    },
  ]

  return (
    <>
      <div style={{ maxWidth: 860, margin: "0 auto 32px", textAlign: "center", padding: "14px 20px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: 10, color: "var(--foreground)" }}>
        <strong style={{ color: "#0284c7" }}>✨ Public Early Access Program Active: </strong>
        <span>All core synthetic monitoring features are 100% free while our merchant account &amp; payment aggregator compliance is being finalized.</span>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`pricing-card ${plan.popular ? "popular" : ""}`}
          >
            {plan.badge && <span className="pricing-popular-badge">{plan.badge}</span>}
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
              href={plan.name.includes("Enterprise") ? "/contact" : "/register"}
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
                <th style={{ color: "var(--primary)" }}>Early Access (Active)</th>
                <th>Pro (Coming Soon)</th>
                <th>Team (Coming Soon)</th>
                <th>Enterprise (Coming Soon)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Monitor Allowance</strong></td>
                <td><strong>10 monitors (Free)</strong></td>
                <td>60 monitors</td>
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
                <td>Email, Telegram, Slack, Discord</td>
                <td>PagerDuty, Webhooks, SMS</td>
                <td>Custom Integrations</td>
              </tr>
              <tr>
                <td><strong>AI Root Cause Post-Mortems</strong></td>
                <td>—</td>
                <td>Standard</td>
                <td>Advanced AI</td>
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
      title: "6-Region Edge Probes & Predictive Latency Radar",
      desc: "Expanded global synthetic probe network across 6 regions with real-time latency anomaly detection and jitter tracking.",
      bullets: [
        "Distributed synthetic probing across US-East (Virginia), US-West (Oregon), EU-Central (Frankfurt), EU-West (London), AP-South (Mumbai), and AP-East (Singapore).",
        "Predictive Latency Anomaly Radar flagging p95 degradation before outright outages trigger.",
        "Edge waterfalls highlighting DNS lookup, TCP connect, and TLS handshake times per geography.",
      ],
    },
    {
      version: "v2.3.0",
      date: "August 2026",
      tag: "feature",
      title: "AI Automated Incident Post-Mortems",
      desc: "One-click post-mortem generator turning raw incident error logs and timelines into polished markdown reports.",
      bullets: [
        "Automatic synthesis of HTTP failure status codes, request bodies, and edge timestamps.",
        "Root cause diagnostic breakdown distinguishing server crashes, transit timeouts, or SSL expiry.",
        "Instant export to markdown for GitHub, Notion, or executive status distributions.",
      ],
    },
    {
      version: "v2.2.0",
      date: "July 2026",
      tag: "improvement",
      title: "SSL / TLS Certificate Guardian & Expiry Warning Tiers",
      desc: "Complete overhaul of HTTPS certificate auditing with automated multi-tier alerts and chain analysis.",
      bullets: [
        "Multi-tier notifications at 30, 14, 7, and 1 days before certificate expiration.",
        "Intermediate and root CA trust chain validation with SAN hostname verification.",
        "Automated revocation checking via OCSP and CRL distribution points.",
      ],
    },
    {
      version: "v2.1.0",
      date: "June 2026",
      tag: "feature",
      title: "Public Status Page Customization & Subscriber Broadcasts",
      desc: "Branded public incident communication with custom subdomains, logos, and subscriber email management.",
      bullets: [
        "Zero-configuration dark and light mode themes with custom company branding.",
        "Email subscriber broadcast management with one-click subscription management.",
        "Component-level status decoupling for microservices architectures.",
      ],
    },
    {
      version: "v2.0.0",
      date: "May 2026",
      tag: "improvement",
      title: "Next-Gen Synthetic Monitoring Engine & Zero-Noise Thresholds",
      desc: "Sub-minute check dispatching with consecutive failure confirmation rules.",
      bullets: [
        "Consecutive failure rules (1-5 checks) preventing false positives from transit blips.",
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
        "How we engineered distributed edge probe nodes across 6 global regions to run deterministic synthetic HTTP checks without false alerts caused by transient BGP flapping.",
      content: [
        "When running continuous synthetic checks for production endpoints, transient network transit blips are an inescapable reality of the public internet. A single edge node in Frankfurt observing a DNS timeout or TCP packet drop does not necessarily mean your origin server is down. In the majority of cases, it represents local ISP route flapping, transient BGP convergence delays, or third-party transit carrier degradation.",
        "If monitoring systems immediately open an incident and page on-call engineers on the very first failed packet, alert fatigue quickly destroys team morale. Engineers begin muting notifications, which eventually leads to real, catastrophic outages slipping past unnoticed.",
        "At Pingava, we solved this by implementing multi-region quorum consensus coupled with consecutive failure verification. Instead of evaluating a check in isolation, a suspected failure from one probe triggers a verification round across peer nodes in Virginia, Oregon, Frankfurt, London, Mumbai, and Singapore. Only when a quorum of distinct geographic vantage points confirms consecutive failed attempts does the system escalate to an alert.",
        "Furthermore, our probe architecture dissects every HTTP transaction into high-resolution timing phases: DNS resolution time, TCP handshake latency, TLS negotiation, and Time to First Byte (TTFB). This granularity allows engineers to instantly distinguish an origin server crash (HTTP 500/502) from an upstream routing bottleneck or an expired SSL certificate."
      ],
      takeaways: [
        "Single-probe alerts produce high false-positive rates due to transient BGP route flapping.",
        "Multi-region quorum consensus eliminates alert noise by confirming reachability across independent geographies.",
        "Breaking down latency into DNS, TCP, TLS, and TTFB pinpoints the exact failure layer before diving into logs."
      ]
    },
    {
      id: 2,
      category: "Reliability",
      readTime: "8 min read",
      date: "August 2026",
      title: "Why 99.9% Uptime Is No Longer Enough: Surviving with Latency SLAs",
      excerpt:
        "Modern cloud users don't differentiate between an HTTP 500 error and a 12-second hanging request. Here is how p95/p99 latency monitoring protects user trust.",
      content: [
        "Traditional uptime monitoring relied solely on binary HTTP status codes: a response of 200 OK meant the service was healthy, while 500 meant it was down. However, in modern distributed cloud architectures and microservices, total outages are rarely binary. Instead, degradation almost always manifests first as severe latency tail spikes.",
        "When an upstream database connection pool is saturated, or an external payment gateway begins rate-limiting, incoming requests do not fail immediately. They queue. Workers hang waiting for I/O, thread pools become exhausted, and response times balloon from 80ms to 12,000ms. From an end-user's perspective, a spinning loader that takes 15 seconds to timeout is indistinguishable from outright downtime.",
        "To safeguard user experience, site reliability engineers must establish aggressive latency assertions alongside status code checks. Pingava allows teams to define strict SLA thresholds (such as failing checks that exceed 1,500ms even if they return HTTP 200).",
        "By tracking p95 and p99 jitter trends over rolling 24-hour and 7-day windows, our Latency Anomaly Radar flags performance degradation long before origin worker pools collapse completely into HTTP 504 Gateway Timeouts."
      ],
      takeaways: [
        "A slow response is practically an outage for users. Binary 200 OK checks give a false sense of reliability.",
        "Thread pool exhaustion and database locks manifest as latency spikes long before HTTP 500s appear.",
        "Enforcing maximum response time assertions prevents silent performance degradation from cascading."
      ]
    },
    {
      id: 3,
      category: "Security",
      readTime: "5 min read",
      date: "July 2026",
      title: "The Anatomy of an SSL Expiry Outage (and How to Never Have One)",
      excerpt:
        "Over 60% of unforeseen production outages stem from expired certificates or misconfigured intermediate chains. Here is our checklist for automated SSL hygiene.",
      content: [
        "Every seasoned engineering team has a war story about an expired SSL certificate bringing down a critical API or production domain. Despite the widespread adoption of automated ACME clients like Let's Encrypt and cert-manager, SSL outages remain one of the most frequent causes of unplanned downtime.",
        "Why does automation fail? Common culprits include: DNS-01 verification records being accidentally overwritten during DNS migrations; HTTP-01 challenge paths blocked by updated WAF rules; automated renewal webhooks hitting rate limits; and load balancers caching expired certificates in memory even after disk renewal.",
        "When an SSL certificate expires, modern browsers, mobile SDKs, and API clients immediately abort the TLS handshake. There is no graceful degradation—every API call fails with SSL_ERROR_EXPIRED_CERTIFICATE.",
        "Pingava's SSL Guardian checks your certificate chain on every synthetic run. It validates leaf validity, intermediate authority chains, and SAN hostnames. More importantly, it provides multi-tiered advance alerts at 30 days, 14 days, 7 days, and 24 hours, guaranteeing that renewal issues are identified weeks before traffic is impacted."
      ],
      takeaways: [
        "Automated ACME renewals frequently break silently due to WAF rules or DNS changes.",
        "Clients reject expired certificates immediately with hard network terminations.",
        "Multi-tiered advance alerts (30, 14, 7 days) ensure team visibility before certificate expiry occurs."
      ]
    },
    {
      id: 4,
      category: "Best Practices",
      readTime: "7 min read",
      date: "June 2026",
      title: "Effective Incident Communication: What to Say on Your Public Status Page",
      excerpt:
        "Proven templates and guidelines for Investigating, Identified, Monitoring, and Resolved updates that preserve customer trust when production fails.",
      content: [
        "During an outage, silence is the single most damaging choice an engineering team can make. When users encounter an error and see an empty status page stating 'All Systems Operational,' customer trust erodes instantly. Conversely, clear, calm, and transparent incident updates demonstrate operational maturity and respect for your users' workflows.",
        "An effective incident lifecycle follows four distinct communication stages:",
        "1. Investigating: Acknowledge the problem immediately. State which service or region is affected and confirm that engineers are actively diagnosing it. You do not need to know the root cause to post an initial update.",
        "2. Identified: Explain the issue in clear, professional language without jargon. Provide an estimated timeline for the next update so customers are not left refreshing blindly.",
        "3. Monitoring: Once a fix is deployed, keep the incident open under observation while metrics stabilize. Confirm that traffic has normalized across edge regions.",
        "4. Resolved: Summarize the resolution clearly. Follow up with an automated AI-assisted post-mortem explaining what happened, how it was fixed, and what preventative measures are being implemented.",
        "Pingava's hosted public status pages integrate directly with synthetic monitors and subscriber broadcast lists, allowing teams to deliver authentic, professional updates in seconds."
      ],
      takeaways: [
        "Acknowledge issues immediately—silence during downtime damages customer trust more than the outage itself.",
        "Use structured incident stages: Investigating, Identified, Monitoring, and Resolved.",
        "Deliver subscriber email notifications so impacted customers receive updates directly without checking status pages."
      ]
    },
    {
      id: 5,
      category: "Architecture",
      readTime: "6 min read",
      date: "May 2026",
      title: "Catching Silent API Contract Drift in Production Microservices",
      excerpt:
        "Why standard HTTP 200 OK checks fail to catch broken schema changes, and how JSON Path assertions protect API consumers.",
      content: [
        "A microservice can respond with an HTTP 200 OK status code while being completely broken for downstream consumers. For example, an unhandled database exception might return an empty JSON array `[]`, or a backend refactor might rename an essential property from `user_id` to `userId`.",
        "Because the HTTP transport layer successfully returned a 200 OK, standard uptime pingers report the service as healthy. Meanwhile, mobile applications, web frontends, and webhook consumers crash with null-pointer or parsing exceptions.",
        "To guarantee true API reliability, synthetic checks must validate the payload contract. Pingava provides deep JSON Path assertions, allowing engineers to verify expected keys, data types, and value constraints (e.g., `$.status == 'ok'`, `$.data.length > 0`).",
        "By pairing response status checks with payload validation and response time thresholds, engineering teams detect contract drift and regression bugs seconds after deployment."
      ],
      takeaways: [
        "HTTP 200 OK does not mean an API is healthy; empty payloads and renamed keys break consumers silently.",
        "JSON Path assertions validate the structure, presence, and types of response properties.",
        "Continuous payload inspection catches breaking schema drift before users encounter frontend errors."
      ]
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
            style={{ cursor: "pointer" }}
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
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            zIndex: 9999,
          }}
          onClick={() => setActiveArticle(null)}
        >
          <div
            style={{
              maxWidth: "740px",
              width: "100%",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "var(--surface)",
              color: "var(--foreground)",
              padding: "36px",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const a = articles.find((art) => art.id === activeArticle)!
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span className="blog-tag-badge">{a.category} &middot; {a.readTime}</span>
                    <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>{a.date}</span>
                  </div>
                  <h2 style={{ margin: "0 0 20px", font: "700 24px/1.3 'Manrope', sans-serif" }}>
                    {a.title}
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "var(--muted-foreground)", fontSize: "15px", lineHeight: "1.75" }}>
                    {a.content.map((p, idx) => (
                      <p key={idx} style={{ margin: 0 }}>{p}</p>
                    ))}
                  </div>

                  {a.takeaways && (
                    <div style={{ marginTop: "24px", padding: "18px 20px", background: "rgba(8, 122, 75, 0.06)", borderLeft: "3px solid var(--primary)", borderRadius: "6px" }}>
                      <strong style={{ color: "var(--foreground)", display: "block", marginBottom: "8px", fontSize: "14px" }}>Key Takeaways:</strong>
                      <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--foreground)", fontSize: "14px", lineHeight: "1.6" }}>
                        {a.takeaways.map((t, idx) => (
                          <li key={idx} style={{ marginBottom: "4px" }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>Written by <strong>Pingava Reliability Team</strong></span>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => setActiveArticle(null)}
                    >
                      Close Article
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
    { name: "AI Post-Mortem Service", loc: "Diagnostic Pipeline", uptime: "100.0%" },
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
      desc: "Deliver formatted alerts to Telegram, Slack, Discord, PagerDuty, or custom HTTPS endpoints.",
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
          <div className="about-stat-num">6 Regions</div>
          <div className="about-stat-label">Global Synthetic Edge Probes</div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-num">15s &ndash; 30s</div>
          <div className="about-stat-label">Sub-Minute Check Intervals</div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-num">Quorum</div>
          <div className="about-stat-label">Consecutive Failure Confirmation</div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-num">99.99%</div>
          <div className="about-stat-label">Core Dispatcher &amp; Ingestion SLA</div>
        </div>
      </div>

      <Section title="Our Story &amp; Mission">
        <p>
          Pingava was founded by engineers who experienced first-hand the acute pain of monitoring fatigue:
          inboxes inundated with false alarms at 3 AM caused by single-hop transit hiccups, while critical
          silent degradations&mdash;such as API contract drift, latency tail-spikes, and expiring SSL certificates&mdash;slipped
          past unnoticed until frustrated users reported them.
        </p>
        <p>
          We created Pingava with a singular, uncompromising mission: <strong>eliminate silent downtime</strong>.
          By combining distributed multi-region edge probes, zero-noise confirmation algorithms, deep API payload
          validation, and transparent public status communication, we ensure engineering teams know exactly what is
          happening across their stack before their users do.
        </p>
      </Section>

      <Section title="Our Architectural Principles">
        <div className="public-principles">
          <article>
            <h3>External Edge Vantage Points</h3>
            <p>
              Internal agent metrics cannot tell you if public users can reach your service. Pingava probes your
              endpoints from outside your firewall across North America, Europe, and Asia-Pacific, dissecting every
              request into DNS resolution, TCP connection, TLS handshake, and Time to First Byte (TTFB).
            </p>
          </article>
          <article>
            <h3>Zero-Noise Outage Confirmation</h3>
            <p>
              Alert fatigue destroys on-call morale. We enforce consecutive failure rules and multi-region quorum
              consensus before triggering notifications, ensuring your engineers are paged only for genuine production
              outages rather than transient internet hiccups.
            </p>
          </article>
          <article>
            <h3>Deep API &amp; SSL Hygiene</h3>
            <p>
              A 200 OK status code does not mean your API is healthy. We validate response payload schemas with
              JSON Path assertions, audit TLS certificate chains continuously, and dispatch multi-tiered advance
              warnings (30, 14, 7 days) before certificates expire.
            </p>
          </article>
          <article>
            <h3>Radical Operational Transparency</h3>
            <p>
              When production incidents occur, honest and immediate communication preserves customer trust. Our hosted
              public status pages, subscriber email broadcasts, and AI-assisted post-mortems turn operational challenges
              into demonstrations of engineering maturity.
            </p>
          </article>
        </div>
      </Section>

      <Section title="Official Brand Identity &amp; Logo Assets">
        <p>
          Download official Pingava brand assets, vector marks, app icons, and favicons for press kits, light and dark backgrounds, print media, and third-party integrations.
        </p>
        <div className="brand-kit-grid">
          {/* 1. Primary Brand Logo */}
          <div className="brand-kit-card">
            <div className="brand-kit-preview dark-bg">
              <img src="/pingava-logo.png" alt="Pingava Primary Brand Logo" />
            </div>
            <div className="brand-kit-info">
              <div className="brand-kit-badge">Primary Brand Logo</div>
              <h4>Full Logo (Dark Background)</h4>
              <p>Icon + Pingava wordmark + &ldquo;KNOW BEFORE YOUR USERS DO&rdquo; tagline.</p>
              <span className="brand-kit-meta">1024 &times; 768 &middot; Dark PNG / Web</span>
              <a href="/pingava-logo.png" download="pingava-logo.png" className="secondary-btn download-btn">
                <Download size={14} /> Download Logo
              </a>
            </div>
          </div>

          {/* 2. Icon Only / Brand Mark */}
          <div className="brand-kit-card">
            <div className="brand-kit-preview transparent-grid">
              <img src="/pingava-mark.png" alt="Pingava Icon Only Brand Mark" />
            </div>
            <div className="brand-kit-info">
              <div className="brand-kit-badge">Icon Only / Brand Mark</div>
              <h4>Circular Monitoring Ring &amp; Node</h4>
              <p>Transparent circular monitoring ring with radar pulse ripples.</p>
              <span className="brand-kit-meta">1254 &times; 1254 &middot; Transparent RGBA</span>
              <a href="/pingava-mark.png" download="pingava-mark.png" className="secondary-btn download-btn">
                <Download size={14} /> Download Mark
              </a>
            </div>
          </div>

          {/* 3. Light Background Logo */}
          <div className="brand-kit-card">
            <div className="brand-kit-preview light-bg">
              <img src="/pingava-logo-light.png" alt="Pingava Light Background Logo" />
            </div>
            <div className="brand-kit-info">
              <div className="brand-kit-badge">Light Background Logo</div>
              <h4>Full Logo (Light Background)</h4>
              <p>Colored monitoring mark + dark navy wordmark + tagline.</p>
              <span className="brand-kit-meta">1024 &times; 768 &middot; Light PNG</span>
              <a href="/pingava-logo-light.png" download="pingava-logo-light.png" className="secondary-btn download-btn">
                <Download size={14} /> Download Logo
              </a>
            </div>
          </div>

          {/* 4. Monochrome Logo */}
          <div className="brand-kit-card">
            <div className="brand-kit-preview mono-bg">
              <img src="/pingava-logo-mono.png" alt="Pingava Monochrome Logo" />
            </div>
            <div className="brand-kit-info">
              <div className="brand-kit-badge">Monochrome Logo</div>
              <h4>Single-Color High Contrast</h4>
              <p>Pure white logo on solid black for printing, watermarks, and legal docs.</p>
              <span className="brand-kit-meta">1024 &times; 768 &middot; Solid Black / White</span>
              <a href="/pingava-logo-mono.png" download="pingava-logo-mono.png" className="secondary-btn download-btn">
                <Download size={14} /> Download Mono
              </a>
            </div>
          </div>

          {/* 5. App Icon */}
          <div className="brand-kit-card">
            <div className="brand-kit-preview dark-bg">
              <img src="/pingava-app-icon.png" alt="Pingava App Icon" style={{ width: 100, height: 100, borderRadius: 20 }} />
            </div>
            <div className="brand-kit-info">
              <div className="brand-kit-badge">App Icon</div>
              <h4>Squircle Container Icon</h4>
              <p>Icon inside rounded container for PWA, mobile apps, and macOS.</p>
              <span className="brand-kit-meta">512 &times; 512 &middot; Apple &amp; Android PWA</span>
              <a href="/pingava-app-icon.png" download="pingava-app-icon.png" className="secondary-btn download-btn">
                <Download size={14} /> Download App Icon
              </a>
            </div>
          </div>

          {/* 6. Favicon Sizes */}
          <div className="brand-kit-card">
            <div className="brand-kit-preview dark-bg" style={{ display: "flex", gap: "16px", alignItems: "center", justifyContent: "center" }}>
              <img src="/favicon-64x64.png" alt="64px" width={48} height={48} />
              <img src="/favicon-32x32.png" alt="32px" width={32} height={32} />
              <img src="/favicon-16x16.png" alt="16px" width={16} height={16} />
            </div>
            <div className="brand-kit-info">
              <div className="brand-kit-badge">Favicon Suite</div>
              <h4>Multi-Resolution Favicons</h4>
              <p>Optimized 64px, 48px, 32px, 16px, and multi-size .ico bundle.</p>
              <span className="brand-kit-meta">64px / 32px / 16px &middot; .ico / PNG</span>
              <a href="/favicon.ico" download="favicon.ico" className="secondary-btn download-btn">
                <Download size={14} /> Download Favicon (.ico)
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Engineering Leadership &amp; Direct Access">
        <p>
          We are an engineering-led team obsessed with site reliability and distributed systems. We do not hide behind
          opaque support queues&mdash;our founders and on-call reliability engineers are directly reachable:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "16px" }}>
          <a className="public-contact-email" href="mailto:connect@pingava.com">
            <Mail size={18} />
            connect@pingava.com
          </a>
          <a className="public-contact-email" href="mailto:support@pingava.com">
            <Mail size={18} />
            support@pingava.com
          </a>
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
      setErrorMsg(err.message || "Failed to dispatch inquiry. Please email support@pingava.com or connect@pingava.com directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-interactive-grid">
      <div>
        <Section title="Direct Engineering Channels">
          <p>
            Have a question about Pingava, need dedicated enterprise probe deployment, or
            discovered a security issue? Our engineering and reliability team is ready to assist you.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "20px 0" }}>
            <a className="public-contact-email" href="mailto:support@pingava.com">
              <Mail size={20} />
              support@pingava.com
            </a>
            <p style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--muted-foreground)" }}>
              For technical support, monitor configuration questions, and active incident troubleshooting.
            </p>

            <a className="public-contact-email" href="mailto:connect@pingava.com">
              <Mail size={20} />
              connect@pingava.com
            </a>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--muted-foreground)" }}>
              For general inquiries, enterprise contracts, custom probe requests, and partnerships.
            </p>
          </div>

          <div style={{ padding: "14px 18px", background: "rgba(8, 122, 75, 0.06)", borderLeft: "3px solid var(--primary)", borderRadius: "6px", margin: "20px 0" }}>
            <strong style={{ fontSize: "13px", color: "var(--foreground)", display: "block", marginBottom: "6px" }}>Fast Resolution Tip:</strong>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--muted-foreground)", lineHeight: "1.6" }}>
              To help us diagnose issues on our very first response, please include your <strong>target URL</strong>,
              affected <strong>probe region(s)</strong> (e.g. Frankfurt, Mumbai, Virginia), and observed <strong>HTTP status code</strong>.
            </p>
          </div>

          <div style={{ marginTop: "24px" }}>
            <p><strong>Response Time Commitments:</strong></p>
            <ul style={{ paddingLeft: "20px", color: "var(--muted-foreground)", fontSize: "14px", lineHeight: "1.7" }}>
              <li><strong>Critical Incidents &amp; Security:</strong> &lt; 2 hours SLA</li>
              <li><strong>General Technical Inquiries:</strong> &lt; 24 hours</li>
              <li><strong>Enterprise &amp; Sales Inquiries:</strong> Same-day response</li>
            </ul>
          </div>
        </Section>
      </div>

      <div className="contact-form-container">
        {sent ? (
          <div className="contact-success-card">
            <CheckCircle2 size={36} color="#12b76a" style={{ margin: "0 auto" }} />
            <h3>Inquiry Dispatched</h3>
            <p>
              Thank you for reaching out to Pingava. Ticket reference <strong>#{ticketId}</strong> has
              been created. Your inquiry has been routed to our on-call team at <strong>connect@pingava.com</strong> and
              an automated confirmation receipt was delivered to <strong>{email}</strong>.
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
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3 style={{ margin: "0 0 4px", font: "700 18px 'Manrope', sans-serif" }}>
              Send a Direct Inquiry
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--muted-foreground)" }}>
              Messages are routed directly to our engineering on-call inbox.
            </p>
            <label>
              Inquiry Type
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="Technical Support">Technical &amp; Account Support</option>
                <option value="Enterprise Sales">Enterprise &amp; Custom Probe Regions</option>
                <option value="Security Report">Security Disclosure / Vulnerability</option>
                <option value="Billing">Billing &amp; Subscription Inquiry</option>
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
                rows={4}
                placeholder="Describe your issue or inquiry in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
            <button type="submit" className="primary-btn" style={{ justifySelf: "flex-start" }} disabled={isSubmitting}>
              {isSubmitting ? "Dispatching..." : <>Send Inquiry <Send size={15} /></>}
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
              "AI Root Cause Post-Mortems",
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
    "EARLY ACCESS PROGRAM",
    "100% Free During Early Access. Paid Tiers Coming Soon.",
    "Start monitoring your websites and APIs for $0 with multi-region edge checks and status pages. Paid self-serve plans are coming soon once merchant aggregator compliance is finalized.",
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
  "/features": [
    "SRE & OBSERVABILITY SUITE",
    "Engineered to reduce false alarms and provide high-fidelity visibility.",
    "Explore Pingava's 6-region edge inspector, predictive latency radar, automated API contract drift guardian, and instant AI root cause post-mortems.",
  ],
  "/demo": [
    "ZERO-AUTH INTERACTIVE DEMO",
    "Experience Pingava live without creating an account.",
    "Explore pre-populated production monitors, global edge waterfalls, jitter radar analytics, and real incident post-mortem breakdowns.",
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
